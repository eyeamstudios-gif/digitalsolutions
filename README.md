# EYE AM STUDIOS | Enhanced Digital Solutions Platform

This repository contains the **EDS** platform, a collection of browser-only industrial tools deployed to `eds.eyeamstudios.com`.

## Key Properties

- 100% client-side execution (no backend required)
- No user data stored on EDS servers
- Tools unlocked via a shared license gate
- Exports generated in the browser (PDF / CSV / JSON / XLSX)
- Designed to scale instantly when deployed to static hosting (e.g. Vercel)

## Structure (high level)

- `eds/pages/`  Landing and legal pages
- `eds/apps/`  Individual tools (e.g. WeldersPro, API-653 Inspectors Pro)
- `eds/components/`  Shared HTML fragments
- `eds/lib/`  Shared utility scripts such as the license gate
- `eds/public/`  Static assets (CSS, images)

For more platform-specific details, see `eds/EDS_README.md`.
