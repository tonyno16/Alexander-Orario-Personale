# AI Task Planning Template - Alexander-Orario-Personale

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title

<!-- Give your task a clear, specific name that describes what you're building or fixing -->

**Title:** [Brief, descriptive title - e.g., "Add User Authentication System" or "Fix Payment Integration Bug"]

### Goal Statement

<!-- Write one paragraph explaining what you want to achieve and why it matters for your project -->

**Goal:** [Clear statement of the end result you want and the business/user value it provides]

---

## 2. Project Analysis & Current State

### Technology & Architecture

<!-- This is where you document your current tech stack so the AI understands your environment -->

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

<!-- Describe what exists today - what's working, what's broken, what's missing -->

**Stato Attuale del Progetto:**

Il progetto è un sistema MVP funzionante per la gestione dei turni del personale per ristoranti multipli.

**Funzionalità Implementate:**

- ✅ Database persistente PostgreSQL con Prisma ORM
- ✅ CRUD completo per dipendenti (Employee)
- ✅ CRUD completo per ristoranti (Restaurant)
- ✅ Gestione requisiti turni (ShiftRequirement)
- ✅ Algoritmo di assegnazione automatica turni (SchedulerService)
- ✅ Visualizzazione turni settimanali
- ✅ Esportazione PDF dei turni
- ✅ Inizializzazione automatica database con dati di esempio
- ✅ API Routes Next.js per tutte le operazioni backend

**Struttura Database:**

- 4 modelli Prisma: Employee, Restaurant, ShiftRequirement, ShiftAssignment
- Relazioni configurate con cascade delete
- Indici ottimizzati per query frequenti

**Pagine Frontend:**

- `/` - Homepage con dashboard e generazione turni
- `/employees` - Gestione dipendenti
- `/requirements` - Configurazione requisiti turni
- `/schedule` - Visualizzazione turni settimanali

**Cosa Manca/da Migliorare:**

- ⚠️ Autenticazione utente
- ✅ Algoritmo di assegnazione migliorato per casi complessi (completato: backtracking, ricerca locale, riassegnazione intelligente)
- 🔄 **Gestione conflitti tra dipendenti e parametri personalizzabili** (in sviluppo)
- ⚠️ Gestione ferie e permessi
- ⚠️ Notifiche ai dipendenti
- ⚠️ Statistiche e report avanzati

## 3. Context & Problem Definition

### Problem Statement

<!-- This is where you clearly define the specific problem you're solving -->

[Detailed explanation of the problem, including user impact, pain points, and why it needs to be solved now]

### Success Criteria

<!-- Define exactly how you'll know when this task is complete and successful -->

- [ ] [Specific, measurable outcome 1]
- [ ] [Specific, measurable outcome 2]
- [ ] [Specific, measurable outcome 3]

---

## 4. Development Mode Context

### Development Mode Context

<!-- This is where you tell the AI agent about your project's constraints and priorities -->

- **🚨 Project Stage:** MVP in sviluppo attivo - sistema funzionante ma in evoluzione
- **Breaking Changes:** Evitare breaking changes quando possibile, ma accettabili se migliorano significativamente l'architettura
- **Data Handling:**
  - I dati sono già nel database PostgreSQL
  - Le migrazioni devono preservare i dati esistenti
  - Backup consigliato prima di modifiche schema significative
- **User Base:** Sistema interno per gestione turni ristoranti (non pubblico)
- **Priority:**
  - Stabilità > Velocità per funzionalità core (assegnazione turni)
  - Velocità > Stabilità per nuove feature MVP
  - Mantenere compatibilità con dati esistenti

---

## 5. Technical Requirements

### Functional Requirements

<!-- This is where the AI will understand exactly what the system should do - be specific about user actions and system behaviors -->

**Esempi di Requisiti Funzionali per Nuove Feature:**

- User può [azione specifica]
- System automaticamente [comportamento specifico]
- Quando [condizione] si verifica, allora [risposta del sistema]

**Esempi Esistenti nel Progetto:**

- User può aggiungere/modificare/eliminare dipendenti
- User può configurare requisiti turni per ristorante/giorno/turno
- System automaticamente genera assegnamenti turni rispettando disponibilità e requisiti
- Quando un dipendente raggiunge la sua disponibilità settimanale, non viene più assegnato
- System inizializza automaticamente database con dati di esempio se vuoto

### Non-Functional Requirements

<!-- This is where you define performance, security, and usability standards -->

- **Performance:**
  - Generazione turni deve completarsi in < 2 secondi per 50+ dipendenti e 4 ristoranti
  - Query database devono essere ottimizzate con indici appropriati
  - Pagine devono caricare in < 1 secondo
- **Security:**
  - Attualmente nessuna autenticazione (da implementare)
  - Validazione input lato server per tutte le API routes
  - Sanitizzazione dati prima di salvare nel database
