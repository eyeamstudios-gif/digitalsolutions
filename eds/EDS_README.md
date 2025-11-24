# Enhanced Digital Solutions (EDS) Platform

The EDS platform (`eds.eyeamstudios.com`) is a browser-only collection of industrial tools created by **EYE AM STUDIOS**. All tools:

- Run 100% in the users browser
- Store zero user data on EDS servers
- Rely on local JSON/config for logic
- Use a universal license unlock gate
- Export PDF / XLSX / CSV / JSON client-side

## Tools

### WeldersPro  Digital Welding Assistant (`/apps/welderspro/`)

- Multi-material compatibility engine (carbon, stainless, chromoly, exotic)
- Dissimilar metal guidance
- Preheat & interpass calculators
- Consumable selection helper
- WPS-style PDF weld plan export
- No weld data stored on EDS servers

### API-653 Inspectors Pro (`/apps/api653-pro/`)

- Shell course configuration builder
- Tank dimension helpers
- Nozzle/manway catalog with blind/non-blind states
- Photo upload + labeling (client-side only)
- Inspection checklist and report export to PDF
- No inspection data stored on EDS servers

## Unlock Flow

Each tool uses the same browser-only license gate:

1. User visits a tool URL.
2. License gate prompts for an `EDS-<PRODUCT>-XXXXXXXX` key.
3. Key is validated purely client-side (`eds/lib/license.js`).
4. On success, the gate hides and the app UI is shown.
5. A `localStorage` flag records a valid license for that browser.
6. All user inputs remain in-memory; exports are generated on the client only.

## Local Development

- Serve the `eds` directory with any static file server.
- Open `pages/index.html` as the landing page.
- Tools live under `apps/<tool>/index.html` and can be tested directly.
