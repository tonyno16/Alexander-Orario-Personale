'use client'

import { useEffect, useState } from 'react'
import { ApiService } from '@/lib/api'
import { Employee, EmployeeRole, DayOfWeek } from '@/types'
import WeekCalendar from '@/components/WeekCalendar'

const ROLES: EmployeeRole[] = [
  'cuoco',
  'aiuto_cuoco',
  'pizzaiolo',
  'lavapiatti',
  'cameriere',
  'aiuto_cameriere',
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'cuoco' as EmployeeRole,
    availability: 5,
    availableDays: [] as DayOfWeek[],
    restaurants: [] as string[],
  })
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [emps, rests] = await Promise.all([
        ApiService.getEmployees(),
        ApiService.getRestaurants(),
      ])
      setEmployees(emps)
      setRestaurants(rests.map(r => ({ id: r.id, name: r.name })))
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await ApiService.updateEmployee(editing, formData)
      } else {
        await ApiService.createEmployee(formData)
      }
      resetForm()
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Errore nel salvataggio')
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditing(employee.id)
    setFormData({
      name: employee.name,
      role: employee.role,
      availability: employee.availability,
      availableDays: employee.availableDays || [],
      restaurants: employee.restaurants || [],
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo dipendente?')) return
    try {
      await ApiService.deleteEmployee(id)
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Errore nell\'eliminazione')
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      name: '',
      role: 'cuoco',
      availability: 5,
      availableDays: [],
      restaurants: [],
    })
  }

  const handleAvailableDaysChange = (days: DayOfWeek[]) => {
    // Calcola availability dal numero di giorni selezionati
    // Se nessun giorno è selezionato, disponibilità = 7 (tutti i giorni)
    const calculatedAvailability = days.length === 0 ? 7 : days.length
    setFormData({
      ...formData,
      availableDays: days,
      availability: calculatedAvailability,
    })
  }

  const toggleRestaurant = (restaurantId: string) => {
    setFormData(prev => ({
      ...prev,
      restaurants: prev.restaurants.includes(restaurantId)
        ? prev.restaurants.filter(id => id !== restaurantId)
        : [...prev.restaurants, restaurantId],
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestisci Dipendenti</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editing ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruolo
            </label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <WeekCalendar
              selectedDays={formData.availableDays}
              onChange={handleAvailableDaysChange}
            />
            <p className="mt-2 text-xs text-gray-500">
              Disponibilità totale: {formData.availableDays.length === 0 ? '7' : formData.availableDays.length} giorni/settimana
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ristoranti (lascia vuoto per tutti)
            </label>
            <div className="space-y-2">
              {restaurants.map(rest => (
                <label key={rest.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.restaurants.includes(rest.id)}
                    onChange={() => toggleRestaurant(rest.id)}
                    className="mr-2"
                  />
                  <span>{rest.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editing ? 'Salva Modifiche' : 'Aggiungi Dipendente'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Elenco Dipendenti</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibilità
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giorni
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ristoranti
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.role.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.availableDays && emp.availableDays.length > 0 
                      ? `${emp.availableDays.length} giorni/settimana`
                      : `${emp.availability} giorni/settimana`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.availableDays && emp.availableDays.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {emp.availableDays.map(day => (
                          <span key={day} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {day.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Tutti i giorni</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.restaurants.length === 0 ? 'Tutti' : `${emp.restaurants.length} specifici`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessun dipendente registrato
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

