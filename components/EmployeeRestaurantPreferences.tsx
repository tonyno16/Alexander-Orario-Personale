'use client'

import { useState, useEffect, useCallback } from 'react'
import { ApiService } from '@/lib/api'
import { EmployeeRestaurantPreference, Employee, Restaurant } from '@/types'

interface EmployeeRestaurantPreferencesProps {
  employee: Employee
  allRestaurants: Restaurant[]
  onClose: () => void
}

export default function EmployeeRestaurantPreferences({ employee, allRestaurants, onClose }: EmployeeRestaurantPreferencesProps) {
  const [preferences, setPreferences] = useState<EmployeeRestaurantPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('')
  const [weight, setWeight] = useState(1.0)

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ApiService.getEmployeeRestaurantPreferences(employee.id)
      setPreferences(data)
    } catch (error) {
      console.error('Error loading restaurant preferences:', error)
      alert('Errore nel caricamento delle preferenze ristoranti')
    } finally {
      setLoading(false)
    }
  }, [employee.id])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRestaurantId) {
      alert('Seleziona un ristorante')
      return
    }
    try {
      setAdding(true)
      await ApiService.addEmployeeRestaurantPreference(employee.id, {
        restaurantId: selectedRestaurantId,
        weight: weight,
      })
      setSelectedRestaurantId('')
      setWeight(1.0)
      await loadPreferences()
    } catch (error: any) {
      alert(error.message || 'Errore nell\'aggiunta della preferenza ristorante')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (preferenceId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questa preferenza ristorante?')) return
    try {
      await ApiService.deleteEmployeeRestaurantPreference(employee.id, preferenceId)
      await loadPreferences()
    } catch (error: any) {
      alert(error.message || 'Errore nella rimozione della preferenza ristorante')
    }
  }

  const handleUpdateWeight = async (preferenceId: string, newWeight: number) => {
    try {
      await ApiService.updateEmployeeRestaurantPreference(employee.id, preferenceId, newWeight)
      await loadPreferences()
    } catch (error: any) {
      alert(error.message || 'Errore nell\'aggiornamento della preferenza ristorante')
    }
  }

  const getRestaurantName = (restaurantId: string) => {
    const rest = allRestaurants.find(r => r.id === restaurantId)
    return rest?.name || 'Sconosciuto'
  }

  const getWeightLabel = (w: number) => {
    if (w <= 1.0) return 'X (Normale)'
    if (w <= 2.0) return 'XX (Media)'
    return 'XXX (Forte)'
  }

  const getWeightDisplay = (w: number) => {
    if (w <= 1.0) return 'X'
    if (w <= 2.0) return 'XX'
    return 'XXX'
  }

  // Filtra ristoranti già in preferenza
  const availableRestaurants = allRestaurants.filter(
    rest => !preferences.some(p => p.restaurantId === rest.id)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Preferenze Ristoranti per {employee.name}
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
                Aggiungi Preferenza Ristorante
              </label>
              <select
                value={selectedRestaurantId}
                onChange={e => setSelectedRestaurantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Seleziona ristorante...</option>
                {availableRestaurants.map(rest => (
                  <option key={rest.id} value={rest.id}>
                    {rest.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Preferenza: {getWeightDisplay(weight)} ({getWeightLabel(weight)})
              </label>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.5"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0 (X)</span>
                <span>2.0 (XX)</span>
                <span>3.0 (XXX)</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Il peso determina quanto l&apos;algoritmo preferisce assegnare questo dipendente a questo ristorante.
                X = normale, XXX = forte preferenza.
              </p>
            </div>
            <button
              type="submit"
              disabled={adding || !selectedRestaurantId}
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
                Nessuna preferenza ristorante configurata
              </div>
            ) : (
              <div className="space-y-2">
                {preferences.map(preference => (
                  <div
                    key={preference.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-green-900">
                        {getRestaurantName(preference.restaurantId)}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({getWeightDisplay(preference.weight)} - {getWeightLabel(preference.weight)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={preference.weight}
                        onChange={e => handleUpdateWeight(preference.id, parseFloat(e.target.value))}
                        className="text-sm px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="1.0">X</option>
                        <option value="2.0">XX</option>
                        <option value="3.0">XXX</option>
                      </select>
                      <button
                        onClick={() => handleDelete(preference.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

