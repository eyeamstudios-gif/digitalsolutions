const PRODUCT_CODE = "GEN1"; // Default, override per tool
const LOCAL_KEY = `eds_license_${PRODUCT_CODE}`;

function validateLicenseKey(key) {
  if (!key) return false;

  const cleaned = key.replace(/-/g, "").toUpperCase();
  const prefix = "EDS" + PRODUCT_CODE;
  if (!cleaned.startsWith(prefix)) return false;

  const payload = cleaned.slice(prefix.length);
  if (payload.length !== 8) return false;

  let sum = 0;
  for (let char of payload) sum += char.charCodeAt(0);
  return sum % 16 === 0;
}

export function initLicenseGate(productCode) {
  const code = productCode || PRODUCT_CODE;
  const localKey = `eds_license_${code}`;

  const gate = document.getElementById("license-gate");
  const app = document.getElementById("app-wrapper");
  const input = document.getElementById("license-input");
  const submit = document.getElementById("license-submit");
  const message = document.getElementById("license-message");

  if (!gate || !app || !input || !submit || !message) {
    console.warn("License gate elements missing; skipping unlock gate init.");
    return;
  }

  function unlock() {
    gate.style.display = "none";
    app.style.display = "block";
  }

  const stored = window.localStorage.getItem(localKey);
  if (stored === "valid") {
    unlock();
  }

  submit.addEventListener("click", () => {
    const value = input.value.trim();
    if (validateLicenseKey(value.replace(code, PRODUCT_CODE))) {
      window.localStorage.setItem(localKey, "valid");
      message.textContent = "License accepted.";
      unlock();
    } else {
      message.textContent = "Invalid license key.";
    }
  });
}

export function generateLicense(productCode = PRODUCT_CODE) {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  let sum = 0;
  for (let i = 0; i < random.length; i++) {
    sum += random.charCodeAt(i);
  }
  const checksum = (16 - (sum % 16)) % 16;
  const checksumHex = checksum.toString(16).toUpperCase();

  return `EDS-${productCode}-${random}${checksumHex}`;
}
