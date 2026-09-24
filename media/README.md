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
| `hero-banner.png` | Composited graphic: the actual `home-mobile.png` capture placed in an HTML/CSS-rendered phone frame, not an AI-generated scene |

All nine application screenshots were captured from the same public demo account with `scripts/capture-screenshots.mjs` in the private application repository, on the app's default lime accent, and copied here unedited. They replace an earlier, visually inconsistent set that mixed non-default accent colours (orange, pink) and an older logo mark, captured at different times.

The hero is a composition, not a photograph or an unmodified screenshot: an HTML page positions the real `home-mobile.png` capture inside a drawn phone-bezel graphic on a dark gradient background, rendered to a PNG with headless Chromium. Every pixel inside the phone's screen area is the actual application; only the bezel, background and typography around it are drawn. This replaces the previous AI-generated hero, which used an older screenshot as a loose visual reference rather than the current UI, and carried the square "S" app-icon mark instead of the header's circle-and-bar brand mark.
