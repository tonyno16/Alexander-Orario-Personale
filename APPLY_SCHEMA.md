# Applicare Schema Database a Supabase

Dopo che Vercel ha deployato con successo l'applicazione, devi applicare lo schema Prisma al database Supabase.

## Metodo 1: Via Supabase SQL Editor (Consigliato)

1. **Vai su Supabase Dashboard:**

   - Apri [supabase.com](https://supabase.com)
   - Accedi al tuo progetto

2. **Apri SQL Editor:**

   - Nel menu laterale, clicca su "SQL Editor"
   - Clicca su "New query"

3. **Esegui lo Schema:**

   - Copia il contenuto del file `supabase-schema.sql`
   - Incollalo nell'editor SQL
   - Clicca su "Run" (o premi Ctrl+Enter)

4. **Verifica:**
   - Vai su "Table Editor" nel menu laterale
   - Dovresti vedere le 4 tabelle:
     - `Restaurant`
     - `Employee`
     - `ShiftRequirement`
     - `ShiftAssignment`

## Metodo 2: Via Prisma CLI (Locale)

Se riesci a connetterti localmente al database Supabase:

1. **Configura DATABASE_URL:**

   ```bash
   # Crea file .env.production con la connection string di Supabase
   echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"' > .env.production
   ```

2. **Applica Schema:**

   ```bash
   # Genera Prisma Client
   npm run db:generate

   # Applica schema al database Supabase
   npm run db:push
   ```

   ⚠️ **Nota:** Questo metodo potrebbe non funzionare se ci sono restrizioni di rete.

## Metodo 3: Via Vercel Build Command (Avanzato)

Puoi modificare il Build Command in Vercel per applicare automaticamente lo schema:

1. Vai su Vercel Dashboard → Project Settings → General
2. Trova "Build & Development Settings"
3. Modifica "Build Command" in:
   ```
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```

⚠️ **Attenzione:** Questo applicherà lo schema ad ogni deploy. Usa solo se necessario.

## Abilitare Row Level Security (RLS)

Supabase richiede che RLS sia abilitato sulle tabelle pubbliche. Dopo aver applicato lo schema principale:

1. **Esegui lo script RLS:**

   - Nel SQL Editor, esegui anche il contenuto di `supabase-rls-policies.sql`
   - Oppure usa lo script completo `supabase-schema.sql` che include già RLS

2. **Verifica:**
   - Vai su "Authentication" → "Policies" nel menu Supabase
   - Dovresti vedere le policy create per ogni tabella

**Nota:** Le policy attuali sono permissive (permettono tutte le operazioni) perché l'applicazione non ha ancora autenticazione. Quando aggiungerai autenticazione, dovrai sostituire queste policy con policy più restrittive.

## Verifica Schema Applicato

Dopo aver applicato lo schema, verifica che tutto sia corretto:

1. **Via Supabase Dashboard:**

   - Vai su "Table Editor"
   - Verifica che tutte le 4 tabelle esistano
   - Controlla che gli indici siano creati

2. **Via Applicazione:**
   - Vai all'URL della tua applicazione Vercel
   - Clicca su "Inizializza Database" se appare il messaggio
   - Verifica che i dati di esempio vengano creati correttamente

## Troubleshooting

### Errore "relation already exists"

- Le tabelle esistono già
- Puoi ignorare l'errore o eliminare le tabelle esistenti prima di riapplicare

### Errore di permessi

- Verifica che la connection string abbia i permessi corretti
- Assicurati di usare l'utente `postgres` con la password corretta

### Schema non applicato

- Verifica che la connection string sia corretta
- Controlla i logs in Supabase Dashboard → Logs → Postgres Logs

## Prossimi Passi

Dopo aver applicato lo schema:

1. ✅ Verifica che l'applicazione funzioni correttamente
2. ✅ Testa tutte le funzionalità (CRUD dipendenti, requisiti, generazione turni)
3. ✅ Verifica che i dati persistano correttamente
4. ✅ (Opzionale) Configura backup automatico in Supabase
