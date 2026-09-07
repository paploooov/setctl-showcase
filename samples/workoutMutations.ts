import type { SetctlDatabase } from "../../lib/offline/db";
import { ensureOutboxCapacity, makeMutation } from "../../lib/offline/outbox";
import type { WorkoutSet } from "./workoutTypes";

function updatePayload(entity: object): Record<string, unknown> {
  return { ...entity };
}

export interface CompleteSetInput {
  actualWeightKg: number | null;
  actualReps: number;
  rir: number | null;
  notes?: string | null;
}

export async function completeSet(
  database: SetctlDatabase,
  setId: string,
  input: CompleteSetInput,
  now = new Date(),
): Promise<{ changed: boolean; set: WorkoutSet }> {
  const beforeTransaction = await database.sets.get(setId);
  if (!beforeTransaction) throw new Error("Set not found.");
  if (beforeTransaction.status === "completed") {
    return { changed: false, set: beforeTransaction };
  }
  await ensureOutboxCapacity(database);
  const clientId = await database.initialize();
  const timestamp = now.toISOString();

  return database.transaction(
    "rw",
    database.exercises,
    database.sets,
    database.activeSession,
    database.outbox,
    async () => {
      const existing = await database.sets.get(setId);
      if (!existing) throw new Error("Set not found.");
      if (existing.status === "completed")
        return { changed: false, set: existing };
      if (
        !Number.isInteger(input.actualReps) ||
        input.actualReps < 0 ||
        input.actualReps > 100
      ) {
        throw new Error("Reps must be a whole number from 0 to 100.");
      }
      if (input.rir !== null && (input.rir < 0 || input.rir > 10)) {
        throw new Error("RIR must be between 0 and 10.");
      }
      const exercise = await database.exercises.get(existing.exerciseId);
      if (!exercise) throw new Error("Exercise not found.");
      if (exercise.loadType === "external" && input.actualWeightKg === null) {
        throw new Error("Weight is required for this exercise.");
      }
      if (
        input.actualWeightKg !== null &&
        (input.actualWeightKg < 0 || input.actualWeightKg > 1000)
      ) {
        throw new Error("Weight must be between 0 and 1000 kg.");
      }

      const completed: WorkoutSet = {
        ...existing,
        status: "completed",
        actualWeightKg: input.actualWeightKg,
        actualReps: input.actualReps,
        rir: input.rir,
        notes: input.notes ?? existing.notes,
        completedAt: timestamp,
        revision: existing.revision + 1,
        updatedAt: timestamp,
      };
      const remaining = (
        await database.sets
          .where("workoutId")
          .equals(existing.workoutId)
          .toArray()
      )
        .filter(
          (set) =>
            set.id !== existing.id &&
            set.status === "pending" &&
            !set.deletedAt,
        )
        .sort(
          (left, right) =>
            left.exerciseOrder - right.exerciseOrder ||
            left.setNumber - right.setNumber,
        );
      const session = await database.activeSession.get(existing.workoutId);

      await database.sets.put(completed);
      if (session) {
        await database.activeSession.put({
          ...session,
          currentSetId: remaining[0]?.id ?? completed.id,
          restStartedAt: now.getTime(),
          restDeadline: now.getTime() + completed.plannedRestSeconds * 1000,
          updatedAt: timestamp,
        });
      }
      await database.outbox.add(
        makeMutation({
          clientId,
          entityType: "set",
          entityId: completed.id,
          operation: "upsert",
          baseRevision: existing.revision,
          newRevision: completed.revision,
          payload: updatePayload(completed),
          createdAt: timestamp,
        }),
      );
      return { changed: true, set: completed };
    },
  );
}

export async function swapRemainingExercise(
  database: SetctlDatabase,
  workoutId: string,
  plannedExerciseId: string,
  replacementExerciseId: string,
  exerciseOrder?: number,
  now = new Date(),
): Promise<number> {
  const candidates = (
    await database.sets.where("workoutId").equals(workoutId).toArray()
  ).filter(
    (set) =>
      set.status === "pending" &&
      set.deletedAt === null &&
      set.plannedExerciseId === plannedExerciseId &&
      (exerciseOrder === undefined || set.exerciseOrder === exerciseOrder) &&
      set.exerciseId !== replacementExerciseId,
  );
  if (candidates.length === 0) return 0;
  await ensureOutboxCapacity(database, candidates.length);
  const [clientId, replacement] = await Promise.all([
    database.initialize(),
    database.exercises.get(replacementExerciseId),
  ]);
  if (!replacement || replacement.deletedAt || replacement.isArchived) {
    throw new Error("Replacement exercise is unavailable.");
  }
  const timestamp = now.toISOString();

  await database.transaction("rw", database.sets, database.outbox, async () => {
    for (let index = 0; index < candidates.length; index += 1) {
      const existing = candidates[index];
      const changed: WorkoutSet = {
        ...existing,
        exerciseId: replacementExerciseId,
        revision: existing.revision + 1,
        updatedAt: timestamp,
      };
      await database.sets.put(changed);
      await database.outbox.add(
        makeMutation({
          clientId,
          entityType: "set",
          entityId: changed.id,
          operation: "upsert",
          baseRevision: existing.revision,
          newRevision: changed.revision,
          payload: updatePayload(changed),
          createdAt: new Date(now.getTime() + index).toISOString(),
        }),
      );
    }
  });
  return candidates.length;
}

