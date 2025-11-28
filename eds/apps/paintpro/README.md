# PaintPro Estimator + Invoice System

This project turns a business profile + job scope JSON file into:

1. A detailed job record (JSON) that stores business, client, scope, and pricing.
2. A professional invoice (PDF) generated as a simple, single-page layout.

The estimator is data-driven so each painter can keep their own rates,
productivity, and markup rules in version-controlled JSON files.

---

## For Painters (Basic Use)

### What you get

- A Windows launcher: `PaintProEstimator.bat` in this folder.
- Sample JSON templates under `paint_pro_estimator/sample_data/`.

### Step 1 – Open the folder

- Make sure `PaintProEstimator.bat` is in the same folder as the
  `paint_pro_estimator` directory.
- Optionally copy `business_profile.json` and `job_scope.json` somewhere safe
  to customize them.

### Step 2 – Run an estimate

1. Double-click `PaintProEstimator.bat`.
2. In the window that opens, run a command like:

   ```powershell
   PaintProEstimator.bat estimate `
     --business-profile paint_pro_estimator\sample_data\business_profile.json `
     --job paint_pro_estimator\sample_data\job_scope.json
   ```

3. The estimator creates:

   - A JSON record in `estimates/records/estimate_<number>.json`.
   - A PDF invoice in `estimates/invoices/invoice_<number>.pdf`.

### Step 3 – Use your own files

1. Create starter templates (optional) by running:

   ```powershell
   PaintProEstimator.bat init-profile --output business_profile.json
   PaintProEstimator.bat init-job --output job_scope.json
   ```

2. Edit `business_profile.json` with your real business details.
3. Edit `job_scope.json` for each project (rooms, surfaces, square footage).
4. Run `estimate` again, pointing to your edited files.

The CLI never mutates your input JSON, so you can store them safely in Git or a
shared drive.

---

## For Developers / Power Users

### Project layout

- `pyproject.toml` – Minimal build configuration using `setuptools`.
- `paint_pro_estimator/` – Library code and CLI.
- `tests/` – Pytest-based tests, including calculator verification.

### Install in editable mode

```powershell
cd d:\GitHub\Repositories\PaintProEstimator
python -m pip install -e .
```

### Run tests

```powershell
cd d:\GitHub\Repositories\PaintProEstimator
python -m pytest
```

### Run the CLI directly

```powershell
cd d:\GitHub\Repositories\PaintProEstimator

python -m paint_pro_estimator.cli estimate `
  --business-profile paint_pro_estimator\sample_data\business_profile.json `
  --job paint_pro_estimator\sample_data\job_scope.json
```

---

## Building a Windows .exe (Technical)

This section is for technical users who want a standalone EXE.

### Prerequisites

- Python 3.9+ installed on the build machine.
- PyInstaller installed in your environment:

  ```powershell
  cd d:\GitHub\Repositories\PaintProEstimator
  python -m pip install pyinstaller
  ```

### Build the EXE

A helper script `build_exe.ps1` is included at the project root.

```powershell
cd d:\GitHub\Repositories\PaintProEstimator
.\build_exe.ps1
```

This generates `dist/PaintProEstimator.exe`.

### Run the EXE

From the `dist` directory:

```powershell
cd d:\GitHub\Repositories\PaintProEstimator\dist

.\