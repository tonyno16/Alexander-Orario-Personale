-- Script SQL per applicare la migrazione availableDays e availableDates
-- Esegui questo script nel Supabase SQL Editor

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

-- Mostra alcuni esempi per verificare
SELECT id, name, availability, "availableDays", "availableDates" 
FROM "Employee" 
LIMIT 5;

