'use client'

import { useState } from 'react'

interface MonthCalendarProps {
  selectedDates: string[] // Array di date in formato YYYY-MM-DD
  onChange: (dates: string[]) => void
  minDate?: Date
  maxDate?: Date
}

export default function MonthCalendar({ 
  selectedDates, 
  onChange,
  minDate,
  maxDate 
}: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Primo giorno del mese
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Domenica, 1 = Lunedì, etc.
  
  // Aggiusta per iniziare da lunedì (1) invece di domenica (0)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
  
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]
  
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
  
  const toggleDate = (day: number) => {
    const date = new Date(year, month, day)
    const dateString = formatDate(date)
    
    if (selectedDates.includes(dateString)) {
      onChange(selectedDates.filter(d => d !== dateString))
    } else {
      onChange([...selectedDates, dateString].sort())
    }
  }
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }
  
  const isDateSelected = (day: number): boolean => {
    const date = new Date(year, month, day)
    const dateString = formatDate(date)
    return selectedDates.includes(dateString)
  }
  
  const isDateDisabled = (day: number): boolean => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return true // Non permettere date passate
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }
  
  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  const selectAllMonth = () => {
    const dates: string[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (!isDateDisabled(day)) {
        dates.push(formatDate(date))
      }
    }
    // Aggiungi solo le date non già selezionate
    const newDates = [...new Set([...selectedDates, ...dates])].sort()
    onChange(newDates)
  }
  
  const clearMonth = () => {
    // Rimuovi solo le date del mese corrente
    const datesToRemove = selectedDates.filter(date => {
      const dateObj = new Date(date)
      return dateObj.getFullYear() === year && dateObj.getMonth() === month
    })
    onChange(selectedDates.filter(d => !datesToRemove.includes(d)))
  }
  
  const clearAll = () => {
    onChange([])
  }
  
  return (
    <div className="space-y-4">
      {/* Header con navigazione */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-md"
          aria-label="Mese precedente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <button
            type="button"
            onClick={goToToday}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            Vai a oggi
          </button>
        </div>
        
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md"
          aria-label="Mese successivo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Pulsanti azioni rapide */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={selectAllMonth}
          className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          Seleziona tutto il mese
        </button>
        <button
          type="button"
          onClick={clearMonth}
          className="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
        >
          Deseleziona mese
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
        >
          Cancella tutto
        </button>
      </div>
      
      {/* Nomi giorni */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Celle vuote per allineare il primo giorno */}
        {Array.from({ length: adjustedStartingDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {/* Giorni del mese */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const selected = isDateSelected(day)
          const disabled = isDateDisabled(day)
          const today = isToday(day)
          
          return (
            <button
              key={day}
              type="button"
              onClick={() => !disabled && toggleDate(day)}
              disabled={disabled}
              className={`
                aspect-square p-1 text-sm font-medium rounded-md transition-colors
                ${disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : selected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : today
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
      
      {/* Info selezione */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {selectedDates.length > 0 ? (
            <>
              <span className="font-semibold">{selectedDates.length}</span> {selectedDates.length === 1 ? 'giorno' : 'giorni'} selezionati
            </>
          ) : (
            <span className="italic">Nessun giorno selezionato</span>
          )}
        </p>
        {selectedDates.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Prossimi: {selectedDates.slice(0, 3).join(', ')}
            {selectedDates.length > 3 && '...'}
          </p>
        )}
      </div>
    </div>
  )
}

