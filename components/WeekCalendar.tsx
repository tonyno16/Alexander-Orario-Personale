'use client'

import { DayOfWeek } from '@/types'

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'lunedi', label: 'Lunedì' },
  { value: 'martedi', label: 'Martedì' },
  { value: 'mercoledi', label: 'Mercoledì' },
  { value: 'giovedi', label: 'Giovedì' },
  { value: 'venerdi', label: 'Venerdì' },
  { value: 'sabato', label: 'Sabato' },
  { value: 'domenica', label: 'Domenica' },
]

interface WeekCalendarProps {
  selectedDays: DayOfWeek[]
  onChange: (days: DayOfWeek[]) => void
}

export default function WeekCalendar({ selectedDays, onChange }: WeekCalendarProps) {
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day))
    } else {
      onChange([...selectedDays, day])
    }
  }

  const selectAll = () => {
    onChange(DAYS.map(d => d.value))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Giorni Disponibili
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Tutti
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Nessuno
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(({ value, label }) => {
          const isSelected = selectedDays.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }
              `}
            >
              {label.substring(0, 3)}
            </button>
          )
        })}
      </div>
      
      {selectedDays.length > 0 && (
        <p className="text-xs text-gray-500">
          {selectedDays.length} {selectedDays.length === 1 ? 'giorno' : 'giorni'} selezionati
        </p>
      )}
      {selectedDays.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          Nessun giorno selezionato = disponibile tutti i giorni
        </p>
      )}
    </div>
  )
}

