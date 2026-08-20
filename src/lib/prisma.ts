// NOTE: schema.prisma uses the `prisma-client` generator with a custom
// output path (src/generated/prisma), so the client is imported from
// './client' inside that folder rather than the classic '@prisma/client'.
// Run `npm run prisma:generate` before this will resolve.
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '@/config';

const isDev = config.NODE_ENV === 'development';

// Prisma 7 dropped the built-in query engine in favor of driver adapters,
// so the connection string is passed here instead of read from the
// datasource block in schema.prisma.
const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

// --- Singleton pattern ---
// `tsx watch` hot-reloads on every save. Without stashing the instance on
// globalThis, each reload would spin up a new PrismaClient (and connection
// pool) while the old one leaks, quickly exhausting Postgres's
// max_connections. In production this branch never triggers since the
// process only starts once.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (isDev) {
  globalForPrisma.prisma = prisma;
}

// --- Connection lifecycle helpers ---
// Call connectDB() once at boot so a broken DB connection fails the
// container/process immediately, rather than failing silently on the first
// real request.
export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log('Database connected');
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

// Cheap query used by the /health/ready endpoint to verify the DB is
// actually reachable, not just that the process is up.
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
