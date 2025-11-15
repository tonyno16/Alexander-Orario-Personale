# AI Task Planning Template - Deploy Online

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title

**Title:** Deploy Alexander-Orario-Personale Online (Production Deployment)

### Goal Statement

**Goal:** Deployare il sistema di gestione turni Alexander-Orario-Personale in produzione su una piattaforma cloud, rendendolo accessibile pubblicamente via web. Il sistema deve essere stabile, performante e utilizzabile da utenti finali per gestire turni del personale per ristoranti multipli. Il deployment deve includere sia l'applicazione Next.js che il database PostgreSQL, garantendo persistenza dei dati e scalabilità futura.

---

## 2. Project Analysis & Current State

### Technology & Architecture

- **Frameworks & Versions:**
  - Next.js 14.2.18 (App Router)
  - React 18.3.1
  - React DOM 18.3.1
- **Language:** TypeScript 5.7.2
- **Database & ORM:**
  - PostgreSQL (12.x o superiore)
  - Prisma ORM 5.20.0/5.22.0
- **UI & Styling:**
  - Tailwind CSS 3.4.17
  - PostCSS 8.4.49
  - Autoprefixer 10.4.20
- **Authentication:** Nessuna autenticazione implementata (da aggiungere in futuro)
- **Key Architectural Patterns:**
  - Next.js App Router con API Routes
  - Server-side rendering e client-side rendering misto
  - Service layer pattern (ApiService, SchedulerService)
  - Prisma Client singleton pattern per database access

### Current State

**Stato Attuale del Progetto:**

Il progetto è un sistema MVP funzionante per la gestione dei turni del personale per ristoranti multipli, attualmente in esecuzione solo in locale.

**Ambiente Attuale:**
- ✅ Sviluppo locale funzionante su `localhost:3000`
- ✅ Database PostgreSQL locale via Docker (`postgres-alexander`)
- ✅ Variabili d'ambiente configurate in `.env` e `.env.local` (non committate)
- ✅ Build di produzione testata localmente (`npm run build` funziona)
- ✅ Repository Git configurato e pushato su GitHub

**Cosa Manca per Production:**
- ⚠️ Nessun deployment cloud configurato
- ⚠️ Database PostgreSQL non è accessibile pubblicamente
- ⚠️ Variabili d'ambiente non configurate per produzione
- ⚠️ Domain/URL pubblico non configurato
- ⚠️ SSL/HTTPS non configurato
- ⚠️ Processo di deployment automatizzato non configurato
- ⚠️ Monitoring e logging produzione non configurati

**Requisiti Deployment:**
- Applicazione Next.js deve essere deployata su piattaforma cloud
- Database PostgreSQL deve essere accessibile dall'applicazione cloud
- Variabili d'ambiente devono essere configurate in modo sicuro
- Build deve essere ottimizzata per produzione
- Deve supportare migrazioni database automatiche

---

## 3. Context & Problem Definition

### Problem Statement

Il sistema Alexander-Orario-Personale è attualmente utilizzabile solo in locale, limitando l'accesso agli utenti che hanno accesso alla macchina di sviluppo. Per rendere il sistema utilizzabile da utenti finali (gestori di ristoranti, amministratori), è necessario deployarlo online in un ambiente cloud accessibile pubblicamente.

**Pain Points:**
- Sistema non accessibile da remoto
- Database locale non condivisibile tra utenti
- Nessuna disponibilità 24/7
- Difficile da aggiornare e mantenere senza deployment centralizzato
- Nessun backup automatico dei dati

**Perché Risolvere Ora:**
- Il sistema MVP è funzionante e pronto per uso reale
- Utenti potenziali hanno bisogno di accesso remoto
- Deployment è prerequisito per eventuale autenticazione multi-utente
- Permette testing con utenti reali

### Success Criteria

