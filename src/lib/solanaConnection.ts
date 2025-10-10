import { Connection, ConnectionConfig, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getSolanaRpcConfig, SolanaNetwork } from './solanaConfig';

const DEFAULT_CONFIG: ConnectionConfig = {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
};

/**
 * Robust Solana connection with automatic fallback and retry logic
 */
export class RobustConnection {
  private rpcUrls: string[];
  private currentIndex: number = 0;
  private connection: Connection;
  private network: SolanaNetwork;

  constructor(network: SolanaNetwork = 'mainnet-beta') {
    this.network = network;
    const config = getSolanaRpcConfig(network);
    this.rpcUrls = [config.primary, ...config.fallbacks];
    this.connection = new Connection(this.rpcUrls[0], DEFAULT_CONFIG);
    
    // Log which RPC we're using
    if (typeof window !== 'undefined') {
      console.log(`[Solana] Using RPC: ${this.getCurrentRpcUrl()}`);
    }
  }

  /**
   * Get the current RPC URL being used
   */
  getCurrentRpcUrl(): string {
    return this.rpcUrls[this.currentIndex];
  }

  /**
   * Get the underlying Connection object
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the network this connection is for
   */
  getNetwork(): SolanaNetwork {
    return this.network;
  }

  /**
   * Execute an operation with automatic retry and fallback
   */
  async withRetry<T>(
    operation: (connection: Connection) => Promise<T>,
    maxRetries: number = 3,
    timeout: number = 5000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Execute with timeout
        const result = await Promise.race([
          operation(this.connection),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('RPC timeout')), timeout)
          ),
        ]);
        
        // Success! Reset to primary RPC if we were using a fallback
        if (this.currentIndex !== 0) {
          console.log('[Solana] Operation successful, resetting to primary RPC');
          this.currentIndex = 0;
          this.connection = new Connection(this.rpcUrls[0], DEFAULT_CONFIG);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        const rpcUrl = this.rpcUrls[this.currentIndex];
        console.warn(
          `[Solana] Attempt ${attempt + 1}/${maxRetries} failed with ${rpcUrl}:`,
          error instanceof Error ? error.message : error
        );

        // Try next RPC endpoint if available
        if (attempt < maxRetries - 1 && this.currentIndex < this.rpcUrls.length - 1) {
          this.currentIndex++;
          this.connection = new Connection(
            this.rpcUrls[this.currentIndex],
            DEFAULT_CONFIG
          );
          console.log(`[Solana] Switching to fallback RPC: ${this.getCurrentRpcUrl()}`);
          
          // Brief delay before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed
    throw lastError || new Error('All RPC endpoints failed');
  }

  /**
   * Get balance for a public key in SOL
   */
  async getBalance(publicKeyOrString: PublicKey | string): Promise<number> {
    const publicKey = typeof publicKeyOrString === 'string' 
      ? new PublicKey(publicKeyOrString) 
      : publicKeyOrString;
      
    return this.withRetry(async (conn) => {
      const balance = await conn.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    });
  }

  /**
   * Get recent blockhash
   */
  async getRecentBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    return this.withRetry(async (conn) => {
      return await conn.getLatestBlockhash();
    });
  }

  /**
   * Send a raw transaction
   */
  async sendTransaction(signedTransaction: Buffer | Uint8Array): Promise<string> {
    return this.withRetry(async (conn) => {
      return await conn.sendRawTransaction(signedTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
    }, 5, 10000); // More retries and longer timeout for transactions
  }

  /**
   * Confirm a transaction
   */
  async confirmTransaction(signature: string): Promise<void> {
    return this.withRetry(async (conn) => {
      const result = await conn.confirmTransaction(signature, 'confirmed');
      if (result.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
      }
    }, 5, 30000); // Longer timeout for confirmation
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string) {
    return this.withRetry(async (conn) => {
      return await conn.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
    });
  }

  /**
   * Get account info
   */
  async getAccountInfo(publicKeyOrString: PublicKey | string) {
    const publicKey = typeof publicKeyOrString === 'string' 
      ? new PublicKey(publicKeyOrString) 
      : publicKeyOrString;
      
    return this.withRetry(async (conn) => {
      return await conn.getAccountInfo(publicKey);
    });
  }
}

// Singleton instances
let mainnetConnection: RobustConnection | null = null;
let devnetConnection: RobustConnection | null = null;

/**
 * Get a singleton Solana connection for the specified network
 */
export const getSolanaConnection = (network: SolanaNetwork = 'mainnet-beta'): RobustConnection => {
  if (network === 'devnet') {
    if (!devnetConnection) {
      devnetConnection = new RobustConnection('devnet');
    }
    return devnetConnection;
  } else {
    if (!mainnetConnection) {
      mainnetConnection = new RobustConnection('mainnet-beta');
    }
    return mainnetConnection;
  }
};

/**
 * Reset connection singletons (useful for testing or network switches)
 */
export const resetConnections = (): void => {
  mainnetConnection = null;
  devnetConnection = null;
};

