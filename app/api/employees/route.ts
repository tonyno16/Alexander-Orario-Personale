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
    const { name, role, availability, availableDays, restaurants } = body

    // Validazione
    if (!name || !role || availability === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validRoles: EmployeeRole[] = [
      'cuoco',
      'aiuto_cuoco',
      'pizzaiolo',
      'lavapiatti',
      'cameriere',
      'aiuto_cameriere',
    ]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    if (availability < 0 || availability > 7) {
      return NextResponse.json(
        { error: 'Availability must be between 0 and 7' },
        { status: 400 }
      )
    }

    // Calcola availability da availableDays se disponibile
    const calculatedAvailability = availableDays && availableDays.length > 0 
      ? availableDays.length 
      : availability

    const employee = await prisma.employee.create({
      data: {
        name,
        role,
        availability: calculatedAvailability,
        availableDays: availableDays || [],
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

