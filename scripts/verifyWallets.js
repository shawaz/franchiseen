#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://neat-raccoon-612.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("🔍 Verifying all franchise wallets...\n");

  try {
    const result = await client.query(api.migrateWallets.verifyAllWallets, {});
    
    console.log(`📊 Summary:`);
    console.log(`   Total: ${result.total}`);
    console.log(`   Valid: ${result.valid}`);
    console.log(`   Invalid: ${result.invalid}\n`);
    
    console.log("📋 All Wallets:\n");
    
    result.wallets.forEach((wallet, index) => {
      const status = wallet.isValid ? "✅" : "❌";
      console.log(`${index + 1}. ${status} ${wallet.walletName}`);
      console.log(`   Address: ${wallet.address}`);
      console.log(`   Valid: ${wallet.isValid ? 'Yes' : 'No'}`);
      console.log(`   Has Secret Key: ${wallet.hasSecretKey ? 'Yes' : 'No'}`);
      if (wallet.explorerUrl) {
        console.log(`   Explorer: ${wallet.explorerUrl}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();

