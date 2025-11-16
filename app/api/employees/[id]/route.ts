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
    const { name, role, roles, availability, availableDays, availableDates, restaurants } = body

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
    let updateData: any = {}
    
    if (roles !== undefined) {
      if (Array.isArray(roles)) {
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
        updateData.roles = roles
        updateData.role = roles.length > 0 ? roles[0] : null // Mantieni il primo ruolo per retrocompatibilità
      }
    } else if (role !== undefined) {
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }
      updateData.role = role
      // Se roles non è specificato, mantieni i ruoli esistenti o usa solo role
      const existing = await prisma.employee.findUnique({ where: { id: params.id } })
      if (existing && existing.roles && existing.roles.length > 0) {
        // Mantieni i ruoli esistenti ma aggiorna il primo
        updateData.roles = [role, ...existing.roles.slice(1)].filter((r, i, arr) => arr.indexOf(r) === i)
      } else {
        updateData.roles = [role]
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
        ...updateData,
        ...(calculatedAvailability !== undefined && { availability: calculatedAvailability }),
        ...(availableDays !== undefined && { availableDays }),
        ...(availableDates !== undefined && { availableDates }),
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

