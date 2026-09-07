# Selected implementation samples

Copied from the application source at commit `5b3bc20`, without operational configuration, credentials or user data.

- `workoutMutations.ts`: real application source; depends on the application's database and outbox modules. Read as an excerpt.
- `scheduler.ts`: real application source; depends on the application's database and entity types. Read as an excerpt.
- `e1rm.ts`: standalone pure TypeScript source.
- `e1rm.test.mjs`: small runnable public test for the extracted calculations.

Run the standalone tests with Node.js 24+:

```sh
node --experimental-strip-types --test samples/e1rm.test.mjs
```

These samples are for inspection and are not the complete runnable application.
