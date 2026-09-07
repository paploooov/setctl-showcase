# Verification record

## Application baseline — 7 September 2026

The latest implementation batch at private commit `5b3bc20` recorded:

| Check | Result |
| --- | --- |
| TypeScript, lint, formatting | Passed |
| Client unit tests | 65 passed across 14 files |
| Worker/D1 tests | 36 passed across 5 files |
| Chromium/WebKit E2E | 36 passed, 4 platform-specific skips |
| Production build security check | Passed |
| 390px layout sweep | Passed |
| Desktop exercise drag and mobile arrow controls | Passed |
| Reload and automated offline recovery | Passed |

The recorded production deployment also returned HTTP 200 for the page and health endpoint. Counts above are the existing application gate, not tests freshly executed by this documentation-only publication.

## Public sample verification

With Node.js 24 or newer, run from the repository root:

```sh
node --experimental-strip-types --test samples/e1rm.test.mjs
```

This checks the extracted analytics sample only. The workout and scheduler files are review excerpts and require the private application's surrounding modules to compile.

## Remaining boundaries

- A physical iPhone Home Screen relaunch while offline remains a manual verification item.
- Playwright browser-specific exclusions are not evidence of equivalent physical-device coverage.
- The public demo prevents writes; it cannot demonstrate actual offline set completion without a writable account.
- No usage, uptime, adoption or performance claims are inferred from seeded training data.
