import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Solana transactions - replaced by Stripe payments
 * These are no-op stubs kept for backward compatibility
 */

export const executeSolanaTransfer = action({
  args: {
    fromPublicKey: v.string(),
    fromSecretKey: v.string(),
    toPublicKey: v.string(),
    amountSOL: v.number(),
    description: v.string(),
  },
  handler: async () => ({
    success: false,
    error: "Solana removed - use Stripe payments",
    signature: null,
    explorerUrl: null,
  }),
});

export const executeBatchSolanaTransfers = action({
  args: {
    fromPublicKey: v.string(),
    fromSecretKey: v.string(),
    transfers: v.array(
      v.object({
        toPublicKey: v.string(),
        amountSOL: v.number(),
        description: v.string(),
      })
    ),
  },
  handler: async () => ({
    success: false,
    error: "Solana removed - use Stripe payments",
    signature: null,
    explorerUrl: null,
  }),
});
