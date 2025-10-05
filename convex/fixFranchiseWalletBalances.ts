import { mutation, query } from "./_generated/server";

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

// Fix franchise wallets that have incorrect balances
export const fixFranchiseWalletBalances = mutation({
  args: {},
  handler: async (ctx) => {
    const wallets = await ctx.db.query("franchiseWallets").collect();
    const results = [];
    
    for (const wallet of wallets) {
      let needsFix = false;
      let oldBalance = wallet.balance;
      let oldUsdBalance = wallet.usdBalance;
      
      // Check if balance is 0.5 SOL or usdBalance is 75 (which would show as 0.5 SOL)
      if (wallet.balance === 0.5 || wallet.usdBalance === 75) {
        needsFix = true;
      }
      
      if (needsFix) {
        await ctx.db.patch(wallet._id, {
          balance: 0,
          usdBalance: 0,
          updatedAt: Date.now()
        });
        
        results.push({
          franchiseId: wallet.franchiseId,
          walletAddress: wallet.walletAddress,
          oldBalance: oldBalance,
          oldUsdBalance: oldUsdBalance,
          newBalance: 0,
          newUsdBalance: 0,
          fixed: true
        });
      } else {
        results.push({
          franchiseId: wallet.franchiseId,
          walletAddress: wallet.walletAddress,
          balance: wallet.balance,
          usdBalance: wallet.usdBalance,
          fixed: false
        });
      }
    }
    
    return {
      totalWallets: wallets.length,
      fixedWallets: results.filter(r => r.fixed).length,
      results
    };
  },
});