- [ ] Applicazione Next.js deployata e accessibile pubblicamente via HTTPS
- [ ] Database PostgreSQL cloud configurato e connesso all'applicazione
- [ ] Variabili d'ambiente configurate in modo sicuro (non esposte pubblicamente)
- [ ] Build di produzione funzionante senza errori
- [ ] Migrazioni database applicate correttamente in produzione
- [ ] Sistema accessibile 24/7 con uptime ragionevole (>99%)
- [ ] Performance accettabile (tempo di risposta < 2 secondi)
- [ ] Dati persistiti correttamente nel database cloud
- [ ] Processo di deployment documentato e riproducibile
- [ ] Backup automatico database configurato (opzionale ma consigliato)

---

## 4. Development Mode Context

### Development Mode Context

- **🚨 Project Stage:** MVP pronto per deployment produzione - sistema funzionante che necessita di accesso pubblico
- **Breaking Changes:** Nessun breaking change necessario per deployment - solo configurazione infrastruttura
- **Data Handling:**
  - Dati di sviluppo locale possono essere migrati al database cloud
  - Creare script di migrazione dati se necessario
  - Backup database locale prima di migrazione
  - Considerare inizializzazione database cloud con dati di esempio
- **User Base:** 
  - Utenti interni (gestori ristoranti)
  - Sistema non pubblico ma accessibile via URL (autenticazione da aggiungere dopo)
- **Priority:**
  - Stabilità > Velocità - deployment deve essere robusto
  - Costo contenuto - preferire opzioni gratuite o low-cost per MVP
  - Facilità di setup - preferire soluzioni con buona documentazione
  - Scalabilità futura - scegliere piattaforme che permettono crescita

---

## 5. Technical Requirements

### Functional Requirements

**Requisiti Funzionali per Deployment:**

- **Deployment Applicazione:**
  - User può accedere all'applicazione via browser usando URL pubblico
  - System deve servire l'applicazione Next.js in modalità produzione
  - System deve gestire automaticamente build e deploy su push a Git
  - System deve supportare rollback in caso di problemi

- **Database:**
  - Database PostgreSQL deve essere accessibile dall'applicazione cloud
  - Connection string deve essere configurata via variabili d'ambiente
  - Migrazioni Prisma devono essere applicabili in produzione
  - Database deve supportare almeno 1000 record per tabella (scalabilità base)

- **Variabili d'Ambiente:**
  - `DATABASE_URL` deve essere configurata in modo sicuro
  - Nessuna variabile sensibile deve essere esposta nel codice sorgente
  - Variabili devono essere configurabili senza rebuild

- **SSL/HTTPS:**
  - Applicazione deve essere accessibile via HTTPS
  - Certificato SSL deve essere valido e auto-rinnovabile

- **Performance:**
  - Tempo di caricamento iniziale < 3 secondi
  - API routes devono rispondere in < 1 secondo
  - Generazione turni deve completarsi in < 5 secondi (con più overhead cloud)

### Non-Functional Requirements

- **Performance:**
  - Applicazione deve essere accessibile 24/7
  - Uptime target: >99% (per MVP)
  - Cold start < 10 secondi (per serverless)
  - Supporto per almeno 10 utenti concorrenti

- **Security:**
  - HTTPS obbligatorio
  - Variabili d'ambiente protette
  - Database accessibile solo dall'applicazione (non pubblico)
  - Rate limiting consigliato per API routes

- **Usability:**
  - URL pubblico facile da ricordare o configurabile
  - Redirect automatico HTTP → HTTPS
  - Error pages user-friendly

- **Responsive Design:**
  - Deve funzionare su mobile, tablet, desktop (già implementato)
  - Performance accettabile su connessioni lente

- **Cost:**
  - Preferire opzioni gratuite per MVP
  - Budget massimo: €10-20/mese per iniziare
  - Scalabilità futura senza costi eccessivi

### Technical Constraints

- Deve supportare Next.js 14 App Router
- Deve supportare Prisma ORM con PostgreSQL
- Deve supportare variabili d'ambiente
- Deve supportare build Node.js 18+
- Non può richiedere modifiche significative al codice esistente
- Deve supportare Git-based deployment (preferito)
- Database deve essere PostgreSQL (non MySQL o altri)

