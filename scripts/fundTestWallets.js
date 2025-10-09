#!/usr/bin/env node

/**
 * Fund all franchise wallets with devnet SOL for testing
 * 
 * Usage:
 *   node scripts/fundTestWallets.js [amount]
 * 
 * Example:
 *   node scripts/fundTestWallets.js 2    # Fund each wallet with 2 SOL
 */

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://neat-raccoon-612.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  const amountSOL = parseFloat(process.argv[2]) || 2;
  
  console.log(`💰 Funding Test Wallets with ${amountSOL} SOL each...\n`);

  try {
    // Get all wallets
    const wallets = await client.query(api.fundTestWallets.getWalletsNeedingFunds, {});
    
    console.log(`📊 Found ${wallets.length} wallets:\n`);
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. ${wallet.name}`);
      console.log(`   Address: ${wallet.address}`);
      console.log(`   Current Balance: ${wallet.currentBalance} SOL (database)`);
      console.log(`   Explorer: ${wallet.explorerUrl}\n`);
    });
    
    console.log(`🚀 Starting airdrop process...\n`);
    
    // Fund all wallets
    const result = await client.action(api.fundTestWallets.fundAllTestWallets, {
      amountPerWallet: amountSOL,
    });
    
    if (result.success) {
      console.log(`\n✅ Successfully funded ${result.successCount}/${result.totalWallets} wallets!\n`);
      
      console.log(`📊 Results:\n`);
      result.results.forEach((r, index) => {
        if (r.success) {
          console.log(`${index + 1}. ✅ ${r.wallet}`);
          console.log(`   Balance: ${r.newBalanceSOL} SOL`);
          console.log(`   TX: https://explorer.solana.com/tx/${r.signature}?cluster=devnet\n`);
        } else {
          console.log(`${index + 1}. ❌ ${r.wallet}`);
          console.log(`   Error: ${r.error}\n`);
        }
      });
      
      console.log(`\n🎉 All wallets funded! You can now test real transactions.`);
      console.log(`💡 Try completing funding for a franchise to see on-chain transfers.`);
    } else {
      console.error(`\n❌ Funding failed: ${result.error}`);
      console.log(`\n💡 Manual airdrop commands:`);
      wallets.forEach(wallet => {
        console.log(`   ${wallet.airdropCommand}`);
      });
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log(`\n💡 Make sure you're on devnet and try manual airdrops:`);
    console.log(`   solana airdrop 2 <WALLET_ADDRESS> --url devnet`);
  }
}

main();

