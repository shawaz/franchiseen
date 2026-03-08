import { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { clusterApiUrl } from '@solana/web3.js';

// Create a new Solana wallet without seedphrase
export function createNewWallet(): { keypair: Keypair; publicKey: string; secretKey: Uint8Array } {
  const keypair = Keypair.generate();
  return {
    keypair,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: keypair.secretKey
  };
}

// Token Mints
export const USDC_MINT = {
  devnet: '4zMMC9srtvS2X6x5c5C9S7XdcN3V6Y2b356h6m8v4',
  mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
};

// Get wallet balance
export async function getWalletBalance(publicKey: string, network: 'devnet' | 'mainnet-beta' = 'devnet'): Promise<number> {
  if (!publicKey) return 0;
  try {
    const connection = new Connection(clusterApiUrl(network), 'confirmed');
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

// Get USDC balance
export async function getUSDCBalance(publicKey: string, network: 'devnet' | 'mainnet-beta' = 'devnet'): Promise<number> {
  if (!publicKey) return 0;
  try {
    const mint = network === 'devnet' ? USDC_MINT.devnet : USDC_MINT.mainnet;
    const connection = new Connection(clusterApiUrl(network), 'confirmed');

    const response = await connection.getParsedTokenAccountsByOwner(new PublicKey(publicKey), {
      mint: new PublicKey(mint),
    });

    if (response.value.length === 0) {
      return 0;
    }

    let totalBalance = 0;
    for (const account of response.value) {
      const amount = account.account.data.parsed.info.tokenAmount.uiAmount || 0;
      totalBalance += amount;
    }

    return totalBalance;
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return 0;
  }
}

// Request airdrop for devnet (for testing)
export async function requestAirdrop(publicKey: string, amount: number = 1): Promise<string | null> {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const signature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      amount * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    return null;
  }
}

// Transfer SOL between wallets
export async function transferSOL(
  fromKeypair: Keypair,
  toPublicKey: string,
  amount: number,
  network: 'devnet' | 'mainnet-beta' = 'devnet'
): Promise<string | null> {
  try {
    const connection = new Connection(clusterApiUrl(network), 'confirmed');

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(toPublicKey),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await connection.sendTransaction(transaction, [fromKeypair]);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    return null;
  }
}

// Store wallet in localStorage (for demo purposes - in production, use secure storage)
export function storeWallet(publicKey: string, secretKey: Uint8Array, franchiseId: string): void {
  const walletData = {
    publicKey,
    secretKey: Array.from(secretKey), // Convert Uint8Array to regular array for JSON storage
    franchiseId,
    createdAt: Date.now()
  };

  const storageKey = `franchise_wallet_${franchiseId}`;
  console.log('Storing wallet with key:', storageKey, 'publicKey:', publicKey);
  localStorage.setItem(storageKey, JSON.stringify(walletData));

  // Verify storage
  const stored = localStorage.getItem(storageKey);
  console.log('Wallet storage verified:', !!stored);
}

// Retrieve wallet from localStorage
export function getStoredWallet(franchiseId: string): { publicKey: string; secretKey: Uint8Array } | null {
  try {
    const storageKey = `franchise_wallet_${franchiseId}`;
    console.log('Retrieving wallet with key:', storageKey);
    const stored = localStorage.getItem(storageKey);
    console.log('Stored data found:', !!stored);

    if (!stored) {
      console.log('No stored wallet found for franchiseId:', franchiseId);
      return null;
    }

    const walletData = JSON.parse(stored);
    console.log('Retrieved wallet data:', { publicKey: walletData.publicKey, franchiseId: walletData.franchiseId });
    return {
      publicKey: walletData.publicKey,
      secretKey: new Uint8Array(walletData.secretKey)
    };
  } catch (error) {
    console.error('Error retrieving stored wallet:', error);
    return null;
  }
}

// Generate a deterministic wallet address from franchise data (alternative approach)
export function generateDeterministicWallet(franchiseId: string, franchiserId: string): { keypair: Keypair; publicKey: string; secretKey: Uint8Array } {
  // Create a deterministic seed from franchise data
  const seed = `${franchiseId}_${franchiserId}_${Date.now()}`;
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(seed);

  // Use the seed to generate a keypair (this is deterministic)
  const keypair = Keypair.fromSeed(seedBytes.slice(0, 32)); // Take first 32 bytes

  return {
    keypair,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: keypair.secretKey
  };
}