---

## 6. Data & Database Changes

### Database Schema Changes

**Nessuna modifica schema necessaria per deployment.**

Lo schema Prisma esistente è già compatibile con PostgreSQL cloud. Le migrazioni esistenti devono essere applicate al database cloud.

**Schema da Migrare:**

```prisma
model Employee {
  id          String   @id @default(cuid())
  name        String
  role        String
  availability Int
  restaurants  String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  assignments ShiftAssignment[]
  @@index([role])
}

model Restaurant {
  id          String   @id @default(cuid())
  name        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  requirements ShiftRequirement[]
  assignments  ShiftAssignment[]
}

model ShiftRequirement {
  id           String   @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  day          String
  shift        String
  requirements Json
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([restaurantId, day, shift])
  @@index([restaurantId])
}

model ShiftAssignment {
  id           String   @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  employeeId   String
  employee     Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  day          String
  shift        String
  role         String
  weekStart    String
  createdAt    DateTime @default(now())
  @@index([restaurantId, day, shift])
  @@index([employeeId])
  @@index([weekStart])
  @@unique([restaurantId, day, shift, employeeId, weekStart])
}
```

### Data Model Updates

**Nessuna modifica ai tipi TypeScript necessaria.**

I tipi esistenti sono già compatibili. Potrebbe essere necessario aggiungere tipi per gestione errori deployment o configurazione ambiente.

### Data Migration Plan

**Piano Migrazione Database:**

1. **Scelta Database Cloud:**
   - Opzione 1: Supabase (PostgreSQL gratuito, 500MB storage)
   - Opzione 2: Railway (PostgreSQL, $5/mese, 5GB)
   - Opzione 3: Neon (PostgreSQL serverless, tier gratuito disponibile)
   - Opzione 4: Render (PostgreSQL, tier gratuito limitato)

2. **Setup Database Cloud:**
   - Creare nuovo database PostgreSQL
   - Ottenere connection string
   - Configurare variabile d'ambiente `DATABASE_URL`

3. **Applicare Schema:**
   ```bash
   # In ambiente deployment
   npm run db:generate
   npm run db:push
   # Oppure
   npm run db:migrate
   ```

4. **Migrazione Dati (Opzionale):**
   - Se ci sono dati di sviluppo da migrare:
     ```bash
     # Export da database locale
     docker exec postgres-alexander pg_dump -U postgres alexander_turni > backup.sql
     
     # Import in database cloud (dipende dalla piattaforma)
     # Esempio per Supabase: usare dashboard o CLI
     ```

5. **Validazione:**
   - Verificare che tutte le tabelle siano create
   - Testare operazioni CRUD
   - Verificare che inizializzazione funzioni

---

## 7. API & Backend Changes

### Data Access Pattern Rules

**Nessuna modifica al pattern di accesso dati necessario.**

Il codice esistente usa già Prisma Client singleton che funziona sia in locale che in cloud. L'unica differenza sarà la connection string del database.

**Considerazioni:**
- Prisma Client si connetterà al database cloud invece che locale
- Connection pooling gestito automaticamente da Prisma
- Potrebbe essere necessario configurare connection pool size per produzione

### Server Actions

**Nessuna modifica alle API routes necessaria.**

Tutte le API routes esistenti funzioneranno senza modifiche:
- `/api/employees` - CRUD dipendenti
- `/api/restaurants` - CRUD ristoranti
- `/api/requirements` - Gestione requisiti
- `/api/schedules/[weekStart]` - Gestione turni
- `/api/init` - Inizializzazione database

**Possibili Miglioramenti Post-Deployment:**
- Aggiungere rate limiting
- Aggiungere logging errori più dettagliato
- Aggiungere monitoring

### Database Queries

**Nessuna modifica alle query necessaria.**

Le query Prisma esistenti funzioneranno senza modifiche. Potrebbe essere necessario ottimizzare per performance cloud se necessario.

---

## 8. Frontend Changes

