# Fix RLS Issue - Troubleshooting

Se l'inizializzazione del database fallisce, potrebbe essere un problema con le policy RLS.

## Verifica RLS in Supabase

1. Vai su Supabase Dashboard → Authentication → Policies
2. Verifica che ci siano 4 policy create (una per tabella)
3. Se le policy non ci sono, esegui `supabase-rls-policies.sql`

## Soluzione Temporanea: Disabilita RLS (Solo per Test)

Se le policy non funzionano correttamente, puoi temporaneamente disabilitare RLS:

```sql
-- DISABILITA RLS (SOLO PER TEST - NON PER PRODUZIONE CON DATI REALI)
ALTER TABLE "Restaurant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftRequirement" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftAssignment" DISABLE ROW LEVEL SECURITY;
```

⚠️ **ATTENZIONE:** Questo disabilita la sicurezza. Usa solo per test o se non hai dati sensibili.

## Soluzione Permanente: Verifica Policy

Se vuoi mantenere RLS abilitato, verifica che le policy siano corrette:

```sql
-- Verifica che RLS sia abilitato
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('Restaurant', 'Employee', 'ShiftRequirement', 'ShiftAssignment');

-- Verifica che le policy esistano
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Policy Alternative per Service Role

Se Prisma usa un service role, potresti aver bisogno di policy diverse. Verifica la connection string:

- Se usa `postgres` user → Le policy attuali dovrebbero funzionare
- Se usa `service_role` → Potrebbe essere necessario configurare diversamente

## Test Connessione Diretta

Testa la connessione direttamente:

```sql
-- In Supabase SQL Editor
INSERT INTO "Restaurant" (id, name, "createdAt", "updatedAt") 
VALUES ('test-123', 'Test Restaurant', NOW(), NOW());

-- Se questo funziona, il problema è nelle policy RLS
-- Se questo fallisce, il problema è altrove
```

