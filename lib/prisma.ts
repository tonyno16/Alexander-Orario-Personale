import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        // Prova tutte le variabili d'ambiente possibili nell'ordine di priorità
        // 1. POSTGRES_PRISMA_URL - da integrazione Supabase-Vercel (preferita)
        // 2. POSTGRES_URL_NON_POOLING - connection diretta senza pooling
        // 3. POSTGRES_URL - connection pooling
        // 4. DATABASE_URL - configurazione manuale (fallback)
        url: process.env.POSTGRES_PRISMA_URL 
          || process.env.POSTGRES_URL_NON_POOLING 
          || process.env.POSTGRES_URL 
          || process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

