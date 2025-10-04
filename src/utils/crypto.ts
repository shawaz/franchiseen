// Client-side crypto utilities for OTP hashing
export async function hashOTP(otp: string): Promise<string> {
  // Use Web Crypto API for client-side hashing to match server-side Node.js crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

