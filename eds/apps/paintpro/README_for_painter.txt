PAINTPRO ESTIMATOR – QUICK START (WINDOWS)

1. Open this folder
   - You should see:
     - PaintProEstimator.exe
     - business_profile.json
     - job_scope.json

2. Edit your business profile (one-time setup)
   - Right-click business_profile.json → Open with → Notepad
   - Update:
     - name, phone, email, address
     - labor_rate, overhead_percent, profit_percent
   - Save the file.

3. Edit the job for each project
   - Right-click job_scope.json → Open with → Notepad
   - Update:
     - client name and project address
     - rooms, surfaces, square footage (area_sqft)
     - any equipment and days needed
   - Save the file.

4. Run an estimate
   - Right-click in this folder → "Open in Terminal" (or "Open PowerShell window here").
   - In the blue/black window, type:

     .\PaintProEstimator.exe estimate `
       --business-profile .\business_profile.json `
       --job .\job_scope.json

   - Press ENTER.

5. Find your results
   - A JSON summary is saved under: estimates\records
   - A PDF invoice is saved under:  estimates\invoices
   - Open the PDF invoice and send it to your client.

6. Optional: Generate starter templates
   - If you don't have business_profile.json or job_scope.json yet, run:

     .\PaintProEstimator.exe init-profile --output business_profile.json
     .\PaintProEstimator.exe init-job --output job_scope.json

   - Then edit those files with your real business and project info.
