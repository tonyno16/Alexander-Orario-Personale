-- Abilita Row Level Security (RLS) su tutte le tabelle
-- Questo script abilita RLS con policy permissive per permettere tutte le operazioni
-- Utile per MVP senza autenticazione, ma prepara il terreno per autenticazione futura

-- Abilita RLS su Restaurant
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;

-- Policy per Restaurant: permette tutte le operazioni
CREATE POLICY "Allow all operations on Restaurant" ON "Restaurant"
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Abilita RLS su Employee
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;

-- Policy per Employee: permette tutte le operazioni
CREATE POLICY "Allow all operations on Employee" ON "Employee"
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Abilita RLS su ShiftRequirement
ALTER TABLE "ShiftRequirement" ENABLE ROW LEVEL SECURITY;

-- Policy per ShiftRequirement: permette tutte le operazioni
CREATE POLICY "Allow all operations on ShiftRequirement" ON "ShiftRequirement"
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Abilita RLS su ShiftAssignment
ALTER TABLE "ShiftAssignment" ENABLE ROW LEVEL SECURITY;

-- Policy per ShiftAssignment: permette tutte le operazioni
CREATE POLICY "Allow all operations on ShiftAssignment" ON "ShiftAssignment"
    FOR ALL
    USING (true)
    WITH CHECK (true);

