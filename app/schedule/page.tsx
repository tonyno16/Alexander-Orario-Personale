'use client'

import { useEffect, useState } from 'react'
import { ApiService } from '@/lib/api'
import { SchedulerService } from '@/lib/scheduler'
import { ShiftAssignment, Restaurant, Employee, DayOfWeek, Shift } from '@/types'

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

export default function SchedulePage() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState(SchedulerService.getWeekStart())
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [weekStart])

  const loadData = async () => {
    try {
      setLoading(true)
      const [sched, rests, emps] = await Promise.all([
        ApiService.getSchedule(weekStart),
        ApiService.getRestaurants(),
        ApiService.getEmployees(),
      ])
      setAssignments(sched)
      setRestaurants(rests)
      setEmployees(emps)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const [rests, emps, reqs] = await Promise.all([
        ApiService.getRestaurants(),
        ApiService.getEmployees(),
        ApiService.getRequirements(),
      ])
      const newAssignments = SchedulerService.generateSchedule(
        emps,
        rests,
        reqs,
        weekStart
      )
      await ApiService.saveSchedule(weekStart, newAssignments)
      await loadData()
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Errore durante la generazione dei turni')
    } finally {
      setGenerating(false)
    }
  }

  const exportToPDF = () => {
    // Implementazione semplice con window.print per ora
    // In produzione si potrebbe usare jsPDF o react-pdf
    window.print()
  }

  const getAssignmentsFor = (
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift
  ): ShiftAssignment[] => {
    return assignments.filter(
      a => a.restaurantId === restaurantId && a.day === day && a.shift === shift
    )
  }

  const getEmployeeName = (employeeId: string): string => {
    return employees.find(e => e.id === employeeId)?.name || employeeId
  }

  const groupByRole = (assignments: ShiftAssignment[]): Record<string, string[]> => {
    const grouped: Record<string, string[]> = {}
    assignments.forEach(a => {
      if (!grouped[a.role]) {
        grouped[a.role] = []
      }
      grouped[a.role].push(getEmployeeName(a.employeeId))
    })
    return grouped
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visualizza Turni</h1>
          <p className="text-gray-600 mt-1">
            Settimana dal {SchedulerService.formatDate(weekStart)}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={weekStart}
            onChange={e => setWeekStart(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {generating ? 'Generazione...' : 'Rigenera Turni'}
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Esporta PDF
          </button>
        </div>
      </div>

      <div className="space-y-8 print:space-y-12">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className="bg-white rounded-lg shadow p-6 print:shadow-none print:break-after-page">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{restaurant.name}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giorno
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pranzo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {DAYS.map(day => (
                    <tr key={day}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {(() => {
                          const dayAssignments = getAssignmentsFor(restaurant.id, day, 'pranzo')
                          const grouped = groupByRole(dayAssignments)
                          return (
                            <div className="space-y-1">
                              {Object.entries(grouped).map(([role, names]) => (
                                <div key={role}>
                                  <span className="font-medium">{role.replace('_', ' ')}:</span>{' '}
                                  {names.join(', ')}
                                </div>
                              ))}
                              {dayAssignments.length === 0 && (
                                <span className="text-gray-400">Nessun turno</span>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {(() => {
                          const dayAssignments = getAssignmentsFor(restaurant.id, day, 'cena')
                          const grouped = groupByRole(dayAssignments)
                          return (
                            <div className="space-y-1">
                              {Object.entries(grouped).map(([role, names]) => (
                                <div key={role}>
                                  <span className="font-medium">{role.replace('_', ' ')}:</span>{' '}
                                  {names.join(', ')}
                                </div>
                              ))}
                              {dayAssignments.length === 0 && (
                                <span className="text-gray-400">Nessun turno</span>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nessun ristorante configurato
        </div>
      )}

      <style jsx global>{`
        @media print {
          nav {
            display: none;
          }
          button {
            display: none;
          }
          input {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