- **Usability:**
  - Interfaccia in italiano
  - Design responsive (mobile-first)
  - Feedback visivo per azioni utente (loading states, error messages)
  - Form validation lato client e server
- **Responsive Design:**
  - Supporto mobile, tablet, desktop
  - Tailwind CSS breakpoints: sm, md, lg, xl
  - Layout adattivo per tabelle e form
- **Theme Support:**
  - Attualmente solo tema chiaro
  - Dark mode può essere aggiunto in futuro

### Technical Constraints

<!-- This is where you list limitations the AI agent must work within -->

- Deve usare Prisma ORM per tutte le operazioni database
- Deve mantenere compatibilità con schema Prisma esistente (o creare migrazioni appropriate)
- Deve usare Next.js App Router (non Pages Router)
- Deve usare TypeScript con tipi definiti in `types/index.ts`
- Deve seguire la struttura API Routes esistente in `app/api/`
- Deve usare Tailwind CSS per styling (non CSS modules o styled-components)
- Non modificare la logica core di `lib/scheduler.ts` senza test approfonditi

---

## 6. Data & Database Changes

### Database Schema Changes

<!-- This is where you specify any database modifications needed -->

**Schema Prisma Attuale:**

```prisma
model Employee {
  id          String   @id @default(cuid())
  name        String
  role        String   // 'cuoco' | 'aiuto_cuoco' | 'pizzaiolo' | 'lavapiatti' | 'cameriere' | 'aiuto_cameriere'
  availability Int     // giorni disponibili a settimana
  restaurants  String[] // array di ID ristoranti (vuoto = tutti)
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
  day          String   // 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'
  shift        String   // 'pranzo' | 'cena'
  requirements Json     // Array di { role: string, count: number }
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
  day          String   // 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'
  shift        String   // 'pranzo' | 'cena'
  role         String   // ruolo del dipendente per questo turno
  weekStart    String   // data inizio settimana (YYYY-MM-DD)
  createdAt    DateTime @default(now())
  @@index([restaurantId, day, shift])
  @@index([employeeId])
  @@index([weekStart])
  @@unique([restaurantId, day, shift, employeeId, weekStart])
}
```

**Per Nuove Feature, Specificare:**

- Nuove tabelle da creare
- Nuove colonne da aggiungere a tabelle esistenti
- Nuovi indici necessari
- Modifiche a relazioni esistenti

### Data Model Updates

<!-- This is where you define TypeScript types, schema updates, or data structure changes -->

**Tipi TypeScript Attuali (`types/index.ts`):**

```typescript
export type EmployeeRole =
  | "cuoco"
  | "aiuto_cuoco"
  | "pizzaiolo"
  | "lavapiatti"
  | "cameriere"
  | "aiuto_cameriere";

export type DayOfWeek =
  | "lunedi"
  | "martedi"
  | "mercoledi"
  | "giovedi"
  | "venerdi"
  | "sabato"
  | "domenica";

export type Shift = "pranzo" | "cena";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  availability: number;
  restaurants: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleRequirement {
  role: EmployeeRole;
  count: number;
}

export interface ShiftRequirement {
  id: string;
  restaurantId: string;
  day: DayOfWeek;
  shift: Shift;
  requirements: RoleRequirement[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShiftAssignment {
  id: string;
  restaurantId: string;
  employeeId: string;
  day: DayOfWeek;
  shift: Shift;
  role: EmployeeRole;
  weekStart: string; // YYYY-MM-DD
  createdAt?: Date;
}

export interface WeekSchedule {
  weekStart: string; // YYYY-MM-DD
  assignments: ShiftAssignment[];
}
```

**Per Nuove Feature, Specificare:**

- Nuovi tipi TypeScript da aggiungere
- Modifiche a interfacce esistenti
- Nuovi enum o union types

### Data Migration Plan

<!-- This is where you plan how to handle existing data during changes -->

**Processo Migrazione Standard:**

1. **Backup:** Eseguire backup database prima di modifiche schema

   ```bash
   docker exec postgres-alexander pg_dump -U postgres alexander_turni > backup.sql
   ```

2. **Modifiche Schema:** Aggiornare `prisma/schema.prisma`

3. **Generare Migrazione:**

   ```bash
   npm run db:migrate
   ```

   Oppure per sviluppo rapido:

   ```bash
   npm run db:push
   ```

4. **Validazione:** Verificare che dati esistenti siano preservati

5. **Test:** Testare funzionalità esistenti con nuovo schema

**Per Modifiche Schema Significative:**

- Creare script di migrazione dati se necessario
- Testare su copia database di sviluppo
- Pianificare downtime se necessario

---

## 7. API & Backend Changes

