/**
 * Script per verificare errori nel database
 * Esegui con: node check-database.js
 */

const { PrismaClient } = require('@prisma/client');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkDatabase() {
  log('\n=== VERIFICA ERRORI DATABASE ===\n', 'blue');

  // 1. Verifica variabili d'ambiente
  log('1. Verifica configurazione...', 'yellow');
  const dbUrl = process.env.POSTGRES_PRISMA_URL 
    || process.env.POSTGRES_URL_NON_POOLING 
    || process.env.POSTGRES_URL 
    || process.env.DATABASE_URL;

  if (!dbUrl) {
    log('   ❌ DATABASE_URL non trovata nelle variabili d\'ambiente', 'red');
    log('   Verifica che .env.local contenga DATABASE_URL', 'yellow');
    return;
  }

  // Nascondi password nell'output
  const safeUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  log(`   ✓ DATABASE_URL trovata: ${safeUrl}`, 'green');

  // 2. Verifica Prisma Client
  log('\n2. Verifica Prisma Client...', 'yellow');
  let prisma;
  try {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    log('   ✓ Prisma Client creato con successo', 'green');
  } catch (error) {
    log(`   ❌ Errore nella creazione Prisma Client: ${error.message}`, 'red');
    log('   Prova a eseguire: npm run db:generate', 'yellow');
    return;
  }

  // 3. Test connessione
  log('\n3. Test connessione database...', 'yellow');
  try {
    await prisma.$connect();
    log('   ✓ Connessione al database riuscita', 'green');
  } catch (error) {
    log(`   ❌ Errore di connessione: ${error.message}`, 'red');
    log(`   Codice errore: ${error.code || 'N/A'}`, 'red');
    
    if (error.code === 'P1001') {
      log('   → Il server database non è raggiungibile', 'yellow');
      log('   → Verifica che il database sia attivo e la connessione corretta', 'yellow');
    } else if (error.code === 'P1000') {
      log('   → Autenticazione fallita', 'yellow');
      log('   → Verifica username e password nella DATABASE_URL', 'yellow');
    } else if (error.code === 'P1003') {
      log('   → Database non trovato', 'yellow');
      log('   → Verifica il nome del database nella DATABASE_URL', 'yellow');
    }
    
    await prisma.$disconnect();
    return;
  }

  // 4. Verifica schema/tabelle
  log('\n4. Verifica schema database...', 'yellow');
  try {
    // Test query su ogni tabella principale
    const tables = [
      { name: 'Employee', query: () => prisma.employee.count() },
      { name: 'Restaurant', query: () => prisma.restaurant.count() },
      { name: 'ShiftRequirement', query: () => prisma.shiftRequirement.count() },
      { name: 'ShiftAssignment', query: () => prisma.shiftAssignment.count() },
      { name: 'EmployeeConflict', query: () => prisma.employeeConflict.count() },
      { name: 'EmployeePreference', query: () => prisma.employeePreference.count() },
      { name: 'SchedulingParameter', query: () => prisma.schedulingParameter.count() },
    ];

    for (const table of tables) {
      try {
        const count = await table.query();
        log(`   ✓ Tabella ${table.name}: ${count} record`, 'green');
      } catch (error) {
        log(`   ❌ Errore su tabella ${table.name}: ${error.message}`, 'red');
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
          log(`   → La tabella non esiste. Esegui: npm run db:push`, 'yellow');
        }
      }
    }
  } catch (error) {
    log(`   ❌ Errore nella verifica schema: ${error.message}`, 'red');
  }

  // 5. Test query complesse
  log('\n5. Test query complesse...', 'yellow');
  try {
    // Test relazione Employee-Conflicts
    const employeesWithConflicts = await prisma.employee.findMany({
      include: {
        conflicts1: true,
        conflicts2: true,
      },
      take: 1,
    });
    log('   ✓ Query relazioni Employee-Conflicts funziona', 'green');

    // Test relazione Employee-Preferences
    const employeesWithPreferences = await prisma.employee.findMany({
      include: {
        preferences1: true,
        preferences2: true,
      },
      take: 1,
    });
    log('   ✓ Query relazioni Employee-Preferences funziona', 'green');

    // Test relazione Restaurant-Requirements
    const restaurantsWithRequirements = await prisma.restaurant.findMany({
      include: {
        requirements: true,
      },
      take: 1,
    });
    log('   ✓ Query relazioni Restaurant-Requirements funziona', 'green');

  } catch (error) {
    log(`   ❌ Errore nelle query complesse: ${error.message}`, 'red');
    log(`   Codice: ${error.code || 'N/A'}`, 'red');
  }

  // 6. Verifica integrità dati
  log('\n6. Verifica integrità dati...', 'yellow');
  try {
    // Verifica conflitti orfani
    const conflicts = await prisma.employeeConflict.findMany({
      include: {
        employee1: true,
        employee2: true,
      },
    });
    
    const orphanConflicts = conflicts.filter(c => !c.employee1 || !c.employee2);
    if (orphanConflicts.length > 0) {
      log(`   ⚠️ Trovati ${orphanConflicts.length} conflitti orfani (dipendenti eliminati)`, 'yellow');
    } else {
      log('   ✓ Nessun conflitto orfano trovato', 'green');
    }

    // Verifica preferenze orfane
    const preferences = await prisma.employeePreference.findMany({
      include: {
        employee1: true,
        employee2: true,
      },
    });
    
    const orphanPreferences = preferences.filter(p => !p.employee1 || !p.employee2);
    if (orphanPreferences.length > 0) {
      log(`   ⚠️ Trovate ${orphanPreferences.length} preferenze orfane (dipendenti eliminati)`, 'yellow');
    } else {
      log('   ✓ Nessuna preferenza orfana trovata', 'green');
    }

  } catch (error) {
    log(`   ⚠️ Errore nella verifica integrità: ${error.message}`, 'yellow');
  }

  // 7. Test transazioni
  log('\n7. Test transazioni...', 'yellow');
  try {
    await prisma.$transaction(async (tx) => {
      await tx.employee.count();
    });
    log('   ✓ Transazioni funzionano correttamente', 'green');
  } catch (error) {
    log(`   ❌ Errore nelle transazioni: ${error.message}`, 'red');
  }

  // Chiudi connessione
  await prisma.$disconnect();
  log('\n=== VERIFICA COMPLETATA ===\n', 'blue');
}

// Esegui il check
checkDatabase().catch((error) => {
  log(`\n❌ ERRORE FATALE: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

