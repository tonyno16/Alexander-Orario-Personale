import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/employees/[id]/restaurant-preferences/[preferenceId] - Elimina preferenza ristorante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; preferenceId: string } }
) {
  try {
    const employeeId = params.id
    const preferenceId = params.preferenceId

    // Verifica che la preferenza esista e appartenga al dipendente
    const preference = await prisma.employeeRestaurantPreference.findUnique({
      where: { id: preferenceId },
    })

    if (!preference) {
      return NextResponse.json(
        { error: 'Preferenza ristorante non trovata' },
        { status: 404 }
      )
    }

    if (preference.employeeId !== employeeId) {
      return NextResponse.json(
        { error: 'Preferenza ristorante non appartiene a questo dipendente' },
        { status: 403 }
      )
    }

    await prisma.employeeRestaurantPreference.delete({
      where: { id: preferenceId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting restaurant preference:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Preferenza ristorante non trovata' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete restaurant preference' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id]/restaurant-preferences/[preferenceId] - Aggiorna preferenza ristorante
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; preferenceId: string } }
) {
  try {
    const employeeId = params.id
    const preferenceId = params.preferenceId
    const body = await request.json()
    const { weight } = body

    // Validazione
    if (weight === undefined) {
      return NextResponse.json(
        { error: 'weight è richiesto' },
        { status: 400 }
      )
    }

    if (weight < 1.0 || weight > 3.0) {
      return NextResponse.json(
        { error: 'Weight deve essere tra 1.0 e 3.0 (1.0 = X, 3.0 = XXX)' },
        { status: 400 }
      )
    }

    // Verifica che la preferenza esista e appartenga al dipendente
    const existingPreference = await prisma.employeeRestaurantPreference.findUnique({
      where: { id: preferenceId },
    })

    if (!existingPreference) {
      return NextResponse.json(
        { error: 'Preferenza ristorante non trovata' },
        { status: 404 }
      )
    }

    if (existingPreference.employeeId !== employeeId) {
      return NextResponse.json(
        { error: 'Preferenza ristorante non appartiene a questo dipendente' },
        { status: 403 }
      )
    }

    const updated = await prisma.employeeRestaurantPreference.update({
      where: { id: preferenceId },
      data: { weight },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating restaurant preference:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Preferenza ristorante non trovata' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update restaurant preference' },
      { status: 500 }
    )
  }
}

