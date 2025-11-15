import { Employee, Restaurant, ShiftRequirement, ShiftAssignment, DayOfWeek, Shift, EmployeeRole } from '@/types'

const DAYS_OF_WEEK: DayOfWeek[] = [
  'lunedi',
  'martedi',
  'mercoledi',
  'giovedi',
  'venerdi',
  'sabato',
  'domenica',
]

const SHIFTS: Shift[] = ['pranzo', 'cena']

interface EmployeeAvailability {
  employee: Employee
  assignmentsCount: number
  remainingAvailability: number
}

export class SchedulerService {
  /**
   * Genera gli assegnamenti dei turni per una settimana
   */
  static generateSchedule(
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string
  ): ShiftAssignment[] {
    const assignments: ShiftAssignment[] = []
    
    // Crea una mappa delle disponibilità dei dipendenti
    const employeeAvailabilityMap = new Map<string, EmployeeAvailability>()
    employees.forEach(emp => {
      employeeAvailabilityMap.set(emp.id, {
        employee: emp,
        assignmentsCount: 0,
        remainingAvailability: emp.availability,
      })
    })

    // Itera su tutti i giorni, turni e ristoranti
    for (const day of DAYS_OF_WEEK) {
      for (const shift of SHIFTS) {
        for (const restaurant of restaurants) {
          // Trova i requisiti per questo ristorante/giorno/turno
          const requirement = requirements.find(
            req =>
              req.restaurantId === restaurant.id &&
              req.day === day &&
              req.shift === shift
          )

          if (!requirement || !requirement.requirements) {
            continue
          }

          // Per ogni ruolo richiesto
          for (const roleReq of requirement.requirements) {
            const needed = roleReq.count
            const role = roleReq.role

            // Trova i dipendenti disponibili per questo ruolo
            const availableEmployees = this.findAvailableEmployees(
              employeeAvailabilityMap,
              restaurant.id,
              day,
              shift,
              role,
              assignments
            )

            // Ordina per disponibilità rimanente (meno disponibilità = priorità)
            availableEmployees.sort(
              (a, b) => a.remainingAvailability - b.remainingAvailability
            )

            // Assegna i dipendenti necessari
            let assigned = 0
            for (const empAvail of availableEmployees) {
              if (assigned >= needed) break
              if (empAvail.remainingAvailability <= 0) continue

              // Crea l'assegnamento
              assignments.push({
                id: `${restaurant.id}-${day}-${shift}-${empAvail.employee.id}-${weekStart}`,
                restaurantId: restaurant.id,
                employeeId: empAvail.employee.id,
                day,
                shift,
                role,
                weekStart,
              })

              // Aggiorna la disponibilità
              empAvail.assignmentsCount++
              empAvail.remainingAvailability--

              assigned++
            }
          }
        }
      }
    }

    return assignments
  }

  /**
   * Trova i dipendenti disponibili per un ruolo specifico
   */
  private static findAvailableEmployees(
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    existingAssignments: ShiftAssignment[]
  ): EmployeeAvailability[] {
    const available: EmployeeAvailability[] = []

    for (const empAvail of employeeAvailabilityMap.values()) {
      const emp = empAvail.employee

      // Verifica che il dipendente abbia il ruolo corretto
      if (emp.role !== role) continue

      // Verifica che il dipendente possa lavorare in questo ristorante
      if (emp.restaurants.length > 0 && !emp.restaurants.includes(restaurantId)) {
        continue
      }

      // Verifica disponibilità ricorrente (giorni della settimana)
      // Se availableDays è vuoto, il dipendente è disponibile tutti i giorni
      if (emp.availableDays && emp.availableDays.length > 0 && !emp.availableDays.includes(day)) {
        continue
      }

      // Verifica disponibilità date specifiche (se configurate)
      // Se availableDates ha valori, il dipendente è disponibile SOLO in quelle date
      // Questo sovrascrive la disponibilità ricorrente (availableDays)
      if (emp.availableDates && emp.availableDates.length > 0) {
        // Calcola la data del giorno corrente nella settimana
        const weekStartDate = new Date(weekStart + 'T00:00:00') // Assicura timezone corretto
        const dayIndex = DAYS_OF_WEEK.indexOf(day)
        const currentDate = new Date(weekStartDate)
        currentDate.setDate(weekStartDate.getDate() + dayIndex)
        const dateString = currentDate.toISOString().split('T')[0] // YYYY-MM-DD
        
        // Se ci sono date specifiche, il dipendente è disponibile SOLO in quelle date
        if (!emp.availableDates.includes(dateString)) {
          continue
        }
      }

      // Verifica che il dipendente abbia ancora disponibilità
      if (empAvail.remainingAvailability <= 0) continue

      // Verifica che il dipendente non sia già assegnato a questo turno
      const alreadyAssigned = existingAssignments.some(
        a =>
          a.employeeId === emp.id &&
          a.day === day &&
          a.shift === shift
      )

      if (alreadyAssigned) continue

      available.push(empAvail)
    }

    return available
  }

  /**
   * Calcola la data di inizio settimana (lunedì) per una data
   */
  static getWeekStart(date: Date = new Date()): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Aggiusta per lunedì = 1
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  /**
   * Formatta una data per la visualizzazione
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

