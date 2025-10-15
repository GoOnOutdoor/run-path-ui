import { generateJDPlan } from "@/lib/jd/generator";
import type { JDZones, WeekdayPT } from "@/lib/jd/types";

// Training Plan Generator Logic

export interface WorkoutSession {
  day: string;
  type: "easy" | "moderate" | "intense";
  duration: number;
  distance?: number;
  description: string;
  scheduledDate?: string;
}

export interface WeekPlan {
  week: number;
  workouts: WorkoutSession[];
  totalVolume: number;
}

export interface TrainingPlan {
  user_profile: {
    objective: string;
    target_distance: string;
    weekly_frequency: number;
    plan_duration: number;
    available_days: string[];
    start_date?: string;
    event_date?: string | null;
  };
  weekly_structure: WeekPlan[];
  total_volume: number;
  progression_rate: number;
  jd_zones?: JDZones;
  jd_notes?: string[];
}

const WORKOUT_TYPES = {
  easy: { ratio: 0.7, intensity: "Fácil", pace: "Conversação confortável" },
  moderate: { ratio: 0.2, intensity: "Moderado", pace: "Conversação difícil" },
  intense: { ratio: 0.1, intensity: "Intenso", pace: "Sem conversação" },
};

const DISTANCE_TEMPLATES = {
  "5": { minWeeks: 8, maxWeeks: 12, baseVolume: 15 },
  "10": { minWeeks: 10, maxWeeks: 14, baseVolume: 25 },
  "21": { minWeeks: 12, maxWeeks: 16, baseVolume: 40 },
  "42": { minWeeks: 16, maxWeeks: 20, baseVolume: 60 },
};

const WEEKDAY_MAP: Record<string, string> = {
  Segunda: "monday",
  Terça: "tuesday",
  Quarta: "wednesday",
  Quinta: "thursday",
  Sexta: "friday",
  Sábado: "saturday",
  Domingo: "sunday",
};

function getDistanceCategory(distance: string): keyof typeof DISTANCE_TEMPLATES {
  const dist = parseInt(distance);
  if (dist <= 5) return "5";
  if (dist <= 10) return "10";
  if (dist <= 21) return "21";
  return "42";
}

function calculateWeeklyVolume(
  baseVolume: number,
  week: number,
  totalWeeks: number,
  frequency: number
): number {
  const progressionFactor = week / totalWeeks;
  const peakWeek = Math.floor(totalWeeks * 0.8);
  
  if (week < peakWeek) {
    return baseVolume * (1 + progressionFactor * 0.5) * (frequency / 3);
  } else if (week === peakWeek) {
    return baseVolume * 1.5 * (frequency / 3);
  } else {
    // Taper
    const taperFactor = 1 - ((week - peakWeek) / (totalWeeks - peakWeek)) * 0.4;
    return baseVolume * 1.5 * taperFactor * (frequency / 3);
  }
}

function distributeWorkouts(
  weeklyVolume: number,
  frequency: number,
  availableDays: string[]
): WorkoutSession[] {
  const workouts: WorkoutSession[] = [];
  const freq = Math.max(1, Math.floor(frequency || 1));
  const selectedDays = availableDays.slice(0, freq);

  // Calculate workout distribution
  let easyCount = Math.round(freq * WORKOUT_TYPES.easy.ratio);
  let moderateCount = Math.round(freq * WORKOUT_TYPES.moderate.ratio);
  let intenseCount = freq - easyCount - moderateCount;

  if (intenseCount < 0) {
    moderateCount = Math.max(0, moderateCount + intenseCount); // reduce moderate if negative spill
    intenseCount = 0;
  }

  while (easyCount + moderateCount + intenseCount > freq) {
    if (moderateCount > 0) moderateCount--;
    else if (easyCount > 0) easyCount--;
    else break;
  }

  while (easyCount + moderateCount + intenseCount < freq) {
    easyCount++;
  }

  const workoutTypes: Array<"easy" | "moderate" | "intense"> = [
    ...Array(easyCount > 0 ? easyCount : 0).fill("easy"),
    ...Array(moderateCount > 0 ? moderateCount : 0).fill("moderate"),
    ...Array(intenseCount > 0 ? intenseCount : 0).fill("intense"),
  ];

  // Distribute volume
  const volumePerWorkout = weeklyVolume / freq;

  selectedDays.forEach((dayPT, index) => {
    const day = WEEKDAY_MAP[dayPT] || "monday";
    const type = workoutTypes[index] || "easy";
    const duration = Math.round(volumePerWorkout * 60); // Convert to minutes
    const distance = Math.round(volumePerWorkout * 10) / 10;
    
    let description = "";
    switch (type) {
      case "easy":
        description = `Corrida fácil de ${duration} min (~${distance}km). ${WORKOUT_TYPES.easy.pace}.`;
        break;
      case "moderate":
        description = `Treino moderado de ${duration} min (~${distance}km). ${WORKOUT_TYPES.moderate.pace}.`;
        break;
      case "intense":
        description = `Treino intenso de ${duration} min (~${distance}km). ${WORKOUT_TYPES.intense.pace}.`;
        break;
    }
    
    workouts.push({ day, type, duration, distance, description });
  });
  
  return workouts;
}

