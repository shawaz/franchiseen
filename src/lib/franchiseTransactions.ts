import { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

/**
 * Send a real SOL transfer on Solana blockchain
 * @param fromKeypair - Sender's keypair (must have private key)
 * @param toPublicKey - Recipient's public key (string)
 * @param amountSOL - Amount in SOL to transfer
 * @returns Transaction signature or null if failed
 */
export async function sendSolanaTransfer(
  fromKeypair: Keypair,
  toPublicKey: string,
  amountSOL: number
): Promise<string | null> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(toPublicKey),
        lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
      })
    );
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;
    
    // Sign and send
    transaction.sign(fromKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log(`✅ Solana transaction successful: ${signature}`);
    return signature;
  } catch (error) {
    console.error('❌ Solana transaction failed:', error);
    return null;
  }
}

/**
 * Get keypair from stored secret key
 * @param secretKeyString - Base58 encoded secret key or array of numbers
 * @returns Keypair or null if invalid
 */
export function getKeypairFromSecretKey(secretKeyString: string): Keypair | null {
  try {
    // If it's stored as JSON array
    if (secretKeyString.startsWith('[')) {
      const secretKeyArray = JSON.parse(secretKeyString);
      return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
    }
    
    // If it's stored as base58
    // Note: You may need bs58 library for this
    // For now, assuming it's stored as array
    const secretKeyArray = JSON.parse(secretKeyString);
    return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  } catch (error) {
    console.error('Failed to parse keypair:', error);
    return null;
  }
}

/**
 * Generate a new Solana keypair
 * @returns New keypair with public key and secret key
 */
export function generateSolanaKeypair(): {
  publicKey: string;
  secretKey: string;
  keypair: Keypair;
} {
  const keypair = Keypair.generate();
  
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: JSON.stringify(Array.from(keypair.secretKey)),
    keypair
  };
}

/**
 * Send multiple transfers in one transaction (for efficiency)
 */
export async function sendBatchTransfers(
  fromKeypair: Keypair,
  transfers: Array<{ to: string; amount: number }>
): Promise<string | null> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Create transaction with multiple transfer instructions
    const transaction = new Transaction();
    
    for (const transfer of transfers) {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: new PublicKey(transfer.to),
          lamports: Math.round(transfer.amount * LAMPORTS_PER_SOL),
        })
      );
    }
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;
    
    // Sign and send
    transaction.sign(fromKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log(`✅ Batch Solana transaction successful: ${signature}`);
    return signature;
  } catch (error) {
    console.error('❌ Batch Solana transaction failed:', error);
    return null;
  }
}

