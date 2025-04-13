import crypto from "crypto";

// Generate a secure hash of the admin password
function hashPassword(password) {
  if (!password) return null;
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Simple admin authentication with direct password comparison
export function isAdmin(userId, adminToken) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return adminToken === adminPassword;
}

// Generate initial admin password hash (run this once to get the hash)
export function generateAdminHash(password) {
  return hashPassword(password);
}
