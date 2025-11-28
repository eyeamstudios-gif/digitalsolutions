# PBS – Preview Guide

## PBS Pricing Structure — 2025 Edition

| Tier                    | Version                   | Access Type             | Storage                      | Trial Period      | Monthly        | Annual      | Description                                                                                   |
|-------------------------|---------------------------|-------------------------|------------------------------|-------------------|---------------|-------------|-----------------------------------------------------------------------------------------------|
| 🟦 PBS Starter / Basic  | Static (Offline)          | Browser-based, offline  | LocalStorage                 | 30 Days Free      | $12.99 / mo   | $99 / yr    | Core budgeting app with allocations, income, bills, and variable expenses. Converts to Basic after trial. |
| 🟧 PBS Pro (Standard)   | Static (Offline Advanced) | Browser-based, offline  | LocalStorage + Manual Backup | Optional 7-day demo | $24.99 / mo   | $199 / yr   | Unlocks advanced tools: debt payoff, savings goals, multiple budgets, printable reports, and auto-backup to file. |

This guide explains how to preview each version of the Personal Budget System locally and how to use the test pages safely.

## 1) Run a local server (recommended)
From the repo root:

- Python
  
  ```powershell
  python -m http.server 5500 --bind 127.0.0.1
  ```

Then open http://127.0.0.1:5500/

A local server ensures relative links and assets behave like production.

## Preview launcher (one-click)

- Open http://127.0.0.1:5500/preview.html for quick access to all apps and test pages.
- The launcher shows an Override status pill and buttons to Enable/Clear it.
- Test links in the launcher include `?test=1&grant=1` and will automatically set the override on non-local hosts. You can also toggle it manually.

## 2) Routes to open

- Root (homepage)
  - Live: `/index.html`

- Starter
  - Live app: `/starter/app.html` (redirects to `/starter/signup.html` if not signed up)
  - Helper link: add `?test=1` to show a floating link to the test page
  - Test app: `/starter/test.html` (isolated storage, toggle Trial/Basic)

- Pro
  - Live landing: `/pro/index.html`
  - Live app (gated): `/pro/app.html` (redirects to `/pro/payment.html` without Pro keys)
  - Helper link: add `?test=1` to show a floating link to the test page
  - Test tools: `/pro/test.html` (toggle Pro on/off/expired; can apply to LIVE keys)

- Pro+ Cloud
  - Live landing: `/pro-cloud/index.html`
  - Helper link: `/pro-cloud/app.html?test=1` exposes link to test page
  - Test page: `/pro-cloud/test.html`

## 3) Test pages and safety

- All test pages include:
  - `noindex` meta and `robots.txt` disallow entries
  - Visible TEST banners
  - Hostname guard: allowed on `localhost`, `127.0.0.1`, and any `*.local` host. Otherwise they redirect to the section index unless overridden.

- Override on staging/non-local:
  - Visit with `?test=1&grant=1` once (e.g., `/pro/test.html?test=1&grant=1`)
  - This sets `localStorage.PBS_TEST_OVERRIDE = 'true'` in your browser. Clear storage to remove it.
  - The preview launcher’s test links already include the grant flag and will auto-set the override.

## 4) Pro LIVE keys workflow (to preview the real gating)

1. Open `/pro/test.html`
2. Click "Toggle Pro Access" to ON (or "Simulate Expired" to test expiry)
3. Click "Apply to LIVE keys"
4. Click "Open Pro App (LIVE keys)" – this opens `/pro/app.html` which uses the real keys
5. To reset, click "Clear LIVE keys" on the test page

LIVE keys used by `/pro/app.html`:
- `PBS_PRO_ACCESS` ("true" or absent)
- `PBS_PRO_KEY` (string)
- `PBS_PRO_EXPIRES` ("recurring", "never", or a timestamp)

TEST keys (used only by the test page):
- `PBS_PRO_ACCESS_TEST`
- `PBS_PRO_KEY_TEST`
- `PBS_PRO_EXPIRES_TEST`

## 5) Starter test storage isolation

The Starter test page uses `EAS_PBS_COMPREHENSIVE_v2_TEST` so your test data does not overwrite real saved data. It also includes a "Reset TEST Data" button.

## 6) Light/dark theme

All pages respect `localStorage.PBS_THEME`. Use the 🌓 button to switch.

## 7) Deployment note

Keep test pages in git for versioning. If you publish directly from this repo, the guards prevent indexing and casual access. For stricter control, either:
- Publish only a subset (e.g., from `docs/`), or
- Enforce a host allowlist in the guards, or
- Require a passphrase/secret for test pages.
