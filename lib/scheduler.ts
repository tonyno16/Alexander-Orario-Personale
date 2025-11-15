import {
  Employee,
  Restaurant,
  ShiftRequirement,
  ShiftAssignment,
  DayOfWeek,
  Shift,
  EmployeeRole,
} from "@/types";
import { prisma } from "@/lib/prisma";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "lunedi",
  "martedi",
  "mercoledi",
  "giovedi",
  "venerdi",
  "sabato",
  "domenica",
];

const SHIFTS: Shift[] = ["pranzo", "cena"];

interface EmployeeAvailability {
  employee: Employee;
  assignmentsCount: number;
  remainingAvailability: number;
  assignmentsByDay: Map<string, number>; // giorno -> numero di turni assegnati quel giorno
  assignmentsByRestaurant: Map<string, number>; // restaurantId -> numero di turni assegnati
}

interface AssignmentScore {
  employeeAvail: EmployeeAvailability;
  score: number;
  reasons: string[];
}

interface SchedulingOptions {
  avoidSameDayDoubleShift?: boolean; // Evita pranzo+cena stesso giorno stesso dipendente
  balanceWorkload?: boolean; // Bilancia il carico di lavoro tra dipendenti
  preferRestaurantContinuity?: boolean; // Preferisce continuità nello stesso ristorante
  useAdvancedAlgorithm?: boolean; // Usa algoritmo avanzato per casi complessi (default: true)
  maxBacktrackDepth?: number; // Profondità massima per backtracking (default: 5)
  useBacktracking?: boolean; // Abilita backtracking vero per casi complessi (default: true)
  useLocalSearch?: boolean; // Usa ricerca locale per migliorare soluzioni (default: true)
  maxLocalSearchIterations?: number; // Numero massimo di iterazioni ricerca locale (default: 10)
  avoidConflicts?: boolean; // Evita conflitti tra dipendenti (default: true)
  considerPreferences?: boolean; // Considera preferenze nello scoring (default: true)
  maxDifferentCoworkersPerWeek?: number; // Max dipendenti diversi per settimana (opzionale)
  preferStableTeams?: boolean; // Preferisce mantenere team stabili (default: false)
}

interface RequirementDifficulty {
  requirement: ShiftRequirement;
  roleReq: { role: EmployeeRole; count: number };
  difficulty: number; // Più alto = più difficile da soddisfare
  availableEmployees: number; // Numero di dipendenti disponibili per questo requisito
  criticality: number; // Criticità del requisito (basata su giorno, turno, etc.)
}

export class SchedulerService {
  /**
   * Genera gli assegnamenti dei turni per una settimana con algoritmo migliorato
   * Supporta algoritmo avanzato per casi complessi con analisi di fattibilità globale
   */
  static async generateSchedule(
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions = {}
  ): Promise<ShiftAssignment[]> {
    const defaultOptions: SchedulingOptions = {
      avoidSameDayDoubleShift: true,
      balanceWorkload: true,
      preferRestaurantContinuity: false,
      useAdvancedAlgorithm: true,
      maxBacktrackDepth: 5,
      useBacktracking: true,
      useLocalSearch: true,
      maxLocalSearchIterations: 10,
      avoidConflicts: true,
      considerPreferences: true,
      preferStableTeams: false,
      ...options,
    };

    // Carica conflitti e preferenze se necessario
    let conflicts: Map<string, Set<string>> = new Map();
    let preferences: Map<string, Map<string, number>> = new Map();

    if (defaultOptions.avoidConflicts || defaultOptions.considerPreferences) {
      const employeeIds = employees.map((e) => e.id);
      if (defaultOptions.avoidConflicts) {
        conflicts = await this.loadEmployeeConflicts(employeeIds);
      }
      if (defaultOptions.considerPreferences) {
        preferences = await this.loadEmployeePreferences(employeeIds);
      }
    }

    // Usa algoritmo avanzato per casi complessi se abilitato
    if (defaultOptions.useAdvancedAlgorithm) {
      let assignments = await this.generateScheduleAdvanced(
        employees,
        restaurants,
        requirements,
        weekStart,
        defaultOptions,
        conflicts,
        preferences
      );

      // Applica ricerca locale per migliorare la soluzione se abilitato
      if (defaultOptions.useLocalSearch) {
        assignments = this.improveScheduleWithLocalSearch(
          assignments,
          employees,
          restaurants,
          requirements,
          weekStart,
          defaultOptions,
          conflicts,
          preferences
        );
      }

      return assignments;
    }

    // Algoritmo base (greedy semplice)
    return await this.generateScheduleBasic(
      employees,
      restaurants,
      requirements,
      weekStart,
      defaultOptions,
      conflicts,
      preferences
    );
  }

  /**
   * Algoritmo base (greedy semplice) - mantenuto per retrocompatibilità
   */
  private static async generateScheduleBasic(
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts: Map<string, Set<string>>,
    preferences: Map<string, Map<string, number>>
  ): Promise<ShiftAssignment[]> {
    const assignments: ShiftAssignment[] = [];

    // Crea una mappa delle disponibilità dei dipendenti con tracking avanzato
    const employeeAvailabilityMap = new Map<string, EmployeeAvailability>();
    employees.forEach((emp) => {
      employeeAvailabilityMap.set(emp.id, {
        employee: emp,
        assignmentsCount: 0,
        remainingAvailability: emp.availability,
        assignmentsByDay: new Map(),
        assignmentsByRestaurant: new Map(),
      });
    });

    // Ordina i requisiti per priorità (prima i più critici)
    const sortedRequirements = this.prioritizeRequirements(
      requirements,
      restaurants
    );

    // Itera sui requisiti prioritizzati
    for (const requirement of sortedRequirements) {
      const { restaurantId, day, shift, requirements: roleReqs } = requirement;

      // Per ogni ruolo richiesto
      for (const roleReq of roleReqs) {
        const needed = roleReq.count;
        const role = roleReq.role;

        // Trova i dipendenti disponibili con scoring avanzato
        const scoredEmployees = this.findAndScoreEmployees(
          employeeAvailabilityMap,
          restaurantId,
          day,
          shift,
          role,
          assignments,
          weekStart,
          options,
          conflicts,
          preferences
        );

        // Ordina per score (score più alto = migliore candidato)
        scoredEmployees.sort((a, b) => b.score - a.score);

        // Assegna i dipendenti necessari
        let assigned = 0;
        for (const scored of scoredEmployees) {
          if (assigned >= needed) break;
          if (scored.employeeAvail.remainingAvailability <= 0) continue;

          // Crea l'assegnamento
          assignments.push({
            id: `${restaurantId}-${day}-${shift}-${scored.employeeAvail.employee.id}-${weekStart}`,
            restaurantId,
            employeeId: scored.employeeAvail.employee.id,
            day,
            shift,
            role,
            weekStart,
          });

          // Aggiorna la disponibilità e i contatori
          const empAvail = scored.employeeAvail;
          empAvail.assignmentsCount++;
          empAvail.remainingAvailability--;

          // Aggiorna contatori per giorno
          const dayCount = empAvail.assignmentsByDay.get(day) || 0;
          empAvail.assignmentsByDay.set(day, dayCount + 1);

          // Aggiorna contatori per ristorante
          const restCount =
            empAvail.assignmentsByRestaurant.get(restaurantId) || 0;
          empAvail.assignmentsByRestaurant.set(restaurantId, restCount + 1);

          assigned++;
        }

        // Se non abbiamo abbastanza dipendenti, logga un warning
        if (assigned < needed) {
          console.warn(
            `⚠️ Non è stato possibile assegnare tutti i dipendenti richiesti: ` +
              `${assigned}/${needed} ${role} per ${restaurantId} - ${day} - ${shift}`
          );
        }
      }
    }

    return assignments;
  }

