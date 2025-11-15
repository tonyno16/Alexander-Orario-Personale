# Alexander - Gestione Turni

Sistema MVP per la gestione dei turni del personale per ristoranti multipli.

## Caratteristiche

- **4 Ristoranti**: Gestione di 4 ristoranti diversi
- **50+ Dipendenti**: Gestione dipendenti con ruoli diversi (cuoco, aiuto cuoco, pizzaiolo, lavapiatti, camerieri, aiuto camerieri)
- **Turni**: Due turni per ogni locale (pranzo e cena)
- **Requisiti Configurabili**: Imposta i requisiti di personale per ogni giorno della settimana, ristorante e turno
- **Disponibilità Dipendenti**: Ogni dipendente ha una disponibilità settimanale (giorni disponibili)
- **Assegnazione Automatica**: Algoritmo automatico per assegnare i turni in base ai requisiti e alle disponibilità

## Tecnologie

- **Next.js 14** con App Router
- **TypeScript**
- **Tailwind CSS** per lo styling
- **PostgreSQL** con **Prisma ORM** per il database persistente
- **API Routes** Next.js per il backend

## Requisiti

- **Node.js** 18.x o superiore (consigliato Node.js 20)
- **npm** 9.x o superiore
- **PostgreSQL** 12.x o superiore (locale o cloud)

## Installazione

1. **(Opzionale)** Se usi `nvm` (Node Version Manager), puoi usare la versione specificata:

```bash
nvm use
```

2. Installa le dipendenze:

```bash
npm install
```

3. **Configura il database:**

   Crea un file `.env.local` (per Next.js) e `.env` (per Prisma CLI) nella root del progetto con la tua connessione PostgreSQL:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/alexander_turni"
   ```

   **Opzioni per il database:**

   - **PostgreSQL locale:** Installa PostgreSQL e crea un database
   - **Docker (consigliato per sviluppo):**
     ```bash
     docker run --name postgres-alexander -e POSTGRES_PASSWORD=password -e POSTGRES_DB=alexander_turni -p 5432:5432 -d postgres
     ```
     Per riavviare il container: `docker start postgres-alexander`
   - **Supabase:** Crea un progetto gratuito su [supabase.com](https://supabase.com) e usa la connection string
   - **Railway:** Deploy gratuito su [railway.app](https://railway.app)

4. **Inizializza il database:**

   ```bash
   # Genera il Prisma Client
   npm run db:generate

   # Applica lo schema al database (sviluppo rapido, senza migrazioni)
   npm run db:push
   ```

   Oppure usa `db:migrate` per creare migrazioni formali:

   ```bash
   npm run db:migrate
   ```

   **Nota:** Se il database è già configurato e le tabelle esistono, puoi saltare questo passaggio.

5. Avvia il server di sviluppo:

```bash
npm run dev
```

6. Apri [http://localhost:3000](http://localhost:3000) nel browser

**Nota:** Alla prima apertura, il sistema inizializzerà automaticamente alcuni dati di esempio (4 ristoranti e 6 dipendenti).

## Come Usare

### 1. Gestione Dipendenti

Vai alla pagina **"Gestisci Dipendenti"** per:

- Aggiungere nuovi dipendenti
- Impostare il ruolo di ogni dipendente
- Configurare la disponibilità settimanale (quanti giorni può lavorare)
- Specificare in quali ristoranti può lavorare (lasciare vuoto per tutti)

### 2. Configurazione Requisiti

Vai alla pagina **"Configura Requisiti"** per:

- Impostare per ogni ristorante, giorno della settimana e turno quanti dipendenti servono per ogni ruolo
- Esempio: Ristorante A, Lunedì, Pranzo → 2 aiuto cuoco, 1 cuoco, 2 pizzaioli

### 3. Generazione Turni

Dalla pagina principale, clicca su **"Genera Turni"** per:

- Generare automaticamente gli assegnamenti dei turni per la settimana corrente
- Il sistema cercherà di soddisfare tutti i requisiti rispettando le disponibilità dei dipendenti

### 4. Visualizzazione Turni

Vai alla pagina **"Visualizza Turni"** per:

- Vedere il calendario completo dei turni per tutti i ristoranti
- Visualizzare chi è assegnato a ogni turno organizzato per ruolo
- **Esportare i turni in PDF** cliccando sul pulsante "Esporta PDF" (ogni ristorante su una pagina separata)

## Struttura Dati

### Dipendente

```typescript
{
  id: string;
  name: string;
  role: 'cuoco' | 'aiuto_cuoco' | 'pizzaiolo' | 'lavapiatti' | 'cameriere' | 'aiuto_cameriere';
  availability: number; // Giorni disponibili a settimana
  restaurants: string[]; // ID ristoranti (vuoto = tutti)
}
```

### Requisito Turno

```typescript
{
  restaurantId: string;
  day: 'lunedi' | 'martedi' | ...;
  shift: 'pranzo' | 'cena';
  requirements: [
    { role: 'cuoco', count: 1 },
    { role: 'aiuto_cuoco', count: 2 },
    ...
  ];
}
```

## Algoritmo di Assegnazione

L'algoritmo di assegnazione:

1. Itera su tutti i giorni della settimana, turni e ristoranti
2. Per ogni requisito, trova i dipendenti disponibili che:
   - Hanno il ruolo corretto
   - Possono lavorare nel ristorante specificato
   - Non hanno ancora raggiunto la loro disponibilità settimanale
   - Non sono già assegnati allo stesso turno
3. Assegna i dipendenti necessari, dando priorità a quelli con meno disponibilità rimanente

## Note MVP

- ✅ Database persistente PostgreSQL implementato con Prisma ORM
- ✅ I dati sono salvati nel database PostgreSQL (non più localStorage)
- ✅ API Routes Next.js per tutte le operazioni CRUD
- ✅ Migrazione completa da localStorage a database persistente
- ✅ Esportazione PDF dei turni settimanali
- ⚠️ Non c'è autenticazione utente (da implementare)
- ⚠️ L'algoritmo è base e può essere migliorato per gestire casi più complessi

## Comandi Utili

```bash
# Genera Prisma Client dopo modifiche allo schema
npm run db:generate

# Crea una nuova migrazione
npm run db:migrate

# Applica modifiche schema senza migrazione (solo sviluppo)
npm run db:push

# Apri Prisma Studio (GUI per database)
npm run db:studio
```

## Prossimi Passi (Future Miglioramenti)

- [x] Database persistente (PostgreSQL, MongoDB, ecc.) ✅
- [ ] Autenticazione utente
- [ ] Notifiche ai dipendenti
- [x] Esportazione PDF dei turni ✅
- [ ] Algoritmo più avanzato con vincoli aggiuntivi
- [ ] Gestione ferie e permessi
- [ ] Statistiche e report
