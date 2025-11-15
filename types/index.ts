export type EmployeeRole = 
  | 'cuoco' 
  | 'aiuto_cuoco' 
  | 'pizzaiolo' 
  | 'lavapiatti' 
  | 'cameriere' 
  | 'aiuto_cameriere'

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
  role: EmployeeRole
  availability: number // Giorni disponibili a settimana
  restaurants: string[] // ID ristoranti (vuoto = tutti)
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

