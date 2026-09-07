<p align="center"><img src="media/product-hero.png" alt="SetCtl product mockup: a dark mobile workout screen with lime accents" width="100%"></p>

# setctl — Plan. Train. Review.

A workout tracking PWA built around what happens on the gym floor: log a set, adapt the exercise order when equipment is busy, and review progress over time.

**[Try the live demo](https://setctl.pablovaswdfghdvcsd.workers.dev/auth)** · **[Product tour](docs/product-tour.md)** · **[Engineering case study](docs/architecture.md)** · **[Code samples](samples/README.md)**

Built by (https://github.com/paploooov) with React, TypeScript, IndexedDB, Cloudflare Workers and D1. Development used AI coding assistance; product requirements, iteration and delivery are documented here through the resulting behavior and engineering decisions.

This public repository is a portfolio case study with selected source samples. The full application and its development history are maintained separately. It is not a self-hosting distribution.

## Try it in one minute

1. Open the [sign-in page](https://setctl.pablovaswdfghdvcsd.workers.dev/auth).
2. Select **Open demo account**. No shared password is needed.
3. Open **Review** to explore 24 sample workouts, weekly volume and strength trends.

The shared demo is read-only. Creating workouts and editing plans require a writable account; demo access does not provide those permissions. On iPhone, follow the app's Home Screen installation guidance.

## Product

| Train | Plan | Review |
| --- | --- | --- |
| Large set, reps and weight controls | Create and edit reusable plans | Weekly training volume |
| Local set completion and reload recovery | Search exercises and add custom movements | Estimated one-rep-max trends |
| Reorder untouched exercises for today's workout | Review JSON, CSV, TSV and supported Excel imports | Session history and workout detail |
| Substitute exercises without rewriting the template | Adjust exercise order, sets and rep targets | Data-quality-aware training check-ins |

### A focused workout screen

<img src="media/workout-mobile.png" alt="Actual mobile workout UI with sample Incline Dumbbell Press set and reorder controls" width="340">

Actual application capture at 390 CSS pixels, using a local sample workout. The header artwork above is an AI-assisted device mockup based on this screen.

### Build a training week

![Actual desktop planner with an Upper A sample plan](media/planner-desktop.png)

Captured from the local application with a simulated signed-in sample profile and a deliberately small exercise fixture. No personal account or training data is shown.

### See the work add up

![Actual production analytics screen with sample training history](media/analytics-desktop.png)

Captured from the public, read-only demo. All training figures are seeded examples, not user adoption metrics or the author's personal results.

## Engineering highlights

- **Local critical path:** completing a set writes the set, active-session pointer and outgoing mutation in one IndexedDB transaction. No network request is needed to finish the set.
- **Recoverable synchronization:** an outbox schedules revisions and parent/child dependencies; conflicts and failed mutations remain available for explicit recovery.
- **Guarded server writes:** Cloudflare D1 updates use revision predicates and ownership checks. A stale client does not silently overwrite newer work.
- **Workout snapshots:** in-session substitutions and reordering affect the workout, preserving the reusable template.
- **PWA persistence:** cached app assets, reload recovery and platform-specific installation guidance support training with unreliable connectivity.
- **Authentication:** passkeys through WebAuthn, password accounts and role-based administration.

```mermaid
flowchart LR
  UI[Workout screen] --> TX[IndexedDB transaction]
  TX --> SET[Set and active session]
  TX --> OUT[Durable outbox]
  OUT --> SYNC[Sync scheduler]
  SYNC --> API[Cloudflare Worker]
  API --> D1[(D1: ownership and revision checks)]
  API --> REC[Explicit conflict / failure recovery]
```

## Verification and boundaries

The application verification run recorded on **7 September 2026** passed **65 client tests, 36 Worker/D1 tests and 36 Chromium/WebKit E2E cases**. Four platform-specific cases were skipped by design. Type checking, lint, formatting, responsive-layout checks, production build and the build security guard passed. These are dated results from the private application, not a claim that this showcase runs that entire suite.

The public repository includes a small independently runnable analytics example. See [verification notes](docs/verification.md) for scope and limitations, including the remaining physical-iPhone Home Screen relaunch check.

## Explore the implementation

- [Atomic workout mutations](samples/workoutMutations.ts): completion, substitution, reordering and their outbox writes.
- [Dependency-aware sync selection](samples/scheduler.ts): revisions, blocked entities and parent ordering.
- [Estimated strength calculations](samples/e1rm.ts): Epley and Brzycki calculations with confidence flags.
- [Architecture and trade-offs](docs/architecture.md).
- [Resume-ready project description](docs/resume.md).

## Media and source

See [media provenance](media/README.md) for screenshot context and mockup labeling. Screenshots and sample code are shared for portfolio review. No general reuse license is granted by this repository; third-party libraries and trademarks retain their respective rights.
