import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { validateTransfer, FindReferenceError, ValidateTransferError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  AppError,
  HTTP_STATUS,
  ERROR_CODES,
  SOLANA_NETWORKS,
  SOLANA_TOKENS,
  SOLANA_PAY_CONSTANTS,
  isValidSolanaAddress,
  formatSolanaAmount,
  parseSolanaAmount,
  generateSolanaPayReference,
  createSolanaPayUrl,
} from '@franchiseen/shared';

export class SolanaService {
  private connection: Connection;
  private merchantKeypair: Keypair | null = null;

  constructor() {
    // Initialize Solana connection
    const rpcUrl = config.payment.solana.rpcUrl || this.getDefaultRpcUrl();
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Initialize merchant keypair if private key is provided
    if (config.payment.solana.privateKey) {
      try {
        const privateKeyBytes = this.decodePrivateKey(config.payment.solana.privateKey);
        this.merchantKeypair = Keypair.fromSecretKey(privateKeyBytes);
        logger.info('Solana merchant wallet initialized', {
          publicKey: this.merchantKeypair.publicKey.toBase58(),
          network: config.payment.solana.network,
        });
      } catch (error) {
        logger.error('Failed to initialize Solana merchant keypair:', error);
      }
    }
  }

  private getDefaultRpcUrl(): string {
    switch (config.payment.solana.network) {
      case 'mainnet-beta':
        return 'https://api.mainnet-beta.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      case 'devnet':
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  private decodePrivateKey(privateKey: string): Uint8Array {
    // Assume base58 encoded private key
    try {
      return Uint8Array.from(Buffer.from(privateKey, 'base64'));
    } catch {
      throw new AppError(
        'Invalid Solana private key format',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
  }

  /**
   * Create a Solana Pay request
   */
  async createPaymentRequest(params: {
    amount: number;
    currency: 'SOL' | 'USDC' | 'USDT';
    label: string;
    message?: string;
    memo?: string;
    orderId?: string;
  }): Promise<{
    reference: string;
    url: string;
    recipient: string;
    amount: number;
    splToken?: string;
  }> {
    if (!config.payment.solana.merchantWallet) {
      throw new AppError(
        'Solana merchant wallet not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const recipient = config.payment.solana.merchantWallet;
    if (!isValidSolanaAddress(recipient)) {
      throw new AppError(
        'Invalid merchant wallet address',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INVALID_SOLANA_ADDRESS
      );
    }

    const reference = generateSolanaPayReference();
    const tokenInfo = SOLANA_TOKENS[params.currency];
    
    const paymentParams = {
      recipient,
      amount: params.amount,
      reference,
      label: params.label,
      message: params.message,
      memo: params.memo,
      ...(params.currency !== 'SOL' && { splToken: tokenInfo.mint }),
    };

    const url = createSolanaPayUrl(paymentParams);

    logger.info('Created Solana Pay request', {
      reference,
      recipient,
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
    });

    return {
      reference,
      url,
      recipient,
      amount: params.amount,
      ...(params.currency !== 'SOL' && { splToken: tokenInfo.mint }),
    };
  }

  /**
   * Validate a Solana Pay transaction
   */
  async validatePayment(params: {
    signature: string;
    recipient: string;
    amount: number;
    splToken?: string;
    reference?: string;
  }): Promise<{
    isValid: boolean;
    transaction?: ParsedTransactionWithMeta;
    error?: string;
  }> {
    try {
      const recipientPublicKey = new PublicKey(params.recipient);
      const referencePublicKey = params.reference ? new PublicKey(params.reference) : undefined;
      const splTokenPublicKey = params.splToken ? new PublicKey(params.splToken) : undefined;

      // Convert amount to appropriate units
      const amount = params.splToken 
        ? new BigNumber(params.amount).multipliedBy(Math.pow(10, this.getTokenDecimals(params.splToken)))
        : new BigNumber(params.amount).multipliedBy(LAMPORTS_PER_SOL);

      await validateTransfer(
        this.connection,
        params.signature,
        {
          recipient: recipientPublicKey,
          amount,
          splToken: splTokenPublicKey,
          reference: referencePublicKey,
        }
      );

      // Get transaction details
      const transaction = await this.connection.getParsedTransaction(params.signature, {
        commitment: 'confirmed',
      });

      logger.info('Solana payment validated successfully', {
        signature: params.signature,
        recipient: params.recipient,
        amount: params.amount,
      });

      return {
        isValid: true,
        transaction: transaction || undefined,
      };
    } catch (error) {
      let errorMessage = 'Unknown validation error';
      
      if (error instanceof FindReferenceError) {
        errorMessage = 'Payment reference not found in transaction';
      } else if (error instanceof ValidateTransferError) {
        errorMessage = 'Payment validation failed: ' + error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      logger.warn('Solana payment validation failed', {
        signature: params.signature,
        error: errorMessage,
      });

      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<{
    status: 'pending' | 'confirmed' | 'finalized' | 'failed';
    confirmations: number;
    slot?: number;
    blockTime?: number;
  }> {
    try {
      const status = await this.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });

      if (!status.value) {
        return { status: 'pending', confirmations: 0 };
      }

      const confirmations = status.value.confirmations || 0;
      let transactionStatus: 'pending' | 'confirmed' | 'finalized' | 'failed' = 'pending';

      if (status.value.err) {
        transactionStatus = 'failed';
      } else if (confirmations >= 32) {
        transactionStatus = 'finalized';
      } else if (confirmations > 0) {
        transactionStatus = 'confirmed';
      }

      return {
        status: transactionStatus,
        confirmations,
        slot: status.value.slot,
      };
    } catch (error) {
      logger.error('Failed to get transaction status:', error);
      throw new AppError(
        'Failed to get transaction status',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.SOLANA_NETWORK_ERROR
      );
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string, tokenMint?: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);

      if (tokenMint) {
        // Get SPL token balance
        const tokenPublicKey = new PublicKey(tokenMint);
        const associatedTokenAddress = await getAssociatedTokenAddress(
          tokenPublicKey,
          publicKey
        );

        const balance = await this.connection.getTokenAccountBalance(associatedTokenAddress);
        return parseFloat(balance.value.uiAmountString || '0');
      } else {
        // Get SOL balance
        const balance = await this.connection.getBalance(publicKey);
        return formatSolanaAmount(balance);
      }
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      return 0;
    }
  }

  /**
   * Get recent transactions for a wallet
   */
  async getRecentTransactions(
    address: string,
    limit = 10
  ): Promise<ConfirmedSignatureInfo[]> {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit,
      });

      return signatures;
    } catch (error) {
      logger.error('Failed to get recent transactions:', error);
      return [];
    }
  }

  private getTokenDecimals(tokenMint: string): number {
    // Get decimals for known tokens
    for (const token of Object.values(SOLANA_TOKENS)) {
      if (token.mint === tokenMint) {
        return token.decimals;
      }
    }
    
    // Default to 9 decimals if unknown
    return 9;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(
      config.payment.solana.merchantWallet &&
      isValidSolanaAddress(config.payment.solana.merchantWallet)
    );
  }

  /**
   * Get network info
   */
  getNetworkInfo(): {
    network: string;
    rpcUrl: string;
    merchantWallet?: string;
  } {
    return {
      network: config.payment.solana.network,
      rpcUrl: this.connection.rpcEndpoint,
      merchantWallet: config.payment.solana.merchantWallet,
    };
  }
}

// Export singleton instance
export const solanaService = new SolanaService();
