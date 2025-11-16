// Script Node.js per aggiornare i nomi dei ristoranti localmente
// Esegui con: node update-restaurant-names-local.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateRestaurantNames() {
  try {
    console.log('🔄 Aggiornamento nomi ristoranti...\n')

    // Trova i ristoranti esistenti
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    })

    console.log(`📋 Ristoranti trovati: ${restaurants.length}\n`)

    if (restaurants.length === 0) {
      console.log('⚠️  Nessun ristorante trovato. Creazione nuovi ristoranti...\n')
      
      // Crea i nuovi ristoranti
      const newRestaurants = await Promise.all([
        prisma.restaurant.create({ data: { name: 'Valsangone' } }),
        prisma.restaurant.create({ data: { name: 'Rivoli' } }),
        prisma.restaurant.create({ data: { name: 'Pinerolo' } }),
        prisma.restaurant.create({ data: { name: 'Piossasco' } }),
      ])

      console.log('✅ Ristoranti creati:')
      newRestaurants.forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`))
      return
    }

    // Mappa vecchi nomi -> nuovi nomi
    const nameMapping = {
      'Ristorante A': 'Valsangone',
      'Ristorante B': 'Rivoli',
      'Ristorante C': 'Pinerolo',
      'Ristorante D': 'Piossasco',
    }

    // Aggiorna i ristoranti esistenti
    const updates = []
    for (const restaurant of restaurants) {
      const newName = nameMapping[restaurant.name]
      if (newName && restaurant.name !== newName) {
        const updated = await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: { name: newName },
        })
        updates.push({ old: restaurant.name, new: newName, id: updated.id })
        console.log(`✅ Aggiornato: "${restaurant.name}" → "${newName}"`)
      } else if (!newName) {
        console.log(`⏭️  Saltato: "${restaurant.name}" (non nella mappatura)`)
      } else {
        console.log(`✓ Già corretto: "${restaurant.name}"`)
      }
    }

    // Verifica che tutti i nuovi nomi siano presenti
    const finalRestaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    })

    console.log('\n📊 Ristoranti finali:')
    finalRestaurants.forEach(r => console.log(`   - ${r.name}`))

    const requiredNames = ['Valsangone', 'Rivoli', 'Pinerolo', 'Piossasco']
    const existingNames = finalRestaurants.map(r => r.name)
    const missing = requiredNames.filter(name => !existingNames.includes(name))

    if (missing.length > 0) {
      console.log(`\n⚠️  Ristoranti mancanti: ${missing.join(', ')}`)
      console.log('   Creazione ristoranti mancanti...\n')
      
      for (const name of missing) {
        const created = await prisma.restaurant.create({ data: { name } })
        console.log(`✅ Creato: ${created.name}`)
      }
    }

    console.log('\n✅ Aggiornamento completato!')
  } catch (error) {
    console.error('❌ Errore:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateRestaurantNames()