### Data Access Pattern Rules

<!-- This is where you tell the AI agent how to structure backend code in your project -->

**Pattern di Accesso Dati nel Progetto:**

1. **API Routes:** Tutte le API routes sono in `app/api/[resource]/route.ts`

   - GET: Fetch dati
   - POST: Creare nuovi record
   - PUT: Aggiornare record esistenti
   - DELETE: Eliminare record

2. **Prisma Client:** Usare `lib/prisma.ts` per accesso database

   - Singleton pattern per evitare multiple istanze
   - Logging abilitato in development

3. **Service Layer:**

   - `lib/api.ts` - ApiService per chiamate client-side
   - `lib/scheduler.ts` - SchedulerService per logica business turni

4. **Error Handling:**

   - Tutte le API routes devono gestire errori e restituire JSON con `{ error: string }`
   - Status codes appropriati (200, 201, 400, 404, 500)

5. **Validazione:**
   - Validare input in API routes prima di salvare
   - Usare TypeScript types per type safety

### Server Actions

<!-- List the backend mutation operations you need -->

**API Routes Esistenti:**

**Employees (`app/api/employees/route.ts`):**

- `GET /api/employees` - Lista tutti i dipendenti
- `POST /api/employees` - Crea nuovo dipendente
- `PUT /api/employees/[id]` - Aggiorna dipendente
- `DELETE /api/employees/[id]` - Elimina dipendente

**Restaurants (`app/api/restaurants/route.ts`):**

- `GET /api/restaurants` - Lista tutti i ristoranti
- `POST /api/restaurants` - Crea nuovo ristorante
- `PUT /api/restaurants/[id]` - Aggiorna ristorante
- `DELETE /api/restaurants/[id]` - Elimina ristorante

**Requirements (`app/api/requirements/route.ts`):**

- `GET /api/requirements` - Lista tutti i requisiti
- `POST /api/requirements` - Salva/aggiorna requisito (upsert)
- `DELETE /api/requirements?id=...` - Elimina requisito

**Schedules (`app/api/schedules/[weekStart]/route.ts`):**

- `GET /api/schedules/[weekStart]` - Ottieni turni per settimana
- `POST /api/schedules/[weekStart]` - Salva assegnamenti turni

**Init (`app/api/init/route.ts`):**

- `POST /api/init` - Inizializza database con dati di esempio

**Per Nuove Feature, Specificare:**

- Nuove API routes da creare
- Nuove operazioni da aggiungere a route esistenti
- Modifiche a logica esistente

### Database Queries

<!-- Specify how you'll fetch data -->

**Pattern Query Esistenti:**

- Query dirette nelle API routes usando Prisma Client
- Nessun repository pattern separato (query inline nelle route)
- Uso di `include` per relazioni quando necessario
- Uso di `where` per filtri
- Uso di `orderBy` per ordinamento

**Esempi:**

```typescript
// Fetch con relazioni
const employees = await prisma.employee.findMany({
  include: { assignments: true },
});

// Query filtrata
const requirements = await prisma.shiftRequirement.findMany({
  where: { restaurantId },
});

// Query con ordinamento
const restaurants = await prisma.restaurant.findMany({
  orderBy: { name: "asc" },
});
```

---

## 8. Frontend Changes

### New Components

<!-- This is where you specify UI components to be created -->

**Componenti Esistenti:**

- Layout principale con navigazione (`app/layout.tsx`)
- Pagina Home (`app/page.tsx`)
- Pagina Gestione Dipendenti (`app/employees/page.tsx`)
- Pagina Configurazione Requisiti (`app/requirements/page.tsx`)
- Pagina Visualizzazione Turni (`app/schedule/page.tsx`)

**Pattern Componenti:**

- Client components con `'use client'` quando necessario
- Server components di default (Next.js App Router)
- Tailwind CSS per styling
- Form con validazione lato client

**Per Nuove Feature, Specificare:**

- Nuovi componenti da creare
- Componenti riutilizzabili da estrarre
- Modifiche a componenti esistenti

### Page Updates

<!-- This is where you list pages that need modifications -->

**Pagine Esistenti:**

- `/` - Homepage con dashboard e generazione turni
- `/employees` - CRUD dipendenti
- `/requirements` - Configurazione requisiti turni
- `/schedule` - Visualizzazione turni settimanali con esportazione PDF

**Per Nuove Feature, Specificare:**

- Pagine da modificare
- Nuove pagine da creare
- Modifiche a routing

### State Management

<!-- This is where you plan how data flows through your frontend -->

**Pattern State Management Attuale:**

- **Client State:** React `useState` e `useEffect` per state locale
- **Server State:** Fetch diretto nelle pagine con `useEffect`
- **Data Fetching:** ApiService (`lib/api.ts`) per tutte le chiamate API
- **No Global State:** Nessun Context API o Redux (non necessario per MVP)