export function generateTrainingPlan(
  objective: string,
  distance: string,
  weeklyFrequency: number,
  availableDays: string[],
  planDuration?: number
): TrainingPlan {
  const distCategory = getDistanceCategory(distance);
  const template = DISTANCE_TEMPLATES[distCategory];
  
  // Use provided duration or default to template min
  const totalWeeks = planDuration || template.minWeeks;
  const baseVolume = template.baseVolume;
  
  const weeklyStructure: WeekPlan[] = [];
  let totalVolume = 0;
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weeklyVolume = calculateWeeklyVolume(
      baseVolume,
      week,
      totalWeeks,
      weeklyFrequency
    );
    
    const workouts = distributeWorkouts(weeklyVolume, weeklyFrequency, availableDays);
    
    weeklyStructure.push({
      week,
      workouts,
      totalVolume: weeklyVolume,
    });
    
    totalVolume += weeklyVolume;
  }
  
  return {
    user_profile: {
      objective,
      target_distance: distance,
      weekly_frequency: weeklyFrequency,
      plan_duration: totalWeeks,
      available_days: availableDays,
    },
    weekly_structure: weeklyStructure,
    total_volume: totalVolume,
    progression_rate: 1.1, // 10% weekly progression
  };
}

// Daniels-based generator (compat wrapper)
// Produces the same TrainingPlan shape using the advanced JD engine under src/lib/jd
export interface JDCompatParams {
  athleteId: string;
  athleteName: string;
  distanceKm: number;
  weeklyFrequency: number;
  availableDaysPT: string[]; // e.g., ["Seg","Qua","Sáb"]
  startDateISO: string; // YYYY-MM-DD
  eventDateISO?: string;
  planDurationWeeks?: number; // used if eventDate not provided
  timeEstimates?: string; // e.g., "10k em 45:00 e 21k em 1:45"
  experience?: string;
  notes?: string;
}

export async function generateTrainingPlanJDCompat(params: JDCompatParams): Promise<TrainingPlan> {
  const availableDaysJD = params.availableDaysPT.map((day) => day as WeekdayPT);
  const jd = generateJDPlan({
    athleteId: params.athleteId,
    athleteName: params.athleteName,
    startDate: params.startDateISO,
    eventDate: params.eventDateISO,
    planDurationWeeks: params.planDurationWeeks,
    distanceKm: params.distanceKm,
    weeklyFrequency: params.weeklyFrequency,
    availableDays: availableDaysJD,
    timeEstimates: params.timeEstimates,
    specialObservations: params.notes,
    experience: params.experience || "unknown",
  });

  // Map JD sessions to simple calendar-friendly buckets
  type SimpleType = "easy" | "moderate" | "intense";
  const mapType = (w: string): SimpleType => {
    if (w === "Corrida Leve") return "easy";
    if (w === "Long Run") return "moderate";
    if (w === "Fartlek" || w === "Contínuo" || w === "Progressivo") return "moderate";
    return "intense"; // Limiar, Intervalado, Tempo Run, Teste, Race Day
  };

  // Group by week
  const weeksMap = new Map<number, WeekPlan>();
  let totalVolumeKm = 0;
  for (const s of jd.sessions) {
    const type = mapType(s.workoutType);
    const wk = weeksMap.get(s.weekNumber) || { week: s.weekNumber, workouts: [], totalVolume: 0 };
    const dt = new Date(s.date);
    const dow = dt.getDay(); // 0..6 (Sun..Sat)
    const dayStr = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][dow];
    wk.workouts.push({
      day: dayStr,
      type,
      duration: s.durationMinutes,
      distance: s.distanceKm ?? undefined,
      description: s.description,
      scheduledDate: s.date,
    });
    const rawKm = s.distanceKm ?? (s.durationMinutes / 60) * 10; // fallback: 10 km/h ~ 6:00 pace
    const sessionKm = parseFloat(rawKm.toFixed(1));
    wk.totalVolume += sessionKm;
    totalVolumeKm += sessionKm;
    weeksMap.set(s.weekNumber, wk);
  }

  const weekly_structure = Array.from(weeksMap.values()).sort((a, b) => a.week - b.week);

  return {
    user_profile: {
      objective: "Daniels",
      target_distance: String(params.distanceKm),
      weekly_frequency: params.weeklyFrequency,
      plan_duration: weekly_structure.length,
      available_days: params.availableDaysPT,
      start_date: params.startDateISO,
      event_date: params.eventDateISO ?? null,
    },
    weekly_structure,
    total_volume: totalVolumeKm,
    progression_rate: 1.1,
    jd_zones: jd.zones,
    jd_notes: jd.notesAndAssumptions,
  };
}
