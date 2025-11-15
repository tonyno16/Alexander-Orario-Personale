# 🚀 Deploy Immediato - Conflitti e Preferenze

## ✅ Pre-Deploy Checklist

### 1. Codice già pushato su GitHub ✅
- ✅ Commit completato: `312bd38`
- ✅ Push su `main` completato
- ✅ Tutte le modifiche sono su GitHub

### 2. Migrazione Database Supabase (CRITICO) ⚠️

**IMPORTANTE:** Applica questa migrazione PRIMA che Vercel completi il deploy!

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Apri **SQL Editor** (menu laterale)
4. Crea una nuova query
5. Copia e incolla questo SQL:

```sql
-- Verifica se le tabelle esistono già
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('EmployeeConflict', 'EmployeePreference', 'SchedulingParameter');

-- Se non esistono, creale con Prisma db push o esegui questo schema completo
-- (Meglio usare Prisma db push con DATABASE_URL di Supabase)
```

**Metodo Consigliato - Via Prisma CLI:**

```bash
# 1. Ottieni DATABASE_URL da Supabase Dashboard → Settings → Database → Connection string (URI)
# 2. Crea file temporaneo .env.supabase con la connection string
echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"' > .env.supabase

# 3. Applica schema
npx dotenv -e .env.supabase -- npx prisma db push

# 4. Verifica
npx dotenv -e .env.supabase -- npx prisma db push --skip-generate
```

**Metodo Alternativo - Via Supabase SQL Editor:**

Se preferisci usare SQL direttamente, esegui lo schema completo da `prisma/schema.prisma` convertito in SQL, oppure usa Prisma Migrate.

### 3. Verifica Variabili d'Ambiente Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Apri il progetto `Alexander-Orario-Personale` (o il nome del tuo progetto)
3. Vai su **Settings** → **Environment Variables**
4. Verifica che queste variabili siano presenti:

   - ✅ `DATABASE_URL` o `POSTGRES_PRISMA_URL` (connection string Supabase)
   - ✅ Altre variabili necessarie (se presenti)

5. Se manca `DATABASE_URL`:
   - Vai su Supabase Dashboard → Settings → Database
   - Copia la "Connection string" (URI mode)
   - Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Aggiungi in Vercel come `DATABASE_URL`
   - Seleziona tutte le environment (Production, Preview, Development)

### 4. Verifica Database Supabase Attivo

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Verifica che il progetto sia **attivo** (non in pausa)
3. Se è in pausa, clicca **Resume** per riattivarlo

---

## 🚀 Deploy Automatico Vercel

### Il deploy dovrebbe essere già in corso!

Dato che abbiamo appena fatto push su `main`, Vercel dovrebbe aver già triggerato automaticamente un nuovo deploy.

### Verifica Deploy:

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Apri il progetto
3. Vai su **Deployments**
4. Dovresti vedere un nuovo deploy in corso o completato
5. Se non c'è un deploy automatico:
   - Vai su **Deployments** → **Redeploy** (ultimo commit)
   - Oppure fai un commit vuoto: `git commit --allow-empty -m "trigger deploy" && git push`

### Monitora Build Logs:

1. Clicca sul deploy in corso/completato
2. Controlla i **Build Logs**:
   - ✅ `npm install` completato
   - ✅ `prisma generate` completato
   - ✅ `next build` completato senza errori
   - ⚠️ Se vedi errori di database, applica la migrazione (vedi punto 2)

---

## 🧪 Test Post-Deploy

### 1. Test Base

1. Apri l'applicazione deployata su Vercel
2. Verifica che la homepage carichi correttamente
3. Vai su `/employees`
4. Verifica che la pagina carichi senza errori

### 2. Test Conflitti

1. Clicca "⚠️ Conflitti" su un dipendente
2. Verifica che il modal si apra
3. Aggiungi un conflitto con un altro dipendente
4. Verifica che appaia nella lista
5. Rimuovi il conflitto

### 3. Test Preferenze

1. Clicca "✓ Preferenze" su un dipendente
2. Verifica che il modal si apra
3. Aggiungi una preferenza con un altro dipendente
4. Regola lo slider del peso
5. Verifica che appaia nella lista
6. Rimuovi la preferenza

### 4. Test Scheduler

1. Vai su `/schedule`
2. Configura alcuni conflitti/preferenze
3. Genera un programma
4. Verifica che i conflitti siano rispettati
5. Verifica che le preferenze siano considerate

---

## ✅ Checklist Finale

- [ ] Migrazione database applicata su Supabase (tabelle EmployeeConflict, EmployeePreference, SchedulingParameter)
- [ ] Variabili d'ambiente configurate in Vercel (DATABASE_URL)
- [ ] Database Supabase attivo
- [ ] Deploy Vercel completato con successo
- [ ] Build logs senza errori critici
- [ ] Applicazione accessibile online
- [ ] Conflitti funzionanti
- [ ] Preferenze funzionanti
- [ ] Scheduler rispetta conflitti e preferenze

---

## 🆘 Troubleshooting

### Errore: "Table 'EmployeeConflict' does not exist"
**SOLUZIONE:** Applica la migrazione database su Supabase (vedi punto 2)

### Errore: "Can't reach database server"
**SOLUZIONE:** 
- Verifica che il database Supabase sia attivo
- Verifica le variabili d'ambiente in Vercel
- Controlla che `DATABASE_URL` sia configurata correttamente

### Deploy non parte automaticamente
**SOLUZIONE:**
- Verifica che Vercel sia collegato al repository GitHub
- Vai su Vercel Dashboard → Project Settings → Git
- Verifica che il branch `main` sia selezionato
- Triggera manualmente: Deployments → Redeploy

### Build fallisce con errori Prisma
**SOLUZIONE:**
- Verifica che lo schema database sia applicato su Supabase
- Controlla i build logs per errori specifici
- Verifica che Prisma Client sia generato correttamente

---

## 📝 Note

- **Priorità:** La migrazione database è CRITICA - applicala prima o subito dopo il deploy
- **Deploy Automatico:** Ogni push su `main` triggera automaticamente un nuovo deploy
- **Rollback:** Se qualcosa va storto, puoi fare rollback da Vercel Dashboard → Deployments → Promuovi deploy precedente

---

## 🎉 Deploy Completato!

Una volta completata questa checklist, tutte le nuove funzionalità (conflitti e preferenze) saranno operative online!

