import { Employee, Restaurant, ShiftRequirement, ShiftAssignment } from '@/types'

const API_BASE = '/api'

export class ApiService {
  // Employees
  static async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees`)
    if (!res.ok) throw new Error('Failed to fetch employees')
    return res.json()
  }

  static async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create employee')
    }
    return res.json()
  }

  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update employee')
    }
    return res.json()
  }

  static async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to delete employee')
    }
  }

  // Restaurants
  static async getRestaurants(): Promise<Restaurant[]> {
    const res = await fetch(`${API_BASE}/restaurants`)
    if (!res.ok) throw new Error('Failed to fetch restaurants')
    return res.json()
  }

  static async createRestaurant(restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant> {
    const res = await fetch(`${API_BASE}/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restaurant),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create restaurant')
    }
    return res.json()
  }

  static async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    const res = await fetch(`${API_BASE}/restaurants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update restaurant')
    }
    return res.json()
  }

  static async deleteRestaurant(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/restaurants/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to delete restaurant')
    }
  }

  // Requirements
  static async getRequirements(): Promise<ShiftRequirement[]> {
    const res = await fetch(`${API_BASE}/requirements`)
    if (!res.ok) throw new Error('Failed to fetch requirements')
    return res.json()
  }

  static async saveRequirement(requirement: Omit<ShiftRequirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShiftRequirement> {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirement),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to save requirement')
    }
    return res.json()
  }

  static async deleteRequirement(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/requirements?id=${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to delete requirement')
    }
  }

  // Schedules
  static async getSchedule(weekStart: string): Promise<ShiftAssignment[]> {
    const res = await fetch(`${API_BASE}/schedules/${weekStart}`)
    if (!res.ok) throw new Error('Failed to fetch schedule')
    return res.json()
  }

  static async saveSchedule(weekStart: string, assignments: ShiftAssignment[]): Promise<ShiftAssignment[]> {
    const res = await fetch(`${API_BASE}/schedules/${weekStart}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to save schedule')
    }
    return res.json()
  }

  // Init
  static async initializeDatabase(): Promise<void> {
    const res = await fetch(`${API_BASE}/init`, {
      method: 'POST',
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to initialize database')
    }
  }
}

