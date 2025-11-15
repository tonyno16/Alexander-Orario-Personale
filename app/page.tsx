'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ApiService } from '@/lib/api'
import { SchedulerService } from '@/lib/scheduler'
import { Employee, Restaurant, ShiftRequirement } from '@/types'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [requirements, setRequirements] = useState<ShiftRequirement[]>([])

  const initializeDatabase = useCallback(async () => {
    try {
      setInitializing(true)
      await ApiService.initializeDatabase()
      // Ricarica i dati dopo l'inizializzazione
      const [emps, rests, reqs] = await Promise.all([
        ApiService.getEmployees(),
        ApiService.getRestaurants(),
        ApiService.getRequirements(),
      ])
      setEmployees(emps)
      setRestaurants(rests)
      setRequirements(reqs)
    } catch (error) {
      console.error('Error initializing database:', error)
      alert('Errore durante l\'inizializzazione del database')
    } finally {
      setInitializing(false)
    }
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [emps, rests, reqs] = await Promise.all([
        ApiService.getEmployees(),
        ApiService.getRestaurants(),
        ApiService.getRequirements(),
      ])
      setEmployees(emps)
      setRestaurants(rests)
      setRequirements(reqs)

      // Se non ci sono ristoranti, inizializza il database
      if (rests.length === 0) {
        await initializeDatabase()
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [initializeDatabase])

  const initializeDatabase = useCallback(async () => {
    try {
      setInitializing(true)
      await ApiService.initializeDatabase()
      // Ricarica i dati dopo l'inizializzazione
      const [emps, rests, reqs] = await Promise.all([
        ApiService.getEmployees(),
        ApiService.getRestaurants(),
        ApiService.getRequirements(),
      ])
      setEmployees(emps)
      setRestaurants(rests)
      setRequirements(reqs)
    } catch (error) {
      console.error('Error initializing database:', error)
      alert('Errore durante l\'inizializzazione del database')
    } finally {
      setInitializing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const generateSchedule = async () => {
    try {
      setGenerating(true)
      const weekStart = SchedulerService.getWeekStart()
      const assignments = SchedulerService.generateSchedule(
        employees,
        restaurants,
        requirements,
        weekStart
      )
      await ApiService.saveSchedule(weekStart, assignments)
      router.push('/schedule')
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Errore durante la generazione dei turni')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestione Turni
        </h1>
        <p className="text-gray-600">
          Sistema MVP per la gestione dei turni del personale per ristoranti multipli
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Ristoranti
          </h2>
          <p className="text-3xl font-bold text-blue-600">{restaurants.length}</p>
          <p className="text-sm text-gray-500 mt-2">ristoranti configurati</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Dipendenti
          </h2>
          <p className="text-3xl font-bold text-green-600">{employees.length}</p>
          <p className="text-sm text-gray-500 mt-2">dipendenti registrati</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Requisiti
          </h2>
          <p className="text-3xl font-bold text-purple-600">{requirements.length}</p>
          <p className="text-sm text-gray-500 mt-2">requisiti configurati</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Azioni Rapide
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/employees')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Gestisci Dipendenti
          </button>
          <button
            onClick={() => router.push('/requirements')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Configura Requisiti
          </button>
          <button
            onClick={generateSchedule}
            disabled={generating || employees.length === 0 || restaurants.length === 0 || requirements.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {generating ? 'Generazione...' : 'Genera Turni'}
          </button>
          <button
            onClick={() => router.push('/schedule')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Visualizza Turni
          </button>
        </div>
      </div>

      {restaurants.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Il database non è ancora inizializzato. Clicca il pulsante per inizializzare con dati di esempio.
          </p>
          <button
            onClick={initializeDatabase}
            disabled={initializing}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-yellow-400"
          >
            {initializing ? 'Inizializzazione...' : 'Inizializza Database'}
          </button>
        </div>
      )}
    </div>
  )
}