  /**
   * Algoritmo avanzato per casi complessi con analisi di fattibilità globale,
   * priorità basata sulla difficoltà e backtracking opzionale
   */
  private static async generateScheduleAdvanced(
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts: Map<string, Set<string>>,
    preferences: Map<string, Map<string, number>>
  ): Promise<ShiftAssignment[]> {
    // Se backtracking è abilitato, usa algoritmo con backtracking
    if (options.useBacktracking) {
      return await this.generateScheduleWithBacktracking(
        employees,
        restaurants,
        requirements,
        weekStart,
        options,
        conflicts,
        preferences
      );
    }

    // Altrimenti usa algoritmo avanzato senza backtracking (più veloce)
    return await this.generateScheduleAdvancedGreedy(
      employees,
      restaurants,
      requirements,
      weekStart,
      options,
      conflicts,
      preferences
    );
  }

  /**
   * Algoritmo avanzato greedy (senza backtracking) - più veloce ma meno robusto
   */
  private static async generateScheduleAdvancedGreedy(
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts: Map<string, Set<string>>,
    preferences: Map<string, Map<string, number>>
  ): Promise<ShiftAssignment[]> {
    const assignments: ShiftAssignment[] = [];

    // Crea una mappa delle disponibilità dei dipendenti con tracking avanzato
    const employeeAvailabilityMap = new Map<string, EmployeeAvailability>();
    employees.forEach((emp) => {
      employeeAvailabilityMap.set(emp.id, {
        employee: emp,
        assignmentsCount: 0,
        remainingAvailability: emp.availability,
        assignmentsByDay: new Map(),
        assignmentsByRestaurant: new Map(),
      });
    });

    // Analizza la difficoltà di ogni requisito e crea una lista prioritaria
    const requirementDifficulties: RequirementDifficulty[] = [];
    for (const requirement of requirements) {
      const { restaurantId, day, shift, requirements: roleReqs } = requirement;

      for (const roleReq of roleReqs) {
        // Conta quanti dipendenti sono disponibili per questo requisito
        const availableEmployees = this.countAvailableEmployees(
          employeeAvailabilityMap,
          restaurantId,
          day,
          shift,
          roleReq.role,
          [],
          weekStart,
          options,
          conflicts
        );

        // Calcola la difficoltà (rapporto tra richiesti e disponibili)
        const difficulty =
          availableEmployees > 0
            ? roleReq.count / availableEmployees
            : Infinity;

        // Calcola la criticità (basata su giorno e turno)
        const criticality = this.calculateCriticality(day, shift);

        requirementDifficulties.push({
          requirement,
          roleReq,
          difficulty,
          availableEmployees,
          criticality,
        });
      }
    }

    // Ordina per difficoltà (prima i più difficili) e poi per criticità
    requirementDifficulties.sort((a, b) => {
      // Prima per difficoltà (più difficile = prima)
      if (Math.abs(a.difficulty - b.difficulty) > 0.1) {
        return b.difficulty - a.difficulty;
      }
      // Poi per criticità (più critico = prima)
      return b.criticality - a.criticality;
    });

    // Itera sui requisiti ordinati per difficoltà
    for (const reqDiff of requirementDifficulties) {
      const { requirement, roleReq } = reqDiff;
      const { restaurantId, day, shift } = requirement;
      const { role, count: needed } = roleReq;

      // Trova i dipendenti disponibili con scoring avanzato che considera l'impatto futuro
      const scoredEmployees = this.findAndScoreEmployeesWithLookAhead(
        employeeAvailabilityMap,
        restaurantId,
        day,
        shift,
        role,
        assignments,
        weekStart,
        options,
        requirementDifficulties,
        conflicts,
        preferences
      );

      // Ordina per score (score più alto = migliore candidato)
      scoredEmployees.sort((a, b) => b.score - a.score);

      // Assegna i dipendenti necessari
      let assigned = 0;
      for (const scored of scoredEmployees) {
        if (assigned >= needed) break;
        if (scored.employeeAvail.remainingAvailability <= 0) continue;

        // Verifica fattibilità globale prima di assegnare (look-ahead)
        const wouldBlockFuture = this.wouldBlockFutureRequirements(
          scored.employeeAvail.employee.id,
          restaurantId,
          day,
          shift,
          role,
          employeeAvailabilityMap,
          assignments,
          requirementDifficulties,
          weekStart,
          options,
          conflicts
        );

        // Se l'assegnazione bloccherebbe requisiti futuri critici, considera alternative
        if (wouldBlockFuture && assigned < needed - 1) {
          // Prova a trovare un'alternativa migliore
          const alternative = scoredEmployees.find(
            (s) =>
              s.employeeAvail.employee.id !==
                scored.employeeAvail.employee.id && s.score > scored.score * 0.8 // Almeno 80% dello score
          );
          if (
            alternative &&
            !this.wouldBlockFutureRequirements(
              alternative.employeeAvail.employee.id,
              restaurantId,
              day,
              shift,
              role,
              employeeAvailabilityMap,
              assignments,
              requirementDifficulties,
              weekStart,
              options,
              conflicts
            )
          ) {
            // Usa l'alternativa invece
            const empAvail = alternative.employeeAvail;
            assignments.push({
              id: `${restaurantId}-${day}-${shift}-${empAvail.employee.id}-${weekStart}`,
              restaurantId,
              employeeId: empAvail.employee.id,
              day,
              shift,
              role,
              weekStart,
            });

            empAvail.assignmentsCount++;
            empAvail.remainingAvailability--;
            const dayCount = empAvail.assignmentsByDay.get(day) || 0;
            empAvail.assignmentsByDay.set(day, dayCount + 1);
            const restCount =
              empAvail.assignmentsByRestaurant.get(restaurantId) || 0;
            empAvail.assignmentsByRestaurant.set(restaurantId, restCount + 1);
            assigned++;
            continue;
          }
        }

        // Crea l'assegnamento
        assignments.push({
          id: `${restaurantId}-${day}-${shift}-${scored.employeeAvail.employee.id}-${weekStart}`,
          restaurantId,
          employeeId: scored.employeeAvail.employee.id,
          day,
          shift,
          role,
          weekStart,
        });

        // Aggiorna la disponibilità e i contatori
        const empAvail = scored.employeeAvail;
        empAvail.assignmentsCount++;
        empAvail.remainingAvailability--;

        // Aggiorna contatori per giorno
        const dayCount = empAvail.assignmentsByDay.get(day) || 0;
        empAvail.assignmentsByDay.set(day, dayCount + 1);

        // Aggiorna contatori per ristorante
        const restCount =
          empAvail.assignmentsByRestaurant.get(restaurantId) || 0;
        empAvail.assignmentsByRestaurant.set(restaurantId, restCount + 1);

        assigned++;
      }

      // Se non abbiamo abbastanza dipendenti, prova riassegnazione intelligente
      if (assigned < needed) {
        const reassigned = this.tryIntelligentReassignment(
          requirement,
          roleReq,
          assigned,
          needed,
          employeeAvailabilityMap,
          assignments,
          weekStart,
          options,
          conflicts,
          preferences
        );

        if (reassigned > 0) {
          assigned += reassigned;
          console.log(
            `✅ Riassegnazione intelligente: ${reassigned} dipendenti aggiuntivi per ${role} - ${restaurantId} - ${day} - ${shift}`
          );
        }

        if (assigned < needed) {
          console.warn(
            `⚠️ Non è stato possibile assegnare tutti i dipendenti richiesti: ` +
              `${assigned}/${needed} ${role} per ${restaurantId} - ${day} - ${shift}`
          );
        }
      }
    }

    return assignments;
  }

