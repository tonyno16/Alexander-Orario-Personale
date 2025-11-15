import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees/[id]/preferences - Lista tutte le preferenze per un dipendente
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

    // Trova tutte le preferenze dove questo dipendente è coinvolto
    const preferences = await prisma.employeePreference.findMany({
      where: {
        OR: [
          { employeeId1: employeeId },
          { employeeId2: employeeId },
        ],
      },
      include: {
        employee1: {
          select: { id: true, name: true },
        },
        employee2: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Formatta le preferenze per includere sempre il dipendente corrente come employeeId1
    const formattedPreferences = preferences.map(preference => ({
      id: preference.id,
      employeeId1: preference.employeeId1,
      employeeId2: preference.employeeId2,
      otherEmployee: preference.employeeId1 === employeeId
        ? preference.employee2
        : preference.employee1,
      weight: preference.weight,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt,
    }))

    return NextResponse.json(formattedPreferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// POST /api/employees/[id]/preferences - Aggiungi preferenza
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId1 = params.id
    const body = await request.json()
    const { employeeId2, weight = 1.0 } = body

    // Validazione
    if (!employeeId2) {
      return NextResponse.json(
        { error: 'employeeId2 è richiesto' },
        { status: 400 }
      )
    }

    if (employeeId1 === employeeId2) {
      return NextResponse.json(
        { error: 'Un dipendente non può avere preferenza con se stesso' },
        { status: 400 }
      )
    }

    if (weight < 1.0 || weight > 2.0) {
      return NextResponse.json(
        { error: 'Weight deve essere tra 1.0 e 2.0' },
        { status: 400 }
      )
    }

    // Verifica che entrambi i dipendenti esistano
    const [employee1, employee2] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId1 } }),
      prisma.employee.findUnique({ where: { id: employeeId2 } }),
    ])

    if (!employee1 || !employee2) {
      return NextResponse.json(
        { error: 'Uno o entrambi i dipendenti non trovati' },
        { status: 404 }
      )
    }

    // Verifica se la preferenza esiste già (in entrambe le direzioni)
    const existingPreference = await prisma.employeePreference.findFirst({
      where: {
        OR: [
          { employeeId1, employeeId2 },
          { employeeId1: employeeId2, employeeId2: employeeId1 },
        ],
      },
    })

    if (existingPreference) {
      // Aggiorna la preferenza esistente invece di crearne una nuova
      const updated = await prisma.employeePreference.update({
        where: { id: existingPreference.id },
        data: { weight },
        include: {
          employee1: {
            select: { id: true, name: true },
          },
          employee2: {
            select: { id: true, name: true },
          },
        },
      })
      return NextResponse.json(updated)
    }

    // Crea la preferenza (sempre con employeeId1 < employeeId2 per consistenza)
    const [id1, id2] = employeeId1 < employeeId2
      ? [employeeId1, employeeId2]
      : [employeeId2, employeeId1]

    const preference = await prisma.employeePreference.create({
      data: {
        employeeId1: id1,
        employeeId2: id2,
        weight,
      },
      include: {
        employee1: {
          select: { id: true, name: true },
        },
        employee2: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(preference, { status: 201 })
  } catch (error: any) {
    console.error('Error creating preference:', error)
    
    // Gestione errore unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Preferenza già esistente' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create preference' },
      { status: 500 }
    )
  }
}