**Data Flow:**

1. Pagina carica dati con `useEffect` → `ApiService.getX()`
2. State locale aggiornato con dati ricevuti
3. User interagisce → chiama `ApiService.create/update/delete()`
4. Dopo successo → ricarica dati o aggiorna state locale

**Per Nuove Feature, Specificare:**

- Nuovo state da gestire
- Nuovi hook custom da creare
- Modifiche a data flow esistente

---

## 9. Implementation Plan

**Template per Piano di Implementazione:**

TODO: Break your work into phases with specific tasks and file paths

**Esempio Struttura:**

```
Fase 1: Setup e Preparazione
- [ ] Task 1: Descrizione task
  - File: path/to/file.ts
  - Modifiche: cosa cambiare
- [ ] Task 2: Descrizione task
  - File: path/to/file.tsx
  - Modifiche: cosa cambiare

Fase 2: Implementazione Core
- [ ] Task 3: Descrizione task
  ...

Fase 3: Testing e Refinement
- [ ] Task N: Descrizione task
  ...
```

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking

<!-- This is where you tell the AI agent to update progress as work is completed -->

**Tracking Progress:**

- Aggiornare checklist in questa sezione mentre si completa ogni task
- Segnare file modificati/creati
- Notare eventuali problemi o deviazioni dal piano
- Documentare decisioni importanti prese durante implementazione

**Formato:**

- ✅ Task completato
- 🔄 Task in corso
- ⏸️ Task in pausa/bloccato
- ❌ Task fallito/abbandonato

---

## 11. File Structure & Organization

**Struttura File Attuale:**

```
alexander-turni/
├── app/
│   ├── api/              # API Routes Next.js
│   │   ├── employees/
│   │   ├── restaurants/
│   │   ├── requirements/
│   │   ├── schedules/
│   │   └── init/
│   ├── employees/        # Pagina gestione dipendenti
│   ├── requirements/     # Pagina configurazione requisiti
│   ├── schedule/         # Pagina visualizzazione turni
│   ├── layout.tsx        # Layout principale
│   ├── page.tsx          # Homepage
│   └── globals.css       # Stili globali
├── lib/
│   ├── api.ts           # ApiService (client-side)
│   ├── prisma.ts        # Prisma Client singleton
│   └── scheduler.ts     # SchedulerService (logica business)
├── prisma/
│   └── schema.prisma    # Schema database
├── types/
│   └── index.ts         # TypeScript types
├── AI Doc Folder/       # Documentazione progetto
└── [config files]       # next.config.js, tsconfig.json, etc.
```

**Per Nuove Feature, Specificare:**

- Nuovi file da creare e loro posizione
- File esistenti da modificare
- File da eliminare (se necessario)

---

## 12. AI Agent Instructions

### Implementation Workflow

<!-- This is where you give specific instructions to your AI agent -->

🎯 **MANDATORY PROCESS:**

1. **Analisi:** Leggere e comprendere il codice esistente prima di modificare
2. **Pianificazione:** Creare piano dettagliato prima di iniziare implementazione
3. **Implementazione Incrementale:**
   - Implementare una feature alla volta
   - Testare dopo ogni modifica significativa
   - Commit frequenti con messaggi descrittivi
4. **Validazione:**
   - Verificare che TypeScript compili senza errori
   - Verificare che non ci siano errori di linting
   - Testare funzionalità manualmente se possibile
5. **Documentazione:** Aggiornare commenti e documentazione se necessario

**Best Practices:**

- Seguire convenzioni di naming esistenti (camelCase per variabili, PascalCase per componenti)
- Mantenere consistenza con stile codice esistente
- Aggiungere commenti per logica complessa
- Usare TypeScript types invece di `any`
- Gestire errori appropriatamente

### Communication Preferences

<!-- This is where you set expectations for how the AI should communicate -->

- Essere conciso ma completo nelle spiegazioni
- Spiegare decisioni importanti prese durante implementazione
- Avvisare se ci sono problemi o limitazioni
- Fornire esempi di codice quando utile
- Chiedere conferma prima di modifiche breaking o significative

### Code Quality Standards

<!-- This is where you define your coding standards for the AI to follow -->

- **TypeScript:** Strict mode, no `any`, tipi espliciti
- **Formatting:** Prettier (se configurato) o seguire stile esistente
- **Linting:** ESLint con configurazione Next.js
- **Naming:**
  - Componenti: PascalCase
  - Funzioni/Variabili: camelCase
  - Costanti: UPPER_SNAKE_CASE
  - File: kebab-case per route, camelCase per utilities
- **Error Handling:** Try-catch per operazioni async, gestione errori user-friendly
- **Performance:** Evitare re-render inutili, usare `useMemo`/`useCallback` quando appropriato

