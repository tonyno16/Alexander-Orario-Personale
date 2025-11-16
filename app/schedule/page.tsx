'use client'

import { useEffect, useState, useCallback } from 'react'
import { ApiService } from '@/lib/api'
import { SchedulerService } from '@/lib/scheduler'
import { ShiftAssignment, Restaurant, Employee, DayOfWeek, Shift, ShiftRequirement } from '@/types'

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
  const [requirements, setRequirements] = useState<ShiftRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState(SchedulerService.getWeekStart())
  const [generating, setGenerating] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [sched, rests, emps, reqs] = await Promise.all([
        ApiService.getSchedule(weekStart),
        ApiService.getRestaurants(),
        ApiService.getEmployees(),
        ApiService.getRequirements(),
      ])
      setAssignments(sched)
      setRestaurants(rests)
      setEmployees(emps)
      setRequirements(reqs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      
      // Chiama l'API per generare lo schedule
      const response = await fetch(`/api/schedules/${weekStart}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.details || 'Errore durante la generazione')
      }

      const result = await response.json()
      
      if (result.success) {
        // Ricarica i dati
        await loadData()
        alert(`✅ Schedule generato con successo! ${result.count} assegnazioni create.`)
      } else {
        throw new Error('Generazione fallita')
      }
    } catch (error: any) {
      console.error('Error generating schedule:', error)
      alert(`Errore durante la generazione dei turni: ${error.message || error}`)
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

  const stats = assignments.length > 0 && requirements.length > 0
    ? SchedulerService.calculateScheduleStatistics(assignments, employees, requirements)
    : null

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
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {showDebug ? 'Nascondi' : 'Mostra'} Debug
          </button>
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

      {showDebug && stats && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Statistiche Algoritmo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-500">Requisiti Totali</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRequirements}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 shadow">
              <div className="text-sm text-green-600">Soddisfatti</div>
              <div className="text-2xl font-bold text-green-700">{stats.satisfiedRequirements}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 shadow">
              <div className="text-sm text-yellow-600">Parziali</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.partiallySatisfiedRequirements}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 shadow">
              <div className="text-sm text-red-600">Non Soddisfatti</div>
              <div className="text-2xl font-bold text-red-700">{stats.unsatisfiedRequirements}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Tasso di Soddisfazione</span>
              <span className="text-sm font-bold text-gray-900">{stats.satisfactionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  stats.satisfactionRate >= 90 ? 'bg-green-500' :
                  stats.satisfactionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${stats.satisfactionRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Bilanciamento Carico di Lavoro</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Media:</span>
                  <span className="font-medium">{stats.workloadBalance.average.toFixed(1)} turni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-medium">{stats.workloadBalance.min} turni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-medium">{stats.workloadBalance.max} turni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Varianza:</span>
                  <span className="font-medium">{stats.workloadBalance.variance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Info Algoritmo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Assegnazioni Totali:</span>
                  <span className="font-medium">{stats.algorithmInfo.totalAssignments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dipendenti Utilizzati:</span>
                  <span className="font-medium">{stats.algorithmInfo.uniqueEmployees} / {employees.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-3">Distribuzione Carico di Lavoro</h3>
            <div className="max-h-48 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-gray-600">Dipendente</th>
                    <th className="text-right py-2 px-2 text-gray-600">Assegnati</th>
                    <th className="text-right py-2 px-2 text-gray-600">Disponibilità</th>
                    <th className="text-right py-2 px-2 text-gray-600">Utilizzo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.workloadBalance.distribution
                    .sort((a, b) => b.assignments - a.assignments)
                    .map(emp => {
                      const usage = emp.availability > 0 ? (emp.assignments / emp.availability) * 100 : 0
                      return (
                        <tr key={emp.employeeId} className="border-b">
                          <td className="py-2 px-2">{emp.employeeName}</td>
                          <td className="text-right py-2 px-2 font-medium">{emp.assignments}</td>
                          <td className="text-right py-2 px-2 text-gray-500">{emp.availability}</td>
                          <td className="text-right py-2 px-2">
                            <span className={`font-medium ${
                              usage > 90 ? 'text-red-600' :
                              usage > 70 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {usage.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

