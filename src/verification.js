const CUHK_EMAIL_DOMAINS = new Set(["link.cuhk.edu.hk", "cuhk.edu.hk"]);

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isCuhkStudentEmail(email) {
  const normalized = normalizeEmail(email);
  const parts = normalized.split("@");
  if (parts.length !== 2 || !parts[0]) {
    return false;
  }

  return CUHK_EMAIL_DOMAINS.has(parts[1]);
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