### New Components

**Nessun nuovo componente necessario per deployment base.**

Potrebbero essere aggiunti componenti per:
- Indicatore stato deployment (opzionale)
- Messaggi di errore più user-friendly per problemi di rete
- Loading states migliorati per latenza cloud

### Page Updates

**Nessuna modifica alle pagine necessaria.**

Tutte le pagine esistenti funzioneranno senza modifiche:
- `/` - Homepage
- `/employees` - Gestione dipendenti
- `/requirements` - Configurazione requisiti
- `/schedule` - Visualizzazione turni

**Possibili Miglioramenti:**
- Aggiungere error boundary per gestire errori di rete
- Migliorare messaggi di errore per problemi di connessione

### State Management

**Nessuna modifica necessaria.**

Il pattern esistente con `useState` e `useEffect` funzionerà senza modifiche.

**Considerazioni:**
- Potrebbe essere necessario gestire timeout più lunghi per chiamate API cloud
- Aggiungere retry logic per chiamate fallite (opzionale)

---

## 9. Implementation Plan

### Fase 1: Scelta e Setup Piattaforma Deployment

**Opzioni Raccomandate:**

1. **Vercel (Consigliato per Next.js)**
   - ✅ Ottimizzato per Next.js
   - ✅ Deploy automatico da GitHub
   - ✅ HTTPS incluso
   - ✅ Tier gratuito generoso
   - ✅ Facile setup
   - ⚠️ Database separato necessario

2. **Railway**
   - ✅ Supporto Next.js e PostgreSQL
   - ✅ Deploy automatico
   - ✅ Database incluso
   - ⚠️ Costo $5/mese minimo

3. **Render**
   - ✅ Tier gratuito disponibile
   - ✅ Supporto Next.js e PostgreSQL
   - ⚠️ Cold start più lento

**Piano Dettagliato:**

**Fase 1.1: Setup Database Cloud**
- [ ] Scegliere provider database (Supabase consigliato per iniziare)
- [ ] Creare account e progetto database
- [ ] Creare database PostgreSQL
- [ ] Ottenere connection string
- [ ] Testare connessione locale con nuova connection string
- **File:** `.env.production` (da creare, non committare)

**Fase 1.2: Setup Piattaforma Deployment**
- [ ] Creare account su piattaforma scelta (Vercel consigliato)
- [ ] Collegare repository GitHub
- [ ] Configurare progetto Next.js
- [ ] Configurare variabili d'ambiente (`DATABASE_URL`)
- [ ] Configurare build settings
- **File:** Configurazione piattaforma (via dashboard)

**Fase 1.3: Configurazione Build**
- [ ] Verificare che `package.json` abbia script `build` e `start`
- [ ] Aggiungere script `postbuild` per generare Prisma Client se necessario
- [ ] Configurare `next.config.js` per produzione se necessario
- **File:** `package.json`, `next.config.js`

### Fase 2: Migrazione Database e Deploy

**Fase 2.1: Preparazione Database**
- [ ] Applicare schema Prisma al database cloud
  ```bash
  # In ambiente deployment o via CI/CD
  npm install
  npm run db:generate
  npm run db:push
  ```
- [ ] Verificare che tabelle siano create correttamente
- [ ] (Opzionale) Migrare dati da database locale

**Fase 2.2: Deploy Iniziale**
- [ ] Triggerare deploy iniziale dalla piattaforma
- [ ] Monitorare build logs per errori
- [ ] Verificare che build completi con successo
- [ ] Verificare che applicazione sia accessibile via URL pubblico

**Fase 2.3: Test Post-Deploy**
- [ ] Testare accesso applicazione via browser
- [ ] Testare inizializzazione database (se vuoto)
- [ ] Testare CRUD dipendenti
- [ ] Testare CRUD ristoranti
- [ ] Testare configurazione requisiti
- [ ] Testare generazione turni
- [ ] Testare visualizzazione turni
- [ ] Verificare che dati persistano correttamente

