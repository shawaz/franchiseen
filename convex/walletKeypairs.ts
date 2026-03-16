/**
 * Wallet keypair management - replaced with Stripe
 * These are no-op stubs kept for backward compatibility
 */

export function generateKeypair(): { publicKey: string; secretKey: string } {
  return { publicKey: '', secretKey: '' };
}

export function keypairFromSecretKey(_secretKeyString: string): null {
  return null;
}

export function encryptSecretKey(k: string): string {
  return k;
}

export function decryptSecretKey(k: string): string {
  return k;
}
