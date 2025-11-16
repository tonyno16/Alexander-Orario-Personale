import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees/[id]/restaurant-preferences - Lista tutte le preferenze ristoranti per un dipendente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id

    // Verifica che il dipendente esista
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Dipendente non trovato' },
        { status: 404 }
      )
    }

    // Trova tutte le preferenze ristoranti per questo dipendente
    const preferences = await prisma.employeeRestaurantPreference.findMany({
      where: {
        employeeId: employeeId,
      },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
      orderBy: { weight: 'desc' },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching restaurant preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant preferences' },
      { status: 500 }
    )
  }
}

// POST /api/employees/[id]/restaurant-preferences - Aggiungi preferenza ristorante
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    const body = await request.json()
    const { restaurantId, weight = 1.0 } = body

    // Validazione
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId è richiesto' },
        { status: 400 }
      )
    }

    // Weight: 1.0 = X (normale), 3.0 = XXX (forte preferenza)
    if (weight < 1.0 || weight > 3.0) {
      return NextResponse.json(
        { error: 'Weight deve essere tra 1.0 e 3.0 (1.0 = X, 3.0 = XXX)' },
        { status: 400 }
      )
    }

    // Verifica che il dipendente e il ristorante esistano
    const [employee, restaurant] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId } }),
      prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    ])

    if (!employee) {
      return NextResponse.json(
        { error: 'Dipendente non trovato' },
        { status: 404 }
      )
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Ristorante non trovato' },
        { status: 404 }
      )
    }

    // Verifica se la preferenza esiste già
    const existingPreference = await prisma.employeeRestaurantPreference.findUnique({
      where: {
        employeeId_restaurantId: {
          employeeId,
          restaurantId,
        },
      },
    })

    if (existingPreference) {
      // Aggiorna la preferenza esistente invece di crearne una nuova
      const updated = await prisma.employeeRestaurantPreference.update({
        where: { id: existingPreference.id },
        data: { weight },
        include: {
          restaurant: {
            select: { id: true, name: true },
          },
        },
      })
      return NextResponse.json(updated)
    }

    // Crea la preferenza
    const preference = await prisma.employeeRestaurantPreference.create({
      data: {
        employeeId,
        restaurantId,
        weight,
      },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(preference, { status: 201 })
  } catch (error: any) {
    console.error('Error creating restaurant preference:', error)
    
    // Gestione errore unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Preferenza ristorante già esistente' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create restaurant preference' },
      { status: 500 }
    )
  }
}