  /**
   * Prova una riassegnazione intelligente per soddisfare requisiti non completati
   * Cerca di riassegnare turni meno critici per liberare dipendenti
   */
  private static tryIntelligentReassignment(
    requirement: ShiftRequirement,
    roleReq: { role: EmployeeRole; count: number },
    currentAssigned: number,
    needed: number,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>,
    preferences?: Map<string, Map<string, number>>
  ): number {
    const { restaurantId, day, shift } = requirement;
    const { role } = roleReq;
    const stillNeeded = needed - currentAssigned;

    if (stillNeeded <= 0) return 0;

    // Trova assegnazioni meno critiche che possono essere riassegnate
    const reassignableAssignments = existingAssignments
      .filter((a) => {
        // Solo assegnazioni dello stesso ruolo
        if (a.role !== role) return false;

        // Solo assegnazioni meno critiche (giorni feriali, pranzo)
        const criticality = this.calculateCriticality(
          a.day as DayOfWeek,
          a.shift as Shift
        );
        const currentCriticality = this.calculateCriticality(day, shift);

        // Riassegna solo se il requisito corrente è più critico
        return criticality < currentCriticality;
      })
      .sort((a, b) => {
        // Ordina per criticità crescente (meno critici prima)
        const critA = this.calculateCriticality(
          a.day as DayOfWeek,
          a.shift as Shift
        );
        const critB = this.calculateCriticality(
          b.day as DayOfWeek,
          b.shift as Shift
        );
        return critA - critB;
      });

    let reassigned = 0;

    // Prova a riassegnare turni meno critici
    for (const reassignable of reassignableAssignments.slice(
      0,
      stillNeeded * 2
    )) {
      const oldEmpId = reassignable.employeeId;
      const oldEmpAvail = employeeAvailabilityMap.get(oldEmpId)!;

      // Verifica se il dipendente può essere riassegnato
      if (
        !this.isEmployeeAvailable(
          oldEmpAvail,
          restaurantId,
          day,
          shift,
          role,
          existingAssignments.filter((a) => a.id !== reassignable.id),
          weekStart,
          options,
          conflicts
        )
      ) {
        continue;
      }

      // Trova un sostituto per il turno riassegnato
      const substitute = this.findSubstitute(
        reassignable,
        oldEmpId,
        employeeAvailabilityMap,
        existingAssignments.filter((a) => a.id !== reassignable.id),
        weekStart,
        options,
        conflicts,
        preferences
      );

      if (substitute) {
        // Riassegna: il vecchio dipendente va al nuovo turno, il sostituto prende il vecchio turno
        reassignable.employeeId = substitute.id;
        reassignable.id = `${reassignable.restaurantId}-${reassignable.day}-${reassignable.shift}-${substitute.id}-${weekStart}`;

        // Crea nuova assegnazione per il requisito corrente
        existingAssignments.push({
          id: `${restaurantId}-${day}-${shift}-${oldEmpId}-${weekStart}`,
          restaurantId,
          employeeId: oldEmpId,
          day,
          shift,
          role,
          weekStart,
        });

        // Aggiorna disponibilità
        oldEmpAvail.assignmentsCount++;
        oldEmpAvail.remainingAvailability--;
        const dayCount = oldEmpAvail.assignmentsByDay.get(day) || 0;
        oldEmpAvail.assignmentsByDay.set(day, dayCount + 1);
        const restCount =
          oldEmpAvail.assignmentsByRestaurant.get(restaurantId) || 0;
        oldEmpAvail.assignmentsByRestaurant.set(restaurantId, restCount + 1);

        const subEmpAvail = employeeAvailabilityMap.get(substitute.id)!;
        subEmpAvail.assignmentsCount++;
        subEmpAvail.remainingAvailability--;
        const subDayCount =
          subEmpAvail.assignmentsByDay.get(reassignable.day as DayOfWeek) || 0;
        subEmpAvail.assignmentsByDay.set(
          reassignable.day as DayOfWeek,
          subDayCount + 1
        );
        const subRestCount =
          subEmpAvail.assignmentsByRestaurant.get(reassignable.restaurantId) ||
          0;
        subEmpAvail.assignmentsByRestaurant.set(
          reassignable.restaurantId,
          subRestCount + 1
        );

        reassigned++;
        if (reassigned >= stillNeeded) {
          break;
        }
      }
    }

    return reassigned;
  }

  /**
   * Trova un sostituto per un'assegnazione
   */
  private static findSubstitute(
    assignment: ShiftAssignment,
    excludeEmployeeId: string,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>,
    preferences?: Map<string, Map<string, number>>
  ): Employee | null {
    const candidates = this.findAndScoreEmployees(
      employeeAvailabilityMap,
      assignment.restaurantId,
      assignment.day as DayOfWeek,
      assignment.shift as Shift,
      assignment.role as EmployeeRole,
      existingAssignments,
      weekStart,
      options,
      conflicts,
      preferences
    );

    // Trova il miglior candidato (escludendo quello da sostituire)
    const bestCandidate = candidates
      .filter((c) => c.employeeAvail.employee.id !== excludeEmployeeId)
      .filter((c) => c.employeeAvail.remainingAvailability > 0)
      .sort((a, b) => b.score - a.score)[0];

    return bestCandidate?.employeeAvail.employee || null;
  }

  /**
   * Algoritmo con backtracking per casi complessi
   * Quando trova un dead-end, torna indietro e prova alternative
   */
  private static async generateScheduleWithBacktracking(
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts: Map<string, Set<string>>,
    preferences: Map<string, Map<string, number>>
  ): Promise<ShiftAssignment[]> {
    // Crea una mappa delle disponibilità dei dipendenti
    const employeeAvailabilityMap = new Map<string, EmployeeAvailability>();
    employees.forEach((emp) => {
      employeeAvailabilityMap.set(emp.id, {
        employee: emp,
        assignmentsCount: 0,
        remainingAvailability: emp.availability,
        assignmentsByDay: new Map(),
        assignmentsByRestaurant: new Map(),
      });
    });

    // Analizza la difficoltà di ogni requisito
    const requirementDifficulties: RequirementDifficulty[] = [];
    for (const requirement of requirements) {
      const { restaurantId, day, shift, requirements: roleReqs } = requirement;

      for (const roleReq of roleReqs) {
        const availableEmployees = this.countAvailableEmployees(
          employeeAvailabilityMap,
          restaurantId,
          day,
          shift,
          roleReq.role,
          [],
          weekStart,
          options,
          conflicts
        );

        const difficulty =
          availableEmployees > 0
            ? roleReq.count / availableEmployees
            : Infinity;

        const criticality = this.calculateCriticality(day, shift);

        requirementDifficulties.push({
          requirement,
          roleReq,
          difficulty,
          availableEmployees,
          criticality,
        });
      }
    }

    // Ordina per difficoltà e criticità
    requirementDifficulties.sort((a, b) => {
      if (Math.abs(a.difficulty - b.difficulty) > 0.1) {
        return b.difficulty - a.difficulty;
      }
      return b.criticality - a.criticality;
    });

    // Usa backtracking ricorsivo
    const result = await this.backtrackSchedule(
      requirementDifficulties,
      0,
      [],
      employeeAvailabilityMap,
      weekStart,
      options,
      0,
      conflicts,
      preferences
    );

    return result.assignments;
  }

