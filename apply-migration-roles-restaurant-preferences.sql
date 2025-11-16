-- Script SQL per applicare la migrazione: Ruoli Multipli e Preferenze Ristoranti
-- Esegui questo script nel Supabase SQL Editor
-- Data: Migrazione per supportare ruoli multipli (fino a 3) e preferenze ristoranti con pesi

-- ============================================
-- 1. AGGIUNGI COLONNA ROLES ALLA TABELLA EMPLOYEE
-- ============================================

-- Aggiungi colonna roles (array di ruoli, fino a 3 come nello spreadsheet)
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "roles" TEXT[] DEFAULT '{}';

-- Se la colonna esiste già ma è NULL, inizializzala con un array vuoto
UPDATE "Employee" 
SET "roles" = '{}' 
WHERE "roles" IS NULL;

-- Per dipendenti esistenti senza ruoli, copia il ruolo principale nel campo roles
UPDATE "Employee" 
SET "roles" = ARRAY["role"] 
WHERE "roles" = '{}' OR array_length("roles", 1) IS NULL;

-- ============================================
-- 2. CREA TABELLA EMPLOYEE RESTAURANT PREFERENCE
-- ============================================

-- Tabella per gestire preferenze ristoranti con pesi
CREATE TABLE IF NOT EXISTS "EmployeeRestaurantPreference" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeRestaurantPreference_pkey" PRIMARY KEY ("id")
);

-- Crea indice unico per evitare preferenze duplicate
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeRestaurantPreference_employeeId_restaurantId_key" 
ON "EmployeeRestaurantPreference"("employeeId", "restaurantId");

-- Crea indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS "EmployeeRestaurantPreference_employeeId_idx" 
ON "EmployeeRestaurantPreference"("employeeId");

CREATE INDEX IF NOT EXISTS "EmployeeRestaurantPreference_restaurantId_idx" 
ON "EmployeeRestaurantPreference"("restaurantId");

-- ============================================
-- 3. AGGIUNGI FOREIGN KEYS
-- ============================================

-- Foreign key verso Employee (se non esiste già)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'EmployeeRestaurantPreference_employeeId_fkey'
    ) THEN
        ALTER TABLE "EmployeeRestaurantPreference"
        ADD CONSTRAINT "EmployeeRestaurantPreference_employeeId_fkey" 
        FOREIGN KEY ("employeeId") 
        REFERENCES "Employee"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Foreign key verso Restaurant (se non esiste già)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'EmployeeRestaurantPreference_restaurantId_fkey'
    ) THEN
        ALTER TABLE "EmployeeRestaurantPreference"
        ADD CONSTRAINT "EmployeeRestaurantPreference_restaurantId_fkey" 
        FOREIGN KEY ("restaurantId") 
        REFERENCES "Restaurant"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- 4. VERIFICA MIGRAZIONE
-- ============================================

-- Verifica che la colonna roles sia stata creata
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Employee' 
AND column_name = 'roles';

-- Verifica che la tabella EmployeeRestaurantPreference sia stata creata
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'EmployeeRestaurantPreference'
ORDER BY ordinal_position;

-- Mostra alcuni esempi per verificare
SELECT 
    id, 
    name, 
    role, 
    "roles",
    availability,
    "availableDays"
FROM "Employee" 
LIMIT 5;

-- Conta le preferenze ristoranti (dovrebbe essere 0 se è una nuova installazione)
SELECT COUNT(*) as total_restaurant_preferences
FROM "EmployeeRestaurantPreference";

-- ============================================
-- 5. NOTE IMPORTANTI
-- ============================================

-- PESI PREFERENZE RISTORANTI:
-- - 1.0 = X (preferenza normale)
-- - 2.0 = XX (preferenza media)
-- - 3.0 = XXX (forte preferenza, come nello spreadsheet)

-- ROLES MULTIPLI:
-- - Ogni dipendente può avere fino a 3 ruoli
-- - Il campo "role" è mantenuto per retrocompatibilità (primo ruolo)
-- - Il campo "roles" contiene l'array completo di ruoli

-- MIGRAZIONE DATI ESISTENTI:
-- I dipendenti esistenti avranno automaticamente il loro ruolo principale
-- copiato nel campo "roles" durante questa migrazione.

