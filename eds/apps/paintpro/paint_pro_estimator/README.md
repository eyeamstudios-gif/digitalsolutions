# PaintPro Estimator + Invoice System (Base Version)

This folder contains a ready-to-run estimator for painting contractors. It turns a
business profile + job scope JSON file into:

1. A detailed job record (JSON) that stores business, client, scope, and pricing.
2. A professional invoice (PDF) that mirrors the spec shared by EYE AM STUDIOS.

The estimator is intentionally data-driven so every painter can keep their own
rates, productivity, and markup rules in version-controlled JSON files.

## Key Capabilities

- **Business + Client Profiles** – Business details auto-fill every estimate and invoice.
- **Job Scope Builder** – Capture rooms, surfaces, prep level, coat count, color change,
  and more so difficulty multipliers can be calculated consistently.
- **Estimator Engine** – Automatically totals labor, materials, equipment, overhead,
  and profit using configurable defaults.
- **Invoice/PDF Creator** – Generates branded invoices (logo optional) using a
  lightweight PDF writer (no external dependencies).
- **Customization Ready** – `init-profile` and `init-job` commands create starter files
  that each painter can edit and keep as their defaults.

## Usage

Create or edit your business profile and job scope JSON files, then run:

```bash
python -m paint_pro_estimator.cli estimate \
  --business-profile paint_pro_estimator/sample_data/business_profile.json \
  --job paint_pro_estimator/sample_data/job_scope.json
```

Outputs include:

- `estimates/records/estimate_<number>.json`
- `estimates/invoices/invoice_<number>.pdf`

### Initialize Templates

```bash
# Create a starter business profile
python -m paint_pro_estimator.cli init-profile --output business_profile.json

# Create a starter job file
python -m paint_pro_estimator.cli init-job --output job_scope.json
```

## JSON Structure Overview

- `business_profile.json` – Stores business header, default rates, coverage, overhead,
  and profit percentages.
- `job_scope.json` – Includes client info, project description, scope, labor/material
  inputs, equipment list, and optional overrides for overhead & profit.

## Customizing Defaults

Because everything is stored as JSON files, painters can version their own
profiles (per crew, per region, etc.) and re-use them for future jobs. The
following defaults are persisted:

- Business contact info + logo path.
- Labor rate and productivity rate per square foot.
- Paint coverage rate and cost per gallon.
- Overhead % and profit %.

Edit the JSON, save it, and re-run the estimator. The CLI never mutates your
inputs, so you can safely store them in Git or a shared drive.

## PDF Output

The invoice layout follows the requested structure:

- Business header with optional logo
- Client details and project summary
- Description of work (rooms, surfaces, prep notes)
- Cost breakdown table (Labor, Materials, Equipment, Overhead, Profit)
- Payment terms and signature lines

Logos are optional—if the referenced file exists it is embedded in the top-left
corner of the PDF.
