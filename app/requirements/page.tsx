'use client'

import { useEffect, useState } from 'react'
import { ApiService } from '@/lib/api'
import { Restaurant, ShiftRequirement, DayOfWeek, Shift, EmployeeRole, RoleRequirement } from '@/types'

const DAYS: DayOfWeek[] = [
  'lunedi',
  'martedi',
  'mercoledi',
  'giovedi',
  'venerdi',
  'sabato',
  'domenica',
]

const SHIFTS: Shift[] = ['pranzo', 'cena']

const ROLES: EmployeeRole[] = [
  'cuoco',
  'aiuto_cuoco',
  'pizzaiolo',
  'lavapiatti',
  'cameriere',
  'aiuto_cameriere',
]

export default function RequirementsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [requirements, setRequirements] = useState<ShiftRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    restaurantId: '',
    day: 'lunedi' as DayOfWeek,
    shift: 'pranzo' as Shift,
    requirements: [] as RoleRequirement[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rests, reqs] = await Promise.all([
        ApiService.getRestaurants(),
        ApiService.getRequirements(),
      ])
      setRestaurants(rests)
      setRequirements(reqs)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.restaurantId) {
      alert('Seleziona un ristorante')
      return
    }
    try {
      await ApiService.saveRequirement({
        restaurantId: formData.restaurantId,
        day: formData.day,
        shift: formData.shift,
        requirements: formData.requirements,
      })
      resetForm()
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Errore nel salvataggio')
    }
  }

  const handleEdit = (req: ShiftRequirement) => {
    setEditing(req.id)
    setFormData({
      restaurantId: req.restaurantId,
      day: req.day,
      shift: req.shift,
      requirements: req.requirements as RoleRequirement[],
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo requisito?')) return
    try {
      await ApiService.deleteRequirement(id)
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Errore nell\'eliminazione')
    }
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      restaurantId: '',
      day: 'lunedi',
      shift: 'pranzo',
      requirements: [],
    })
  }

  const addRoleRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { role: 'cuoco', count: 1 }],
    }))
  }

  const updateRoleRequirement = (index: number, updates: Partial<RoleRequirement>) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((r, i) =>
        i === index ? { ...r, ...updates } : r
      ),
    }))
  }

  const removeRoleRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const getRequirementFor = (restaurantId: string, day: DayOfWeek, shift: Shift) => {
    return requirements.find(
      r => r.restaurantId === restaurantId && r.day === day && r.shift === shift
    )
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configura Requisiti</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editing ? 'Modifica Requisito' : 'Nuovo Requisito'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ristorante
              </label>
              <select
                required
                value={formData.restaurantId}
                onChange={e => setFormData({ ...formData, restaurantId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona ristorante</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giorno
              </label>
              <select
                value={formData.day}
                onChange={e => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turno
              </label>
              <select
                value={formData.shift}
                onChange={e => setFormData({ ...formData, shift: e.target.value as Shift })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SHIFTS.map(shift => (
                  <option key={shift} value={shift}>
                    {shift.charAt(0).toUpperCase() + shift.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requisiti per Ruolo
            </label>
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={req.role}
                    onChange={e => updateRoleRequirement(index, { role: e.target.value as EmployeeRole })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={req.count}
                    onChange={e => updateRoleRequirement(index, { count: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeRoleRequirement(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRoleRequirement}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Aggiungi Ruolo
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editing ? 'Salva Modifiche' : 'Salva Requisito'}
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
          <h2 className="text-xl font-semibold">Requisiti Configurati</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ristorante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giorno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requisiti
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requirements.map(req => {
                const restaurant = restaurants.find(r => r.id === req.restaurantId)
                return (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {restaurant?.name || req.restaurantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.day.charAt(0).toUpperCase() + req.day.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.shift.charAt(0).toUpperCase() + req.shift.slice(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(req.requirements as RoleRequirement[]).map(r => (
                        <div key={r.role}>
                          {r.role.replace('_', ' ')}: {r.count}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(req)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {requirements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessun requisito configurato
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

