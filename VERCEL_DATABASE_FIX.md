# Fix Connessione Database Vercel → Supabase

## Problema
Vercel non riesce a connettersi al database Supabase: `Can't reach database server`

## Possibili Cause

1. **Connection string non configurata in Vercel**
2. **Connection string errata o incompleta**
3. **Database Supabase in pausa**
4. **Restrizioni di rete/firewall**

## Soluzione Step-by-Step

### Step 1: Verifica Database Supabase

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Apri il tuo progetto
3. Verifica che il database sia **attivo** (non in pausa)
4. Se è in pausa, clicca "Resume" per riattivarlo

### Step 2: Ottieni Connection String Corretta

1. In Supabase Dashboard, vai su **Settings** → **Database**
2. Scorri fino a **Connection string**
3. Seleziona **URI** (non Session mode o Transaction mode)
4. Copia la connection string completa
5. Formato dovrebbe essere: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 3: Configura DATABASE_URL in Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Apri il progetto `Alexander-Orario-Personale`
3. Vai su **Settings** → **Environment Variables**
4. Cerca `DATABASE_URL`
5. **Modifica** o **Aggiungi** la variabile:
   - **Name:** `DATABASE_URL`
   - **Value:** La connection string completa di Supabase (URI mode)
   - **Environment:** Seleziona tutte (Production, Preview, Development)
6. Clicca **Save**

### Step 4: Verifica Connection String

La connection string deve:
- ✅ Iniziare con `postgresql://`
- ✅ Contenere la password del database
- ✅ Usare l'host corretto: `db.[PROJECT-REF].supabase.co`
- ✅ Usare la porta `5432`
- ✅ Terminare con `/postgres`

**Esempio corretto:**
```
postgresql://postgres:TUO_PASSWORD@db.vparigzctrwaxkzphlvf.supabase.co:5432/postgres
```

### Step 5: Trigger Nuovo Deploy

Dopo aver aggiornato la variabile d'ambiente:

1. Vai su **Deployments** in Vercel
2. Trova l'ultimo deploy
3. Clicca sui **3 puntini** → **Redeploy**
4. Seleziona **Use existing Build Cache** = **No** (per forzare rebuild)
5. Clicca **Redeploy**

Oppure fai un nuovo commit per triggerare deploy automatico.

### Step 6: Verifica Logs

Dopo il nuovo deploy:

1. Vai su **Deployments** → Clicca sul deploy
2. Vai su **Functions** → Clicca su `/api/init`
3. Controlla i logs per vedere se la connessione funziona

## Troubleshooting Avanzato

### Se il problema persiste:

1. **Verifica Network Restrictions in Supabase:**
   - Vai su Supabase → Settings → Database
   - Controlla "Network restrictions"
   - Se ci sono restrizioni, aggiungi temporaneamente `0.0.0.0/0` per permettere tutte le connessioni (solo per test)

2. **Testa Connection String Localmente:**
   ```bash
   # Crea file .env.test
   echo 'DATABASE_URL="[COLLEA_QUI_LA_CONNECTION_STRING]"' > .env.test
   
   # Testa connessione
   npm run db:push
   ```

3. **Verifica Password Database:**
   - Se hai cambiato la password del database, aggiorna la connection string
   - La password è nella connection string dopo `postgres:`

4. **Usa Connection Pooling (Alternativa):**
   - In Supabase, prova la connection string con **Connection Pooling**
   - Porta: `6543` invece di `5432`
   - Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## Verifica Finale

Dopo aver configurato tutto:

1. ✅ Database Supabase attivo
2. ✅ Connection string corretta in Vercel
3. ✅ Nuovo deploy completato
4. ✅ Test inizializzazione database funziona

## Note Importanti

- **Non committare mai** la connection string nel codice
- Usa sempre variabili d'ambiente per dati sensibili
- La connection string deve essere identica in tutti gli environment (Production, Preview, Development)

