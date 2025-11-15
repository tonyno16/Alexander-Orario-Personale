# ✅ Checklist Deploy Definitivo - Calendario Disponibilità

## 🚀 Pre-Deploy (CRITICO - Fai PRIMA del deploy)

### 1. Migrazione Database Supabase ⚠️ OBBLIGATORIO

**IMPORTANTE:** Applica questa migrazione PRIMA che Vercel faccia il deploy, altrimenti l'applicazione crasha!

1. ✅ Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. ✅ Seleziona il tuo progetto
3. ✅ Apri **SQL Editor** (menu laterale)
4. ✅ Crea una nuova query
5. ✅ Copia e incolla questo SQL:

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

6. ✅ Clicca **Run** (Ctrl+Enter)
7. ✅ Verifica il risultato: dovresti vedere 2 righe con le colonne create
8. ✅ Verifica i dati esistenti:

```sql
SELECT id, name, availability, "availableDays", "availableDates" 
FROM "Employee" 
LIMIT 5;
```

**✅ Risultato atteso:** Tutti i dipendenti esistenti avranno `availableDays = {}` e `availableDates = {}` (array vuoti)

---

## 🔧 Verifica Configurazione Vercel

### 2. Variabili d'Ambiente

1. ✅ Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. ✅ Apri il progetto `Alexander-Orario-Personale`
3. ✅ Vai su **Settings** → **Environment Variables**
4. ✅ Verifica che queste variabili siano presenti:

   - ✅ `POSTGRES_PRISMA_URL` (da integrazione Supabase-Vercel)
   - ✅ `POSTGRES_URL` (opzionale, fallback)
   - ✅ `POSTGRES_URL_NON_POOLING` (opzionale, fallback)
   - ✅ `DATABASE_URL` (opzionale, fallback)
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` (se usi Supabase Auth)
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (se usi Supabase Auth)

5. ✅ Se manca `POSTGRES_PRISMA_URL`:
   - Verifica che l'integrazione Supabase-Vercel sia installata
   - Vai su **Settings** → **Integrations** → Verifica **Supabase**
   - Se non c'è, segui `SUPABASE_VERCEL_INTEGRATION.md`

### 3. Database Supabase Attivo

1. ✅ Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. ✅ Verifica che il progetto sia **attivo** (non in pausa)
3. ✅ Se è in pausa, clicca **Resume** per riattivarlo

---

## 📦 Deploy Automatico Vercel

### 4. Verifica Deploy in Corso

1. ✅ Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. ✅ Apri il progetto `Alexander-Orario-Personale`
3. ✅ Vai su **Deployments**
4. ✅ Verifica che ci sia un nuovo deploy in corso dopo il push su `main`
5. ✅ Attendi che il deploy completi (dovrebbe richiedere 1-2 minuti)

### 5. Verifica Build Logs

1. ✅ Clicca sul deploy in corso/completato
2. ✅ Controlla i **Build Logs**:
   - ✅ `npm install` completato senza errori
   - ✅ `prisma generate` completato
   - ✅ `next build` completato senza errori
   - ✅ Nessun errore di TypeScript o ESLint critico

3. ⚠️ Se vedi errori:
   - **Errore Prisma:** Verifica che la migrazione sia stata applicata su Supabase
   - **Errore DATABASE_URL:** Verifica le variabili d'ambiente in Vercel
   - **Errore Build:** Controlla i log per dettagli specifici

---

## 🧪 Test Post-Deploy

### 6. Test Funzionalità Base

1. ✅ Apri l'applicazione deployata su Vercel
2. ✅ Verifica che la homepage carichi correttamente
3. ✅ Vai su `/employees`
4. ✅ Verifica che la pagina carichi senza errori
5. ✅ Verifica che la tabella dipendenti sia visibile

### 7. Test Calendario Settimanale

1. ✅ Clicca "Aggiungi Dipendente" o modifica un dipendente esistente
2. ✅ Verifica che il calendario settimanale sia visibile
3. ✅ Seleziona alcuni giorni (es. Lunedì, Mercoledì, Venerdì)
4. ✅ Verifica che `availability` si aggiorni automaticamente
5. ✅ Salva il dipendente
6. ✅ Verifica che i giorni selezionati siano salvati correttamente

### 8. Test Calendario Mensile

1. ✅ Nel form dipendente, clicca "Mostra Calendario Date Specifiche"
2. ✅ Verifica che il calendario mensile appaia
3. ✅ Naviga tra i mesi (precedente/successivo)
4. ✅ Seleziona alcune date future
5. ✅ Verifica che le date selezionate vengano mostrate
6. ✅ Salva il dipendente
7. ✅ Modifica di nuovo il dipendente e verifica che le date siano ancora selezionate

### 9. Test Scheduler

1. ✅ Vai su `/schedule`
2. ✅ Genera un orario settimanale
3. ✅ Verifica che lo scheduler rispetti le disponibilità configurate:
   - Dipendenti con `availableDays` configurati vengono assegnati solo nei giorni corretti
   - Dipendenti con `availableDates` configurati vengono assegnati solo nelle date corrette
4. ✅ Verifica che non ci siano errori nella generazione

### 10. Test Retrocompatibilità

1. ✅ Verifica che i dipendenti esistenti (senza `availableDays` configurati) funzionino ancora
2. ✅ Genera un orario con dipendenti esistenti
3. ✅ Verifica che vengano assegnati correttamente (dovrebbero essere disponibili tutti i giorni)

---

## ✅ Checklist Finale

- [ ] Migrazione database applicata su Supabase
- [ ] Colonne `availableDays` e `availableDates` verificate nel database
- [ ] Variabili d'ambiente configurate in Vercel
- [ ] Database Supabase attivo
- [ ] Deploy Vercel completato con successo
- [ ] Build logs senza errori critici
- [ ] Applicazione accessibile online
- [ ] Calendario settimanale funzionante
- [ ] Calendario mensile funzionante
- [ ] Scheduler rispetta le disponibilità
- [ ] Retrocompatibilità verificata

---

## 🆘 Troubleshooting

### Errore: "Can't reach database server"
- Verifica che il database Supabase sia attivo
- Verifica le variabili d'ambiente in Vercel
- Controlla che `POSTGRES_PRISMA_URL` sia configurata

### Errore: "Column 'availableDays' does not exist"
- **SOLUZIONE:** Applica la migrazione SQL su Supabase (vedi punto 1)

### Errore: "Invalid input value for enum"
- Verifica che i giorni della settimana siano nel formato corretto: `'lunedi'`, `'martedi'`, etc.

### Calendario non appare
- Verifica la console del browser per errori JavaScript
- Controlla che i componenti siano importati correttamente
- Verifica che il build sia completato senza errori

---

## 📝 Note Finali

- **Priorità:** La migrazione database è CRITICA - applicala prima del deploy
- **Backup:** I dipendenti esistenti non vengono modificati, solo aggiunte nuove colonne
- **Retrocompatibilità:** L'applicazione funziona anche senza configurare `availableDays` o `availableDates`
- **Performance:** Le query al database includono i nuovi campi, ma non impattano le performance

---

## 🎉 Deploy Completato!

Una volta completata questa checklist, la funzionalità del calendario sarà completamente operativa!

