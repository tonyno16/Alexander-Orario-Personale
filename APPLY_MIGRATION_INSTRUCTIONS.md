# Istruzioni per Applicare la Migrazione

## Metodo Consigliato: Supabase SQL Editor

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Crea una nuova query
5. Copia e incolla il contenuto di `apply-migration.sql`:

```sql
-- Aggiungi colonna availableDays (giorni della settimana ricorrenti)
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "availableDays" TEXT[] DEFAULT '{}';

-- Aggiungi colonna availableDates (date specifiche)
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "availableDates" TEXT[] DEFAULT '{}';

-- Verifica che le colonne siano state create
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'Employee' 
AND column_name IN ('availableDays', 'availableDates');
```

6. Clicca **Run** (o premi Ctrl+Enter)
7. Verifica che le colonne siano state create correttamente

## Verifica Post-Migrazione

Dopo aver applicato la migrazione, verifica che tutto funzioni:

```sql
-- Controlla che le colonne esistano
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'Employee' 
AND column_name IN ('availableDays', 'availableDates');

-- Verifica alcuni dipendenti
SELECT id, name, availability, "availableDays", "availableDates" 
FROM "Employee" 
LIMIT 5;
```

## Note

- I dipendenti esistenti avranno `availableDays = []` e `availableDates = []` (array vuoti)
- `availableDays = []` significa disponibile tutti i giorni della settimana
- `availableDates = []` significa nessuna data specifica configurata
- Il campo `availability` rimane invariato per retrocompatibilità

## Alternativa: Prisma db:push (se funziona localmente)

Se riesci a risolvere i problemi di permessi Windows:

```bash
npm run db:push
```

Ma il metodo SQL diretto è più affidabile per Supabase.

