# Media provenance

| File | Origin |
| --- | --- |
| `home-desktop.png` | Live application screenshot, desktop viewport, demo account, reproduced unchanged |
| `home-mobile.png` | Live application screenshot, mobile viewport, demo account, reproduced unchanged |
| `review-desktop.png` | Live application screenshot: training overview, totals and weekly volume, reproduced unchanged |
| `review-mobile.png` | Live application screenshot: training overview, mobile viewport, reproduced unchanged |
| `muscle-balance-desktop.png` | Live application screenshot: 2D muscle balance, front and back maps, reproduced unchanged |
| `muscle-balance-3d-desktop.png` | Live application screenshot: rotatable 3D muscle balance model, reproduced unchanged |
| `muscle-balance-mobile.png` | Live application screenshot: 2D muscle balance, mobile viewport, reproduced unchanged |
| `session-analysis-desktop.png` | Live application screenshot: per-session analysis with PubMed-cited findings, reproduced unchanged |
| `settings-desktop.png` | Live application screenshot: settings grouped by topic, reproduced unchanged |
| `hero-devices.webp` | AI-generated composition, closely prompted against `home-desktop.png` and `muscle-balance-3d-desktop.png` as hard visual references; not an unmodified screenshot |

All nine application screenshots were captured from the same public demo account with `scripts/capture-screenshots.mjs` in the private application repository, on the app's default lime accent, and copied here unedited. They replace an earlier, visually inconsistent set that mixed non-default accent colours (orange, pink) and an older logo mark, captured at different times.

The hero went through two revisions. The first was an HTML page compositing the real `home-mobile.png` capture into a drawn phone-bezel graphic, rendered with headless Chromium — accurate but visually plain. The current version is AI-generated (prompted with the app's real colour values, brand mark description, and the two referenced screenshots as hard constraints, specifically instructed to reproduce the 3D muscle-balance screen's pose and muscle segmentation rather than reinterpret it) to show two phones: one with the home screen, one with the rotatable 3D muscle-balance model, which was not otherwise shown in the hero. The on-screen UI is a close likeness of the real app, not pixel-identical — see the direct screenshots above for the actual UI in detail.
