'use client'

import { useState, useEffect, useCallback } from 'react'
import { ApiService } from '@/lib/api'
import { EmployeeConflict, Employee } from '@/types'

interface EmployeeConflictsProps {
  employee: Employee
  allEmployees: Employee[]
  onClose: () => void
}

export default function EmployeeConflicts({ employee, allEmployees, onClose }: EmployeeConflictsProps) {
  const [conflicts, setConflicts] = useState<EmployeeConflict[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [reason, setReason] = useState('')

  const loadConflicts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ApiService.getEmployeeConflicts(employee.id)
      setConflicts(data)
    } catch (error) {
      console.error('Error loading conflicts:', error)
      alert('Errore nel caricamento dei conflitti')
    } finally {
      setLoading(false)
    }
  }, [employee.id])

  useEffect(() => {
    loadConflicts()
  }, [loadConflicts])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployeeId) {
      alert('Seleziona un dipendente')
      return
    }
    if (selectedEmployeeId === employee.id) {
      alert('Non puoi creare un conflitto con te stesso')
      return
    }
    try {
      setAdding(true)
      await ApiService.addEmployeeConflict(employee.id, {
        employeeId2: selectedEmployeeId,
        reason: reason || undefined,
      })
      setSelectedEmployeeId('')
      setReason('')
      await loadConflicts()
    } catch (error: any) {
      alert(error.message || 'Errore nell\'aggiunta del conflitto')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (conflictId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo conflitto?')) return
    try {
      await ApiService.deleteEmployeeConflict(employee.id, conflictId)
      await loadConflicts()
    } catch (error: any) {
      alert(error.message || 'Errore nella rimozione del conflitto')
    }
  }

  const getEmployeeName = (employeeId: string) => {
    const emp = allEmployees.find(e => e.id === employeeId)
    return emp?.name || 'Sconosciuto'
  }

  const getOtherEmployeeId = (conflict: EmployeeConflict) => {
    // Determina quale employeeId è l'altro dipendente (non quello corrente)
    return conflict.employeeId1 === employee.id ? conflict.employeeId2 : conflict.employeeId1
  }

  // Filtra dipendenti già in conflitto o se stesso
  const availableEmployees = allEmployees.filter(
    emp => emp.id !== employee.id && !conflicts.some(c => {
      const otherId = getOtherEmployeeId(c)
      return otherId === emp.id
    })
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Conflitti per {employee.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form per aggiungere conflitto */}
          <form onSubmit={handleAdd} className="space-y-4 border-b pb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aggiungi Conflitto
              </label>
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Seleziona dipendente...</option>
                {availableEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opzionale)
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Es: Incompatibilità caratteriale"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !selectedEmployeeId}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Aggiunta...' : 'Aggiungi Conflitto'}
            </button>
          </form>

          {/* Lista conflitti esistenti */}
          <div>
            <h3 className="text-lg font-medium mb-3">Conflitti Esistenti</h3>
            {loading ? (
              <div className="text-center py-4">Caricamento...</div>
            ) : conflicts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nessun conflitto configurato
              </div>
            ) : (
              <div className="space-y-2">
                {conflicts.map(conflict => {
                  const otherEmployeeId = getOtherEmployeeId(conflict)
                  return (
                    <div
                      key={conflict.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                      <div>
                        <span className="font-medium text-red-900">
                          {getEmployeeName(otherEmployeeId)}
                        </span>
                        {conflict.reason && (
                          <span className="ml-2 text-sm text-gray-600">
                            ({conflict.reason})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(conflict.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Rimuovi
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

