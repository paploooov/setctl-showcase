# Engineering case study

## The problem

A workout is a sequence of small writes made under poor connectivity, often with a phone in one hand. Losing a just-completed set or replacing a newer device's data would undermine the central purpose of the app.

SetCtl therefore keeps the critical workout operation on the device and treats server synchronization as a separate, recoverable process.

## Completing a set

The implementation validates reps and weight, checks outbox capacity, and then opens a Dexie transaction across the required IndexedDB tables. It writes the completed set, advances the active session, starts the rest deadline and adds a revisioned mutation. An outbox insertion failure aborts the transaction. Repeating completion of an already-completed set is a no-op.

The session stores an absolute rest deadline rather than relying on a continuously running JavaScript timer. Reloads and background pauses can derive the remaining duration from time.

## Synchronization and conflict recovery

The scheduler selects the earliest eligible mutation for each entity, respects parent creates and blocks entities with unresolved conflicts or dead letters. Batches are bounded. The Worker checks account ownership and uses SQL revision predicates for compare-and-swap writes.

Acknowledgements, idempotent equivalence and conflict responses have different meanings. The client retains unresolved work so the user can choose recovery explicitly. This complexity is the cost of preserving edits across unreliable requests and multiple devices.

## Templates versus workouts

Starting a workout materializes a snapshot. Workout sets retain both planned and actual exercise references. Replacing an exercise can therefore preserve the intended plan while recording what was performed.

Reordering moves untouched exercise positions and selects the first pending set from the new order. Started positions are locked in the current implementation. The mutation does not update template rows.

## Platform choices

| Layer | Choice | Purpose |
| --- | --- | --- |
| UI | React + TypeScript | Responsive workout, planning and review flows |
| Local storage | Dexie + IndexedDB | Transactional workout state and outbox |
| Delivery | PWA service worker | Cached application shell and recovery |
| API | Hono on Cloudflare Workers | Authentication, imports and guarded sync |
| Database | Cloudflare D1 | Relational ownership and revision checks |
| Authentication | WebAuthn + password accounts | Device credentials and conventional sign-in |
| Analytics | Pure TypeScript + Recharts | Testable calculations and client-side charts |
| Verification | Vitest + Playwright | Unit, Worker/D1 and browser coverage |

The deployment uses the existing Cloudflare Workers Static Assets and D1 setup. No server connection participates in completing a workout set.

## Boundaries worth keeping visible

Browser storage is not an unlimited or infallible backup. Storage-persistence guidance, visible pending changes and server synchronization remain necessary. PWA emulation is useful but does not replace physical-device checks. Estimated strength and training check-ins are contextual estimates, not measured maximal strength or medical advice.

This case study describes the implementation at private-source commit `5b3bc20`. The public samples intentionally omit the application database adapter and the rest of the server/UI; only the analytics sample is self-contained.
