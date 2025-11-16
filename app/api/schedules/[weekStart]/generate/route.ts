import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SchedulerService } from '@/lib/scheduler'

export async function POST(
  request: NextRequest,
  { params }: { params: { weekStart: string } }
) {
  try {
    const weekStart = params.weekStart

    // Carica tutti i dati necessari
    const [employees, restaurants, requirements] = await Promise.all([
      prisma.employee.findMany(),
      prisma.restaurant.findMany(),
      prisma.shiftRequirement.findMany({
        include: { restaurant: true },
      }),
    ])

    // Verifica che ci siano dati
    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'Nessun dipendente configurato' },
        { status: 400 }
      )
    }

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: 'Nessun ristorante configurato' },
        { status: 400 }
      )
    }

    if (requirements.length === 0) {
      return NextResponse.json(
        { error: 'Nessun requisito configurato. Configura i requisiti prima di generare lo schedule.' },
        { status: 400 }
      )
    }

    // Prepara i dati per lo scheduler
    const employeesForScheduler = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      roles: (emp as any).roles && (emp as any).roles.length > 0 
        ? (emp as any).roles 
        : [emp.role],
      availability: emp.availability,
      availableDays: emp.availableDays || [],
      availableDates: emp.availableDates || [],
      restaurants: emp.restaurants || [],
    }))

    const requirementsForScheduler = requirements.map(req => ({
      id: req.id,
      restaurantId: req.restaurantId,
      day: req.day,
      shift: req.shift,
      requirements: req.requirements,
    }))

    // Genera lo schedule
    const assignments = await SchedulerService.generateSchedule(
      employeesForScheduler,
      restaurants,
      requirementsForScheduler,
      weekStart,
      {
        avoidSameDayDoubleShift: true,
        balanceWorkload: true,
        preferRestaurantContinuity: false,
        useAdvancedAlgorithm: true,
        avoidConflicts: true,
        considerPreferences: true,
      }
    )

    // Salva lo schedule nel database
    await prisma.shiftAssignment.deleteMany({
      where: { weekStart },
    })

    if (assignments.length > 0) {
      await prisma.shiftAssignment.createMany({
        data: assignments.map(a => ({
          restaurantId: a.restaurantId,
          employeeId: a.employeeId,
          day: a.day,
          shift: a.shift,
          role: a.role,
          weekStart: a.weekStart,
        })),
      })
    }

    // Recupera gli assegnamenti salvati con le relazioni
    const savedAssignments = await prisma.shiftAssignment.findMany({
      where: { weekStart },
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

    return NextResponse.json({
      success: true,
      assignments: savedAssignments,
      count: savedAssignments.length,
    })
  } catch (error: any) {
    console.error('Error generating schedule:', error)
    return NextResponse.json(
      { 
        error: 'Errore durante la generazione dello schedule',
        details: error.message || error.toString(),
      },
      { status: 500 }
    )
  }
}