---

## 13. Second-Order Impact Analysis

### Impact Assessment

<!-- This is where you think through broader consequences of your changes -->

**Aree di Preoccupazione:**

1. **Database Schema Changes:**

   - Modifiche a schema Prisma possono richiedere migrazioni
   - Verificare che dati esistenti siano compatibili
   - Testare su database di sviluppo prima di produzione

2. **SchedulerService (`lib/scheduler.ts`):**

   - Logica core per assegnazione turni
   - Modifiche qui possono influenzare tutti i turni generati
   - Testare accuratamente con diversi scenari

3. **API Routes:**

   - Modifiche possono rompere frontend esistente
   - Mantenere backward compatibility quando possibile
   - Versionare API se breaking changes necessari

4. **TypeScript Types (`types/index.ts`):**

   - Modifiche possono richiedere aggiornamenti in molti file
   - Verificare che tutti i file usino i tipi aggiornati

5. **Performance:**

   - Algoritmo scheduler deve rimanere efficiente
   - Query database devono rimanere ottimizzate
   - Evitare N+1 query problems

6. **User Workflow:**
   - Modifiche UI possono confondere utenti esistenti
   - Mantenere navigazione intuitiva
   - Preservare funzionalità esistenti

**Checklist Pre-Deploy:**

- [ ] Testare tutte le funzionalità esistenti
- [ ] Verificare che generazione turni funzioni correttamente
- [ ] Verificare che esportazione PDF funzioni
- [ ] Testare su browser diversi
- [ ] Verificare responsive design
- [ ] Controllare errori console
- [ ] Verificare performance (tempo generazione turni)

---

**🎯 Ready to Plan Your Next Project?**

This template gives you the framework - now fill it out with your specific project details!

_Want the complete version with detailed examples, advanced strategies, and full AI agent workflows? [Watch the full tutorial video here]_

---

## 14. Task: Gestione Conflitti Dipendenti e Parametri Personalizzabili

### Task Title

**Title:** Gestione Conflitti tra Dipendenti e Parametri Personalizzabili nell'Algoritmo di Assegnazione

### Goal Statement

**Goal:** Estendere l'algoritmo di assegnazione turni per supportare la gestione di conflitti tra dipendenti (evitare di assegnare insieme persone che non lavorano bene insieme) e altri parametri personalizzabili che permettano un controllo più granulare sulla generazione dei turni. Questo migliorerà la qualità della soluzione e permetterà di gestire situazioni reali dove alcuni dipendenti non possono o non devono lavorare insieme.

---

## 15. Context & Problem Definition

### Problem Statement

Attualmente l'algoritmo di assegnazione considera solo:

- Disponibilità dei dipendenti
- Ruoli richiesti
- Bilanciamento del carico di lavoro
- Continuità ristorante (opzionale)

**Problema:** In contesti reali, ci sono spesso situazioni dove:

- Alcuni dipendenti non possono lavorare insieme (conflitti personali, problemi di collaborazione)
- Alcuni dipendenti lavorano meglio insieme (preferenze di team)
- Potrebbero esserci altre regole personalizzate (es. evitare che un dipendente lavori con più di X persone diverse nella stessa settimana)

**Impatto:** Senza questa funzionalità, l'algoritmo potrebbe generare turni che, pur tecnicamente corretti, non sono praticabili o ottimali per l'ambiente di lavoro reale.

### Success Criteria

- [ ] Sistema permette di configurare conflitti tra dipendenti (coppie che non possono lavorare insieme)
- [ ] Sistema permette di configurare preferenze tra dipendenti (coppie che lavorano bene insieme)
- [ ] Algoritmo rispetta i conflitti durante l'assegnazione (non assegna dipendenti conflittuali allo stesso turno)
- [ ] Algoritmo considera le preferenze come bonus nello scoring (preferisce assegnare dipendenti che lavorano bene insieme)
- [ ] Interfaccia utente permette di gestire conflitti/preferenze per dipendente
- [ ] Le regole sono configurabili e possono essere modificate senza impattare i dati esistenti
- [ ] Performance dell'algoritmo rimane accettabile (< 2 secondi per 50+ dipendenti)

---

## 16. Technical Requirements

### Functional Requirements

**Requisiti Funzionali:**

- User può configurare conflitti tra dipendenti (dipendente A non può lavorare con dipendente B)
- User può configurare preferenze tra dipendenti (dipendente A lavora meglio con dipendente B)
- User può visualizzare tutti i conflitti/preferenze configurati per un dipendente
- User può rimuovere conflitti/preferenze esistenti
- System automaticamente evita di assegnare dipendenti conflittuali allo stesso turno (stesso ristorante, giorno, turno)
- System automaticamente preferisce assegnare dipendenti con preferenze configurate quando possibile
- Quando non è possibile evitare un conflitto (caso complesso), system logga un warning ma completa l'assegnazione
- System permette configurazione di altri parametri personalizzabili:
  - Massimo numero di dipendenti diversi con cui un dipendente può lavorare nella stessa settimana
  - Preferenza per mantenere team stabili tra settimane
  - Regole per ruoli specifici (es. sempre assegnare X con Y quando entrambi disponibili)

