import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!(global as any).prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    (global as any).prisma = new PrismaClient({ adapter });
  }
  prisma = (global as any).prisma;
}

export { prisma };
