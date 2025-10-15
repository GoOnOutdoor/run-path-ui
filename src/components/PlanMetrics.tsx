import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrainingPlan } from "@/lib/trainingPlanGenerator";
import { TrendingUp, Calendar, Target, Zap } from "lucide-react";

interface PlanMetricsProps {
  plan: TrainingPlan;
}

export function PlanMetrics({ plan }: PlanMetricsProps) {
  const totalWorkouts = plan.weekly_structure.reduce(
    (sum, week) => sum + week.workouts.length,
    0
  );

  const workoutsByType = plan.weekly_structure.reduce(
    (acc, week) => {
      week.workouts.forEach((workout) => {
        acc[workout.type] = (acc[workout.type] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const avgWeeklyVolume = plan.weekly_structure.length
    ? plan.total_volume / plan.weekly_structure.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 border-2 border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Duração Total</p>
            <p className="text-3xl font-bold mt-2">{plan.user_profile.plan_duration}</p>
            <p className="text-sm text-muted-foreground">semanas</p>
          </div>
          <Calendar className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Volume Total</p>
            <p className="text-3xl font-bold mt-2">{plan.total_volume.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">km</p>
          </div>
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Meta</p>
            <p className="text-3xl font-bold mt-2">{plan.user_profile.target_distance}</p>
            <p className="text-sm text-muted-foreground">km</p>
          </div>
          <Target className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6 border-2 border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Treinos Totais</p>
            <p className="text-3xl font-bold mt-2">{totalWorkouts}</p>
            <p className="text-sm text-muted-foreground">sessões</p>
          </div>
          <Zap className="h-8 w-8 text-primary" />
        </div>
      </Card>

      {/* Volume Progress by Week */}
      <Card className="p-6 border-2 border-border col-span-full">
        <h3 className="text-lg font-semibold mb-4">Progressão de Volume Semanal</h3>
        <div className="space-y-3">
          {plan.weekly_structure.slice(0, 5).map((week) => (
            <div key={week.week} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Semana {week.week}</span>
                <span className="font-semibold">{week.totalVolume.toFixed(1)} km</span>
              </div>
              <Progress
                value={avgWeeklyVolume ? (week.totalVolume / avgWeeklyVolume) * 50 : 0}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Workout Distribution */}
      <Card className="p-6 border-2 border-border col-span-full">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Treinos</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {workoutsByType.easy || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Treinos Fáceis</p>
            <p className="text-xs text-muted-foreground">(70% do volume)</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {workoutsByType.moderate || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Treinos Moderados</p>
            <p className="text-xs text-muted-foreground">(20% do volume)</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">
              {workoutsByType.intense || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Treinos Intensos</p>
            <p className="text-xs text-muted-foreground">(10% do volume)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
