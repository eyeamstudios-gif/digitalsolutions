Param(
    [string]$Name = "PaintProEstimator"
)

$ErrorActionPreference = "Stop"

Write-Host "Building $Name.exe..."

pyinstaller `
  --name $Name `
  --onefile `
  --console `
  paint_pro_estimator\__main__.py

Write-Host "Build complete. EXE is in dist\$Name.exe"
