@echo off
echo PaintPro Estimator - Running estimate...
echo.

PaintProEstimator.exe estimate ^
  --business-profile business_profile.json ^
  --job job_scope.json

echo.
echo ================================================
echo Estimate complete!
echo Check the 'estimates' folder for your files:
echo   - estimates\records\estimate_*.json
echo   - estimates\invoices\invoice_*.pdf
echo ================================================
echo.
pause
