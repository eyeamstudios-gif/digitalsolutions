// EDS License Key Logic (client-side)
// Usage: Include this script in your tool HTML page

const LICENSE_KEY_STORAGE = 'eds_license_key';

// Example: License key format: EDS-<expiry>-<random>
// expiry = Unix timestamp (seconds)

function saveLicenseKey(key) {
  localStorage.setItem(LICENSE_KEY_STORAGE, key);
}

function getLicenseKey() {
  return localStorage.getItem(LICENSE_KEY_STORAGE);
}

function removeLicenseKey() {
  localStorage.removeItem(LICENSE_KEY_STORAGE);
}

function isLicenseKeyValid(key) {
  if (!key || !key.startsWith('EDS-')) return false;
  const parts = key.split('-');
  if (parts.length < 3) return false;
  const expiry = parseInt(parts[1], 10);
  if (isNaN(expiry)) return false;
  const now = Math.floor(Date.now() / 1000);
  return now < expiry;
}

function promptForKeyAndUnlock() {
  const userKey = prompt('Enter your EDS license key:');
  if (isLicenseKeyValid(userKey)) {
    saveLicenseKey(userKey);
    unlockTool();
    alert('Tool unlocked!');
  } else {
    alert('Invalid or expired key.');
    removeLicenseKey();
  }
}

function unlockTool() {
  // Implement your UI unlock logic here (e.g., show tool, hide gate)
  document.getElementById('license-gate').style.display = 'none';
  document.getElementById('tool-content').style.display = 'block';
}

function lockTool() {
  document.getElementById('license-gate').style.display = 'block';
  document.getElementById('tool-content').style.display = 'none';
}

// On page load
window.addEventListener('DOMContentLoaded', () => {
  const key = getLicenseKey();
  if (isLicenseKeyValid(key)) {
    unlockTool();
  } else {
    lockTool();
  }
});

// Expose for button usage
window.promptForKeyAndUnlock = promptForKeyAndUnlock;
window.removeLicenseKey = removeLicenseKey;
