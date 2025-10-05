import { query } from "./_generated/server";

// Debug query to check all franchise wallet balances
export const getAllFranchiseWalletBalances = query({
  args: {},
  handler: async (ctx) => {
    const wallets = await ctx.db.query("franchiseWallets").collect();
    
    return wallets.map(wallet => ({
      franchiseId: wallet.franchiseId,
      walletAddress: wallet.walletAddress,
      balance: wallet.balance,
      usdBalance: wallet.usdBalance,
      createdAt: new Date(wallet.createdAt).toISOString(),
      status: wallet.status
    }));
  },
});
