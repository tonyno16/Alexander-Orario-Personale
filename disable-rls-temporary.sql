-- Script per disabilitare temporaneamente RLS
-- Usa questo SOLO se le policy RLS stanno causando problemi
-- ⚠️ ATTENZIONE: Questo disabilita la sicurezza. Usa solo per MVP senza autenticazione.

-- Disabilita RLS su tutte le tabelle
ALTER TABLE "Restaurant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftRequirement" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftAssignment" DISABLE ROW LEVEL SECURITY;

-- Elimina le policy esistenti (opzionale, per pulizia)
DROP POLICY IF EXISTS "Allow all operations on Restaurant" ON "Restaurant";
DROP POLICY IF EXISTS "Allow all operations on Employee" ON "Employee";
DROP POLICY IF EXISTS "Allow all operations on ShiftRequirement" ON "ShiftRequirement";
DROP POLICY IF EXISTS "Allow all operations on ShiftAssignment" ON "ShiftAssignment";

-- Verifica che RLS sia disabilitato
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('Restaurant', 'Employee', 'ShiftRequirement', 'ShiftAssignment');

