import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Verifica se ci sono già dati
    const existingRestaurants = await prisma.restaurant.count()
    if (existingRestaurants > 0) {
      return NextResponse.json(
        { message: 'Database already initialized', skipped: true },
        { status: 200 }
      )
    }

    // Crea 4 ristoranti
    const restaurants = await Promise.all([
      prisma.restaurant.create({ data: { name: 'Ristorante A' } }),
      prisma.restaurant.create({ data: { name: 'Ristorante B' } }),
      prisma.restaurant.create({ data: { name: 'Ristorante C' } }),
      prisma.restaurant.create({ data: { name: 'Ristorante D' } }),
    ])

    // Crea 6 dipendenti di esempio con giorni disponibili
    const employees = await Promise.all([
      prisma.employee.create({
        data: {
          name: 'Mario Rossi',
          role: 'cuoco',
          availability: 5,
          availableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'],
          restaurants: [],
        },
      }),
      prisma.employee.create({
        data: {
          name: 'Luigi Bianchi',
          role: 'aiuto_cuoco',
          availability: 4,
          availableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi'],
          restaurants: [],
        },
      }),
      prisma.employee.create({
        data: {
          name: 'Giuseppe Verdi',
          role: 'pizzaiolo',
          availability: 6,
          availableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'],
          restaurants: [],
        },
      }),
      prisma.employee.create({
        data: {
          name: 'Anna Neri',
          role: 'cameriere',
          availability: 5,
          availableDays: ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'],
          restaurants: [],
        },
      }),
      prisma.employee.create({
        data: {
          name: 'Paolo Blu',
          role: 'lavapiatti',
          availability: 4,
          availableDays: ['martedi', 'mercoledi', 'giovedi', 'venerdi'],
          restaurants: [],
        },
      }),
      prisma.employee.create({
        data: {
          name: 'Sofia Gialli',
          role: 'aiuto_cameriere',
          availability: 5,
          availableDays: [], // Disponibile tutti i giorni
          restaurants: [],
        },
      }),
    ])

    return NextResponse.json(
      {
        message: 'Database initialized successfully',
        restaurants: restaurants.length,
        employees: employees.length,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error initializing database:', error)
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: errorMessage,
        code: error?.code
      },
      { status: 500 }
    )
  }
}

