import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShiftAssignment } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { weekStart: string } }
) {
  try {
    const assignments = await prisma.shiftAssignment.findMany({
      where: { weekStart: params.weekStart },
      include: {
        employee: true,
        restaurant: true,
      },
      orderBy: [
        { restaurant: { name: 'asc' } },
        { day: 'asc' },
        { shift: 'asc' },
      ],
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { weekStart: string } }
) {
  try {
    const body = await request.json()
    const { assignments } = body

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'Assignments must be an array' },
        { status: 400 }
      )
    }

    // Elimina tutti gli assegnamenti esistenti per questa settimana
    await prisma.shiftAssignment.deleteMany({
      where: { weekStart: params.weekStart },
    })

    // Crea i nuovi assegnamenti
    if (assignments.length > 0) {
      await prisma.shiftAssignment.createMany({
        data: assignments.map((a: ShiftAssignment) => ({
          restaurantId: a.restaurantId,
          employeeId: a.employeeId,
          day: a.day,
          shift: a.shift,
          role: a.role,
          weekStart: params.weekStart,
        })),
      })
    }

    // Recupera gli assegnamenti salvati
    const savedAssignments = await prisma.shiftAssignment.findMany({
      where: { weekStart: params.weekStart },
      include: {
        employee: true,
        restaurant: true,
      },
    })

    return NextResponse.json(savedAssignments, { status: 201 })
  } catch (error) {
    console.error('Error saving schedule:', error)
    return NextResponse.json(
      { error: 'Failed to save schedule' },
      { status: 500 }
    )
  }
}