### Fase 3: Configurazione Produzione e Ottimizzazione

**Fase 3.1: Configurazione Ambiente**
- [ ] Verificare che tutte le variabili d'ambiente siano configurate
- [ ] Verificare che `NODE_ENV=production` sia impostato
- [ ] Configurare logging produzione se disponibile
- [ ] Configurare monitoring se disponibile

**Fase 3.2: Ottimizzazione**
- [ ] Verificare performance applicazione
- [ ] Ottimizzare query database se necessario
- [ ] Configurare caching se disponibile
- [ ] Verificare che immagini/assets siano serviti correttamente

**Fase 3.3: Documentazione**
- [ ] Documentare processo di deployment
- [ ] Documentare variabili d'ambiente necessarie
- [ ] Documentare come fare rollback se necessario
- [ ] Aggiornare README con istruzioni deployment
- **File:** `README.md`, `DEPLOYMENT.md` (nuovo)

### Fase 4: Setup CI/CD e Automazione

**Fase 4.1: Deploy Automatico**
- [ ] Configurare deploy automatico su push a `main` branch
- [ ] Configurare preview deployments per pull requests (opzionale)
- [ ] Testare deploy automatico

**Fase 4.2: Migrazioni Database Automatiche**
- [ ] Configurare script per applicare migrazioni durante deploy
- [ ] Testare che migrazioni vengano applicate correttamente
- **File:** Script di deploy o configurazione piattaforma

**Fase 4.3: Monitoring e Alerting**
- [ ] Configurare monitoring errori (opzionale)
- [ ] Configurare alerting per downtime (opzionale)
- [ ] Documentare come monitorare applicazione

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking

**Tracking Progress:**

- ✅ Task completato
- 🔄 Task in corso
- ⏸️ Task in pausa/bloccato
- ❌ Task fallito/abbandonato

**Checklist Deployment:**

**Pre-Deployment:**
- [ ] Database cloud creato e accessibile
- [ ] Connection string ottenuta e testata
- [ ] Account piattaforma deployment creato
- [ ] Repository GitHub collegato
- [ ] Variabili d'ambiente configurate

**Deployment:**
- [ ] Build completata con successo
- [ ] Applicazione accessibile via URL pubblico
- [ ] Schema database applicato correttamente
- [ ] Test funzionalità base completati

**Post-Deployment:**
- [ ] Tutte le funzionalità testate e funzionanti
- [ ] Performance verificata
- [ ] Documentazione aggiornata
- [ ] Deploy automatico configurato

---

## 11. File Structure & Organization

**File da Creare/Modificare:**

**Nuovi File:**
- `.env.production` (locale, non committare) - Connection string database produzione
- `DEPLOYMENT.md` (opzionale) - Documentazione deployment
- `.vercelignore` (se usando Vercel) - File da escludere da deploy

**File da Modificare:**
- `package.json` - Verificare script build/start, aggiungere postbuild se necessario
- `next.config.js` - Configurazioni produzione se necessarie
- `README.md` - Aggiungere sezione deployment
- `.gitignore` - Verificare che `.env.production` sia ignorato

**File Esistenti (Nessuna Modifica Necessaria):**
- `prisma/schema.prisma` - Schema già compatibile
- `lib/prisma.ts` - Funziona già con connection string da env
- Tutte le API routes - Nessuna modifica necessaria
- Tutte le pagine - Nessuna modifica necessaria

**Struttura Configurazione:**

```
alexander-turni/
├── .env.local          # Variabili sviluppo (locale, non committato)
├── .env.production     # Variabili produzione (locale, non committato)
├── .vercelignore       # File da escludere da Vercel (se usando Vercel)
├── DEPLOYMENT.md       # Documentazione deployment (nuovo, opzionale)
├── package.json        # Script build/start già presenti
├── next.config.js      # Configurazione Next.js
└── [resto struttura esistente]
```

---

## 12. AI Agent Instructions

### Implementation Workflow

🎯 **MANDATORY PROCESS:**

