#!/usr/bin/env node

/**
 * Migrate all franchise wallets with invalid Solana addresses to real addresses
 * 
 * Usage:
 *   node scripts/migrateWallets.js
 */

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment variables");
  console.error("   Make sure .env.local has NEXT_PUBLIC_CONVEX_URL set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log("🔍 Checking for invalid franchise wallets...\n");

  try {
    // Step 1: Find invalid wallets
    const checkResult = await client.query(api.migrateWallets.findInvalidWallets, {});
    
    console.log(`📊 Wallet Status:`);
    console.log(`   Total wallets: ${checkResult.total}`);
    console.log(`   Invalid wallets: ${checkResult.invalid}`);
    console.log(`   Valid wallets: ${checkResult.total - checkResult.invalid}\n`);
    
    if (checkResult.invalid === 0) {
      console.log("✅ All wallets are valid! No migration needed.");
      return;
    }
    
    // Show invalid wallets
    console.log("❌ Invalid wallets found:");
    checkResult.invalidWallets.forEach((wallet, index) => {
      console.log(`   ${index + 1}. ${wallet.walletName}`);
      console.log(`      Address: ${wallet.currentAddress}`);
      console.log(`      Has Secret Key: ${wallet.hasSecretKey ? 'Yes' : 'No'}`);
    });
    
    console.log("\n🔄 Starting migration...\n");
    
    // Step 2: Migrate all invalid wallets
    const migrateResult = await client.mutation(
      api.migrateWallets.migrateAllInvalidWallets,
      {}
    );
    
    if (migrateResult.success) {
      console.log(`✅ ${migrateResult.message}\n`);
      
      // Show migration results
      console.log("📝 Migration Results:");
      migrateResult.results.forEach((result, index) => {
        console.log(`\n   ${index + 1}. ${result.walletName}`);
        console.log(`      Old: ${result.oldAddress}`);
        console.log(`      New: ${result.newAddress}`);
        console.log(`      Explorer: https://explorer.solana.com/address/${result.newAddress}?cluster=devnet`);
      });
      
      console.log("\n✅ Migration completed successfully!");
      console.log("🔗 All new addresses are now visible in Solana Explorer (devnet)");
    } else {
      console.error("❌ Migration failed:", migrateResult.message);
    }
    
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

main();

