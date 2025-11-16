-- Schema SQL Completo per Supabase Database
-- Questo script crea/aggiorna tutte le tabelle necessarie per Alexander-Orario-Personale
-- Incluso: Conflitti, Preferenze, Parametri Scheduling
-- Esegui questo script nel Supabase SQL Editor

-- ============================================
-- TABELLE ESISTENTI (aggiornate)
-- ============================================

-- Tabella Restaurant
CREATE TABLE IF NOT EXISTS "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- Tabella Employee (aggiornata con nuove colonne)
CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT '{}',
    "availability" INTEGER NOT NULL,
    "availableDays" TEXT[] DEFAULT '{}',
    "availableDates" TEXT[] DEFAULT '{}',
    "restaurants" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- Aggiungi colonne se non esistono (per database esistenti)
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "availableDays" TEXT[] DEFAULT '{}';

ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "availableDates" TEXT[] DEFAULT '{}';

ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "roles" TEXT[] DEFAULT '{}';

-- Per dipendenti esistenti senza ruoli, copia il ruolo principale nel campo roles
UPDATE "Employee" 
SET "roles" = ARRAY["role"] 
WHERE "roles" = '{}' OR array_length("roles", 1) IS NULL;

-- Tabella ShiftRequirement
CREATE TABLE IF NOT EXISTS "ShiftRequirement" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShiftRequirement_pkey" PRIMARY KEY ("id")
);

-- Tabella ShiftAssignment
CREATE TABLE IF NOT EXISTS "ShiftAssignment" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- NUOVE TABELLE (Conflitti, Preferenze, Parametri)
-- ============================================

-- Tabella EmployeeConflict
CREATE TABLE IF NOT EXISTS "EmployeeConflict" (
    "id" TEXT NOT NULL,
    "employeeId1" TEXT NOT NULL,
    "employeeId2" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmployeeConflict_pkey" PRIMARY KEY ("id")
);

-- Tabella EmployeePreference
CREATE TABLE IF NOT EXISTS "EmployeePreference" (
    "id" TEXT NOT NULL,
    "employeeId1" TEXT NOT NULL,
    "employeeId2" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmployeePreference_pkey" PRIMARY KEY ("id")
);

-- Tabella EmployeeRestaurantPreference (preferenze ristoranti con pesi)
CREATE TABLE IF NOT EXISTS "EmployeeRestaurantPreference" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeRestaurantPreference_pkey" PRIMARY KEY ("id")
);

-- Tabella SchedulingParameter
CREATE TABLE IF NOT EXISTS "SchedulingParameter" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SchedulingParameter_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- INDICI
-- ============================================

CREATE INDEX IF NOT EXISTS "Employee_role_idx" ON "Employee"("role");
CREATE INDEX IF NOT EXISTS "ShiftRequirement_restaurantId_idx" ON "ShiftRequirement"("restaurantId");
CREATE INDEX IF NOT EXISTS "ShiftAssignment_restaurantId_day_shift_idx" ON "ShiftAssignment"("restaurantId", "day", "shift");
CREATE INDEX IF NOT EXISTS "ShiftAssignment_employeeId_idx" ON "ShiftAssignment"("employeeId");
CREATE INDEX IF NOT EXISTS "ShiftAssignment_weekStart_idx" ON "ShiftAssignment"("weekStart");

