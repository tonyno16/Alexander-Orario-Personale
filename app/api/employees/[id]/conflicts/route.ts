import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees/[id]/conflicts - Lista tutti i conflitti per un dipendente
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

    // Trova tutti i conflitti dove questo dipendente è coinvolto
    const conflicts = await prisma.employeeConflict.findMany({
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

    // Formatta i conflitti per includere sempre il dipendente corrente come employeeId1
    const formattedConflicts = conflicts.map(conflict => ({
      id: conflict.id,
      employeeId1: conflict.employeeId1,
      employeeId2: conflict.employeeId2,
      otherEmployee: conflict.employeeId1 === employeeId
        ? conflict.employee2
        : conflict.employee1,
      reason: conflict.reason,
      createdAt: conflict.createdAt,
      updatedAt: conflict.updatedAt,
    }))

    return NextResponse.json(formattedConflicts)
  } catch (error) {
    console.error('Error fetching conflicts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conflicts' },
      { status: 500 }
    )
  }
}

// POST /api/employees/[id]/conflicts - Aggiungi conflitto
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId1 = params.id
    const body = await request.json()
    const { employeeId2, reason } = body

    // Validazione
    if (!employeeId2) {
      return NextResponse.json(
        { error: 'employeeId2 è richiesto' },
        { status: 400 }
      )
    }

    if (employeeId1 === employeeId2) {
      return NextResponse.json(
        { error: 'Un dipendente non può avere conflitto con se stesso' },
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

    // Verifica se il conflitto esiste già (in entrambe le direzioni)
    const existingConflict = await prisma.employeeConflict.findFirst({
      where: {
        OR: [
          { employeeId1, employeeId2 },
          { employeeId1: employeeId2, employeeId2: employeeId1 },
        ],
      },
    })

    if (existingConflict) {
      return NextResponse.json(
        { error: 'Conflitto già esistente' },
        { status: 409 }
      )
    }

    // Crea il conflitto (sempre con employeeId1 < employeeId2 per consistenza)
    const [id1, id2] = employeeId1 < employeeId2
      ? [employeeId1, employeeId2]
      : [employeeId2, employeeId1]

    const conflict = await prisma.employeeConflict.create({
      data: {
        employeeId1: id1,
        employeeId2: id2,
        reason: reason || null,
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

    return NextResponse.json(conflict, { status: 201 })
  } catch (error: any) {
    console.error('Error creating conflict:', error)
    
    // Gestione errore unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Conflitto già esistente' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create conflict' },
      { status: 500 }
    )
  }
}

