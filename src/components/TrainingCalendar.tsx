import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { WeekPlan, WorkoutSession } from "@/lib/trainingPlanGenerator";
import { format, addWeeks, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrainingCalendarProps {
  weeklyStructure: WeekPlan[];
  startDate?: Date;
}

const WORKOUT_COLORS = {
  easy: "bg-green-500/20 text-green-300 border-green-500/30",
  moderate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  intense: "bg-red-500/20 text-red-300 border-red-500/30",
};

const DAY_MAP: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

export function TrainingCalendar({ weeklyStructure, startDate = new Date() }: TrainingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  // Create workout map by date
  const workoutsByDate = new Map<string, WorkoutSession>();
  weeklyStructure.forEach((week) => {
    const weekStart = startOfWeek(addWeeks(startDate, week.week - 1), { weekStartsOn: 1 });
    week.workouts.forEach((workout) => {
      if (workout.scheduledDate) {
        const scheduled = new Date(workout.scheduledDate);
        workoutsByDate.set(format(scheduled, "yyyy-MM-dd"), workout);
      } else {
        const dayOffset = DAY_MAP[workout.day];
        const workoutDate = new Date(weekStart);
        workoutDate.setDate(workoutDate.getDate() + dayOffset);
        workoutsByDate.set(format(workoutDate, "yyyy-MM-dd"), workout);
      }
    });
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateKey = format(date, "yyyy-MM-dd");
      setSelectedWorkout(workoutsByDate.get(dateKey) || null);
    } else {
      setSelectedWorkout(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6 border-2 border-border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={{
              hasWorkout: (date) => workoutsByDate.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              hasWorkout: "bg-primary/20 font-bold",
            }}
            className="rounded-md"
          />
          
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold mb-3">Legenda:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className={WORKOUT_COLORS.easy}>Fácil (70%)</Badge>
              <Badge className={WORKOUT_COLORS.moderate}>Moderado (20%)</Badge>
              <Badge className={WORKOUT_COLORS.intense}>Intenso (10%)</Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="p-6 border-2 border-border">
          <h3 className="text-xl font-bold mb-4">
            {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
          </h3>
          
          {selectedWorkout ? (
            <div className="space-y-4">
              <Badge className={`${WORKOUT_COLORS[selectedWorkout.type]} text-base px-4 py-2`}>
                {selectedWorkout.type === "easy" && "Treino Fácil"}
                {selectedWorkout.type === "moderate" && "Treino Moderado"}
                {selectedWorkout.type === "intense" && "Treino Intenso"}
              </Badge>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração:</span>
                  <span className="font-semibold">{selectedWorkout.duration} min</span>
                </div>
                {selectedWorkout.distance && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distância:</span>
                    <span className="font-semibold">{selectedWorkout.distance} km</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">{selectedWorkout.description}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {selectedDate
                ? "Nenhum treino programado para este dia"
                : "Clique em uma data no calendário para ver os detalhes do treino"}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
