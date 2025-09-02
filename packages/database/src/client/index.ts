import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

// Multi-tenant database client factory
export class DatabaseClient {
  private static instance: DatabaseClient;
  private clients: Map<string, PrismaClient> = new Map();

  private constructor() {}

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  // Get or create a tenant-specific database client
  public getClient(tenantId?: string): PrismaClient {
    if (!tenantId) {
      return prisma; // Return global client for platform-level operations
    }

    if (!this.clients.has(tenantId)) {
      // In a real multi-tenant setup, you might use different database URLs
      // For now, we'll use the same client but with tenant-aware queries
      this.clients.set(tenantId, prisma);
    }

    return this.clients.get(tenantId)!;
  }

  // Clean up tenant client
  public async disconnectTenant(tenantId: string): Promise<void> {
    const client = this.clients.get(tenantId);
    if (client && client !== prisma) {
      await client.$disconnect();
      this.clients.delete(tenantId);
    }
  }

  // Clean up all clients
  public async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.entries()).map(
      async ([tenantId, client]) => {
        if (client !== prisma) {
          await client.$disconnect();
        }
      }
    );

    await Promise.all(disconnectPromises);
    await prisma.$disconnect();
    this.clients.clear();
  }
}

// Export the singleton instance
export const dbClient = DatabaseClient.getInstance();

// Export the global Prisma client for platform-level operations
export { prisma };

// Graceful shutdown
process.on('beforeExit', async () => {
  await dbClient.disconnectAll();
});

process.on('SIGINT', async () => {
  await dbClient.disconnectAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await dbClient.disconnectAll();
  process.exit(0);
});
