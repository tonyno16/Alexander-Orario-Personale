// Script per importare i requisiti del personale dallo spreadsheet
// Esegui con: node import-requirements-from-spreadsheet.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Mappatura giorni italiano -> inglese
const dayMapping = {
  'Lunedì': 'lunedi',
  'Martedì': 'martedi',
  'Mercoledì': 'mercoledi',
  'Giovedì': 'giovedi',
  'Venerdì': 'venerdi',
  'Sabato': 'sabato',
  'Domenica': 'domenica',
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
}

async function importRequirements() {
  try {
    console.log('🔄 Importazione requisiti personale...\n')

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
    // PIOSSASCO - Solo giorni (senza pranzo/cena separati)
    // Per questi, assumiamo che i requisiti siano per "pranzo" (turno principale)
    // ============================================
    const piossascoRequirements = {
      'lunedi': [
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'martedi': [
        { role: 'cameriere', count: 2 },
        { role: 'caposala', count: 1 },
      ],
      'mercoledi': [
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'giovedi': [
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'venerdi': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 1 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'sabato': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 2 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'domenica': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 1 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
    }

    // ============================================
    // PINEROLO - Solo giorni (senza pranzo/cena separati)
    // ============================================
    const pineroloRequirements = {
      'lunedi': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 1 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'martedi': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 1 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'mercoledi': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'giovedi': [
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cameriere', count: 1 },
        { role: 'caposala', count: 1 },
      ],
      'venerdi': [
        { role: 'lavapiatti', count: 1 },
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 2 },
        { role: 'cameriere', count: 2 },
        { role: 'caposala', count: 1 },
      ],
      'sabato': [
        { role: 'lavapiatti', count: 1 },
        { role: 'aiutopizzaiolo', count: 2 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 3 },
        { role: 'cameriere', count: 3 },
        { role: 'caposala', count: 1 },
      ],
      'domenica': [
        { role: 'lavapiatti', count: 1 },
        { role: 'aiutopizzaiolo', count: 1 },
        { role: 'pizzaiolo', count: 1 },
        { role: 'cuoco', count: 2 },
        { role: 'cameriere', count: 2 },
        { role: 'caposala', count: 1 },
      ],
    }

    // ============================================
    // GIAVENO - Con pranzo e cena separati
    // ============================================
    const giavenoRequirements = {
      'lunedi': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiutopizzaiolo', count: 1 },
          { role: 'pizzaiolo', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
      'martedi': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
      'mercoledi': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiutopizzaiolo', count: 1 },
          { role: 'pizzaiolo', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
      'giovedi': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
      'venerdi': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiutopizzaiolo', count: 1 },
          { role: 'pizzaiolo', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 2 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
      'sabato': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiutopizzaiolo', count: 1 },
          { role: 'pizzaiolo', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 2 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
      'domenica': {
        'pranzo': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 2 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
        'cena': [
          { role: 'lavapiatti', count: 1 },
          { role: 'aiuto_cuoco', count: 1 },
          { role: 'cuoco', count: 1 },
          { role: 'cameriere', count: 1 },
          { role: 'caposala', count: 1 },
        ],
      },
    }

    // Funzione helper per salvare un requisito
    async function saveRequirement(restaurantId, day, shift, requirements) {
      // Filtra solo i requisiti con count > 0
      const filteredRequirements = requirements.filter(r => r.count > 0)
      if (filteredRequirements.length === 0) return

      try {
        await prisma.shiftRequirement.upsert({
          where: {
            restaurantId_day_shift: {
              restaurantId,
              day,
              shift,
            },
          },
          update: {
            requirements: filteredRequirements,
          },
          create: {
            restaurantId,
            day,
            shift,
            requirements: filteredRequirements,
          },
        })
        return true
      } catch (error) {
        console.error(`❌ Errore salvando ${restaurantId} - ${day} - ${shift}:`, error.message)
        return false
      }
    }

    let totalCreated = 0
    let totalUpdated = 0

    // Importa Piossasco
    console.log('📝 Importazione Piossasco...')
    const piossascoId = restaurantMap['Piossasco']
    for (const [day, requirements] of Object.entries(piossascoRequirements)) {
      const saved = await saveRequirement(piossascoId, day, 'pranzo', requirements)
      if (saved) {
        console.log(`   ✅ ${day} - pranzo`)
        totalCreated++
      }
    }

    // Importa Pinerolo
    console.log('\n📝 Importazione Pinerolo...')
    const pineroloId = restaurantMap['Pinerolo']
    for (const [day, requirements] of Object.entries(pineroloRequirements)) {
      const saved = await saveRequirement(pineroloId, day, 'pranzo', requirements)
      if (saved) {
        console.log(`   ✅ ${day} - pranzo`)
        totalCreated++
      }
    }

    // Importa Giaveno
    console.log('\n📝 Importazione Giaveno...')
    const giavenoId = restaurantMap['Giaveno']
    for (const [day, shifts] of Object.entries(giavenoRequirements)) {
      for (const [shift, requirements] of Object.entries(shifts)) {
        const saved = await saveRequirement(giavenoId, day, shift, requirements)
        if (saved) {
          console.log(`   ✅ ${day} - ${shift}`)
          totalCreated++
        }
      }
    }

    console.log(`\n✅ Importazione completata!`)
    console.log(`   Totale requisiti creati/aggiornati: ${totalCreated}`)

    // Verifica finale
    const allRequirements = await prisma.shiftRequirement.findMany({
      include: { restaurant: true },
    })
    console.log(`\n📊 Riepilogo:`)
    const byRestaurant = {}
    allRequirements.forEach(req => {
      const name = req.restaurant.name
      byRestaurant[name] = (byRestaurant[name] || 0) + 1
    })
    Object.entries(byRestaurant).forEach(([name, count]) => {
      console.log(`   ${name}: ${count} requisiti`)
    })

  } catch (error) {
    console.error('❌ Errore:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importRequirements()