### Non-Functional Requirements

- **Performance:**
  - Verifica conflitti deve essere efficiente (O(1) lookup con Map)
  - Algoritmo deve completarsi ancora in < 2 secondi anche con molti conflitti configurati
- **Usability:**
  - Interfaccia intuitiva per gestire conflitti/preferenze
  - Visualizzazione chiara dei conflitti esistenti
  - Feedback quando un conflitto impedisce un'assegnazione
- **Data Integrity:**
  - Conflitti/preferenze devono essere bidirezionali (se A conflitto con B, allora B conflitto con A)
  - Validazione per evitare conflitti/preferenze con se stesso

### Technical Constraints

- Deve estendere `SchedulingOptions` esistente senza breaking changes
- Deve usare Prisma ORM per persistenza conflitti/preferenze
- Deve mantenere retrocompatibilità: sistema funziona anche senza conflitti configurati
- Deve integrare con algoritmo esistente (backtracking, ricerca locale)
- Deve usare TypeScript types definiti in `types/index.ts`

---

## 17. Data & Database Changes

### Database Schema Changes

**Nuove Tabelle da Creare:**

```prisma
model EmployeeConflict {
  id          String   @id @default(cuid())
  employeeId1 String   // Primo dipendente
  employee1   Employee @relation("EmployeeConflicts1", fields: [employeeId1], references: [id], onDelete: Cascade)
  employeeId2 String   // Secondo dipendente
  employee2   Employee @relation("EmployeeConflicts2", fields: [employeeId2], references: [id], onDelete: Cascade)
  reason      String?  // Motivo opzionale del conflitto
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([employeeId1, employeeId2])
  @@index([employeeId1])
  @@index([employeeId2])
}

model EmployeePreference {
  id          String   @id @default(cuid())
  employeeId1 String   // Primo dipendente
  employee1   Employee @relation("EmployeePreferences1", fields: [employeeId1], references: [id], onDelete: Cascade)
  employeeId2 String   // Secondo dipendente
  employee2   Employee @relation("EmployeePreferences2", fields: [employeeId2], references: [id], onDelete: Cascade)
  weight      Float    @default(1.0) // Peso della preferenza (1.0 = normale, >1.0 = forte preferenza)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([employeeId1, employeeId2])
  @@index([employeeId1])
  @@index([employeeId2])
}
```

**Modifiche al Model Employee:**

```prisma
model Employee {
  // ... campi esistenti ...

  conflicts1    EmployeeConflict[] @relation("EmployeeConflicts1")
  conflicts2    EmployeeConflict[] @relation("EmployeeConflicts2")
  preferences1  EmployeePreference[] @relation("EmployeePreferences1")
  preferences2  EmployeePreference[] @relation("EmployeePreferences2")
}
```

**Nuova Tabella per Parametri Globali (opzionale):**

