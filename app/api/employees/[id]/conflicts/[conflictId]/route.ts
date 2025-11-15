import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/employees/[id]/conflicts/[conflictId] - Rimuovi conflitto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; conflictId: string } }
) {
  try {
    const employeeId = params.id
    const conflictId = params.conflictId

    // Verifica che il conflitto esista e appartenga a questo dipendente
    const conflict = await prisma.employeeConflict.findUnique({
      where: { id: conflictId },
    })

    if (!conflict) {
      return NextResponse.json(
        { error: 'Conflitto non trovato' },
        { status: 404 }
      )
    }

    // Verifica che il dipendente sia coinvolto nel conflitto
    if (conflict.employeeId1 !== employeeId && conflict.employeeId2 !== employeeId) {
      return NextResponse.json(
        { error: 'Conflitto non appartiene a questo dipendente' },
        { status: 403 }
      )
    }

    // Elimina il conflitto
    await prisma.employeeConflict.delete({
      where: { id: conflictId },
    })

    return NextResponse.json({ message: 'Conflitto eliminato con successo' })
  } catch (error) {
    console.error('Error deleting conflict:', error)
    return NextResponse.json(
      { error: 'Failed to delete conflict' },
      { status: 500 }
    )
  }
}

