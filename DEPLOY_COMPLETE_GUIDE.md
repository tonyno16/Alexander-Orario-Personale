# 🚀 Guida Completa al Deploy - Alexander Turni

## 📋 Riepilogo Stato Attuale

✅ **Codice pushato su GitHub:**
- Commit: `32677d9` - Funzionalità conflitti e preferenze
- Branch: `main`
- Repository: `tonyno16/Alexander-Orario-Personale`

✅ **File pronti:**
- `supabase-schema-complete.sql` - Schema database completo
- `DEPLOY_NOW.md` - Guida deploy rapida
- `APPLY_SCHEMA_SUPABASE.md` - Guida applicazione schema

---

## 🎯 Passi per il Deploy Completo

### FASE 1: Applica Schema Database su Supabase ⚠️ CRITICO

**Tempo stimato:** 5 minuti

1. **Vai su Supabase Dashboard**
   - URL: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Seleziona il tuo progetto

2. **Apri SQL Editor**
   - Menu laterale → **SQL Editor**
   - Clicca **New Query**

3. **Copia e Incolla Schema**
   - Apri `supabase-schema-complete.sql`
   - Copia tutto il contenuto
   - Incolla nel SQL Editor di Supabase
   - Clicca **Run** (Ctrl+Enter)

4. **Verifica Successo**
   - Dovresti vedere: "Success. No rows returned"
   - Oppure una lista delle 7 tabelle create

**📖 Guida dettagliata:** Vedi [APPLY_SCHEMA_SUPABASE.md](APPLY_SCHEMA_SUPABASE.md)

---

### FASE 2: Verifica Configurazione Vercel

**Tempo stimato:** 3 minuti

