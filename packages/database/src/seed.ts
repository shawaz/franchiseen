import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { TenantStatus, SubscriptionPlan, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create platform admin user
  const adminPasswordHash = await bcrypt.hash('admin123!', 12);
  
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@franchiseen.com' },
    update: {},
    create: {
      email: 'admin@franchiseen.com',
      passwordHash: adminPasswordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      emailVerified: true,
      status: UserStatus.ACTIVE,
      role: UserRole.PLATFORM_ADMIN,
    },
  });

  console.log('✅ Created platform admin user');

  // Create demo tenant owner
  const ownerPasswordHash = await bcrypt.hash('owner123!', 12);
  
  const tenantOwner = await prisma.user.upsert({
    where: { email: 'owner@demo-store.com' },
    update: {},
    create: {
      email: 'owner@demo-store.com',
      passwordHash: ownerPasswordHash,
      firstName: 'Demo',
      lastName: 'Owner',
      emailVerified: true,
      status: UserStatus.ACTIVE,
      role: UserRole.TENANT_OWNER,
    },
  });

  console.log('✅ Created demo tenant owner');

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo-store' },
    update: {},
    create: {
      name: 'Demo Store',
      subdomain: 'demo-store',
      status: TenantStatus.ACTIVE,
      plan: SubscriptionPlan.PROFESSIONAL,
      ownerId: tenantOwner.id,
      settings: {
        storeName: 'Demo Store',
        storeDescription: 'A demo e-commerce store showcasing Franchiseen capabilities',
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        currency: 'USD',
        timezone: 'America/New_York',
        language: 'en',
        enabledFeatures: [
          'products',
          'orders',
          'customers',
          'analytics',
          'marketing',
          'discounts',
          'shipping',
          'taxes',
        ],
      },
    },
  });

  // Update tenant owner with tenant association
  await prisma.user.update({
    where: { id: tenantOwner.id },
    data: { tenantId: demoTenant.id },
  });

  console.log('✅ Created demo tenant');

  // Create demo products
  const demoProducts = [
    {
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
      handle: 'premium-wireless-headphones',
      vendor: 'AudioTech',
      productType: 'Electronics',
      tags: ['electronics', 'audio', 'wireless', 'premium'],
      variants: [
        {
          title: 'Black',
          price: 299.99,
          compareAtPrice: 349.99,
          sku: 'PWH-BLACK-001',
          inventoryQuantity: 50,
          weight: 0.8,
          options: [{ name: 'Color', value: 'Black' }],
        },
        {
          title: 'White',
          price: 299.99,
          compareAtPrice: 349.99,
          sku: 'PWH-WHITE-001',
          inventoryQuantity: 30,
          weight: 0.8,
          options: [{ name: 'Color', value: 'White' }],
        },
      ],
    },
    {
      title: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors.',
      handle: 'organic-cotton-t-shirt',
      vendor: 'EcoWear',
      productType: 'Clothing',
      tags: ['clothing', 'organic', 'cotton', 'sustainable'],
      variants: [
        {
          title: 'Small / Navy',
          price: 29.99,
          sku: 'OCT-NAVY-S',
          inventoryQuantity: 25,
          weight: 0.2,
          options: [
            { name: 'Size', value: 'Small' },
            { name: 'Color', value: 'Navy' },
          ],
        },
        {
          title: 'Medium / Navy',
          price: 29.99,
          sku: 'OCT-NAVY-M',
          inventoryQuantity: 40,
          weight: 0.2,
          options: [
            { name: 'Size', value: 'Medium' },
            { name: 'Color', value: 'Navy' },
          ],
        },
        {
          title: 'Large / Navy',
          price: 29.99,
          sku: 'OCT-NAVY-L',
          inventoryQuantity: 35,
          weight: 0.2,
          options: [
            { name: 'Size', value: 'Large' },
            { name: 'Color', value: 'Navy' },
          ],
        },
      ],
    },
    {
      title: 'Stainless Steel Water Bottle',
      description: 'Durable stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
      handle: 'stainless-steel-water-bottle',
      vendor: 'HydroLife',
      productType: 'Accessories',
      tags: ['accessories', 'water-bottle', 'stainless-steel', 'insulated'],
      variants: [
        {
          title: '500ml',
          price: 34.99,
          sku: 'SSWB-500ML',
          inventoryQuantity: 60,
          weight: 0.5,
          options: [{ name: 'Size', value: '500ml' }],
        },
        {
          title: '750ml',
          price: 39.99,
          sku: 'SSWB-750ML',
          inventoryQuantity: 45,
          weight: 0.7,
          options: [{ name: 'Size', value: '750ml' }],
        },
      ],
    },
  ];

  for (const productData of demoProducts) {
    const { variants, ...productInfo } = productData;
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        tenantId: demoTenant.id,
        status: 'ACTIVE',
      },
    });

    // Create variants for the product
    for (const variantData of variants) {
      await prisma.productVariant.create({
        data: {
          ...variantData,
          productId: product.id,
        },
      });
    }

    console.log(`✅ Created product: ${product.title}`);
  }

  // Create demo customer
  const demoCustomer = await prisma.customer.create({
    data: {
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      acceptsMarketing: true,
      tenantId: demoTenant.id,
      defaultAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main Street',
        city: 'New York',
        province: 'NY',
        country: 'United States',
        zip: '10001',
        phone: '+1-555-0123',
      },
      addresses: [
        {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main Street',
          city: 'New York',
          province: 'NY',
          country: 'United States',
          zip: '10001',
          phone: '+1-555-0123',
        },
      ],
      tags: ['vip', 'newsletter-subscriber'],
    },
  });

  console.log('✅ Created demo customer');

  // Create demo Solana wallet for the tenant
  const demoSolanaWallet = await prisma.solanaWallet.create({
    data: {
      address: '11111111111111111111111111111112', // System program address (demo)
      name: 'Demo Merchant Wallet',
      isActive: true,
      tenantId: demoTenant.id,
    },
  });

  console.log('✅ Created demo Solana wallet');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Seed Summary:');
  console.log(`- Platform Admin: admin@franchiseen.com (password: admin123!)`);
  console.log(`- Demo Store Owner: owner@demo-store.com (password: owner123!)`);
  console.log(`- Demo Store: demo-store.franchiseen.com`);
  console.log(`- Products: ${demoProducts.length} demo products created`);
  console.log(`- Customer: customer@example.com`);
  console.log(`- Solana Wallet: ${demoSolanaWallet.address} (demo wallet)`);
  console.log('\n🚀 Solana Pay Integration:');
  console.log('- Configure SOLANA_MERCHANT_WALLET in .env for live payments');
  console.log('- Supports SOL, USDC, and USDT payments');
  console.log('- Network: devnet (configurable via SOLANA_NETWORK)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