```prisma
model SchedulingParameter {
  id          String   @id @default(cuid())
  key         String   @unique // Es: "max_different_coworkers_per_week"
  value       Json     // Valore del parametro (può essere number, boolean, string, etc.)
  description String?  // Descrizione del parametro
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Data Model Updates

**Nuovi Tipi TypeScript (`types/index.ts`):**

```typescript
export interface EmployeeConflict {
  id: string;
  employeeId1: string;
  employeeId2: string;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeePreference {
  id: string;
  employeeId1: string;
  employeeId2: string;
  weight: number; // Default 1.0, >1.0 = preferenza forte
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SchedulingParameter {
  id: string;
  key: string;
  value: any; // Json value
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Estendere SchedulingOptions
export interface SchedulingOptions {
  // ... opzioni esistenti ...
  avoidConflicts?: boolean; // Evita conflitti tra dipendenti (default: true)
  considerPreferences?: boolean; // Considera preferenze nello scoring (default: true)
  maxDifferentCoworkersPerWeek?: number; // Max dipendenti diversi per settimana (opzionale)
  preferStableTeams?: boolean; // Preferisce mantenere team stabili (default: false)
}
```

### Data Migration Plan

1. **Backup:** Eseguire backup database prima di modifiche schema
2. **Creare Migrazione Prisma:**
   ```bash
   npm run db:migrate -- --name add_employee_conflicts_preferences
   ```
3. **Validazione:** Verificare che dati esistenti siano preservati
4. **Default Values:** Tutti i conflitti/preferenze iniziano vuoti (retrocompatibilità)

---

## 18. API & Backend Changes

### New API Routes

**Conflitti Dipendenti (`app/api/employees/[id]/conflicts/route.ts`):**

- `GET /api/employees/[id]/conflicts` - Lista tutti i conflitti per un dipendente
- `POST /api/employees/[id]/conflicts` - Aggiungi conflitto (body: `{ employeeId2: string, reason?: string }`)
- `DELETE /api/employees/[id]/conflicts/[conflictId]` - Rimuovi conflitto

**Preferenze Dipendenti (`app/api/employees/[id]/preferences/route.ts`):**

- `GET /api/employees/[id]/preferences` - Lista tutte le preferenze per un dipendente
- `POST /api/employees/[id]/preferences` - Aggiungi preferenza (body: `{ employeeId2: string, weight?: number }`)
- `DELETE /api/employees/[id]/preferences/[preferenceId]` - Rimuovi preferenza

**Parametri Scheduling (`app/api/scheduling-parameters/route.ts`):**

- `GET /api/scheduling-parameters` - Lista tutti i parametri
- `POST /api/scheduling-parameters` - Crea/aggiorna parametro (body: `{ key: string, value: any, description?: string }`)
- `DELETE /api/scheduling-parameters/[key]` - Rimuovi parametro

### Modifiche a SchedulerService

**Modifiche a `lib/scheduler.ts`:**

1. Aggiungere metodo per caricare conflitti/preferenze:

   ```typescript
   private static loadEmployeeConflicts(employeeIds: string[]): Map<string, Set<string>>
   private static loadEmployeePreferences(employeeIds: string[]): Map<string, Map<string, number>>
   ```

2. Modificare `isEmployeeAvailable` per verificare conflitti:

   ```typescript
   private static hasConflict(
     employeeId1: string,
     employeeId2: string,
     conflicts: Map<string, Set<string>>,
     existingAssignments: ShiftAssignment[],
     restaurantId: string,
     day: DayOfWeek,
     shift: Shift
   ): boolean
   ```

3. Modificare `calculateEmployeeScore` per considerare preferenze:

   ```typescript
   // Bonus per preferenze
   if (options.considerPreferences) {
     const preferences = this.getPreferencesForEmployee(
       emp.id,
       restaurantId,
       day,
       shift,
       existingAssignments,
       preferencesMap
     );
     score += preferences * 10; // Bonus per preferenze
   }
   ```

4. Modificare `isCombinationValid` per verificare conflitti nelle combinazioni

---

## 19. Frontend Changes

### New Components

**Componente Gestione Conflitti (`components/EmployeeConflicts.tsx`):**

- Lista conflitti per un dipendente
- Form per aggiungere nuovo conflitto (dropdown selezione altro dipendente)
- Pulsante per rimuovere conflitto
- Visualizzazione motivo conflitto (se presente)

**Componente Gestione Preferenze (`components/EmployeePreferences.tsx`):**

- Lista preferenze per un dipendente
- Form per aggiungere nuova preferenza
- Slider per peso preferenza (1.0 - 2.0)
- Pulsante per rimuovere preferenza

**Componente Parametri Scheduling (`components/SchedulingParameters.tsx`):**

- Tabella con tutti i parametri configurabili
- Form per modificare parametri
- Tooltip con descrizioni parametri

### Page Updates

**Modifiche a `app/employees/[id]/page.tsx` (se esiste) o `app/employees/page.tsx`:**

- Aggiungere tab/sezione "Conflitti" nella pagina dettaglio dipendente
- Aggiungere tab/sezione "Preferenze" nella pagina dettaglio dipendente
- Integrare componenti `EmployeeConflicts` e `EmployeePreferences`

**Nuova Pagina `app/scheduling-parameters/page.tsx`:**

- Pagina per gestire parametri globali di scheduling
- Tabella parametri con possibilità di modifica
- Form per aggiungere nuovi parametri personalizzati

### State Management

- Aggiungere state per conflitti/preferenze nella pagina dipendenti
- Caricare conflitti/preferenze quando si carica un dipendente
- Aggiornare UI dopo aggiunta/rimozione conflitto/preferenza

---

## 20. Implementation Plan

**Fase 1: Database e Backend Base**

- [ ] Task 1: Creare migrazione Prisma per tabelle EmployeeConflict e EmployeePreference
  - File: `prisma/schema.prisma`
  - Modifiche: Aggiungere modelli e relazioni
- [ ] Task 2: Eseguire migrazione database
  - Comando: `npm run db:migrate`
- [ ] Task 3: Aggiornare types TypeScript
  - File: `types/index.ts`
  - Modifiche: Aggiungere interfacce EmployeeConflict, EmployeePreference, SchedulingParameter
- [ ] Task 4: Creare API routes per conflitti
  - File: `app/api/employees/[id]/conflicts/route.ts`
  - Modifiche: Implementare GET, POST, DELETE
- [ ] Task 5: Creare API routes per preferenze
  - File: `app/api/employees/[id]/preferences/route.ts`
  - Modifiche: Implementare GET, POST, DELETE

**Fase 2: Integrazione Algoritmo**

- [ ] Task 6: Aggiungere metodi per caricare conflitti/preferenze in SchedulerService
  - File: `lib/scheduler.ts`
  - Modifiche: Metodi `loadEmployeeConflicts`, `loadEmployeePreferences`
- [ ] Task 7: Modificare `isEmployeeAvailable` per verificare conflitti
  - File: `lib/scheduler.ts`
  - Modifiche: Aggiungere verifica conflitti prima di assegnare
- [ ] Task 8: Modificare `calculateEmployeeScore` per considerare preferenze
  - File: `lib/scheduler.ts`
  - Modifiche: Aggiungere bonus per preferenze nello scoring
- [ ] Task 9: Modificare `isCombinationValid` per verificare conflitti nelle combinazioni
  - File: `lib/scheduler.ts`
  - Modifiche: Verificare che combinazione non contenga conflitti
- [ ] Task 10: Aggiornare `generateSchedule` per caricare conflitti/preferenze
  - File: `lib/scheduler.ts`
  - Modifiche: Caricare dati all'inizio e passarli ai metodi

**Fase 3: Frontend**

- [ ] Task 11: Creare componente EmployeeConflicts
  - File: `components/EmployeeConflicts.tsx`
  - Modifiche: Componente completo con lista e form
- [ ] Task 12: Creare componente EmployeePreferences
  - File: `components/EmployeePreferences.tsx`
  - Modifiche: Componente completo con lista e form
- [ ] Task 13: Integrare componenti nella pagina dipendenti
  - File: `app/employees/page.tsx` o nuova pagina dettaglio
  - Modifiche: Aggiungere sezioni conflitti/preferenze
- [ ] Task 14: Creare pagina parametri scheduling
  - File: `app/scheduling-parameters/page.tsx`
  - Modifiche: Pagina completa gestione parametri

**Fase 4: Testing e Refinement**

- [ ] Task 15: Test algoritmo con conflitti configurati
- [ ] Task 16: Test algoritmo con preferenze configurate
- [ ] Task 17: Test casi edge (molti conflitti, nessuna soluzione possibile)
- [ ] Task 18: Verificare performance con molti conflitti/preferenze
- [ ] Task 19: Aggiornare documentazione

---

## 21. Task Completion Tracking

### Real-Time Progress Tracking

**Tracking Progress:**

- ✅ Task Overview e Goal Statement definiti
- ✅ Problem Statement e Success Criteria definiti
- ✅ Technical Requirements documentati
- ✅ Database Schema Changes pianificati
- ✅ API Routes pianificate
- ✅ Frontend Components pianificati
- ✅ Implementation Plan creato
- ⏸️ Implementazione in attesa di avvio

---

## 22. Second-Order Impact Analysis

### Impact Assessment

**Aree di Preoccupazione:**

1. **Performance:**

   - Verifica conflitti deve essere efficiente (usare Map per O(1) lookup)
   - Con molti conflitti, algoritmo potrebbe essere più lento
   - Testare con scenari reali (10-20 conflitti per 50 dipendenti)

2. **Complessità Algoritmo:**

   - Aggiunta di vincoli potrebbe rendere alcuni casi impossibili
   - Algoritmo deve gestire gracefully quando non trova soluzione
   - Backtracking esistente dovrebbe aiutare

3. **User Experience:**

   - Interfaccia deve essere intuitiva per gestire conflitti
   - Feedback chiaro quando conflitti impediscono assegnazioni
   - Possibilità di vedere perché un turno non può essere generato

4. **Data Integrity:**
   - Conflitti devono essere bidirezionali automaticamente
   - Validazione per evitare conflitti con se stesso
   - Gestione quando un dipendente viene eliminato

**Checklist Pre-Deploy:**

- [ ] Testare con database vuoto (nessun conflitto)
- [ ] Testare con alcuni conflitti configurati
- [ ] Testare con molti conflitti (caso complesso)
- [ ] Verificare che algoritmo completi in < 2 secondi
- [ ] Verificare che conflitti siano rispettati
- [ ] Verificare che preferenze migliorino lo scoring
- [ ] Testare rimozione dipendente con conflitti/preferenze
- [ ] Verificare retrocompatibilità (sistema funziona senza conflitti)

---

_This template is part of ShipKit - AI-powered development workflows and templates_  
_Get the complete toolkit at: https://shipkit.ai_
