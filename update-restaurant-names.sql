-- Script SQL per aggiornare i nomi dei ristoranti
-- Esegui questo script nel Supabase SQL Editor o nel database locale
-- Aggiorna i nomi da "Ristorante A/B/C/D" ai nuovi nomi

-- ============================================
-- AGGIORNA NOMI RISTORANTI
-- ============================================

-- Metodo 1: Aggiorna se esistono già con i vecchi nomi
UPDATE "Restaurant" 
SET "name" = 'Valsangone' 
WHERE "name" = 'Ristorante A';

UPDATE "Restaurant" 
SET "name" = 'Rivoli' 
WHERE "name" = 'Ristorante B';

UPDATE "Restaurant" 
SET "name" = 'Pinerolo' 
WHERE "name" = 'Ristorante C';

UPDATE "Restaurant" 
SET "name" = 'Piossasco' 
WHERE "name" = 'Ristorante D';

-- ============================================
-- METODO ALTERNATIVO: Se vuoi aggiornare per ID
-- ============================================
-- Se conosci gli ID dei ristoranti, puoi usarli così:
-- UPDATE "Restaurant" SET "name" = 'Valsangone' WHERE "id" = '[ID_RISTORANTE_A]';
-- UPDATE "Restaurant" SET "name" = 'Rivoli' WHERE "id" = '[ID_RISTORANTE_B]';
-- UPDATE "Restaurant" SET "name" = 'Pinerolo' WHERE "id" = '[ID_RISTORANTE_C]';
-- UPDATE "Restaurant" SET "name" = 'Piossasco' WHERE "id" = '[ID_RISTORANTE_D]';

-- ============================================
-- METODO ALTERNATIVO: Se vuoi creare nuovi ristoranti
-- (solo se non esistono già)
-- ============================================
-- INSERT INTO "Restaurant" ("id", "name", "createdAt", "updatedAt")
-- VALUES 
--   (gen_random_uuid()::text, 'Valsangone', NOW(), NOW()),
--   (gen_random_uuid()::text, 'Rivoli', NOW(), NOW()),
--   (gen_random_uuid()::text, 'Pinerolo', NOW(), NOW()),
--   (gen_random_uuid()::text, 'Piossasco', NOW(), NOW())
-- ON CONFLICT ("name") DO NOTHING;

-- ============================================
-- VERIFICA RISULTATI
-- ============================================

-- Mostra tutti i ristoranti aggiornati
SELECT 
    id,
    name,
    "createdAt",
    "updatedAt"
FROM "Restaurant"
ORDER BY name;

-- Conta i ristoranti
SELECT COUNT(*) as total_restaurants
FROM "Restaurant";

-- Verifica che i nuovi nomi siano presenti
SELECT 
    CASE 
        WHEN COUNT(*) FILTER (WHERE name = 'Valsangone') > 0 THEN '✅ Valsangone presente'
        ELSE '❌ Valsangone mancante'
    END as valsangone_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE name = 'Rivoli') > 0 THEN '✅ Rivoli presente'
        ELSE '❌ Rivoli mancante'
    END as rivoli_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE name = 'Pinerolo') > 0 THEN '✅ Pinerolo presente'
        ELSE '❌ Pinerolo mancante'
    END as pinerolo_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE name = 'Piossasco') > 0 THEN '✅ Piossasco presente'
        ELSE '❌ Piossasco mancante'
    END as piossasco_status
FROM "Restaurant";

