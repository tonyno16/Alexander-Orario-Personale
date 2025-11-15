# Verifica Integrazione Supabase-Vercel

Se continui a vedere errori di connessione, verifica questi punti:

## ✅ Checklist Verifica

### 1. Integrazione Installata?

1. Vai su Vercel Dashboard → Il tuo progetto
2. Settings → **Integrations**
3. Verifica che **Supabase** sia nella lista delle integrazioni installate
4. Se NON c'è, installala seguendo `SUPABASE_VERCEL_INTEGRATION.md`

### 2. Variabili d'Ambiente Presenti?

1. Vai su Vercel Dashboard → Settings → **Environment Variables**
2. Verifica che queste variabili siano presenti:
   - ✅ `POSTGRES_PRISMA_URL` (IMPORTANTE per Prisma)
   - ✅ `POSTGRES_URL`
   - ✅ `POSTGRES_URL_NON_POOLING`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Se `POSTGRES_PRISMA_URL` NON c'è:
   - L'integrazione potrebbe non essere installata correttamente
   - Oppure devi aggiungerla manualmente

### 3. Database Supabase Attivo?

1. Vai su Supabase Dashboard
2. Verifica che il progetto sia **attivo** (non in pausa)
3. Se è in pausa, clicca **Resume**

### 4. Connection String Corretta?

Se devi aggiungere manualmente `POSTGRES_PRISMA_URL`:

1. Vai su Supabase Dashboard → Settings → Database
2. Trova **Connection string**
3. Seleziona **Connection Pooling** → **Transaction mode**
4. Oppure usa **Direct connection** se pooling non funziona
5. Copia la connection string
6. In Vercel, aggiungi come `POSTGRES_PRISMA_URL`

## 🔧 Soluzione Alternativa: Usa POSTGRES_URL_NON_POOLING

Se `POSTGRES_PRISMA_URL` non funziona, prova con `POSTGRES_URL_NON_POOLING`:

Modifica `lib/prisma.ts` per provare tutte le opzioni:

```typescript
url: process.env.POSTGRES_PRISMA_URL 
  || process.env.POSTGRES_URL_NON_POOLING 
  || process.env.POSTGRES_URL 
  || process.env.DATABASE_URL
```

## 🚨 Se Nulla Funziona: Configurazione Manuale

Se l'integrazione non funziona, configura manualmente:

1. Vai su Supabase Dashboard → Settings → Database
2. Trova **Connection string** → Seleziona **URI**
3. Copia la connection string completa
4. In Vercel → Settings → Environment Variables
5. Aggiungi/modifica:
   - **Name:** `DATABASE_URL`
   - **Value:** La connection string completa
   - **Environment:** Tutte

Poi modifica `lib/prisma.ts` per usare solo `DATABASE_URL`:

```typescript
url: process.env.DATABASE_URL
```

## 📝 Debug Steps

1. **Controlla Logs Vercel:**
   - Deployments → Clicca sul deploy → Functions → `/api/restaurants`
   - Vedi se ci sono errori specifici

2. **Testa Connection String:**
   - Prova a connetterti localmente con la stessa connection string
   - Se funziona localmente ma non su Vercel, è un problema di configurazione Vercel

3. **Verifica Network Restrictions:**
   - Supabase → Settings → Database → Network restrictions
   - Se ci sono restrizioni, aggiungi temporaneamente `0.0.0.0/0`

## ⚠️ Nota Importante

L'errore mostra che sta ancora cercando di connettersi alla porta `5432` direttamente. Questo significa che:
- O `POSTGRES_PRISMA_URL` non è configurata
- O sta usando `DATABASE_URL` con connection string diretta
- L'integrazione dovrebbe usare Supavisor (porta diversa) invece della connessione diretta

