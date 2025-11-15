# Guida al Deployment - Alexander-Orario-Personale

Questa guida spiega come deployare Alexander-Orario-Personale in produzione.

## Opzioni di Deployment

### Opzione 1: Vercel + Supabase (Consigliata) ⭐

**Vantaggi:**
- ✅ Gratuito per iniziare
- ✅ Ottimizzato per Next.js
- ✅ Deploy automatico da GitHub
- ✅ HTTPS incluso
- ✅ Facile da configurare

**Setup:**

1. **Database Supabase:**
   - Crea account su [supabase.com](https://supabase.com)
   - Crea un nuovo progetto
   - Vai su Settings → Database
   - Copia la "Connection string" (URI mode)
   - Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

2. **Deploy Vercel:**
   - Crea account su [vercel.com](https://vercel.com)
   - Importa il repository GitHub
   - Configura variabili d'ambiente:
     - `DATABASE_URL`: La connection string di Supabase
   - Vercel eseguirà automaticamente `npm run build` e `npm start`

3. **Applica Schema Database:**
   ```bash
   # Localmente, con DATABASE_URL di Supabase
   npm run db:push
   ```

### Opzione 2: Railway (Tutto-in-Uno)

**Vantaggi:**
- ✅ Next.js + PostgreSQL sulla stessa piattaforma
- ✅ Deploy automatico
- ✅ Facile gestione

**Setup:**

1. Crea account su [railway.app](https://railway.app)
2. Crea nuovo progetto
3. Aggiungi servizio PostgreSQL
4. Aggiungi servizio GitHub (collega repository)
5. Configura variabile d'ambiente `DATABASE_URL` nel servizio Next.js
6. Railway applicherà automaticamente le migrazioni se configurate

### Opzione 3: Render

**Vantaggi:**
- ✅ Tier gratuito disponibile
- ✅ Supporto Next.js e PostgreSQL

**Setup:**

1. Crea account su [render.com](https://render.com)
2. Crea nuovo Web Service (collega repository GitHub)
3. Crea nuovo PostgreSQL Database
4. Configura variabile d'ambiente `DATABASE_URL`
5. Applica migrazioni manualmente dopo primo deploy

## Variabili d'Ambiente Richieste

### Produzione

- `DATABASE_URL`: Connection string PostgreSQL (formato: `postgresql://user:password@host:port/database`)

### Sviluppo (Locale)

- `DATABASE_URL`: Connection string PostgreSQL locale

## Processo di Deployment

### 1. Preparazione

```bash
# Assicurati di essere sul branch corretto
git checkout feature/deploy-online

# Verifica che il build funzioni localmente
npm run build

# Testa il build localmente
npm start
```

### 2. Setup Database Cloud

1. Crea database PostgreSQL su piattaforma scelta
2. Ottieni connection string
3. Testa connessione localmente:
   ```bash
   # Crea file .env.production temporaneo
   echo 'DATABASE_URL="[CONNECTION_STRING]"' > .env.production
   
   # Testa connessione
   npm run db:push
   ```

### 3. Deploy Applicazione

1. Collega repository alla piattaforma di deployment
2. Configura variabile d'ambiente `DATABASE_URL`
3. Triggera deploy iniziale
4. Monitora build logs

### 4. Applica Schema Database

Dopo il primo deploy, applica lo schema al database cloud:

```bash
# Con DATABASE_URL configurata nella piattaforma
npm run db:push
```

Oppure via CLI della piattaforma se disponibile.

### 5. Verifica Deployment

- [ ] Applicazione accessibile via HTTPS
- [ ] Database connesso correttamente
- [ ] Testare inizializzazione database
- [ ] Testare CRUD dipendenti
- [ ] Testare CRUD ristoranti
- [ ] Testare generazione turni
- [ ] Verificare che dati persistano

## Migrazione Dati (Opzionale)

Se hai dati di sviluppo da migrare:

```bash
# Export da database locale
docker exec postgres-alexander pg_dump -U postgres alexander_turni > backup.sql

# Import in database cloud (metodo dipende dalla piattaforma)
# Per Supabase: usa il dashboard SQL Editor
# Per Railway: usa Railway CLI o dashboard
```

## Troubleshooting

### Build Fallisce

- Verifica che `DATABASE_URL` sia configurata correttamente
- Verifica che Prisma Client sia generato (`npm run db:generate`)
- Controlla build logs per errori specifici

### Database Non Connesso

- Verifica connection string
- Verifica che database sia accessibile pubblicamente (se necessario)
- Verifica firewall/network settings della piattaforma

### Migrazioni Non Applicate

- Applica manualmente con `npm run db:push` o `npm run db:migrate`
- Verifica che `DATABASE_URL` sia corretta
- Controlla permessi database

## Deploy Automatico

Dopo il setup iniziale, ogni push al branch `main` (o branch configurato) triggererà automaticamente un nuovo deploy.

## Rollback

Se qualcosa va storto:

1. **Vercel:** Dashboard → Deployments → Trova deploy precedente → "Promote to Production"
2. **Railway:** Dashboard → Deployments → Rollback
3. **Render:** Dashboard → Manual Deploy → Seleziona commit precedente

## Monitoring

- Monitora errori tramite dashboard della piattaforma
- Controlla logs per problemi
- Monitora performance e uptime

## Costi Stimati

- **Vercel + Supabase:** €0/mese (tier gratuito)
- **Railway:** ~$5/mese (tier minimo)
- **Render:** €0/mese (tier gratuito con limitazioni)

## Supporto

Per problemi o domande, consulta:
- [Documentazione Vercel](https://vercel.com/docs)
- [Documentazione Supabase](https://supabase.com/docs)
- [Documentazione Railway](https://docs.railway.app)
- [Documentazione Render](https://render.com/docs)

