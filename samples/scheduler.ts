import type { SetctlDatabase } from "../offline/db";
import type {
  EntityType,
  SyncMutation,
} from "../../features/workouts/workoutTypes";

export const MAX_MUTATIONS_PER_SYNC_REQUEST = 12;

function entityKey(entityType: EntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

function parentFor(
  mutation: SyncMutation,
): { type: EntityType; id: string } | null {
  if (mutation.entityType === "set") {
    const id = mutation.payload.workoutId;
    return typeof id === "string" ? { type: "workout", id } : null;
  }
  if (mutation.entityType === "template_exercise") {
    const id = mutation.payload.templateId;
    return typeof id === "string" ? { type: "workout_template", id } : null;
  }
  return null;
}

export async function selectSyncChunk(
  database: SetctlDatabase,
): Promise<SyncMutation[]> {
  const [pending, conflicts, deadLetters] = await Promise.all([
    database.outbox.orderBy("createdAt").toArray(),
    database.syncConflicts.toArray(),
    database.deadLetter.toArray(),
  ]);
  const blocked = new Set([
    ...conflicts.map((item) => entityKey(item.entityType, item.entityId)),
    ...deadLetters.map((item) => entityKey(item.entityType, item.entityId)),
  ]);
  const pendingCreates = new Set(
    pending
      .filter((mutation) => mutation.baseRevision === 0)
      .map((mutation) => entityKey(mutation.entityType, mutation.entityId)),
  );
  const firstByEntity = new Map<string, SyncMutation>();
  for (const mutation of pending) {
    const key = entityKey(mutation.entityType, mutation.entityId);
    if (!blocked.has(key) && !firstByEntity.has(key))
      firstByEntity.set(key, mutation);
  }
  const candidates = [...firstByEntity.values()];
  const eligible = candidates.filter((mutation) => {
    const parent = parentFor(mutation);
    if (!parent) return true;
    const parentKey = entityKey(parent.type, parent.id);
    if (blocked.has(parentKey)) return false;
    if (!pendingCreates.has(parentKey)) return true;
    return candidates.some(
      (candidate) =>
        candidate.entityType === parent.type &&
        candidate.entityId === parent.id &&
        candidate.baseRevision === 0,
    );
  });
  return eligible
    .sort((left, right) => {
      const leftParent = parentFor(left);
      const rightParent = parentFor(right);
      if (
        rightParent?.id === left.entityId &&
        rightParent.type === left.entityType
      )
        return -1;
      if (
        leftParent?.id === right.entityId &&
        leftParent.type === right.entityType
      )
        return 1;
      return (
        left.createdAt.localeCompare(right.createdAt) ||
        left.mutationId.localeCompare(right.mutationId)
      );
    })
    .slice(0, MAX_MUTATIONS_PER_SYNC_REQUEST);
}
