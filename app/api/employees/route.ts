import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmployeeRole } from '@/types'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, role, roles, availability, availableDays, availableDates, restaurants } = body

    // Validazione
    if (!name || (!role && (!roles || roles.length === 0))) {
      return NextResponse.json(
        { error: 'Missing required fields: name and at least one role' },
        { status: 400 }
      )
    }

    const validRoles: EmployeeRole[] = [
      'cuoco',
      'aiuto_cuoco',
      'pizzaiolo',
      'aiutopizzaiolo',
      'lavapiatti',
      'cameriere',
      'aiuto_cameriere',
      'caposala',
    ]

    // Gestisci ruoli multipli
    let finalRole = role || (roles && roles.length > 0 ? roles[0] : null)
    let finalRoles: string[] = []

    if (roles && Array.isArray(roles)) {
      // Valida tutti i ruoli
      if (roles.length > 3) {
        return NextResponse.json(
          { error: 'Maximum 3 roles allowed' },
          { status: 400 }
        )
      }
      for (const r of roles) {
        if (!validRoles.includes(r as EmployeeRole)) {
          return NextResponse.json(
            { error: `Invalid role: ${r}` },
            { status: 400 }
          )
        }
      }
      finalRoles = roles
      finalRole = roles[0] // Mantieni il primo ruolo per retrocompatibilità
    } else if (role) {
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }
      finalRoles = [role]
      finalRole = role
    }

    if (availability !== undefined && (availability < 0 || availability > 7)) {
      return NextResponse.json(
        { error: 'Availability must be between 0 and 7' },
        { status: 400 }
      )
    }

    // Calcola availability da availableDays se disponibile
    const calculatedAvailability = availableDays && availableDays.length > 0 
      ? availableDays.length 
      : (availability !== undefined ? availability : 7)

    const employee = await prisma.employee.create({
      data: {
        name,
        role: finalRole,
        roles: finalRoles,
        availability: calculatedAvailability,
        availableDays: availableDays || [],
        availableDates: availableDates || [],
        restaurants: restaurants || [],
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

