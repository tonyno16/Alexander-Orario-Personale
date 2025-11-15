# Setup Vercel - Guida Rapida

## Step 1: Crea Account Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "Sign Up" e usa il tuo account GitHub
3. Autorizza Vercel ad accedere ai tuoi repository

## Step 2: Importa Progetto

1. Nel dashboard Vercel, clicca "Add New Project"
2. Seleziona il repository `tonyno16/Alexander-Orario-Personale`
3. Clicca "Import"

## Step 3: Configurazione Progetto

**Framework Preset:** Next.js (dovrebbe essere rilevato automaticamente)

**Build Settings:**

- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

## Step 4: Configura Variabili d'Ambiente

Nella sezione "Environment Variables", aggiungi:

**Nome:** `DATABASE_URL`  
**Valore:** La connection string completa da Supabase Dashboard

⚠️ **IMPORTANTE:**

1. Vai su Supabase Dashboard → Settings → Database
2. Trova "Connection string" → Seleziona **URI** (non Session o Transaction)
3. Copia la connection string completa
4. Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Incolla nel campo "Valore" in Vercel

**Environment:** Seleziona tutte le opzioni (Production, Preview, Development)

**Verifica:**

- La connection string deve iniziare con `postgresql://`
- Deve contenere la password del database
- Deve usare la porta `5432`
- Deve terminare con `/postgres`

## Step 5: Deploy

1. Clicca "Deploy"
2. Attendi che il build completi (circa 2-3 minuti)
3. Una volta completato, avrai un URL tipo: `alexander-turni-xxx.vercel.app`

## Step 6: Applica Schema Database

Dopo il primo deploy, devi applicare lo schema Prisma al database Supabase.

**Opzione A - Via Supabase SQL Editor (Consigliato):**

1. Vai su Supabase Dashboard → SQL Editor
2. Crea una nuova query
3. Esegui questo comando per applicare lo schema:

```sql
-- Questo creerà le tabelle necessarie
-- Puoi anche usare Prisma Migrate se preferisci
```

**Opzione B - Via Vercel Build Command:**

Modifica il Build Command in Vercel per includere:

```
npm install && npx prisma generate && npx prisma db push && npm run build
```

⚠️ **Nota:** Questo applicherà lo schema ad ogni deploy. Per produzione, è meglio usare migrazioni formali.

**Opzione C - Via CLI Locale:**

Se riesci a connetterti localmente:

```bash
# Con DATABASE_URL di Supabase nel tuo .env
npm run db:push
```

## Step 7: Verifica Deployment

Dopo il deploy, verifica:

- [ ] Applicazione accessibile via URL Vercel
- [ ] HTTPS funzionante (automatico con Vercel)
- [ ] Testare inizializzazione database (clicca "Inizializza Database" nella homepage)
- [ ] Testare CRUD dipendenti
- [ ] Testare generazione turni

## Troubleshooting

### Build Fallisce

- Verifica che `DATABASE_URL` sia configurata correttamente
- Controlla i build logs in Vercel Dashboard
- Verifica che Prisma Client sia generato (dovrebbe essere automatico con `postinstall` script)

### Database Non Connesso

- Verifica connection string in Supabase Dashboard
- Verifica che database sia attivo (non in pausa)
- Controlla Network Restrictions in Supabase

### Schema Non Applicato

- Applica manualmente via Supabase SQL Editor
- Oppure modifica Build Command per includere `prisma db push`

## Deploy Automatico

Dopo il setup iniziale, ogni push al branch `main` triggererà automaticamente un nuovo deploy.

Per cambiare il branch di deploy:

- Vai su Vercel Dashboard → Project Settings → Git
- Seleziona il branch desiderato

## Custom Domain (Opzionale)

1. Vai su Vercel Dashboard → Project Settings → Domains
2. Aggiungi il tuo dominio
3. Segui le istruzioni per configurare DNS