1. **Vai su Vercel Dashboard**
   - URL: [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Apri il progetto `Alexander-Orario-Personale`

2. **Verifica Variabili d'Ambiente**
   - Settings → **Environment Variables**
   - Verifica che `DATABASE_URL` sia presente
   - Se manca, aggiungila:
     - Nome: `DATABASE_URL`
     - Valore: Connection string da Supabase (URI mode)
     - Environment: Seleziona tutte (Production, Preview, Development)

3. **Ottieni Connection String da Supabase**
   - Supabase Dashboard → Settings → Database
   - Connection string → Seleziona **URI**
   - Copia la stringa completa
   - Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

4. **Verifica Database Attivo**
   - Supabase Dashboard → Verifica che il progetto sia **attivo** (non in pausa)
   - Se è in pausa, clicca **Resume**

---

### FASE 3: Monitora Deploy Vercel

**Tempo stimato:** 2-5 minuti

1. **Vai su Vercel Dashboard → Deployments**
   - Dovresti vedere un nuovo deploy in corso o completato
   - Se non c'è, il deploy partirà automaticamente dopo il push su `main`

2. **Monitora Build Logs**
   - Clicca sul deploy in corso/completato
   - Controlla i **Build Logs**:
     - ✅ `npm install` completato
     - ✅ `prisma generate` completato
     - ✅ `next build` completato senza errori

3. **Se il Deploy Non Parte Automaticamente**
   - Vai su Deployments → **Redeploy** (ultimo commit)
   - Oppure triggera manualmente:
     ```bash
     git commit --allow-empty -m "trigger deploy"
     git push origin main
     ```

---

### FASE 4: Test Post-Deploy

**Tempo stimato:** 10 minuti

1. **Test Base**
   - Apri l'URL dell'applicazione deployata su Vercel
   - Verifica che la homepage carichi correttamente
   - Vai su `/employees`
   - Verifica che la pagina carichi senza errori

2. **Test Conflitti**
   - Clicca "⚠️ Conflitti" su un dipendente
   - Verifica che il modal si apra
   - Aggiungi un conflitto con un altro dipendente
   - Verifica che appaia nella lista
   - Rimuovi il conflitto

3. **Test Preferenze**
   - Clicca "✓ Preferenze" su un dipendente
   - Verifica che il modal si apra
   - Aggiungi una preferenza con un altro dipendente
   - Regola lo slider del peso
   - Verifica che appaia nella lista
   - Rimuovi la preferenza

4. **Test Scheduler**
   - Vai su `/schedule`
   - Configura alcuni conflitti/preferenze
   - Genera un programma
   - Verifica che i conflitti siano rispettati
   - Verifica che le preferenze siano considerate

---

## ✅ Checklist Finale

### Pre-Deploy
- [ ] Schema database applicato su Supabase
- [ ] Tutte le 7 tabelle create correttamente
- [ ] Colonne `availableDays` e `availableDates` presenti in `Employee`
- [ ] Variabili d'ambiente configurate in Vercel (`DATABASE_URL`)
- [ ] Database Supabase attivo (non in pausa)

### Deploy
- [ ] Codice pushato su GitHub (`main` branch)
- [ ] Deploy Vercel completato con successo
- [ ] Build logs senza errori critici
- [ ] Applicazione accessibile online

### Post-Deploy
- [ ] Homepage carica correttamente
- [ ] Pagina `/employees` funziona
- [ ] Conflitti funzionanti (aggiungi/rimuovi)
- [ ] Preferenze funzionanti (aggiungi/rimuovi/modifica peso)
- [ ] Scheduler rispetta conflitti e preferenze
- [ ] Nessun errore nella console del browser (F12)

---

## 🆘 Troubleshooting

### Errore: "Table 'EmployeeConflict' does not exist"
**Causa:** Schema database non applicato su Supabase  
**Soluzione:** Vedi [APPLY_SCHEMA_SUPABASE.md](APPLY_SCHEMA_SUPABASE.md) - FASE 1

### Errore: "Can't reach database server"
**Causa:** Database Supabase in pausa o DATABASE_URL errata  
**Soluzione:** 
- Verifica che il database sia attivo su Supabase
- Verifica DATABASE_URL in Vercel Settings
- Controlla che la connection string sia completa

### Errore Build: "Prisma Client not generated"
**Causa:** Prisma Client non generato durante il build  
**Soluzione:** 
- Verifica che `postinstall` script sia presente in `package.json`
- Verifica build logs per errori specifici
- Il build dovrebbe includere `prisma generate` automaticamente

### Deploy non parte automaticamente
**Causa:** Vercel non collegato al repository o branch sbagliato  
**Soluzione:**
- Vercel Dashboard → Project Settings → Git
- Verifica che il branch `main` sia selezionato
- Triggera manualmente: Deployments → Redeploy

### Conflitti/Preferenze non funzionano
**Causa:** Tabelle non create o API routes non deployate  
**Soluzione:**
- Verifica che le tabelle esistano su Supabase
- Controlla i build logs per errori API
- Verifica che le route `/api/employees/[id]/conflicts` e `/api/employees/[id]/preferences` siano presenti

---

## 📚 Documentazione di Riferimento

- **Applica Schema:** [APPLY_SCHEMA_SUPABASE.md](APPLY_SCHEMA_SUPABASE.md)
- **Deploy Rapido:** [DEPLOY_NOW.md](DEPLOY_NOW.md)
- **Setup Vercel:** [VERCEL_SETUP.md](VERCEL_SETUP.md)
- **Fix Database:** [VERCEL_DATABASE_FIX.md](VERCEL_DATABASE_FIX.md)

---

## 🎉 Deploy Completato!

Una volta completata questa checklist, l'applicazione sarà completamente operativa online con tutte le nuove funzionalità:

- ✅ Gestione conflitti tra dipendenti
- ✅ Gestione preferenze tra dipendenti
- ✅ Scheduler che rispetta conflitti e preferenze
- ✅ Calendario disponibilità settimanale e mensile
- ✅ Tutte le funzionalità esistenti

---

## 📞 Supporto

Se incontri problemi:
1. Controlla i build logs su Vercel
2. Verifica i log del database su Supabase
3. Controlla la console del browser (F12) per errori JavaScript
4. Consulta la documentazione di troubleshooting sopra

**Buon deploy! 🚀**

