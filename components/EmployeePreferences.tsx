'use client'

import { useState, useEffect, useCallback } from 'react'
import { ApiService } from '@/lib/api'
import { EmployeePreference, Employee } from '@/types'

interface EmployeePreferencesProps {
  employee: Employee
  allEmployees: Employee[]
  onClose: () => void
}

export default function EmployeePreferences({ employee, allEmployees, onClose }: EmployeePreferencesProps) {
  const [preferences, setPreferences] = useState<EmployeePreference[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [weight, setWeight] = useState(1.5)

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ApiService.getEmployeePreferences(employee.id)
      setPreferences(data)
    } catch (error) {
      console.error('Error loading preferences:', error)
      alert('Errore nel caricamento delle preferenze')
    } finally {
      setLoading(false)
    }
  }, [employee.id])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployeeId) {
      alert('Seleziona un dipendente')
      return
    }
    if (selectedEmployeeId === employee.id) {
      alert('Non puoi creare una preferenza con te stesso')
      return
    }
    try {
      setAdding(true)
      await ApiService.addEmployeePreference(employee.id, {
        employeeId2: selectedEmployeeId,
        weight: weight,
      })
      setSelectedEmployeeId('')
      setWeight(1.5)
      await loadPreferences()
    } catch (error: any) {
      alert(error.message || 'Errore nell\'aggiunta della preferenza')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (preferenceId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questa preferenza?')) return
    try {
      await ApiService.deleteEmployeePreference(employee.id, preferenceId)
      await loadPreferences()
    } catch (error: any) {
      alert(error.message || 'Errore nella rimozione della preferenza')
    }
  }

  const getEmployeeName = (employeeId: string) => {
    const emp = allEmployees.find(e => e.id === employeeId)
    return emp?.name || 'Sconosciuto'
  }

  const getOtherEmployeeId = (preference: EmployeePreference) => {
    // Determina quale employeeId è l'altro dipendente (non quello corrente)
    return preference.employeeId1 === employee.id ? preference.employeeId2 : preference.employeeId1
  }

  const getWeightLabel = (w: number) => {
    if (w <= 1.0) return 'Normale'
    if (w <= 1.5) return 'Leggera'
    if (w <= 2.0) return 'Media'
    return 'Forte'
  }

  // Filtra dipendenti già in preferenza o se stesso
  const availableEmployees = allEmployees.filter(
    emp => emp.id !== employee.id && !preferences.some(p => {
      const otherId = getOtherEmployeeId(p)
      return otherId === emp.id
    })
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Preferenze per {employee.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form per aggiungere preferenza */}
          <form onSubmit={handleAdd} className="space-y-4 border-b pb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aggiungi Preferenza
              </label>
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                Peso Preferenza: {weight.toFixed(1)} ({getWeightLabel(weight)})
              </label>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0 (Normale)</span>
                <span>1.5 (Leggera)</span>
                <span>2.0 (Forte)</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Il peso determina quanto l&apos;algoritmo preferisce assegnare questo dipendente insieme.
                Valore più alto = preferenza più forte.
              </p>
            </div>
            <button
              type="submit"
              disabled={adding || !selectedEmployeeId}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Aggiunta...' : 'Aggiungi Preferenza'}
            </button>
          </form>

          {/* Lista preferenze esistenti */}
          <div>
            <h3 className="text-lg font-medium mb-3">Preferenze Esistenti</h3>
            {loading ? (
              <div className="text-center py-4">Caricamento...</div>
            ) : preferences.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nessuna preferenza configurata
              </div>
            ) : (
              <div className="space-y-2">
                {preferences.map(preference => {
                  const otherEmployeeId = getOtherEmployeeId(preference)
                  return (
                    <div
                      key={preference.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                    >
                      <div>
                        <span className="font-medium text-green-900">
                          {getEmployeeName(otherEmployeeId)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          (Peso: {preference.weight.toFixed(1)} - {getWeightLabel(preference.weight)})
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(preference.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
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