  /**
   * Backtracking ricorsivo per trovare una soluzione valida
   */
  private static async backtrackSchedule(
    requirementDifficulties: RequirementDifficulty[],
    index: number,
    currentAssignments: ShiftAssignment[],
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    weekStart: string,
    options: SchedulingOptions,
    depth: number,
    conflicts: Map<string, Set<string>>,
    preferences: Map<string, Map<string, number>>
  ): Promise<{ assignments: ShiftAssignment[]; success: boolean }> {
    // Se abbiamo processato tutti i requisiti, abbiamo una soluzione
    if (index >= requirementDifficulties.length) {
      return { assignments: currentAssignments, success: true };
    }

    // Limite di profondità per evitare ricorsione infinita
    if (depth > (options.maxBacktrackDepth || 5)) {
      return { assignments: currentAssignments, success: false };
    }

    const reqDiff = requirementDifficulties[index];
    const { requirement, roleReq } = reqDiff;
    const { restaurantId, day, shift } = requirement;
    const { role, count: needed } = roleReq;

    // Trova tutti i candidati disponibili
    const scoredEmployees = this.findAndScoreEmployeesWithLookAhead(
      employeeAvailabilityMap,
      restaurantId,
      day,
      shift,
      role,
      currentAssignments,
      weekStart,
      options,
      requirementDifficulties,
      conflicts,
      preferences
    );

    // Ordina per score
    scoredEmployees.sort((a, b) => b.score - a.score);

    // Prova tutte le combinazioni valide di dipendenti per questo requisito
    const candidates = scoredEmployees
      .filter((s) => s.employeeAvail.remainingAvailability > 0)
      .slice(0, Math.min(needed + 2, scoredEmployees.length)); // Limita candidati per performance

    // Genera tutte le combinazioni possibili
    const combinations = this.generateCombinations(candidates, needed);

    // Prova ogni combinazione
    for (const combination of combinations) {
      // Verifica che la combinazione sia valida
      if (
        !this.isCombinationValid(
          combination,
          day,
          shift,
          currentAssignments,
          options,
          conflicts
        )
      ) {
        continue;
      }

      // Applica la combinazione temporaneamente
      const tempAssignments = [...currentAssignments];
      const tempAvailabilityMap = this.cloneAvailabilityMap(
        employeeAvailabilityMap
      );

      for (const scored of combination) {
        const empAvail = tempAvailabilityMap.get(
          scored.employeeAvail.employee.id
        )!;

        tempAssignments.push({
          id: `${restaurantId}-${day}-${shift}-${scored.employeeAvail.employee.id}-${weekStart}`,
          restaurantId,
          employeeId: scored.employeeAvail.employee.id,
          day,
          shift,
          role,
          weekStart,
        });

        empAvail.assignmentsCount++;
        empAvail.remainingAvailability--;
        const dayCount = empAvail.assignmentsByDay.get(day) || 0;
        empAvail.assignmentsByDay.set(day, dayCount + 1);
        const restCount =
          empAvail.assignmentsByRestaurant.get(restaurantId) || 0;
        empAvail.assignmentsByRestaurant.set(restaurantId, restCount + 1);
      }

      // Verifica fattibilità futura
      const futureFeasible = this.checkFutureFeasibility(
        requirementDifficulties,
        index + 1,
        tempAvailabilityMap,
        tempAssignments,
        weekStart,
        options,
        conflicts
      );

      if (!futureFeasible && index < requirementDifficulties.length - 1) {
        // Non è fattibile, prova prossima combinazione
        continue;
      }

      // Ricorsione per prossimo requisito
      const result = await this.backtrackSchedule(
        requirementDifficulties,
        index + 1,
        tempAssignments,
        tempAvailabilityMap,
        weekStart,
        options,
        depth + 1,
        conflicts,
        preferences
      );

      if (result.success) {
        return result;
      }
    }

    // Nessuna combinazione ha funzionato, prova senza questo requisito (se non critico)
    if (reqDiff.criticality < 10) {
      const result = await this.backtrackSchedule(
        requirementDifficulties,
        index + 1,
        currentAssignments,
        employeeAvailabilityMap,
        weekStart,
        options,
        depth + 1,
        conflicts,
        preferences
      );
      if (result.success) {
        console.warn(
          `⚠️ Requisito non soddisfatto: ${role} per ${restaurantId} - ${day} - ${shift}`
        );
        return result;
      }
    }

    return { assignments: currentAssignments, success: false };
  }

  /**
   * Genera tutte le combinazioni possibili di candidati
   */
  private static generateCombinations(
    candidates: AssignmentScore[],
    needed: number
  ): AssignmentScore[][] {
    if (needed === 0) return [[]];
    if (candidates.length < needed) return [];

    const combinations: AssignmentScore[][] = [];

    const generate = (start: number, current: AssignmentScore[]) => {
      if (current.length === needed) {
        combinations.push([...current]);
        return;
      }

      for (let i = start; i < candidates.length; i++) {
        current.push(candidates[i]);
        generate(i + 1, current);
        current.pop();
      }
    };

    generate(0, []);
    return combinations;
  }

