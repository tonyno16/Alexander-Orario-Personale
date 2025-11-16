// Script per importare i dipendenti dallo spreadsheet
// Esegui con: node import-employees-from-spreadsheet.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Mappatura giorni italiano -> inglese
const dayMapping = {
  'lunedì': 'lunedi',
  'martedì': 'martedi',
  'mercoledì': 'mercoledi',
  'giovedì': 'giovedi',
  'venerdì': 'venerdi',
  'sabato': 'sabato',
  'domenica': 'domenica',
}

// Mappatura ruoli spreadsheet -> sistema
const roleMapping = {
  'lavapiatti': 'lavapiatti',
  'aiutopizzaiolo': 'aiutopizzaiolo',
  'pizzaiolo': 'pizzaiolo',
  'aiutocuoco': 'aiuto_cuoco',
  'cuoco': 'cuoco',
  'cameriere': 'cameriere',
  'caposala': 'caposala',
  'aiuto_cameriere': 'aiuto_cameriere', // per retrocompatibilità
}

// Tutti i giorni della settimana
const allDays = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica']

async function importEmployees() {
  try {
    console.log('🔄 Importazione dipendenti...\n')

    // Ottieni i ristoranti
    const restaurants = await prisma.restaurant.findMany()
    const restaurantMap = {}
    restaurants.forEach(r => {
      restaurantMap[r.name] = r.id
    })

    console.log('📋 Ristoranti trovati:')
    Object.keys(restaurantMap).forEach(name => {
      console.log(`   - ${name} (ID: ${restaurantMap[name]})`)
    })
    console.log()

    // Verifica che tutti i ristoranti esistano
    const requiredRestaurants = ['Valsangone', 'Rivoli', 'Pinerolo', 'Piossasco', 'Giaveno']
    const missing = requiredRestaurants.filter(name => !restaurantMap[name])
    if (missing.length > 0) {
      console.log(`⚠️  Ristoranti mancanti: ${missing.join(', ')}`)
      console.log('   Creazione ristoranti mancanti...\n')
      for (const name of missing) {
        const created = await prisma.restaurant.create({ data: { name } })
        restaurantMap[name] = created.id
        console.log(`✅ Creato: ${name}`)
      }
      console.log()
    }

    // ============================================
    // DATI DIPENDENTI DALLO SPREADSHEET
    // ============================================
    const employeesData = [
      // Prima parte (righe 2-17)
      {
        name: 'Biagio Gallucci',
        roles: ['pizzaiolo', 'caposala'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 3.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Giacomo Giudice',
        roles: ['pizzaiolo'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 3.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Blessed',
        roles: ['lavapiatti'],
        restaurantPreferences: { 'Pinerolo': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi'],
      },
      {
        name: 'Roberto Cantore',
        roles: ['pizzaiolo'],
        restaurantPreferences: { 'Giaveno': 3.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi'],
      },
      {
        name: 'Nicolas Spencer',
        roles: ['aiuto_cuoco', 'aiutopizzaiolo', 'lavapiatti'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['lunedi', 'martedi'],
      },
      {
        name: 'Alessandro Belli',
        roles: ['pizzaiolo'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 1.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi'],
      },
      {
        name: 'Suad Khliss',
        roles: ['pizzaiolo'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Jouhain Slimane',
        roles: ['pizzaiolo'],
        restaurantPreferences: { 'Piossasco': 1.0 },
        unavailableDays: ['lunedi'],
      },
      {
        name: 'Pasquale',
        roles: ['pizzaiolo'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['mercoledi'],
      },
      {
        name: 'Vanessa Marabeti',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0 },
        unavailableDays: ['lunedi'],
      },
      {
        name: 'Siria Di Fazio',
        roles: ['cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi'],
      },
      {
        name: 'Kristina Bahollari',
        roles: ['cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 1.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi'],
      },
      {
        name: 'Simone Baldi',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 3.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['mercoledi'],
      },
      {
        name: 'Bonny Deiana',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Pinerolo': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Elisa Martina',
        roles: ['cameriere'],
        restaurantPreferences: { 'Pinerolo': 3.0 },
        unavailableDays: ['mercoledi'],
      },
      {
        name: 'Romina D\'Andria',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 1.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'mercoledi', 'giovedi'],
      },
      // Seconda parte (righe 18-33)
      {
        name: 'Federico Bianucci',
        roles: ['aiutopizzaiolo', 'cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 1.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'giovedi'],
      },
      {
        name: 'Ylenia Garofalo',
        roles: ['cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 1.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'giovedi'],
      },
      {
        name: 'Ludovica Boursier',
        roles: ['cameriere'],
        restaurantPreferences: { 'Piossasco': 1.0, 'Pinerolo': 1.0, 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['giovedi'],
      },
      {
        name: 'Sara Merigo',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'martedi'],
      },
      {
        name: 'Rachel Rivas Rodriguez',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Giaveno': 3.0, 'Rivoli': 1.0 },
        unavailableDays: ['martedi', 'mercoledi', 'venerdi'],
      },
      {
        name: 'Riccardo Rolando',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['martedi', 'mercoledi'],
      },
      {
        name: 'Arianna',
        roles: ['cameriere'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'],
      },
      {
        name: 'Sebastiano Beretta',
        roles: ['cameriere'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'],
      },
      {
        name: 'Giulia Gallo',
        roles: ['cameriere'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Angela Cristiano',
        roles: ['cameriere'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Manuel Abbattangelo',
        roles: ['cameriere'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi'],
      },
      {
        name: 'Andrea Ugo',
        roles: ['cameriere'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['lunedi'],
      },
      {
        name: 'Alessandro Fiore',
        roles: ['aiuto_cuoco'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['mercoledi'],
      },
      {
        name: 'Elena Acatte',
        roles: ['cuoco'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['lunedi', 'martedi'],
      },
      {
        name: 'Moussa Dabre',
        roles: ['aiuto_cuoco', 'lavapiatti'],
        restaurantPreferences: { 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['mercoledi'],
      },
      {
        name: 'Amerigo',
        roles: ['lavapiatti'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi'],
      },
      // Terza parte (righe 34-39)
      {
        name: 'Alessandro Caltran',
        roles: ['cuoco'],
        restaurantPreferences: { 'Giaveno': 1.0, 'Rivoli': 1.0 },
        unavailableDays: ['mercoledi', 'giovedi'],
      },
      {
        name: 'Berry Wilson',
        roles: ['lavapiatti', 'aiuto_cuoco'],
        restaurantPreferences: { 'Giaveno': 1.0 },
        unavailableDays: ['lunedi'],
      },
      {
        name: 'Alessandro D\'Onza',
        roles: ['cuoco', 'aiutopizzaiolo'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['martedi'],
      },
      {
        name: 'Maria Gentile',
        roles: ['lavapiatti', 'aiuto_cuoco', 'aiutopizzaiolo'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['mercoledi', 'giovedi'],
      },
      {
        name: 'Rocco',
        roles: ['lavapiatti'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'],
      },
      {
        name: 'Andrea Rosa',
        roles: ['caposala', 'cameriere'],
        restaurantPreferences: { 'Rivoli': 1.0 },
        unavailableDays: ['lunedi'],
      },
    ]

    let created = 0
    let updated = 0
    let skipped = 0

    console.log(`📝 Importazione ${employeesData.length} dipendenti...\n`)

    for (const empData of employeesData) {
      try {
        // Verifica se il dipendente esiste già
        const existing = await prisma.employee.findFirst({
          where: { name: empData.name },
        })

        // Calcola giorni disponibili (tutti i giorni tranne quelli non disponibili)
        const availableDays = allDays.filter(day => !empData.unavailableDays.includes(day))
        const availability = availableDays.length

        // Prepara i ruoli (massimo 3, primo ruolo per retrocompatibilità)
        const roles = empData.roles.slice(0, 3).map(r => roleMapping[r] || r)
        const primaryRole = roles[0] || 'cameriere'

        // Prepara array di ID ristoranti (per retrocompatibilità)
        const restaurantIds = Object.keys(empData.restaurantPreferences).map(name => restaurantMap[name]).filter(Boolean)

        if (existing) {
          // Aggiorna dipendente esistente
          await prisma.employee.update({
            where: { id: existing.id },
            data: {
              name: empData.name,
              role: primaryRole,
              roles: roles,
              availability: availability,
              availableDays: availableDays,
              restaurants: restaurantIds,
            },
          })

          // Aggiorna preferenze ristoranti
          await prisma.employeeRestaurantPreference.deleteMany({
            where: { employeeId: existing.id },
          })

          for (const [restaurantName, weight] of Object.entries(empData.restaurantPreferences)) {
            const restaurantId = restaurantMap[restaurantName]
            if (restaurantId) {
              await prisma.employeeRestaurantPreference.create({
                data: {
                  employeeId: existing.id,
                  restaurantId: restaurantId,
                  weight: weight,
                },
              })
            }
          }

          updated++
          console.log(`   ✅ Aggiornato: ${empData.name} (${roles.join(', ')})`)
        } else {
          // Crea nuovo dipendente
          const newEmployee = await prisma.employee.create({
            data: {
              name: empData.name,
              role: primaryRole,
              roles: roles,
              availability: availability,
              availableDays: availableDays,
              restaurants: restaurantIds,
            },
          })

          // Crea preferenze ristoranti
          for (const [restaurantName, weight] of Object.entries(empData.restaurantPreferences)) {
            const restaurantId = restaurantMap[restaurantName]
            if (restaurantId) {
              await prisma.employeeRestaurantPreference.create({
                data: {
                  employeeId: newEmployee.id,
                  restaurantId: restaurantId,
                  weight: weight,
                },
              })
            }
          }

          created++
          console.log(`   ✅ Creato: ${empData.name} (${roles.join(', ')})`)
        }
      } catch (error) {
        console.error(`   ❌ Errore con ${empData.name}:`, error.message)
        skipped++
      }
    }

    console.log(`\n✅ Importazione completata!`)
    console.log(`   Creati: ${created}`)
    console.log(`   Aggiornati: ${updated}`)
    console.log(`   Saltati: ${skipped}`)

    // Verifica finale
    const totalEmployees = await prisma.employee.count()
    const totalPreferences = await prisma.employeeRestaurantPreference.count()
    console.log(`\n📊 Riepilogo:`)
    console.log(`   Totale dipendenti: ${totalEmployees}`)
    console.log(`   Totale preferenze ristoranti: ${totalPreferences}`)

    // Mostra alcuni esempi
    const sampleEmployees = await prisma.employee.findMany({
      take: 5,
      include: {
        restaurantPreferences: {
          include: { restaurant: true },
        },
      },
    })

    console.log(`\n📋 Esempi dipendenti:`)
    sampleEmployees.forEach(emp => {
      const roles = (emp.roles && emp.roles.length > 0) ? emp.roles : [emp.role]
      const prefs = emp.restaurantPreferences.map(p => `${p.restaurant.name}(${p.weight === 3.0 ? 'XXX' : p.weight === 2.0 ? 'XX' : 'X'})`).join(', ')
      console.log(`   ${emp.name}: ${roles.join(', ')} | Preferenze: ${prefs || 'nessuna'}`)
    })

  } catch (error) {
    console.error('❌ Errore:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importEmployees()

