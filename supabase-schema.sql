-- Schema SQL per Supabase Database
-- Questo script crea tutte le tabelle necessarie per Alexander-Orario-Personale
-- Esegui questo script nel Supabase SQL Editor dopo aver creato il database

-- Tabella Restaurant
CREATE TABLE IF NOT EXISTS "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- Tabella Employee
CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "availability" INTEGER NOT NULL,
    "restaurants" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

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

-- Indici
CREATE INDEX IF NOT EXISTS "Employee_role_idx" ON "Employee"("role");
CREATE INDEX IF NOT EXISTS "ShiftRequirement_restaurantId_idx" ON "ShiftRequirement"("restaurantId");
CREATE INDEX IF NOT EXISTS "ShiftAssignment_restaurantId_day_shift_idx" ON "ShiftAssignment"("restaurantId", "day", "shift");
CREATE INDEX IF NOT EXISTS "ShiftAssignment_employeeId_idx" ON "ShiftAssignment"("employeeId");
CREATE INDEX IF NOT EXISTS "ShiftAssignment_weekStart_idx" ON "ShiftAssignment"("weekStart");

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Restaurant_name_key" ON "Restaurant"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "ShiftRequirement_restaurantId_day_shift_key" ON "ShiftRequirement"("restaurantId", "day", "shift");
CREATE UNIQUE INDEX IF NOT EXISTS "ShiftAssignment_restaurantId_day_shift_employeeId_weekStart_key" ON "ShiftAssignment"("restaurantId", "day", "shift", "employeeId", "weekStart");

-- Foreign keys
ALTER TABLE "ShiftRequirement" ADD CONSTRAINT "ShiftRequirement_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Abilita Row Level Security (RLS) su tutte le tabelle
-- Policy permissive per MVP senza autenticazione
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftRequirement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftAssignment" ENABLE ROW LEVEL SECURITY;

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