-- Indici per nuove tabelle
CREATE INDEX IF NOT EXISTS "EmployeeConflict_employeeId1_idx" ON "EmployeeConflict"("employeeId1");
CREATE INDEX IF NOT EXISTS "EmployeeConflict_employeeId2_idx" ON "EmployeeConflict"("employeeId2");
CREATE INDEX IF NOT EXISTS "EmployeePreference_employeeId1_idx" ON "EmployeePreference"("employeeId1");
CREATE INDEX IF NOT EXISTS "EmployeePreference_employeeId2_idx" ON "EmployeePreference"("employeeId2");
CREATE INDEX IF NOT EXISTS "EmployeeRestaurantPreference_employeeId_idx" ON "EmployeeRestaurantPreference"("employeeId");
CREATE INDEX IF NOT EXISTS "EmployeeRestaurantPreference_restaurantId_idx" ON "EmployeeRestaurantPreference"("restaurantId");

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "Restaurant_name_key" ON "Restaurant"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "ShiftRequirement_restaurantId_day_shift_key" ON "ShiftRequirement"("restaurantId", "day", "shift");
CREATE UNIQUE INDEX IF NOT EXISTS "ShiftAssignment_restaurantId_day_shift_employeeId_weekStart_key" ON "ShiftAssignment"("restaurantId", "day", "shift", "employeeId", "weekStart");
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeConflict_employeeId1_employeeId2_key" ON "EmployeeConflict"("employeeId1", "employeeId2");
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeePreference_employeeId1_employeeId2_key" ON "EmployeePreference"("employeeId1", "employeeId2");
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeRestaurantPreference_employeeId_restaurantId_key" ON "EmployeeRestaurantPreference"("employeeId", "restaurantId");
CREATE UNIQUE INDEX IF NOT EXISTS "SchedulingParameter_key_key" ON "SchedulingParameter"("key");

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE "ShiftRequirement" 
DROP CONSTRAINT IF EXISTS "ShiftRequirement_restaurantId_fkey";
ALTER TABLE "ShiftRequirement" 
ADD CONSTRAINT "ShiftRequirement_restaurantId_fkey" 
FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShiftAssignment" 
DROP CONSTRAINT IF EXISTS "ShiftAssignment_restaurantId_fkey";
ALTER TABLE "ShiftAssignment" 
ADD CONSTRAINT "ShiftAssignment_restaurantId_fkey" 
FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShiftAssignment" 
DROP CONSTRAINT IF EXISTS "ShiftAssignment_employeeId_fkey";
ALTER TABLE "ShiftAssignment" 
ADD CONSTRAINT "ShiftAssignment_employeeId_fkey" 
FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys per nuove tabelle
ALTER TABLE "EmployeeConflict" 
DROP CONSTRAINT IF EXISTS "EmployeeConflict_employeeId1_fkey";
ALTER TABLE "EmployeeConflict" 
ADD CONSTRAINT "EmployeeConflict_employeeId1_fkey" 
FOREIGN KEY ("employeeId1") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeConflict" 
DROP CONSTRAINT IF EXISTS "EmployeeConflict_employeeId2_fkey";
ALTER TABLE "EmployeeConflict" 
ADD CONSTRAINT "EmployeeConflict_employeeId2_fkey" 
FOREIGN KEY ("employeeId2") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeePreference" 
DROP CONSTRAINT IF EXISTS "EmployeePreference_employeeId1_fkey";
ALTER TABLE "EmployeePreference" 
ADD CONSTRAINT "EmployeePreference_employeeId1_fkey" 
FOREIGN KEY ("employeeId1") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeePreference" 
DROP CONSTRAINT IF EXISTS "EmployeePreference_employeeId2_fkey";
ALTER TABLE "EmployeePreference" 
ADD CONSTRAINT "EmployeePreference_employeeId2_fkey" 
FOREIGN KEY ("employeeId2") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys per EmployeeRestaurantPreference
ALTER TABLE "EmployeeRestaurantPreference" 
DROP CONSTRAINT IF EXISTS "EmployeeRestaurantPreference_employeeId_fkey";
ALTER TABLE "EmployeeRestaurantPreference" 
ADD CONSTRAINT "EmployeeRestaurantPreference_employeeId_fkey" 
FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeRestaurantPreference" 
DROP CONSTRAINT IF EXISTS "EmployeeRestaurantPreference_restaurantId_fkey";
ALTER TABLE "EmployeeRestaurantPreference" 
ADD CONSTRAINT "EmployeeRestaurantPreference_restaurantId_fkey" 
FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftRequirement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployeeConflict" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployeePreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployeeRestaurantPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchedulingParameter" ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti (per evitare duplicati)
DROP POLICY IF EXISTS "Allow all operations on Restaurant" ON "Restaurant";
DROP POLICY IF EXISTS "Allow all operations on Employee" ON "Employee";
DROP POLICY IF EXISTS "Allow all operations on ShiftRequirement" ON "ShiftRequirement";
DROP POLICY IF EXISTS "Allow all operations on ShiftAssignment" ON "ShiftAssignment";
DROP POLICY IF EXISTS "Allow all operations on EmployeeConflict" ON "EmployeeConflict";
DROP POLICY IF EXISTS "Allow all operations on EmployeePreference" ON "EmployeePreference";
DROP POLICY IF EXISTS "Allow all operations on EmployeeRestaurantPreference" ON "EmployeeRestaurantPreference";
DROP POLICY IF EXISTS "Allow all operations on SchedulingParameter" ON "SchedulingParameter";

-- Policy permissive: permette tutte le operazioni
-- TODO: Quando aggiungerai autenticazione, sostituisci queste policy con policy più restrittive
CREATE POLICY "Allow all operations on Restaurant" ON "Restaurant"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on Employee" ON "Employee"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ShiftRequirement" ON "ShiftRequirement"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ShiftAssignment" ON "ShiftAssignment"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on EmployeeConflict" ON "EmployeeConflict"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on EmployeePreference" ON "EmployeePreference"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on EmployeeRestaurantPreference" ON "EmployeeRestaurantPreference"
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on SchedulingParameter" ON "SchedulingParameter"
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VERIFICA
-- ============================================

-- Verifica che tutte le tabelle siano state create
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
    'EmployeeRestaurantPreference',
    'SchedulingParameter'
)
ORDER BY table_name;

