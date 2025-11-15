/**
 * Script di test rapido per le API di Conflitti e Preferenze
 * Esegui con: node test-api.js
 * 
 * Assicurati che il server sia avviato (npm run dev)
 */

const API_BASE = 'http://localhost:3000/api';

// Colori per output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI() {
  log('\n=== TEST API CONFLITTI E PREFERENZE ===\n', 'blue');

  try {
    // 1. Ottieni dipendenti
    log('1. Caricamento dipendenti...', 'yellow');
    const employeesRes = await fetch(`${API_BASE}/employees`);
    if (!employeesRes.ok) {
      throw new Error(`Errore nel caricamento dipendenti: ${employeesRes.status}`);
    }
    const employees = await employeesRes.json();
    log(`   ✓ Trovati ${employees.length} dipendenti`, 'green');

    if (employees.length < 2) {
      log('   ⚠️ Servono almeno 2 dipendenti per i test', 'yellow');
      return;
    }

    const emp1 = employees[0];
    const emp2 = employees[1];
    const emp3 = employees[2] || employees[0]; // Usa emp1 se non c'è emp3

    // 2. Test Conflitti
    log('\n2. Test Conflitti...', 'yellow');
    
    // 2.1 Aggiungi conflitto
    log('   2.1 Aggiunta conflitto...', 'yellow');
    const addConflictRes = await fetch(`${API_BASE}/employees/${emp1.id}/conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId2: emp2.id,
        reason: 'Test automatico',
      }),
    });
    
    if (!addConflictRes.ok) {
      const error = await addConflictRes.json();
      if (error.error.includes('già esistente')) {
        log('   ✓ Conflitto già esistente (OK)', 'green');
      } else {
        throw new Error(`Errore aggiunta conflitto: ${error.error}`);
      }
    } else {
      log('   ✓ Conflitto aggiunto con successo', 'green');
    }

    // 2.2 Lista conflitti
    log('   2.2 Lista conflitti...', 'yellow');
    const conflictsRes = await fetch(`${API_BASE}/employees/${emp1.id}/conflicts`);
    if (!conflictsRes.ok) {
      throw new Error(`Errore nel caricamento conflitti: ${conflictsRes.status}`);
    }
    const conflicts = await conflictsRes.json();
    log(`   ✓ Trovati ${conflicts.length} conflitti`, 'green');
    
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      log(`   ✓ Conflitto trovato: ${conflict.employeeId1} ↔ ${conflict.employeeId2}`, 'green');
      
      // 2.3 Rimuovi conflitto
      log('   2.3 Rimozione conflitto...', 'yellow');
      const deleteConflictRes = await fetch(
        `${API_BASE}/employees/${emp1.id}/conflicts/${conflict.id}`,
        { method: 'DELETE' }
      );
      
      if (!deleteConflictRes.ok) {
        throw new Error(`Errore nella rimozione conflitto: ${deleteConflictRes.status}`);
      }
      log('   ✓ Conflitto rimosso con successo', 'green');
    }

    // 3. Test Preferenze
    log('\n3. Test Preferenze...', 'yellow');
    
    // 3.1 Aggiungi preferenza
    log('   3.1 Aggiunta preferenza...', 'yellow');
    const addPreferenceRes = await fetch(`${API_BASE}/employees/${emp1.id}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId2: emp3.id,
        weight: 1.5,
      }),
    });
    
    if (!addPreferenceRes.ok) {
      const error = await addPreferenceRes.json();
      if (error.error.includes('già esistente')) {
        log('   ✓ Preferenza già esistente (OK)', 'green');
      } else {
        throw new Error(`Errore aggiunta preferenza: ${error.error}`);
      }
    } else {
      log('   ✓ Preferenza aggiunta con successo', 'green');
    }

    // 3.2 Lista preferenze
    log('   3.2 Lista preferenze...', 'yellow');
    const preferencesRes = await fetch(`${API_BASE}/employees/${emp1.id}/preferences`);
    if (!preferencesRes.ok) {
      throw new Error(`Errore nel caricamento preferenze: ${preferencesRes.status}`);
    }
    const preferences = await preferencesRes.json();
    log(`   ✓ Trovate ${preferences.length} preferenze`, 'green');
    
    if (preferences.length > 0) {
      const preference = preferences[0];
      log(`   ✓ Preferenza trovata: ${preference.employeeId1} ↔ ${preference.employeeId2} (peso: ${preference.weight})`, 'green');
      
      // 3.3 Rimuovi preferenza
      log('   3.3 Rimozione preferenza...', 'yellow');
      const deletePreferenceRes = await fetch(
        `${API_BASE}/employees/${emp1.id}/preferences/${preference.id}`,
        { method: 'DELETE' }
      );
      
      if (!deletePreferenceRes.ok) {
        throw new Error(`Errore nella rimozione preferenza: ${deletePreferenceRes.status}`);
      }
      log('   ✓ Preferenza rimossa con successo', 'green');
    }

    // 4. Test Validazioni
    log('\n4. Test Validazioni...', 'yellow');
    
    // 4.1 Conflitto con se stesso
    log('   4.1 Test: conflitto con se stesso...', 'yellow');
    const selfConflictRes = await fetch(`${API_BASE}/employees/${emp1.id}/conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId2: emp1.id,
      }),
    });
    
    if (selfConflictRes.status === 400) {
      log('   ✓ Validazione conflitto con se stesso funziona', 'green');
    } else {
      log('   ⚠️ Validazione conflitto con se stesso non funziona', 'red');
    }

    // 4.2 Preferenza con peso invalido
    log('   4.2 Test: preferenza con peso invalido...', 'yellow');
    const invalidWeightRes = await fetch(`${API_BASE}/employees/${emp1.id}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId2: emp2.id,
        weight: 3.0, // Troppo alto
      }),
    });
    
    if (invalidWeightRes.status === 400) {
      log('   ✓ Validazione peso preferenza funziona', 'green');
    } else {
      log('   ⚠️ Validazione peso preferenza non funziona', 'red');
    }

    log('\n=== TUTTI I TEST COMPLETATI ===\n', 'green');
    log('Ora puoi testare manualmente l\'interfaccia aprendo:', 'blue');
    log('http://localhost:3000/employees', 'blue');

  } catch (error) {
    log(`\n❌ ERRORE: ${error.message}`, 'red');
    log('\nAssicurati che:', 'yellow');
    log('1. Il server sia avviato (npm run dev)', 'yellow');
    log('2. Ci siano almeno 2 dipendenti nel database', 'yellow');
    log('3. Il database sia configurato correttamente', 'yellow');
    process.exit(1);
  }
}

// Esegui i test
testAPI();

