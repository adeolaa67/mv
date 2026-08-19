import { SignJWT, jwtVerify } from "jose";

// ponytail: centralizes the admin session cookie's name, lifetime, and
// signing so login route, logout route, and middleware can't drift apart.
export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short — set a random 32+ byte string in .env.local"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(username: string) {
  return new SignJWT({ role: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    // Expired, tampered, or signed with a different/old SESSION_SECRET.
    return false;
  }
}

export const ADMIN_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
