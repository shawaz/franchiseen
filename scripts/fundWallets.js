#!/usr/bin/env node

/**
 * Fund franchise wallets with devnet SOL for testing
 * 
 * Usage:
 *   node scripts/fundWallets.js
 */

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://neat-raccoon-612.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("💧 Checking franchise wallet balances...\n");

  try {
    // Get all wallets and their balances
    const result = await client.action(api.walletFunding.getAllWalletBalances, {});
    
    if (!result.success) {
      console.error("❌ Failed to get wallet balances:", result.error);
      return;
    }
    
    console.log(`📊 Network: ${result.network}`);
    console.log(`📊 Total wallets: ${result.wallets.length}\n`);
    
    const walletsNeedingFunds = result.wallets.filter(w => !w.error && w.actualBalance < 1);
    
    if (walletsNeedingFunds.length === 0) {
      console.log("✅ All wallets have sufficient SOL!");
      
      // Show current balances
      result.wallets.forEach((wallet, index) => {
        console.log(`\n${index + 1}. ${wallet.walletName}`);
        console.log(`   Address: ${wallet.address}`);
        console.log(`   Balance: ${wallet.actualBalance} SOL`);
        console.log(`   Database: ${wallet.databaseBalance} SOL`);
        if (wallet.discrepancy > 0.001) {
          console.log(`   ⚠️ Discrepancy: ${wallet.discrepancy.toFixed(6)} SOL`);
        }
      });
      
      return;
    }
    
    console.log(`💰 Found ${walletsNeedingFunds.length} wallets needing funds:\n`);
    
    for (const wallet of walletsNeedingFunds) {
      console.log(`\n🔄 Funding: ${wallet.walletName}`);
      console.log(`   Address: ${wallet.address}`);
      console.log(`   Current: ${wallet.actualBalance} SOL`);
      
      // Request airdrop
      const airdropResult = await client.action(
        api.walletFunding.requestDevnetAirdrop,
        {
          walletAddress: wallet.address,
          amountSOL: 2, // Request 2 SOL
        }
      );
      
      if (airdropResult.success) {
        console.log(`   ✅ Airdropped: ${airdropResult.amountAirdropped} SOL`);
        console.log(`   📊 New balance: ${airdropResult.newBalance} SOL`);
        console.log(`   🔗 ${airdropResult.explorerUrl}`);
        
        // Sync database balance
        await client.mutation(api.walletFunding.syncWalletBalance, {
          walletId: wallet.walletId,
          actualBalanceSOL: airdropResult.newBalance,
        });
        
        console.log(`   ✅ Database synced`);
      } else {
        console.log(`   ❌ Airdrop failed: ${airdropResult.error}`);
        console.log(`   💡 Try manually: solana airdrop 2 ${wallet.address} --url devnet`);
      }
      
      // Wait 1 second between airdrops to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n✅ Funding complete!");
    console.log("\n💡 To check balances again, run: node scripts/fundWallets.js");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();

