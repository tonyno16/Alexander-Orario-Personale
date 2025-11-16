export type EmployeeRole = 
  | 'cuoco' 
  | 'aiuto_cuoco' 
  | 'pizzaiolo' 
  | 'aiutopizzaiolo'  // aggiunto per supportare ruoli dallo spreadsheet
  | 'lavapiatti' 
  | 'cameriere' 
  | 'aiuto_cameriere'
  | 'caposala'  // aggiunto per supportare ruoli dallo spreadsheet

export type DayOfWeek = 
  | 'lunedi' 
  | 'martedi' 
  | 'mercoledi' 
  | 'giovedi' 
  | 'venerdi' 
  | 'sabato' 
  | 'domenica'

export type Shift = 'pranzo' | 'cena'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole // Mantenuto per retrocompatibilità
  roles: EmployeeRole[] // Array di ruoli (fino a 3 come nello spreadsheet)
  availability: number // Giorni disponibili a settimana (calcolato da availableDays per retrocompatibilità)
  availableDays: DayOfWeek[] // Giorni della settimana disponibili (vuoto = tutti i giorni)
  availableDates: string[] // Date specifiche disponibili (formato YYYY-MM-DD) - per disponibilità temporanee
  restaurants: string[] // ID ristoranti (vuoto = tutti) - mantenuto per retrocompatibilità
  createdAt?: Date
  updatedAt?: Date
}

export interface Restaurant {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface RoleRequirement {
  role: EmployeeRole
  count: number
}

export interface ShiftRequirement {
  id: string
  restaurantId: string
  day: DayOfWeek
  shift: Shift
  requirements: RoleRequirement[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ShiftAssignment {
  id: string
  restaurantId: string
  employeeId: string
  day: DayOfWeek
  shift: Shift
  role: EmployeeRole
  weekStart: string // YYYY-MM-DD
  createdAt?: Date
}

export interface WeekSchedule {
  weekStart: string // YYYY-MM-DD
  assignments: ShiftAssignment[]
}

export interface EmployeeConflict {
  id: string
  employeeId1: string
  employeeId2: string
  reason?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface EmployeePreference {
  id: string
  employeeId1: string
  employeeId2: string
  weight: number // Default 1.0, >1.0 = preferenza forte
  createdAt?: Date
  updatedAt?: Date
}

export interface EmployeeRestaurantPreference {
  id: string
  employeeId: string
  restaurantId: string
  weight: number // Default 1.0 (X), 3.0 = forte preferenza (XXX)
  createdAt?: Date
  updatedAt?: Date
}

export interface SchedulingParameter {
  id: string
  key: string
  value: any // Json value
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

