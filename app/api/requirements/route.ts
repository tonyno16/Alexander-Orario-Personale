import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DayOfWeek, Shift, RoleRequirement } from '@/types'

const validDays: DayOfWeek[] = [
  'lunedi',
  'martedi',
  'mercoledi',
  'giovedi',
  'venerdi',
  'sabato',
  'domenica',
]

const validShifts: Shift[] = ['pranzo', 'cena']

export async function GET() {
  try {
    const requirements = await prisma.shiftRequirement.findMany({
      include: { restaurant: true },
      orderBy: [
        { restaurant: { name: 'asc' } },
        { day: 'asc' },
        { shift: 'asc' },
      ],
    })
    return NextResponse.json(requirements)
  } catch (error) {
    console.error('Error fetching requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, day, shift, requirements } = body

    // Validazione
    if (!restaurantId || !day || !shift || !requirements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!validDays.includes(day)) {
      return NextResponse.json(
        { error: 'Invalid day' },
        { status: 400 }
      )
    }

    if (!validShifts.includes(shift)) {
      return NextResponse.json(
        { error: 'Invalid shift' },
        { status: 400 }
      )
    }

    if (!Array.isArray(requirements)) {
      return NextResponse.json(
        { error: 'Requirements must be an array' },
        { status: 400 }
      )
    }

    // Verifica che il ristorante esista
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const requirement = await prisma.shiftRequirement.upsert({
      where: {
        restaurantId_day_shift: {
          restaurantId,
          day,
          shift,
        },
      },
      update: {
        requirements: requirements as RoleRequirement[],
      },
      create: {
        restaurantId,
        day,
        shift,
        requirements: requirements as RoleRequirement[],
      },
    })

    return NextResponse.json(requirement, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Requirement already exists for this restaurant/day/shift' },
        { status: 409 }
      )
    }
    console.error('Error creating/updating requirement:', error)
    return NextResponse.json(
      { error: 'Failed to create/update requirement' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }

    await prisma.shiftRequirement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting requirement:', error)
    return NextResponse.json(
      { error: 'Failed to delete requirement' },
      { status: 500 }
    )
  }
}

