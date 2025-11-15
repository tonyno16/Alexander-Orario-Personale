# Come Fare i Test - Guida Rapida

## Metodo 1: Test Automatici delle API (Raccomandato per iniziare)

Questo metodo testa rapidamente che le API funzionino correttamente.

### Passi:

1. **Avvia il server di sviluppo** (se non è già avviato):
   ```bash
   npm run dev
   ```

2. **In un altro terminale, esegui lo script di test**:
   ```bash
   npm run test:api
   ```
   
   Oppure direttamente:
   ```bash
   node test-api.js
   ```

3. **Verifica l'output**: Dovresti vedere una serie di test che vengono eseguiti e verificati. Se tutto è verde (✓), le API funzionano correttamente.

### Cosa testa questo script:
- ✅ Caricamento dipendenti
- ✅ Aggiunta conflitti
- ✅ Lista conflitti
- ✅ Rimozione conflitti
- ✅ Aggiunta preferenze
- ✅ Lista preferenze
- ✅ Rimozione preferenze
- ✅ Validazioni (conflitto con se stesso, peso invalido)

---

## Metodo 2: Test Manuale dell'Interfaccia

Questo metodo ti permette di testare l'interfaccia utente completa.

### Passi:

1. **Avvia il server** (se non è già avviato):
   ```bash
   npm run dev
   ```

2. **Apri il browser** e vai a:
   ```
   http://localhost:3000
   ```

3. **Assicurati di avere dati di test**:
   - Almeno 3-4 dipendenti creati
   - Almeno 1 ristorante creato
   - Alcuni requisiti di turni configurati

4. **Segui la guida dettagliata**:
   - Apri il file `TEST_GUIDE_CONFLITTI_PREFERENZE.md`
   - Segui i test passo-passo

### Test Rapido dell'Interfaccia (5 minuti):

1. **Vai alla pagina Dipendenti**:
   ```
   http://localhost:3000/employees
   ```

2. **Clicca "⚠️ Conflitti"** su un dipendente:
   - Verifica che si apra un modal
   - Prova ad aggiungere un conflitto con un altro dipendente
   - Verifica che appaia nella lista
   - Rimuovilo

3. **Clicca "✓ Preferenze"** sullo stesso dipendente:
   - Verifica che si apra un modal
   - Prova ad aggiungere una preferenza con un altro dipendente
   - Regola lo slider del peso
   - Verifica che appaia nella lista
   - Rimuovila

4. **Testa l'algoritmo**:
   - Vai a `http://localhost:3000/schedule`
   - Configura alcuni conflitti/preferenze
   - Genera un programma
   - Verifica che i conflitti siano rispettati

---

## Metodo 3: Test Completo (Consigliato prima del deploy)

Segui tutti i test nel file `TEST_GUIDE_CONFLITTI_PREFERENZE.md` per una verifica completa.

### Checklist Rapida:

- [ ] Test API completati con successo (`npm run test:api`)
- [ ] Interfaccia funziona (modals si aprono/chiudono)
- [ ] Posso aggiungere/rimuovere conflitti
- [ ] Posso aggiungere/rimuovere preferenze
- [ ] L'algoritmo rispetta i conflitti
- [ ] L'algoritmo considera le preferenze
- [ ] Nessun errore nella console del browser (F12)
- [ ] Nessun errore nei log del server

---

## Risoluzione Problemi

### Il test API fallisce

**Errore: "Failed to fetch"**
- Verifica che il server sia avviato (`npm run dev`)
- Verifica che il server sia su `http://localhost:3000`

**Errore: "Servono almeno 2 dipendenti"**
- Vai a `http://localhost:3000` e crea almeno 2 dipendenti usando il pulsante "Inizializza Database" o creandoli manualmente

**Errore: "Errore nel caricamento dipendenti"**
- Verifica che il database sia configurato correttamente
- Controlla i log del server per errori di connessione al database

### L'interfaccia non funziona

**I pulsanti non appaiono**
- Verifica che la pagina sia ricaricata completamente (Ctrl+F5)
- Controlla la console del browser (F12) per errori JavaScript

**I modals non si aprono**
- Controlla la console del browser per errori
- Verifica che i componenti siano stati creati correttamente

**Errori nella console**
- Apri la console del browser (F12 → Console)
- Cerca errori in rosso
- Controlla anche i log del server nel terminale

---

## Prossimi Passi Dopo i Test

Una volta completati i test con successo:

1. ✅ La funzionalità è pronta per l'uso
2. ✅ Puoi iniziare a configurare conflitti/preferenze reali
3. ✅ L'algoritmo di scheduling utilizzerà automaticamente questi vincoli

---

## Supporto

Se incontri problemi durante i test:
1. Controlla `TEST_GUIDE_CONFLITTI_PREFERENZE.md` per dettagli
2. Verifica i log del server e del browser
3. Assicurati che tutte le dipendenze siano installate (`npm install`)

