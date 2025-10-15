// Daniels-based training generator types (A1–A6, periodization, etc.)

export type WeekdayPT =
  | "Seg" | "Segunda" | "Segunda-feira"
  | "Ter" | "Terça" | "Terça-feira"
  | "Qua" | "Quarta" | "Quarta-feira"
  | "Qui" | "Quinta" | "Quinta-feira"
  | "Sex" | "Sexta" | "Sexta-feira"
  | "Sáb" | "Sab" | "Sábado"
  | "Dom" | "Domingo";

export type WeekdayEN =
  | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export const WEEKDAY_PT_TO_EN: Record<WeekdayPT, WeekdayEN> = {
  "Seg": "monday", "Segunda": "monday", "Segunda-feira": "monday",
  "Ter": "tuesday", "Terça": "tuesday", "Terça-feira": "tuesday",
  "Qua": "wednesday", "Quarta": "wednesday", "Quarta-feira": "wednesday",
  "Qui": "thursday", "Quinta": "thursday", "Quinta-feira": "thursday",
  "Sex": "friday", "Sexta": "friday", "Sexta-feira": "friday",
  "Sáb": "saturday", "Sab": "saturday", "Sábado": "saturday",
  "Dom": "sunday", "Domingo": "sunday",
};

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "unknown";

export type JDWorkoutType =
  | "Limiar"
  | "Intervalado"
  | "Fartlek"
  | "Corrida Leve"
  | "Long Run"
  | "Contínuo"
  | "Progressivo"
  | "Tempo Run"
  | "Teste"
  | "Race Day";

export type JDZones = {
  A1: { paceMinPerKm: string; paceMaxPerKm: string };
  A2: { paceMinPerKm: string; paceMaxPerKm: string };
  A3: { paceMinPerKm: string; paceMaxPerKm: string };
  A4: { paceMinPerKm: string; paceMaxPerKm: string };
  A5: { paceMinPerKm: string; paceMaxPerKm: string };
  A6: { paceMinPerKm: string; paceMaxPerKm: string };
};

export interface AthleteInput {
  athleteId: string;
  athleteName: string;
  startDate: string; // ISO date YYYY-MM-DD
  eventDate?: string; // ISO date for race day
  planDurationWeeks?: number; // used if eventDate not provided
  distanceKm: number; // 15–50
  weeklyFrequency: number; // sessions per week
  availableDays: WeekdayPT[]; // strictly respected
  experience?: ExperienceLevel | string;
  timeEstimates?: string; // free-form string with race test(s)
  specialObservations?: string;
  terrain?: string;
}

export interface JDSession {
  weekNumber: number;
  date: string; // YYYY-MM-DD
  workoutType: JDWorkoutType;
  description: string; // detailed instructions with A1–A6 paces
  durationMinutes: number;
  distanceKm: number | null;
  rpe: number; // 0–10
  notes: string;
}

export interface JDPlan {
  zones: JDZones;
  sessions: JDSession[];
  notesAndAssumptions: string[];
}