1. **Analisi Opzioni:**
   - Analizzare opzioni di deployment disponibili
   - Confrontare costi, facilità setup, scalabilità
   - Scegliere opzione migliore per MVP

2. **Setup Incrementale:**
   - Setup database cloud prima
   - Testare connessione database localmente
   - Setup piattaforma deployment
   - Configurare variabili d'ambiente
   - Deploy iniziale
   - Test funzionalità

3. **Validazione:**
   - Testare tutte le funzionalità dopo deploy
   - Verificare performance
   - Verificare che dati persistano

4. **Documentazione:**
   - Documentare processo di deployment
   - Aggiornare README con istruzioni
   - Documentare variabili d'ambiente necessarie

**Best Practices:**
- Testare tutto localmente prima di deploy
- Fare deploy incrementali (prima database, poi app)
- Mantenere backup database locale
- Documentare ogni passo del processo

### Communication Preferences

- Essere chiaro su quale piattaforma si sta usando
- Spiegare ogni passo del processo di deployment
- Avvisare se ci sono costi associati
- Fornire comandi esatti da eseguire
- Spiegare come verificare che tutto funzioni

### Code Quality Standards

- Non committare file `.env` o variabili sensibili
- Mantenere configurazioni produzione separate da sviluppo
- Documentare tutte le variabili d'ambiente necessarie
- Usare nomi descrittivi per progetti e risorse cloud

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Aree di Preoccupazione:**

1. **Database Migration:**
   - Migrazione schema deve essere applicata correttamente
   - Dati esistenti devono essere preservati se migrati
   - Connection string deve essere corretta
   - **Mitigazione:** Testare migrazione su database di test prima

2. **Variabili d'Ambiente:**
   - `DATABASE_URL` deve essere configurata correttamente
   - Nessuna variabile sensibile deve essere esposta
   - Variabili devono essere accessibili durante build
   - **Mitigazione:** Usare sistema di variabili d'ambiente della piattaforma

3. **Build Process:**
   - Build deve includere generazione Prisma Client
   - Build deve completarsi senza errori
   - Dependencies devono essere installate correttamente
   - **Mitigazione:** Verificare che `package.json` abbia tutti gli script necessari

4. **Performance:**
   - Latenza database cloud può essere maggiore
   - Cold start può essere più lento
   - Performance generale può essere diversa da locale
   - **Mitigazione:** Monitorare performance e ottimizzare se necessario

5. **Cost Management:**
   - Database cloud può avere limiti su tier gratuito
   - Deploy possono avere limiti su tier gratuito
   - **Mitigazione:** Monitorare uso e pianificare upgrade se necessario

6. **Security:**
   - Database non deve essere accessibile pubblicamente
   - Variabili d'ambiente devono essere protette
   - HTTPS deve essere abilitato
   - **Mitigazione:** Usare best practices della piattaforma scelta

**Checklist Pre-Deploy:**
- [ ] Database cloud creato e testato
- [ ] Connection string verificata localmente
- [ ] Build locale funziona (`npm run build`)
- [ ] Tutte le variabili d'ambiente identificate
- [ ] Documentazione aggiornata

**Checklist Post-Deploy:**
- [ ] Applicazione accessibile via HTTPS
- [ ] Database connesso e funzionante
- [ ] Tutte le funzionalità testate
- [ ] Performance accettabile
- [ ] Dati persistono correttamente
- [ ] Deploy automatico configurato
- [ ] Monitoring configurato (se disponibile)

---

**🎯 Ready to Deploy!**

Questo template fornisce il framework completo per deployare Alexander-Orario-Personale online. Segui le fasi in ordine e verifica ogni passo prima di procedere al successivo.

**Prossimi Passi Immediati:**
1. Scegliere piattaforma deployment (Vercel consigliato)
2. Scegliere provider database cloud (Supabase consigliato)
3. Seguire Fase 1 del piano di implementazione

---

*This template is part of ShipKit - AI-powered development workflows and templates*  
*Get the complete toolkit at: https://shipkit.ai*

