# Guida ai Test - Gestione Conflitti e Preferenze

Questa guida ti aiuta a testare la nuova funzionalità di gestione conflitti e preferenze tra dipendenti.

## Prerequisiti

1. Assicurati che il server di sviluppo sia avviato:
   ```bash
   npm run dev
   ```

2. Assicurati di avere almeno 3-4 dipendenti creati nel sistema
3. Assicurati di avere almeno 1 ristorante creato
4. Assicurati di avere alcuni requisiti di turni configurati

## Test 1: Verifica Interfaccia Utente

### 1.1 Accesso alla Pagina Dipendenti
1. Apri il browser e vai a `http://localhost:3000/employees`
2. Verifica che nella tabella dei dipendenti ci siano due nuovi pulsanti per ogni dipendente:
   - ⚠️ **Conflitti** (rosso)
   - ✓ **Preferenze** (verde)

### 1.2 Test Modal Conflitti
1. Clicca sul pulsante "⚠️ Conflitti" di un dipendente
2. Verifica che si apra un modal con:
   - Titolo: "Conflitti per [Nome Dipendente]"
   - Form per aggiungere conflitti
   - Lista conflitti esistenti (vuota inizialmente)
3. Verifica che nel dropdown non appaia il dipendente stesso
4. Chiudi il modal cliccando sulla X

### 1.3 Test Modal Preferenze
1. Clicca sul pulsante "✓ Preferenze" di un dipendente
2. Verifica che si apra un modal con:
   - Titolo: "Preferenze per [Nome Dipendente]"
   - Form per aggiungere preferenze con slider per il peso
   - Lista preferenze esistenti (vuota inizialmente)
3. Verifica che nel dropdown non appaia il dipendente stesso
4. Chiudi il modal cliccando sulla X

## Test 2: Gestione Conflitti

### 2.1 Aggiungere un Conflitto
1. Apri il modal "Conflitti" per il Dipendente A
2. Seleziona il Dipendente B dal dropdown
3. (Opzionale) Inserisci un motivo: "Incompatibilità caratteriale"
4. Clicca "Aggiungi Conflitto"
5. Verifica che:
   - Il conflitto appaia nella lista con sfondo rosso
   - Il nome del dipendente B sia visibile
   - Il motivo (se inserito) sia visibile tra parentesi
   - Il dipendente B non appaia più nel dropdown

### 2.2 Verifica Bidirezionalità
1. Apri il modal "Conflitti" per il Dipendente B
2. Verifica che il Dipendente A appaia nella lista dei conflitti
3. Questo conferma che il conflitto è bidirezionale

### 2.3 Rimuovere un Conflitto
1. Nel modal del Dipendente A, clicca "Rimuovi" sul conflitto con Dipendente B
2. Conferma l'eliminazione
3. Verifica che:
   - Il conflitto scompaia dalla lista
   - Il Dipendente B riappaia nel dropdown

### 2.4 Validazione - Conflitto con Se Stesso
1. Prova ad aggiungere un conflitto selezionando lo stesso dipendente
2. Verifica che appaia un messaggio di errore: "Non puoi creare un conflitto con te stesso"

### 2.5 Validazione - Conflitto Duplicato
1. Aggiungi un conflitto tra Dipendente A e Dipendente B
2. Prova ad aggiungere lo stesso conflitto di nuovo
3. Verifica che appaia un messaggio di errore appropriato

## Test 3: Gestione Preferenze

### 3.1 Aggiungere una Preferenza
1. Apri il modal "Preferenze" per il Dipendente A
2. Seleziona il Dipendente C dal dropdown
3. Regola lo slider del peso (es. 1.5)
4. Verifica che l'etichetta mostri: "Peso Preferenza: 1.5 (Leggera)"
5. Clicca "Aggiungi Preferenza"
6. Verifica che:
   - La preferenza appaia nella lista con sfondo verde
   - Il nome del dipendente C sia visibile
   - Il peso e l'etichetta siano visibili
   - Il dipendente C non appaia più nel dropdown

### 3.2 Verifica Bidirezionalità
1. Apri il modal "Preferenze" per il Dipendente C
2. Verifica che il Dipendente A appaia nella lista delle preferenze
3. Verifica che il peso sia lo stesso

### 3.3 Rimuovere una Preferenza
1. Nel modal del Dipendente A, clicca "Rimuovi" sulla preferenza con Dipendente C
2. Conferma l'eliminazione
3. Verifica che:
   - La preferenza scompaia dalla lista
   - Il Dipendente C riappaia nel dropdown

### 3.4 Test Pesi Diversi
1. Aggiungi preferenze con pesi diversi:
   - Dipendente A → Dipendente C (peso 1.2)
   - Dipendente A → Dipendente D (peso 1.8)
2. Verifica che le etichette siano corrette:
   - 1.0-1.5: "Leggera"
   - 1.5-2.0: "Media"
   - >2.0: "Forte"