  /**
   * Verifica se una combinazione di assegnazioni è valida
   */
  private static isCombinationValid(
    combination: AssignmentScore[],
    day: DayOfWeek,
    shift: Shift,
    existingAssignments: ShiftAssignment[],
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): boolean {
    const employeeIds = new Set(
      combination.map((c) => c.employeeAvail.employee.id)
    );

    // Verifica che non ci siano duplicati
    if (employeeIds.size !== combination.length) {
      return false;
    }

    // Verifica conflitti tra dipendenti nella combinazione stessa
    if (options.avoidConflicts && conflicts) {
      const empIdsArray = Array.from(employeeIds);
      for (let i = 0; i < empIdsArray.length; i++) {
        for (let j = i + 1; j < empIdsArray.length; j++) {
          if (this.hasConflict(empIdsArray[i], empIdsArray[j], conflicts)) {
            return false;
          }
        }
      }
    }

    // Verifica conflitti con assegnazioni esistenti
    for (const scored of combination) {
      const empId = scored.employeeAvail.employee.id;

      // Verifica che non sia già assegnato a questo turno
      if (
        existingAssignments.some(
          (a) => a.employeeId === empId && a.day === day && a.shift === shift
        )
      ) {
        return false;
      }

      // Verifica conflitto pranzo+cena stesso giorno
      if (options.avoidSameDayDoubleShift) {
        const otherShift: Shift = shift === "pranzo" ? "cena" : "pranzo";
        if (
          existingAssignments.some(
            (a) =>
              a.employeeId === empId && a.day === day && a.shift === otherShift
          )
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Clona la mappa delle disponibilità
   */
  private static cloneAvailabilityMap(
    map: Map<string, EmployeeAvailability>
  ): Map<string, EmployeeAvailability> {
    const cloned = new Map<string, EmployeeAvailability>();
    for (const [id, empAvail] of map.entries()) {
      cloned.set(id, {
        employee: empAvail.employee,
        assignmentsCount: empAvail.assignmentsCount,
        remainingAvailability: empAvail.remainingAvailability,
        assignmentsByDay: new Map(empAvail.assignmentsByDay),
        assignmentsByRestaurant: new Map(empAvail.assignmentsByRestaurant),
      });
    }
    return cloned;
  }

  /**
   * Verifica la fattibilità futura dei requisiti rimanenti
   */
  private static checkFutureFeasibility(
    requirementDifficulties: RequirementDifficulty[],
    startIndex: number,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): boolean {
    // Controlla i prossimi requisiti critici
    const remainingReqs = requirementDifficulties.slice(startIndex);
    const criticalReqs = remainingReqs
      .filter((r) => r.criticality >= 15)
      .slice(0, 5);

    for (const reqDiff of criticalReqs) {
      const { requirement, roleReq } = reqDiff;
      const { restaurantId, day, shift } = requirement;
      const { role, count: needed } = roleReq;

      const available = this.countAvailableEmployees(
        employeeAvailabilityMap,
        restaurantId,
        day,
        shift,
        role,
        existingAssignments,
        weekStart,
        options,
        conflicts
      );

      if (available < needed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Migliora una soluzione usando ricerca locale
   */
  private static improveScheduleWithLocalSearch(
    assignments: ShiftAssignment[],
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts: Map<string, Set<string>>,
    preferences: Map<string, Map<string, number>>
  ): ShiftAssignment[] {
    const maxIterations = options.maxLocalSearchIterations || 10;
    let currentAssignments = [...assignments];
    let bestScore = this.evaluateScheduleQuality(
      currentAssignments,
      employees,
      requirements
    );

    for (let iter = 0; iter < maxIterations; iter++) {
      // Trova assegnazioni che possono essere migliorate
      const improvements = this.findLocalImprovements(
        currentAssignments,
        employees,
        restaurants,
        requirements,
        weekStart,
        options,
        conflicts
      );

      if (improvements.length === 0) {
        break; // Nessun miglioramento possibile
      }

      // Applica il miglioramento migliore
      const bestImprovement = improvements[0];
      const newAssignments = this.applyImprovement(
        currentAssignments,
        bestImprovement
      );
      const newScore = this.evaluateScheduleQuality(
        newAssignments,
        employees,
        requirements
      );

      if (newScore > bestScore) {
        currentAssignments = newAssignments;
        bestScore = newScore;
      } else {
        break; // Nessun miglioramento trovato
      }
    }

    return currentAssignments;
  }

  /**
   * Trova miglioramenti locali possibili
   */
  private static findLocalImprovements(
    assignments: ShiftAssignment[],
    employees: Employee[],
    restaurants: Restaurant[],
    requirements: ShiftRequirement[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): Array<{
    type: string;
    from: ShiftAssignment;
    to: ShiftAssignment;
    score: number;
  }> {
    const improvements: Array<{
      type: string;
      from: ShiftAssignment;
      to: ShiftAssignment;
      score: number;
    }> = [];

    // Crea mappa disponibilità
    const employeeAvailabilityMap = new Map<string, EmployeeAvailability>();
    employees.forEach((emp) => {
      const empAssignments = assignments.filter((a) => a.employeeId === emp.id);
      employeeAvailabilityMap.set(emp.id, {
        employee: emp,
        assignmentsCount: empAssignments.length,
        remainingAvailability: Math.max(
          0,
          emp.availability - empAssignments.length
        ),
        assignmentsByDay: new Map(),
        assignmentsByRestaurant: new Map(),
      });

      empAssignments.forEach((a) => {
        const dayCount =
          employeeAvailabilityMap.get(emp.id)!.assignmentsByDay.get(a.day) || 0;
        employeeAvailabilityMap
          .get(emp.id)!
          .assignmentsByDay.set(a.day, dayCount + 1);
        const restCount =
          employeeAvailabilityMap
            .get(emp.id)!
            .assignmentsByRestaurant.get(a.restaurantId) || 0;
        employeeAvailabilityMap
          .get(emp.id)!
          .assignmentsByRestaurant.set(a.restaurantId, restCount + 1);
      });
    });

    // Prova scambi tra assegnazioni
    for (let i = 0; i < assignments.length; i++) {
      for (let j = i + 1; j < assignments.length; j++) {
        const a1 = assignments[i];
        const a2 = assignments[j];

        // Verifica se lo scambio è possibile
        if (
          this.canSwapAssignments(
            a1,
            a2,
            employeeAvailabilityMap,
            assignments,
            weekStart,
            options,
            conflicts
          )
        ) {
          const score = this.calculateSwapScore(
            a1,
            a2,
            employeeAvailabilityMap,
            options
          );
          if (score > 0) {
            improvements.push({
              type: "swap",
              from: a1,
              to: a2,
              score,
            });
          }
        }
      }
    }

    // Ordina per score decrescente
    improvements.sort((a, b) => b.score - a.score);
    return improvements;
  }

  /**
   * Verifica se due assegnazioni possono essere scambiate
   */
  private static canSwapAssignments(
    a1: ShiftAssignment,
    a2: ShiftAssignment,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): boolean {
    // Verifica che i ruoli siano compatibili
    if (a1.role !== a2.role) {
      return false;
    }

    const emp1 = employeeAvailabilityMap.get(a1.employeeId)!;
    const emp2 = employeeAvailabilityMap.get(a2.employeeId)!;

    // Verifica che emp2 possa fare il turno di a1
    if (
      !this.isEmployeeAvailable(
        emp2,
        a1.restaurantId,
        a1.day,
        a1.shift,
        a1.role,
        existingAssignments.filter((a) => a.id !== a2.id),
        weekStart,
        options,
        conflicts
      )
    ) {
      return false;
    }

    // Verifica che emp1 possa fare il turno di a2
    if (
      !this.isEmployeeAvailable(
        emp1,
        a2.restaurantId,
        a2.day,
        a2.shift,
        a2.role,
        existingAssignments.filter((a) => a.id !== a1.id),
        weekStart,
        options,
        conflicts
      )
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calcola lo score di uno scambio
   */
  private static calculateSwapScore(
    a1: ShiftAssignment,
    a2: ShiftAssignment,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    options: SchedulingOptions
  ): number {
    const emp1 = employeeAvailabilityMap.get(a1.employeeId)!;
    const emp2 = employeeAvailabilityMap.get(a2.employeeId)!;

    let score = 0;

    // Bilanciamento carico di lavoro
    if (options.balanceWorkload) {
      const diff1 = emp1.assignmentsCount - emp2.assignmentsCount;
      const diff2 = emp2.assignmentsCount - emp1.assignmentsCount;
      score += Math.abs(diff1) - Math.abs(diff2); // Migliora se riduce la differenza
    }

    // Continuità ristorante
    if (options.preferRestaurantContinuity) {
      const emp1RestCount =
        emp1.assignmentsByRestaurant.get(a2.restaurantId) || 0;
      const emp2RestCount =
        emp2.assignmentsByRestaurant.get(a1.restaurantId) || 0;
      score += (emp1RestCount + emp2RestCount) * 2;
    }

    return score;
  }

  /**
   * Applica un miglioramento a una soluzione
   */
  private static applyImprovement(
    assignments: ShiftAssignment[],
    improvement: { type: string; from: ShiftAssignment; to: ShiftAssignment }
  ): ShiftAssignment[] {
    const newAssignments = [...assignments];

    if (improvement.type === "swap") {
      const idx1 = newAssignments.findIndex(
        (a) => a.id === improvement.from.id
      );
      const idx2 = newAssignments.findIndex((a) => a.id === improvement.to.id);

      if (idx1 !== -1 && idx2 !== -1) {
        // Scambia i dipendenti
        const tempEmpId = newAssignments[idx1].employeeId;
        newAssignments[idx1] = {
          ...newAssignments[idx1],
          employeeId: newAssignments[idx2].employeeId,
        };
        newAssignments[idx2] = {
          ...newAssignments[idx2],
          employeeId: tempEmpId,
        };
      }
    }

    return newAssignments;
  }

  /**
   * Valuta la qualità di una soluzione
   */
  private static evaluateScheduleQuality(
    assignments: ShiftAssignment[],
    employees: Employee[],
    requirements: ShiftRequirement[]
  ): number {
    let score = 1000;

    // Penalità per requisiti non soddisfatti
    for (const req of requirements) {
      const { restaurantId, day, shift, requirements: roleReqs } = req;
      for (const roleReq of roleReqs) {
        const assigned = assignments.filter(
          (a) =>
            a.restaurantId === restaurantId &&
            a.day === day &&
            a.shift === shift &&
            a.role === roleReq.role
        ).length;

        if (assigned < roleReq.count) {
          score -= (roleReq.count - assigned) * 100;
        }
      }
    }

    // Bonus per bilanciamento carico di lavoro
    const employeeCounts = new Map<string, number>();
    assignments.forEach((a) => {
      employeeCounts.set(
        a.employeeId,
        (employeeCounts.get(a.employeeId) || 0) + 1
      );
    });

    if (employeeCounts.size > 0) {
      const counts = Array.from(employeeCounts.values());
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance =
        counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) /
        counts.length;
      score -= variance * 10; // Penalità per varianza alta
    }

    return score;
  }

  /**
   * Priorizza i requisiti per gestire prima i casi più critici
   */
  private static prioritizeRequirements(
    requirements: ShiftRequirement[],
    restaurants: Restaurant[]
  ): ShiftRequirement[] {
    // Ordina per:
    // 1. Giorni della settimana (lunedì prima di domenica)
    // 2. Turni (pranzo prima di cena)
    // 3. Ristoranti (per consistenza)
    return [...requirements].sort((a, b) => {
      const dayOrder =
        DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;

      const shiftOrder = SHIFTS.indexOf(a.shift) - SHIFTS.indexOf(b.shift);
      if (shiftOrder !== 0) return shiftOrder;

      return a.restaurantId.localeCompare(b.restaurantId);
    });
  }

  /**
   * Trova e calcola lo score per ogni dipendente candidato
   */
  private static findAndScoreEmployees(
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>,
    preferences?: Map<string, Map<string, number>>
  ): AssignmentScore[] {
    const scored: AssignmentScore[] = [];

    for (const empAvail of employeeAvailabilityMap.values()) {
      const emp = empAvail.employee;

      // Verifica base disponibilità
      if (
        !this.isEmployeeAvailable(
          empAvail,
          restaurantId,
          day,
          shift,
          role,
          existingAssignments,
          weekStart,
          options,
          conflicts
        )
      ) {
        continue;
      }

      // Calcola lo score
      const score = this.calculateEmployeeScore(
        empAvail,
        restaurantId,
        day,
        shift,
        existingAssignments,
        options,
        preferences
      );

      scored.push({
        employeeAvail: empAvail,
        score,
        reasons: [],
      });
    }

    return scored;
  }

  /**
   * Verifica se un dipendente è disponibile per un turno
   */
  private static isEmployeeAvailable(
    empAvail: EmployeeAvailability,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): boolean {
    const emp = empAvail.employee;

    // Verifica ruolo
    if (emp.role !== role) return false;

    // Verifica ristorante
    if (emp.restaurants.length > 0 && !emp.restaurants.includes(restaurantId)) {
      return false;
    }

    // Verifica disponibilità giorni
    if (
      emp.availableDays &&
      emp.availableDays.length > 0 &&
      !emp.availableDays.includes(day)
    ) {
      return false;
    }

    // Verifica disponibilità date specifiche
    if (emp.availableDates && emp.availableDates.length > 0) {
      const weekStartDate = new Date(weekStart + "T00:00:00");
      const dayIndex = DAYS_OF_WEEK.indexOf(day);
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + dayIndex);
      const dateString = currentDate.toISOString().split("T")[0];

      if (!emp.availableDates.includes(dateString)) {
        return false;
      }
    }

    // Verifica disponibilità rimanente
    if (empAvail.remainingAvailability <= 0) return false;

    // Verifica che non sia già assegnato a questo turno
    const alreadyAssigned = existingAssignments.some(
      (a) => a.employeeId === emp.id && a.day === day && a.shift === shift
    );
    if (alreadyAssigned) return false;

    // Verifica conflitto pranzo+cena stesso giorno (se abilitato)
    if (options.avoidSameDayDoubleShift) {
      const otherShift: Shift = shift === "pranzo" ? "cena" : "pranzo";
      const hasOtherShift = existingAssignments.some(
        (a) =>
          a.employeeId === emp.id && a.day === day && a.shift === otherShift
      );
      if (hasOtherShift) return false;
    }

    // Verifica conflitti con altri dipendenti già assegnati a questo turno (se abilitato)
    if (options.avoidConflicts && conflicts) {
      const otherEmployeesInShift = existingAssignments
        .filter(
          (a) =>
            a.restaurantId === restaurantId &&
            a.day === day &&
            a.shift === shift
        )
        .map((a) => a.employeeId);

      for (const otherEmpId of otherEmployeesInShift) {
        if (this.hasConflict(emp.id, otherEmpId, conflicts)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calcola lo score di un dipendente per un turno specifico
   * Score più alto = migliore candidato
   * Migliorato per gestire meglio casi complessi
   */
  private static calculateEmployeeScore(
    empAvail: EmployeeAvailability,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    existingAssignments: ShiftAssignment[],
    options: SchedulingOptions,
    preferences?: Map<string, Map<string, number>>
  ): number {
    let score = 100; // Score base
    const emp = empAvail.employee;

    // Bilanciamento del carico di lavoro (peso maggiore)
    if (options.balanceWorkload) {
      const avgAssignments = this.getAverageAssignments(existingAssignments);
      const assignmentDiff = avgAssignments - empAvail.assignmentsCount;
      // Bonus maggiore per chi è molto sotto la media
      if (assignmentDiff > 0) {
        score += assignmentDiff * 15; // Bonus aumentato
      } else {
        score += assignmentDiff * 8; // Penalità per chi è sopra la media
      }
    }

    // Disponibilità rimanente (preferisci chi ha più disponibilità)
    // Bonus maggiore se ha molta disponibilità rimanente
    if (empAvail.remainingAvailability > 3) {
      score += empAvail.remainingAvailability * 8; // Bonus maggiore per alta disponibilità
    } else if (empAvail.remainingAvailability > 0) {
      score += empAvail.remainingAvailability * 5; // Bonus normale
    } else {
      score -= 50; // Grande penalità se non ha disponibilità
    }

    // Continuità ristorante (se abilitato)
    if (options.preferRestaurantContinuity) {
      const restCount = empAvail.assignmentsByRestaurant.get(restaurantId) || 0;
      score += restCount * 4; // Bonus aumentato per continuità
    }

    // Evita troppi turni nello stesso giorno (penalità più alta)
    const dayCount = empAvail.assignmentsByDay.get(day) || 0;
    if (dayCount > 0) {
      score -= dayCount * 8; // Penalità aumentata per turni multipli stesso giorno
    }

    // Preferisci dipendenti con meno turni totali (ma non troppo penalizzante)
    score -= empAvail.assignmentsCount * 1.5;

    // Bonus per dipendenti che lavorano raramente in questo ristorante (distribuzione)
    if (!options.preferRestaurantContinuity) {
      const restCount = empAvail.assignmentsByRestaurant.get(restaurantId) || 0;
      const totalAssignments = empAvail.assignmentsCount;
      if (totalAssignments > 0) {
        const restRatio = restCount / totalAssignments;
        // Bonus se ha lavorato poco in questo ristorante (distribuzione migliore)
        if (restRatio < 0.3) {
          score += 5;
        }
      }
    }

    // Penalità per dipendenti con disponibilità molto limitata (preservali per casi critici)
    if (emp.availability <= 2) {
      score -= 10; // Piccola penalità per preservarli
    }

    // Bonus per preferenze con altri dipendenti già assegnati a questo turno (se abilitato)
    if (options.considerPreferences && preferences) {
      const otherEmployeesInShift = existingAssignments
        .filter(
          (a) =>
            a.restaurantId === restaurantId &&
            a.day === day &&
            a.shift === shift
        )
        .map((a) => a.employeeId);

      let preferenceBonus = 0;
      for (const otherEmpId of otherEmployeesInShift) {
        const weight = this.getPreferenceWeight(
          emp.id,
          otherEmpId,
          preferences
        );
        if (weight > 0) {
          preferenceBonus += (weight - 1.0) * 15; // Bonus proporzionale al peso (1.0 = 0, 2.0 = +15)
        }
      }
      score += preferenceBonus;
    }

    return Math.max(0, score); // Assicura che lo score non sia negativo
  }

  /**
   * Calcola la media di assegnamenti tra tutti i dipendenti
   */
  private static getAverageAssignments(assignments: ShiftAssignment[]): number {
    const employeeCounts = new Map<string, number>();
    assignments.forEach((a) => {
      employeeCounts.set(
        a.employeeId,
        (employeeCounts.get(a.employeeId) || 0) + 1
      );
    });

    if (employeeCounts.size === 0) return 0;

    const total = Array.from(employeeCounts.values()).reduce(
      (a, b) => a + b,
      0
    );
    return total / employeeCounts.size;
  }

  /**
   * Calcola la data di inizio settimana (lunedì) per una data
   */
  static getWeekStart(date: Date = new Date()): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Aggiusta per lunedì = 1
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  }

  /**
   * Formatta una data per la visualizzazione
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Calcola statistiche sulla qualità della soluzione generata
   */
  static calculateScheduleStatistics(
    assignments: ShiftAssignment[],
    employees: Employee[],
    requirements: ShiftRequirement[]
  ): {
    totalRequirements: number;
    satisfiedRequirements: number;
    partiallySatisfiedRequirements: number;
    unsatisfiedRequirements: number;
    satisfactionRate: number;
    workloadBalance: {
      average: number;
      min: number;
      max: number;
      variance: number;
      distribution: Array<{
        employeeId: string;
        employeeName: string;
        assignments: number;
        availability: number;
      }>;
    };
    algorithmInfo: {
      totalAssignments: number;
      uniqueEmployees: number;
      assignmentsByRole: Record<string, number>;
      assignmentsByDay: Record<string, number>;
      assignmentsByShift: Record<string, number>;
    };
  } {
    // Analizza requisiti
    const requirementStats = new Map<
      string,
      { required: number; assigned: number }
    >();

    for (const req of requirements) {
      const { restaurantId, day, shift, requirements: roleReqs } = req;
      for (const roleReq of roleReqs) {
        const key = `${restaurantId}-${day}-${shift}-${roleReq.role}`;
        const assigned = assignments.filter(
          (a) =>
            a.restaurantId === restaurantId &&
            a.day === day &&
            a.shift === shift &&
            a.role === roleReq.role
        ).length;

        requirementStats.set(key, {
          required: roleReq.count,
          assigned,
        });
      }
    }

    let satisfied = 0;
    let partiallySatisfied = 0;
    let unsatisfied = 0;

    requirementStats.forEach(({ required, assigned }) => {
      if (assigned >= required) {
        satisfied++;
      } else if (assigned > 0) {
        partiallySatisfied++;
      } else {
        unsatisfied++;
      }
    });

    const total = requirementStats.size;
    const satisfactionRate = total > 0 ? (satisfied / total) * 100 : 0;

    // Analizza bilanciamento carico di lavoro
    const employeeCounts = new Map<string, number>();
    assignments.forEach((a) => {
      employeeCounts.set(
        a.employeeId,
        (employeeCounts.get(a.employeeId) || 0) + 1
      );
    });

    const distribution = employees.map((emp) => ({
      employeeId: emp.id,
      employeeName: emp.name,
      assignments: employeeCounts.get(emp.id) || 0,
      availability: emp.availability,
    }));

    const counts = Array.from(employeeCounts.values());
    const average =
      counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
    const min = counts.length > 0 ? Math.min(...counts) : 0;
    const max = counts.length > 0 ? Math.max(...counts) : 0;
    const variance =
      counts.length > 0
        ? counts.reduce((sum, c) => sum + Math.pow(c - average, 2), 0) /
          counts.length
        : 0;

    // Statistiche algoritmo
    const assignmentsByRole: Record<string, number> = {};
    const assignmentsByDay: Record<string, number> = {};
    const assignmentsByShift: Record<string, number> = {};

    assignments.forEach((a) => {
      assignmentsByRole[a.role] = (assignmentsByRole[a.role] || 0) + 1;
      assignmentsByDay[a.day] = (assignmentsByDay[a.day] || 0) + 1;
      assignmentsByShift[a.shift] = (assignmentsByShift[a.shift] || 0) + 1;
    });

    const uniqueEmployees = new Set(assignments.map((a) => a.employeeId)).size;

    return {
      totalRequirements: total,
      satisfiedRequirements: satisfied,
      partiallySatisfiedRequirements: partiallySatisfied,
      unsatisfiedRequirements: unsatisfied,
      satisfactionRate,
      workloadBalance: {
        average,
        min,
        max,
        variance,
        distribution,
      },
      algorithmInfo: {
        totalAssignments: assignments.length,
        uniqueEmployees,
        assignmentsByRole,
        assignmentsByDay,
        assignmentsByShift,
      },
    };
  }

  /**
   * Carica tutti i conflitti tra dipendenti dal database
   * Ritorna una Map dove la chiave è employeeId1 e il valore è un Set di employeeId2 con cui ha conflitto
   */
  private static async loadEmployeeConflicts(
    employeeIds: string[]
  ): Promise<Map<string, Set<string>>> {
    const conflictsMap = new Map<string, Set<string>>();

    try {
      const conflicts = await prisma.employeeConflict.findMany({
        where: {
          OR: [
            { employeeId1: { in: employeeIds } },
            { employeeId2: { in: employeeIds } },
          ],
        },
      });

      // Costruisce la mappa bidirezionale
      for (const conflict of conflicts) {
        // Aggiungi conflitto in entrambe le direzioni
        if (!conflictsMap.has(conflict.employeeId1)) {
          conflictsMap.set(conflict.employeeId1, new Set());
        }
        conflictsMap.get(conflict.employeeId1)!.add(conflict.employeeId2);

        if (!conflictsMap.has(conflict.employeeId2)) {
          conflictsMap.set(conflict.employeeId2, new Set());
        }
        conflictsMap.get(conflict.employeeId2)!.add(conflict.employeeId1);
      }
    } catch (error) {
      console.error("Error loading employee conflicts:", error);
      // In caso di errore, ritorna mappa vuota (retrocompatibilità)
    }

    return conflictsMap;
  }

  /**
   * Carica tutte le preferenze tra dipendenti dal database
   * Ritorna una Map dove la chiave è employeeId1 e il valore è una Map di employeeId2 -> weight
   */
  private static async loadEmployeePreferences(
    employeeIds: string[]
  ): Promise<Map<string, Map<string, number>>> {
    const preferencesMap = new Map<string, Map<string, number>>();

    try {
      const preferences = await prisma.employeePreference.findMany({
        where: {
          OR: [
            { employeeId1: { in: employeeIds } },
            { employeeId2: { in: employeeIds } },
          ],
        },
      });

      // Costruisce la mappa bidirezionale
      for (const preference of preferences) {
        // Aggiungi preferenza in entrambe le direzioni
        if (!preferencesMap.has(preference.employeeId1)) {
          preferencesMap.set(preference.employeeId1, new Map());
        }
        preferencesMap
          .get(preference.employeeId1)!
          .set(preference.employeeId2, preference.weight);

        if (!preferencesMap.has(preference.employeeId2)) {
          preferencesMap.set(preference.employeeId2, new Map());
        }
        preferencesMap
          .get(preference.employeeId2)!
          .set(preference.employeeId1, preference.weight);
      }
    } catch (error) {
      console.error("Error loading employee preferences:", error);
      // In caso di errore, ritorna mappa vuota (retrocompatibilità)
    }

    return preferencesMap;
  }

  /**
   * Verifica se due dipendenti hanno un conflitto
   */
  private static hasConflict(
    employeeId1: string,
    employeeId2: string,
    conflicts: Map<string, Set<string>>
  ): boolean {
    const conflictsForEmp1 = conflicts.get(employeeId1);
    return conflictsForEmp1 ? conflictsForEmp1.has(employeeId2) : false;
  }

  /**
   * Ottiene il peso della preferenza tra due dipendenti (0 se non c'è preferenza)
   */
  private static getPreferenceWeight(
    employeeId1: string,
    employeeId2: string,
    preferences: Map<string, Map<string, number>>
  ): number {
    const preferencesForEmp1 = preferences.get(employeeId1);
    return preferencesForEmp1 ? preferencesForEmp1.get(employeeId2) || 0 : 0;
  }

  /**
   * Conta quanti dipendenti sono disponibili per un requisito specifico
   */
  private static countAvailableEmployees(
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): number {
    let count = 0;
    for (const empAvail of employeeAvailabilityMap.values()) {
      if (
        this.isEmployeeAvailable(
          empAvail,
          restaurantId,
          day,
          shift,
          role,
          existingAssignments,
          weekStart,
          options,
          conflicts
        )
      ) {
        count++;
      }
    }
    return count;
  }

  /**
   * Calcola la criticità di un requisito basata su giorno e turno
   * Valori più alti = più critico
   */
  private static calculateCriticality(day: DayOfWeek, shift: Shift): number {
    let criticality = 0;

    // Weekend è più critico
    if (day === "sabato" || day === "domenica") {
      criticality += 10;
    }

    // Cena è più critica del pranzo
    if (shift === "cena") {
      criticality += 5;
    }

    // Giorni lavorativi standard
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    criticality += 7 - dayIndex; // Lunedì = 7, Domenica = 0

    return criticality;
  }

  /**
   * Trova e calcola lo score per ogni dipendente candidato con look-ahead
   * Considera l'impatto futuro delle assegnazioni
   */
  private static findAndScoreEmployeesWithLookAhead(
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    existingAssignments: ShiftAssignment[],
    weekStart: string,
    options: SchedulingOptions,
    requirementDifficulties: RequirementDifficulty[],
    conflicts?: Map<string, Set<string>>,
    preferences?: Map<string, Map<string, number>>
  ): AssignmentScore[] {
    const scored: AssignmentScore[] = [];

    for (const empAvail of employeeAvailabilityMap.values()) {
      const emp = empAvail.employee;

      // Verifica base disponibilità
      if (
        !this.isEmployeeAvailable(
          empAvail,
          restaurantId,
          day,
          shift,
          role,
          existingAssignments,
          weekStart,
          options,
          conflicts
        )
      ) {
        continue;
      }

      // Calcola lo score base
      let score = this.calculateEmployeeScore(
        empAvail,
        restaurantId,
        day,
        shift,
        existingAssignments,
        options,
        preferences
      );

      // Penalizza se l'assegnazione bloccherebbe requisiti futuri critici
      const futureImpact = this.calculateFutureImpact(
        emp.id,
        restaurantId,
        day,
        shift,
        role,
        employeeAvailabilityMap,
        existingAssignments,
        requirementDifficulties,
        weekStart,
        options,
        conflicts
      );
      score -= futureImpact * 15; // Penalità per impatto futuro

      scored.push({
        employeeAvail: empAvail,
        score,
        reasons: [],
      });
    }

    return scored;
  }

  /**
   * Calcola l'impatto futuro di un'assegnazione (quanto bloccherebbe requisiti futuri)
   */
  private static calculateFutureImpact(
    employeeId: string,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    existingAssignments: ShiftAssignment[],
    requirementDifficulties: RequirementDifficulty[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): number {
    let impact = 0;

    // Simula l'assegnazione temporanea
    const tempAssignments = [
      ...existingAssignments,
      {
        id: `temp-${employeeId}`,
        restaurantId,
        employeeId,
        day,
        shift,
        role,
        weekStart,
      },
    ];

    // Crea una copia temporanea della mappa disponibilità
    const tempAvailabilityMap = new Map<string, EmployeeAvailability>();
    for (const [id, empAvail] of employeeAvailabilityMap.entries()) {
      tempAvailabilityMap.set(id, {
        employee: empAvail.employee,
        assignmentsCount:
          empAvail.assignmentsCount + (id === employeeId ? 1 : 0),
        remainingAvailability:
          empAvail.remainingAvailability - (id === employeeId ? 1 : 0),
        assignmentsByDay: new Map(empAvail.assignmentsByDay),
        assignmentsByRestaurant: new Map(empAvail.assignmentsByRestaurant),
      });
      if (id === employeeId) {
        const dayCount =
          tempAvailabilityMap.get(id)!.assignmentsByDay.get(day) || 0;
        tempAvailabilityMap.get(id)!.assignmentsByDay.set(day, dayCount + 1);
        const restCount =
          tempAvailabilityMap
            .get(id)!
            .assignmentsByRestaurant.get(restaurantId) || 0;
        tempAvailabilityMap
          .get(id)!
          .assignmentsByRestaurant.set(restaurantId, restCount + 1);
      }
    }

    // Controlla quanti requisiti futuri diventerebbero impossibili o più difficili
    for (const reqDiff of requirementDifficulties) {
      // Salta il requisito corrente
      if (
        reqDiff.requirement.restaurantId === restaurantId &&
        reqDiff.requirement.day === day &&
        reqDiff.requirement.shift === shift &&
        reqDiff.roleReq.role === role
      ) {
        continue;
      }

      const availableAfter = this.countAvailableEmployees(
        tempAvailabilityMap,
        reqDiff.requirement.restaurantId,
        reqDiff.requirement.day,
        reqDiff.requirement.shift,
        reqDiff.roleReq.role,
        tempAssignments,
        weekStart,
        options,
        conflicts
      );

      // Se il requisito diventa impossibile o molto più difficile
      if (availableAfter < reqDiff.roleReq.count) {
        // Più critico è il requisito, più alto è l'impatto
        impact +=
          reqDiff.criticality * (reqDiff.roleReq.count - availableAfter);
      } else if (availableAfter < reqDiff.availableEmployees) {
        // Anche se ancora fattibile, è diventato più difficile
        impact += reqDiff.criticality * 0.5;
      }
    }

    return impact;
  }

  /**
   * Verifica se un'assegnazione bloccherebbe requisiti futuri critici
   */
  private static wouldBlockFutureRequirements(
    employeeId: string,
    restaurantId: string,
    day: DayOfWeek,
    shift: Shift,
    role: EmployeeRole,
    employeeAvailabilityMap: Map<string, EmployeeAvailability>,
    existingAssignments: ShiftAssignment[],
    requirementDifficulties: RequirementDifficulty[],
    weekStart: string,
    options: SchedulingOptions,
    conflicts?: Map<string, Set<string>>
  ): boolean {
    const futureImpact = this.calculateFutureImpact(
      employeeId,
      restaurantId,
      day,
      shift,
      role,
      employeeAvailabilityMap,
      existingAssignments,
      requirementDifficulties,
      weekStart,
      options,
      conflicts
    );

    // Considera che blocca se l'impatto è significativo (soglia arbitraria)
    return futureImpact > 20;
  }
}
