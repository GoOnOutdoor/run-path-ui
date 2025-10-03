// Training Plan Generator Logic

export interface WorkoutSession {
  day: string;
  type: "easy" | "moderate" | "intense";
  duration: number;
  distance?: number;
  description: string;
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
  };
  weekly_structure: WeekPlan[];
  total_volume: number;
  progression_rate: number;
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
  const selectedDays = availableDays.slice(0, frequency);
  
  // Calculate workout distribution
  const easyCount = Math.ceil(frequency * WORKOUT_TYPES.easy.ratio);
  const moderateCount = Math.ceil(frequency * WORKOUT_TYPES.moderate.ratio);
  const intenseCount = frequency - easyCount - moderateCount;
  
  let workoutTypes: Array<"easy" | "moderate" | "intense"> = [
    ...Array(easyCount).fill("easy"),
    ...Array(moderateCount).fill("moderate"),
    ...Array(intenseCount).fill("intense"),
  ];
  
  // Distribute volume
  const volumePerWorkout = weeklyVolume / frequency;
  
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