## Test 4: Integrazione con Algoritmo di Scheduling

### 4.1 Test Base - Conflitti Rispettati
1. Configura un conflitto tra Dipendente A e Dipendente B
2. Crea requisiti di turno che richiedano entrambi i dipendenti nello stesso turno:
   - Ristorante X, Lunedì, Pranzo: 2 cuochi
3. Vai alla pagina Schedule (`/schedule`)
4. Genera il programma per la settimana corrente
5. Verifica che:
   - Dipendente A e Dipendente B NON siano assegnati allo stesso turno
   - L'algoritmo assegni altri dipendenti disponibili

### 4.2 Test Preferenze Rispettate
1. Configura una preferenza tra Dipendente A e Dipendente C (peso 1.5)
2. Crea requisiti di turno che permettano questa combinazione:
   - Ristorante X, Lunedì, Pranzo: 2 cuochi
3. Genera il programma
4. Verifica che:
   - Quando possibile, Dipendente A e Dipendente C siano assegnati insieme
   - Questo avvenga quando entrambi sono disponibili e non ci sono conflitti

### 4.3 Test Caso Complesso
1. Configura:
   - Conflitto: A ↔ B
   - Preferenza: A ↔ C (peso 1.5)
   - Preferenza: A ↔ D (peso 1.8)
2. Crea requisiti multipli che richiedano diversi cuochi
3. Genera il programma
4. Verifica che:
   - A e B non siano mai insieme
   - Quando possibile, A sia con D (preferenza più forte) invece che con C
   - Il programma sia comunque valido e completo

### 4.4 Test Caso Impossibile
1. Configura molti conflitti tra tutti i dipendenti disponibili
2. Crea un requisito che richieda più dipendenti di quanti siano disponibili senza conflitti
3. Genera il programma
4. Verifica che:
   - L'algoritmo completi comunque il programma
   - Vengano mostrati warning per requisiti non completamente soddisfatti
   - Il sistema non crashi

## Test 5: Performance

### 5.1 Test con Molti Conflitti
1. Crea 10+ dipendenti
2. Configura conflitti tra molti di loro (es. 20+ conflitti)
3. Genera un programma complesso
4. Verifica che:
   - Il tempo di generazione sia ancora ragionevole (< 3 secondi)
   - L'interfaccia rimanga reattiva

### 5.2 Test con Molte Preferenze
1. Crea 10+ dipendenti
2. Configura preferenze tra molti di loro (es. 30+ preferenze)
3. Genera un programma complesso
4. Verifica che:
   - Il tempo di generazione sia ancora ragionevole
   - L'algoritmo consideri correttamente tutte le preferenze

## Test 6: Edge Cases

### 6.1 Dipendente senza Conflitti/Preferenze
1. Verifica che un dipendente senza conflitti/preferenze possa essere gestito normalmente
2. L'algoritmo deve funzionare come prima

### 6.2 Rimozione Dipendente con Conflitti/Preferenze
1. Crea conflitti/preferenze per un dipendente
2. Elimina il dipendente dalla pagina dipendenti
3. Verifica che:
   - I conflitti/preferenze siano eliminati automaticamente (cascade delete)
   - Non ci siano errori nel database

### 6.3 Aggiornamento Preferenza Esistente
1. Aggiungi una preferenza tra A e B con peso 1.2
2. Prova ad aggiungere la stessa preferenza con peso 1.8
3. Verifica che la preferenza venga aggiornata invece di creare un duplicato

## Checklist Finale

- [ ] Interfaccia funziona correttamente
- [ ] Conflitti possono essere aggiunti/rimossi
- [ ] Preferenze possono essere aggiunte/rimosse
- [ ] Validazioni funzionano (conflitto con se stesso, duplicati)
- [ ] Conflitti sono bidirezionali
- [ ] Preferenze sono bidirezionali
- [ ] Algoritmo rispetta i conflitti
- [ ] Algoritmo considera le preferenze
- [ ] Performance è accettabile con molti conflitti/preferenze
- [ ] Edge cases sono gestiti correttamente
- [ ] Nessun errore nella console del browser
- [ ] Nessun errore nei log del server

## Come Segnalare Problemi

Se trovi un problema durante i test:

1. **Cattura screenshot** dell'errore o comportamento inaspettato
2. **Controlla la console del browser** (F12 → Console) per errori JavaScript
3. **Controlla i log del server** nel terminale dove gira `npm run dev`
4. **Annota i passi** che hanno portato al problema
5. **Riporta**:
   - Cosa stavi facendo
   - Cosa ti aspettavi che succedesse
   - Cosa è successo invece
   - Eventuali messaggi di errore

## Note Tecniche

- I conflitti sono memorizzati nel database con `employeeId1 < employeeId2` per consistenza
- Le preferenze sono memorizzate allo stesso modo
- L'algoritmo carica conflitti/preferenze all'inizio della generazione del programma
- I conflitti hanno priorità sulle preferenze (hard constraint vs soft constraint)

