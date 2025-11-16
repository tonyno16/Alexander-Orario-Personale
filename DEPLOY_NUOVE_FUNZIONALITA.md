# 🚀 Deploy Nuove Funzionalità - Ruoli Multipli e Preferenze Ristoranti

## ✅ FASE 1: Codice Pushato (COMPLETATO)
- ✅ Commit: `29e9136` - Ruoli multipli e preferenze ristoranti
- ✅ Push su GitHub: `main` branch
- ✅ Vercel dovrebbe iniziare automaticamente il deploy

---

## ⚠️ FASE 2: Applica Migrazione Database su Supabase (IMPORTANTE!)

**Tempo stimato:** 5 minuti

### Step 1: Accedi a Supabase
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Accedi al tuo account
3. Seleziona il progetto **Alexander-Orario-Personale**

### Step 2: Apri SQL Editor
1. Nel menu laterale, clicca su **SQL Editor**
2. Clicca su **New Query** (in alto a destra)

### Step 3: Applica Migrazione
1. Apri il file `apply-migration-roles-restaurant-preferences.sql` nel tuo editor
2. **Seleziona tutto** il contenuto (Ctrl+A)
3. **Copia** (Ctrl+C)
4. **Incolla** nella query editor di Supabase (Ctrl+V)
5. Clicca sul pulsante **Run** (in basso a destra) oppure premi **Ctrl+Enter**

### Step 4: Verifica Successo
Dovresti vedere:
- ✅ Messaggio: "Success. No rows returned"
- ✅ Oppure una tabella con i risultati delle query di verifica

**Cosa fa questa migrazione:**
- ✅ Aggiunge colonna `roles` (array) alla tabella `Employee`
- ✅ Crea tabella `EmployeeRestaurantPreference` per preferenze ristoranti
- ✅ Migra automaticamente i dati esistenti (copia ruolo principale in `roles`)
- ✅ Crea indici e foreign keys necessari
- ✅ Configura RLS (Row Level Security)

---

## 🔍 FASE 3: Verifica Deploy Vercel

**Tempo stimato:** 2-5 minuti

### Step 1: Controlla Deploy
1. Vai su [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Apri il progetto `Alexander-Orario-Personale`
3. Vai su **Deployments**
4. Dovresti vedere un nuovo deploy in corso o completato

### Step 2: Monitora Build Logs
Clicca sul deploy e controlla i **Build Logs**:
- ✅ `npm install` completato
- ✅ `prisma generate` completato
- ✅ `next build` completato senza errori

### Step 3: Se il Deploy Non Parte Automaticamente
Se non vedi un nuovo deploy:
1. Vai su **Deployments**
2. Clicca **Redeploy** sull'ultimo commit
3. Oppure aspetta qualche minuto (Vercel può impiegare 1-2 minuti per rilevare il push)

---

## ✅ FASE 4: Test Post-Deploy

**Tempo stimato:** 10 minuti

### Test Funzionalità Base
1. **Apri l'applicazione** su Vercel (URL tipo: `alexander-turni-xxx.vercel.app`)
2. **Vai su `/employees`**
3. **Crea un nuovo dipendente:**
   - Nome: Test Dipendente
   - Seleziona 2-3 ruoli (es: pizzaiolo, caposala)
   - Verifica che i ruoli multipli vengano salvati

### Test Preferenze Ristoranti
1. **Clicca sul pulsante "🏢 Ristoranti"** accanto a un dipendente
2. **Aggiungi una preferenza ristorante:**
   - Seleziona un ristorante
   - Imposta peso XXX (3.0)
   - Salva
3. **Verifica che la preferenza venga salvata**

### Test Scheduler
1. **Vai su `/schedule`**
2. **Genera un nuovo schedule**
3. **Verifica che:**
   - I dipendenti con ruoli multipli possano essere assegnati a qualsiasi ruolo che hanno
   - Le preferenze ristoranti influenzino lo scoring

---

## 🐛 Troubleshooting

### Problema: Deploy Fallisce su Vercel

**Possibili cause:**
1. **Prisma Client non generato**
   - Verifica che `prisma generate` sia nel build script
   - Controlla build logs per errori Prisma

2. **Errori TypeScript**
   - Controlla build logs per errori di tipo
   - Verifica che tutti i tipi siano corretti

**Soluzione:**
```bash
# Testa il build localmente
npm run build
```

### Problema: Database Non Aggiornato

**Sintomi:**
- Errore "column does not exist" o "table does not exist"
- Funzionalità non funzionano

**Soluzione:**
1. Verifica che la migrazione sia stata applicata su Supabase
2. Controlla che `DATABASE_URL` in Vercel punti al database corretto
3. Riapplica la migrazione se necessario

### Problema: Funzionalità Non Visibili

**Sintomi:**
- Non vedi i campi per ruoli multipli
- Pulsante "Ristoranti" non appare

**Soluzione:**
1. Fai hard refresh del browser (Ctrl+Shift+R)
2. Verifica che il deploy sia completato
3. Controlla la console del browser per errori JavaScript

---

## 📋 Checklist Finale

Prima di considerare il deploy completato:

- [ ] Migrazione applicata su Supabase
- [ ] Deploy Vercel completato con successo
- [ ] Test creazione dipendente con ruoli multipli
- [ ] Test aggiunta preferenza ristorante
- [ ] Test generazione schedule con nuove funzionalità
- [ ] Nessun errore nella console del browser
- [ ] Nessun errore nei build logs di Vercel

---

## 🎉 Completato!

Una volta completati tutti i passi, le nuove funzionalità saranno live:
- ✅ Ruoli multipli per dipendente (fino a 3)
- ✅ Preferenze ristoranti con pesi (X/XX/XXX)
- ✅ Scheduler migliorato che considera tutto

**URL Applicazione:** [Il tuo URL Vercel]

