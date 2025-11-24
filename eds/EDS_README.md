# Enhanced Digital Solutions (EDS) Platform

The EDS platform (`eds.eyeamstudios.com`) is a browser-only collection of industrial tools created by **EYE AM STUDIOS**. All tools:

- Run 100% in the user's browser (no backend processing)
- Store zero user data on EDS servers
- Rely on local JSON/config files for logic (no remote APIs)
- Use a universal license unlock gate
- Export PDF / XLSX / CSV / JSON client-side

## Tools

### WeldersPro – Digital Welding Assistant (`/apps/welderspro/`)

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

### PBS – Personal Budget System (`/apps/pbs/`)

- Personal budgeting engine with envelope-style categories
- Instant XLSX exports generated fully client-side
- No income or expense data stored on EDS servers

### PAS – Profit Allocation System (`/apps/pas/`)

- Revenue allocation for owner pay, taxes, profit, and OPEX
- Configurable allocation rules stored locally in browser storage
- All calculations and exports performed in the browser only

### DIFA – Digital ImageFlow Automation (`/apps/difa/`)

- Bulk image renaming and folder structuring based on presets
- Local-only processing against user-selected folders
- No images uploaded or stored on EDS servers

### PaintPro – Painting Estimator (`/apps/paintpro/`)

- Room-by-room material and labor estimating for painting projects
- Client-ready proposal/invoice exports generated in-browser
- No project or client details stored on EDS servers

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
- Open `pages/index.html` as the public EDS landing page and tool catalog.
- Tools live under `apps/<tool>/index.html` and can be tested directly.
