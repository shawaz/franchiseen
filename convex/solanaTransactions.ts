import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send a real Solana transaction from server
 * This action calls the edge function to execute the Solana transaction
 */
export const executeSolanaTransfer = action({
  args: {
    fromPublicKey: v.string(),
    fromSecretKey: v.string(), // Stored secret key (encrypted in production)
    toPublicKey: v.string(),
    amountSOL: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Import Solana web3.js
      const { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } = await import('@solana/web3.js');
      
      // Setup connection
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      
      // Parse the secret key (stored as JSON array)
      let secretKeyArray;
      try {
        secretKeyArray = JSON.parse(args.fromSecretKey);
      } catch {
        throw new Error('Invalid secret key format');
      }
      
      // Create keypair from secret key
      const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
      
      // Verify the public key matches
      if (fromKeypair.publicKey.toBase58() !== args.fromPublicKey) {
        throw new Error('Public key does not match secret key');
      }
      
      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: new PublicKey(args.toPublicKey),
          lamports: Math.round(args.amountSOL * LAMPORTS_PER_SOL),
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKeypair.publicKey;
      
      // Sign transaction
      transaction.sign(fromKeypair);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(transaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`✅ Solana transaction successful: ${signature}`);
      console.log(`📝 Description: ${args.description}`);
      
      return {
        success: true,
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${network}`
      };
      
    } catch (error) {
      console.error('❌ Solana transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        signature: null,
        explorerUrl: null
      };
    }
  },
});

/**
 * Execute a batch of Solana transfers in one transaction
 */
export const executeBatchSolanaTransfers = action({
  args: {
    fromPublicKey: v.string(),
    fromSecretKey: v.string(),
    transfers: v.array(v.object({
      toPublicKey: v.string(),
      amountSOL: v.number(),
      description: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } = await import('@solana/web3.js');
      
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      
      // Parse secret key
      const secretKeyArray = JSON.parse(args.fromSecretKey);
      const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
      
      // Create transaction with multiple transfers
      const transaction = new Transaction();
      
      for (const transfer of args.transfers) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: new PublicKey(transfer.toPublicKey),
            lamports: Math.round(transfer.amountSOL * LAMPORTS_PER_SOL),
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
      
      return {
        success: true,
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${network}`,
        transferCount: args.transfers.length
      };
      
    } catch (error) {
      console.error('❌ Batch Solana transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        signature: null,
        explorerUrl: null
      };
    }
  },
});

