import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmployeeRole } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, role, availability, availableDays, restaurants } = body

    // Validazione
    if (role) {
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
    }

    if (availability !== undefined && (availability < 0 || availability > 7)) {
      return NextResponse.json(
        { error: 'Availability must be between 0 and 7' },
        { status: 400 }
      )
    }

    // Calcola availability da availableDays se disponibile
    const calculatedAvailability = availableDays !== undefined && availableDays.length > 0 
      ? availableDays.length 
      : availability

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(calculatedAvailability !== undefined && { availability: calculatedAvailability }),
        ...(availableDays !== undefined && { availableDays }),
        ...(restaurants !== undefined && { restaurants }),
      },
    })

    return NextResponse.json(employee)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employee.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}

