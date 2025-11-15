# Migrazione Database - Aggiunta Campi availableDays e availableDates

## Modifiche Schema

Sono stati aggiunti due nuovi campi al modello `Employee`:
- `availableDays`: Array di giorni della settimana disponibili (ricorrente)
- `availableDates`: Array di date specifiche disponibili (formato YYYY-MM-DD)

## Applicare Migrazione

### Opzione 1: Via Prisma db push (Sviluppo)

```bash
npm run db:generate
npm run db:push
```

### Opzione 2: Via Migrazione Formale (Produzione)

```bash
npm run db:generate
npm run db:migrate
# Nome migrazione: add_available_days_to_employee
```

### Opzione 3: Via SQL Diretto (Supabase)

Se preferisci applicare manualmente su Supabase:

```sql
-- Aggiungi colonna availableDays (giorni della settimana)
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "availableDays" TEXT[] DEFAULT '{}';

-- Aggiungi colonna availableDates (date specifiche)
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "availableDates" TEXT[] DEFAULT '{}';

-- Per dipendenti esistenti, availability rimane invariato
```

## Retrocompatibilità

- Il campo `availability` è mantenuto per retrocompatibilità
- Se `availableDays` è vuoto, il dipendente è considerato disponibile tutti i giorni
- Se `availableDays` ha valori, viene usato per verificare disponibilità specifica
- `availability` viene calcolato automaticamente da `availableDays.length` quando si crea/modifica un dipendente

## Verifica Migrazione

Dopo aver applicato la migrazione:

1. Verifica che la colonna esista:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'Employee' AND column_name = 'availableDays';
   ```

2. Verifica che i dati esistenti siano preservati:
   ```sql
   SELECT id, name, availability, "availableDays" FROM "Employee" LIMIT 5;
   ```

## Note

- I dipendenti esistenti avranno `availableDays = []` (array vuoto) che significa disponibili tutti i giorni
- Quando si modifica un dipendente esistente, si può selezionare giorni specifici
- L'algoritmo di assegnazione verifica prima `availableDays`, poi usa `availability` come fallback