export async function reorderRemainingExercises(
  database: SetctlDatabase,
  workoutId: string,
  orderedExerciseOrders: number[],
  now = new Date(),
): Promise<number> {
  const workoutSets = (
    await database.sets.where("workoutId").equals(workoutId).toArray()
  ).filter((set) => set.deletedAt === null);
  const setsByOrder = new Map<number, WorkoutSet[]>();
  for (const set of workoutSets) {
    const positionSets = setsByOrder.get(set.exerciseOrder) ?? [];
    positionSets.push(set);
    setsByOrder.set(set.exerciseOrder, positionSets);
  }
  const movableOrders = [...setsByOrder.entries()]
    .filter(([, sets]) => sets.every((set) => set.status === "pending"))
    .map(([order]) => order)
    .sort((left, right) => left - right);
  const requestedOrders = new Set(orderedExerciseOrders);
  if (
    requestedOrders.size !== orderedExerciseOrders.length ||
    orderedExerciseOrders.length !== movableOrders.length ||
    !movableOrders.every((order) => requestedOrders.has(order))
  ) {
    throw new Error("Only untouched exercises can be reordered.");
  }

  const targetOrderByOriginal = new Map(
    orderedExerciseOrders.map((originalOrder, index) => [
      originalOrder,
      movableOrders[index],
    ]),
  );
  const candidates = workoutSets.filter(
    (set) =>
      requestedOrders.has(set.exerciseOrder) &&
      targetOrderByOriginal.get(set.exerciseOrder) !== set.exerciseOrder,
  );
  if (candidates.length === 0) return 0;

  await ensureOutboxCapacity(database, candidates.length);
  const clientId = await database.initialize();
  const timestamp = now.toISOString();

  await database.transaction(
    "rw",
    database.sets,
    database.activeSession,
    database.outbox,
    async () => {
      const changedById = new Map<string, WorkoutSet>();
      for (let index = 0; index < candidates.length; index += 1) {
        const existing = candidates[index];
        const changed: WorkoutSet = {
          ...existing,
          exerciseOrder:
            targetOrderByOriginal.get(existing.exerciseOrder) ??
            existing.exerciseOrder,
          revision: existing.revision + 1,
          updatedAt: timestamp,
        };
        changedById.set(changed.id, changed);
        await database.sets.put(changed);
        await database.outbox.add(
          makeMutation({
            clientId,
            entityType: "set",
            entityId: changed.id,
            operation: "upsert",
            baseRevision: existing.revision,
            newRevision: changed.revision,
            payload: updatePayload(changed),
            createdAt: new Date(now.getTime() + index).toISOString(),
          }),
        );
      }

      const session = await database.activeSession.get(workoutId);
      if (session) {
        const nextPendingSet = workoutSets
          .map((set) => changedById.get(set.id) ?? set)
          .filter((set) => set.status === "pending")
          .sort(
            (left, right) =>
              left.exerciseOrder - right.exerciseOrder ||
              left.setNumber - right.setNumber,
          )[0];
        await database.activeSession.put({
          ...session,
          currentSetId: nextPendingSet?.id ?? session.currentSetId,
          updatedAt: timestamp,
        });
      }
    },
  );

  return candidates.length;
}

export async function finishWorkout(
  database: SetctlDatabase,
  workoutId: string,
  status: "completed" | "discarded",
  now = new Date(),
): Promise<void> {
  await ensureOutboxCapacity(database);
  const clientId = await database.initialize();
  const timestamp = now.toISOString();

  await database.transaction(
    "rw",
    database.workouts,
    database.activeSession,
    database.outbox,
    async () => {
      const existing = await database.workouts.get(workoutId);
      if (!existing) throw new Error("Workout not found.");
      if (existing.status !== "active") return;
      const changed = {
        ...existing,
        status,
        endedAt: timestamp,
        revision: existing.revision + 1,
        updatedAt: timestamp,
      };
      await database.workouts.put(changed);
      await database.activeSession.delete(workoutId);
      await database.outbox.add(
        makeMutation({
          clientId,
          entityType: "workout",
          entityId: workoutId,
          operation: "upsert",
          baseRevision: existing.revision,
          newRevision: changed.revision,
          payload: updatePayload(changed),
          createdAt: timestamp,
        }),
      );
    },
  );
}

export async function clearRestTimer(
  database: SetctlDatabase,
  workoutId: string,
): Promise<void> {
  const session = await database.activeSession.get(workoutId);
  if (!session) return;
  await database.activeSession.put({
    ...session,
    restStartedAt: null,
    restDeadline: null,
    updatedAt: new Date().toISOString(),
  });
}
