import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/employees/[id]/preferences/[preferenceId] - Rimuovi preferenza
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; preferenceId: string } }
) {
  try {
    const employeeId = params.id
    const preferenceId = params.preferenceId

    // Verifica che la preferenza esista e appartenga a questo dipendente
    const preference = await prisma.employeePreference.findUnique({
      where: { id: preferenceId },
    })

    if (!preference) {
      return NextResponse.json(
        { error: 'Preferenza non trovata' },
        { status: 404 }
      )
    }

    // Verifica che il dipendente sia coinvolto nella preferenza
    if (preference.employeeId1 !== employeeId && preference.employeeId2 !== employeeId) {
      return NextResponse.json(
        { error: 'Preferenza non appartiene a questo dipendente' },
        { status: 403 }
      )
    }

    // Elimina la preferenza
    await prisma.employeePreference.delete({
      where: { id: preferenceId },
    })

    return NextResponse.json({ message: 'Preferenza eliminata con successo' })
  } catch (error) {
    console.error('Error deleting preference:', error)
    return NextResponse.json(
      { error: 'Failed to delete preference' },
      { status: 500 }
    )
  }
}

