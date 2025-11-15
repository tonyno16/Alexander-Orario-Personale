# 🗄️ Applica Schema Database su Supabase

## Metodo 1: Via Supabase SQL Editor (Più Semplice) ⭐

### Step 1: Accedi a Supabase
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Accedi al tuo account
3. Seleziona il progetto **Alexander-Orario-Personale** (o il nome del tuo progetto)

### Step 2: Apri SQL Editor
1. Nel menu laterale, clicca su **SQL Editor**
2. Clicca su **New Query** (in alto a destra)

### Step 3: Copia e Incolla lo Schema
1. Apri il file `supabase-schema-complete.sql` nel tuo editor
2. **Seleziona tutto** il contenuto (Ctrl+A)
3. **Copia** (Ctrl+C)
4. **Incolla** nella query editor di Supabase (Ctrl+V)

### Step 4: Esegui lo Script
1. Clicca sul pulsante **Run** (in basso a destra)
   - Oppure premi **Ctrl+Enter**
2. Attendi che lo script completi (dovrebbe richiedere pochi secondi)

### Step 5: Verifica Risultato
Dovresti vedere:
- ✅ Messaggio di successo: "Success. No rows returned"
- ✅ Oppure una tabella con i nomi delle tabelle create (se hai eseguito la query di verifica alla fine)

### Step 6: Verifica Tabelle Create
Esegui questa query per verificare:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'Restaurant', 
    'Employee', 
    'ShiftRequirement', 
    'ShiftAssignment',
    'EmployeeConflict',
    'EmployeePreference',
    'SchedulingParameter'
)
ORDER BY table_name;
```

**Risultato atteso:** Dovresti vedere 7 righe con i nomi delle tabelle.

---

## Metodo 2: Via Prisma CLI (Alternativo)

### Prerequisiti
- Node.js installato
- Prisma CLI installato (`npm install -g prisma` o già presente nel progetto)

### Step 1: Ottieni DATABASE_URL
1. Vai su Supabase Dashboard → **Settings** → **Database**
2. Scorri fino a **Connection string**
3. Seleziona **URI** (non Session o Transaction)
4. Copia la connection string completa
5. Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 2: Configura DATABASE_URL
**Opzione A - File temporaneo:**
```bash
# Crea file .env.supabase temporaneo
echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"' > .env.supabase
```

**Opzione B - Variabile d'ambiente:**
```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Windows CMD
set DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Linux/Mac
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Step 3: Applica Schema
```bash
# Se hai usato file .env.supabase
npx dotenv -e .env.supabase -- npx prisma db push

# Se hai usato variabile d'ambiente
npx prisma db push
```

### Step 4: Verifica
```bash
# Verifica che lo schema sia stato applicato
npx prisma db push --skip-generate
```

Dovresti vedere: "Database schema is up to date!"

---

## ⚠️ Troubleshooting

### Errore: "Table already exists"
**Soluzione:** Lo script usa `CREATE TABLE IF NOT EXISTS`, quindi è sicuro eseguirlo anche se le tabelle esistono già. Le colonne mancanti verranno aggiunte automaticamente.

### Errore: "Permission denied"
**Soluzione:** 
- Verifica di essere loggato nel progetto corretto su Supabase
- Verifica che il database sia attivo (non in pausa)
- Se il database è in pausa, clicca "Resume" nel dashboard

### Errore: "Column already exists"
**Soluzione:** Lo script usa `ADD COLUMN IF NOT EXISTS`, quindi è sicuro. Se vedi questo errore, significa che la colonna esiste già - va bene!

### Errore: "Foreign key constraint fails"
**Soluzione:** 
- Assicurati di eseguire tutto lo script in una volta
- Non eseguire solo parti dello script
- Se necessario, disabilita temporaneamente i foreign key checks (non consigliato)

### Errore Prisma: "Can't reach database server"
**Soluzione:**
- Verifica che la DATABASE_URL sia corretta
- Verifica che il database Supabase sia attivo
- Controlla che la connection string usi la porta 5432
- Verifica che non ci siano firewall che bloccano la connessione

---

## ✅ Checklist Post-Applicazione

Dopo aver applicato lo schema, verifica:

- [ ] Tutte le 7 tabelle sono state create
- [ ] Le colonne `availableDays` e `availableDates` esistono nella tabella `Employee`
- [ ] Le tabelle `EmployeeConflict`, `EmployeePreference`, `SchedulingParameter` esistono
- [ ] Gli indici sono stati creati
- [ ] Le foreign keys sono configurate correttamente
- [ ] Le policy RLS sono attive

---

## 🔍 Verifica Dettagliata

Esegui queste query per verificare che tutto sia corretto:

### 1. Verifica Colonne Employee
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'Employee' 
AND column_name IN ('availableDays', 'availableDates');
```

**Risultato atteso:** 2 righe con `availableDays` e `availableDates` di tipo `ARRAY`.

### 2. Verifica Tabelle Nuove
```sql
SELECT COUNT(*) as count FROM "EmployeeConflict";
SELECT COUNT(*) as count FROM "EmployeePreference";
SELECT COUNT(*) as count FROM "SchedulingParameter";
```

**Risultato atteso:** Tutte dovrebbero restituire `0` (tabelle vuote, ma esistenti).

### 3. Verifica Foreign Keys
```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('EmployeeConflict', 'EmployeePreference');
```

**Risultato atteso:** Dovresti vedere le foreign keys verso la tabella `Employee`.

---

## 🎉 Schema Applicato!

Una volta completati questi passaggi, il database è pronto per il deploy su Vercel!

**Prossimo passo:** Vai su [DEPLOY_NOW.md](DEPLOY_NOW.md) per completare il deploy.

