# Integrazione Supabase-Vercel (Consigliato)

L'integrazione ufficiale Supabase-Vercel è il modo migliore per connettere Vercel a Supabase. Gestisce automaticamente le variabili d'ambiente e risolve i problemi di connessione IPv4/IPv6.

## Vantaggi dell'Integrazione

- ✅ Configurazione automatica delle variabili d'ambiente
- ✅ Gestione corretta delle connessioni IPv4/IPv6
- ✅ Usa Supavisor per connection pooling ottimizzato
- ✅ Aggiornamenti automatici quando cambiano le credenziali
- ✅ Più semplice e affidabile della configurazione manuale

## Step 1: Installa Integrazione Supabase in Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Apri il progetto `Alexander-Orario-Personale`
3. Vai su **Settings** → **Integrations**
4. Clicca su **Browse Marketplace**
5. Cerca **"Supabase"** e clicca sull'integrazione Supabase
6. Clicca **Add Integration**
7. Seleziona il tuo account Vercel dal dropdown
8. Clicca **CONTINUE**

## Step 2: Collega Progetto e Database

1. Scegli **"Specific Projects"** e seleziona `Alexander-Orario-Personale`
2. Clicca **Add Integration**
3. Nella finestra popup Supabase:
   - Seleziona il tuo **Vercel Project**: `Alexander-Orario-Personale`
   - Seleziona il tuo **Supabase Project**: Il progetto che hai creato
4. Clicca **Connect** o **Save**

## Step 3: Variabili d'Ambiente Aggiunte Automaticamente

L'integrazione aggiungerà automaticamente queste variabili d'ambiente:

- `POSTGRES_URL` - Supavisor URL (per connection pooling)
- `POSTGRES_PRISMA_URL` - Supavisor URL (per Prisma)
- `POSTGRES_URL_NON_POOLING` - Direct connection URL
- `NEXT_PUBLIC_SUPABASE_URL` - URL pubblico Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chiave anonima Supabase

## Step 4: Verifica Codice (Già Configurato ✅)

**✅ BUONE NOTIZIE:** Il codice è già configurato correttamente!

Il file `lib/prisma.ts` è già stato aggiornato per usare automaticamente `POSTGRES_PRISMA_URL` se disponibile, altrimenti usa le altre variabili come fallback.

**Non devi modificare nulla nel codice.** Il codice proverà automaticamente nell'ordine:

1. `POSTGRES_PRISMA_URL` (da integrazione Supabase-Vercel) ⭐
2. `POSTGRES_URL_NON_POOLING` (connection diretta)
3. `POSTGRES_URL` (connection pooling)
4. `DATABASE_URL` (fallback manuale)

### Cosa Verificare

Dopo aver installato l'integrazione, verifica solo che:

1. **Le variabili d'ambiente siano presenti** in Vercel:

   - Vai su Settings → Environment Variables
   - Verifica che `POSTGRES_PRISMA_URL` sia presente
   - Se non c'è, l'integrazione non è stata installata correttamente

2. **Il codice è già pronto** - nessuna modifica necessaria!

## Step 5: Redeploy

Dopo aver installato l'integrazione:

1. Vai su **Deployments** in Vercel
2. Trova l'ultimo deploy
3. Clicca sui **3 puntini** → **Redeploy**
4. Seleziona **Use existing Build Cache** = **No**
5. Clicca **Redeploy**

⚠️ **IMPORTANTE:** Se non hai deployato dal 27 Gennaio 2024, devi fare un redeploy per applicare le nuove variabili d'ambiente IPv4.

## Step 6: Verifica

Dopo il redeploy:

1. Vai all'URL della tua applicazione Vercel
2. Prova a inizializzare il database
3. Dovrebbe funzionare senza errori di connessione

## Troubleshooting

### Se l'integrazione non appare

- Assicurati di essere loggato con lo stesso account GitHub sia su Vercel che su Supabase
- Verifica che il progetto Supabase sia attivo (non in pausa)

### Se le variabili non vengono aggiunte

- Controlla che l'integrazione sia collegata correttamente
- Verifica in Settings → Environment Variables che le variabili siano presenti
- Se mancano, aggiungile manualmente copiando i valori da Supabase Dashboard

### Se ancora non funziona

- Verifica che stai usando `POSTGRES_PRISMA_URL` nel codice Prisma
- Controlla i logs Vercel per errori specifici
- Assicurati di aver fatto un redeploy dopo l'installazione dell'integrazione

## Note Importanti

- L'integrazione usa **Supavisor** invece di pgBouncer (più moderno e supporta IPv4)
- Le variabili vengono aggiornate automaticamente quando cambiano le credenziali Supabase
- Non devi più gestire manualmente la connection string

## Riferimenti

- [Documentazione Integrazione Supabase-Vercel](https://supabase.com/partners/integrations/vercel)
- [Vercel Integration Docs](https://vercel.com/docs/integrations)
