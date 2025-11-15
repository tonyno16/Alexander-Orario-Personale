import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const restaurant = await prisma.restaurant.create({
      data: { name },
    })

    return NextResponse.json(restaurant, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Restaurant with this name already exists' },
        { status: 409 }
      )
    }
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}

