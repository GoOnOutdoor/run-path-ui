import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Questionnaire } from "@/components/Questionnaire";
import { TrainingCalendar } from "@/components/TrainingCalendar";
import { PlanMetrics } from "@/components/PlanMetrics";
import { generateTrainingPlan, generateTrainingPlanJDCompat, TrainingPlan } from "@/lib/trainingPlanGenerator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, RefreshCw } from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking profile:", error);
        setHasProfile(false);
        return;
      }

      setHasProfile(!!data);
      setStudentData(data);

      // Load existing training plan
      if (data) {
        const { data: planData } = await supabase
          .from("training_plans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planData && planData.plan_data) {
          setTrainingPlan(planData.plan_data as unknown as TrainingPlan);
        }
      }
    };

    if (user) {
      checkProfile();
    }
  }, [user]);

  const handleGeneratePlan = async () => {
    if (!user || !studentData) return;

    setIsGenerating(true);

    try {
      const distanceField = studentData.distance;
      const customDistance = studentData.custom_distance;
      const parsedDistance = distanceField === "custom"
        ? Number(customDistance)
        : Number(String(distanceField || "").replace(/[^0-9.]/g, ""));

      const distanceKm = parsedDistance && !Number.isNaN(parsedDistance) ? parsedDistance : 0;
      const weeklyFrequency = Number(studentData.weekly_frequency) || 3;
      const fallbackDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
      const availableDays: string[] = Array.isArray(studentData.available_days) && studentData.available_days.length > 0
        ? studentData.available_days
        : fallbackDays.slice(0, Math.min(Math.max(weeklyFrequency, 1), fallbackDays.length));
      const startDateISO = studentData.start_date || new Date().toISOString().split("T")[0];
      const eventDateISO = studentData.event_date || undefined;
      const planDurationWeeks = (() => {
        if (studentData.custom_duration) return Number(studentData.custom_duration);
        if (studentData.plan_duration) {
          const num = Number(studentData.plan_duration);
          if (!Number.isNaN(num)) return num;
        }
        return undefined;
      })();

      const athleteName = studentData.full_name || studentData.name || user.email || "Atleta";

      let plan: TrainingPlan;

      if (distanceKm >= 15 && distanceKm <= 50) {
        plan = await generateTrainingPlanJDCompat({
          athleteId: studentData.id || user.id,
          athleteName,
          distanceKm,
          weeklyFrequency,
          availableDaysPT: availableDays,
          startDateISO,
          eventDateISO,
          planDurationWeeks,
          timeEstimates: studentData.estimated_times,
          experience: studentData.experience,
          notes: studentData.special_observations,
        });
      } else {
        plan = generateTrainingPlan(
          studentData.objective,
          String(distanceKm || studentData.distance || "5"),
          weeklyFrequency,
          availableDays,
          planDurationWeeks
        );
        plan.user_profile.start_date = startDateISO;
        plan.user_profile.event_date = eventDateISO ?? null;
      }

      // Save to database
      const { error } = await supabase
        .from("training_plans")
        .insert({
          user_id: user.id,
          plan_data: plan as unknown as any,
        });

      if (error) throw error;

      setTrainingPlan(plan);

      toast({
        title: "Plano gerado!",
        description: "Seu plano de treinos foi criado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPlan = () => {
    if (!trainingPlan) return;

    const dataStr = JSON.stringify(trainingPlan, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `plano-treino-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Plano exportado!",
      description: "Seu plano foi baixado em formato JSON.",
    });
  };

  if (loading || hasProfile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show questionnaire if profile is not complete
  if (!hasProfile) {
    return <Questionnaire />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo, {user.email}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>

        {/* Training Plan Actions */}
        {trainingPlan ? (
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGeneratePlan} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar Novo Plano
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleExportPlan}>
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>
          </div>
        ) : (
          <Card className="p-8 border-2 border-dashed border-border text-center">
            <h3 className="text-xl font-semibold mb-2">Nenhum plano gerado ainda</h3>
            <p className="text-muted-foreground mb-6">
              Clique no botão abaixo para gerar seu plano de treinos personalizado
            </p>
            <Button onClick={handleGeneratePlan} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando Plano...
                </>
              ) : (
                "Gerar Plano de Treinos"
              )}
            </Button>
          </Card>
        )}

        {/* Tabs */}
        {trainingPlan && (
          <Tabs defaultValue="workouts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workouts">Treinos</TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="workouts" className="space-y-6">
              <PlanMetrics plan={trainingPlan} />

              {trainingPlan.jd_zones && (
                <Card className="p-6 border-2 border-border">
                  <h3 className="text-2xl font-bold mb-4">Zonas de Ritmo (Daniels A1–A6)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(trainingPlan.jd_zones).map(([zone, pace]) => (
                      <div key={zone} className="flex flex-col border border-border rounded-md p-3 bg-card/50">
                        <span className="text-xs uppercase text-muted-foreground">{zone}</span>
                        <span className="text-base font-semibold">{pace.paceMinPerKm} – {pace.paceMaxPerKm} min/km</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {trainingPlan.jd_notes && trainingPlan.jd_notes.length > 0 && (
                <Card className="p-6 border-2 border-border">
                  <h3 className="text-2xl font-bold mb-4">Notas e Assunções</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    {trainingPlan.jd_notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </Card>
              )}
              
              <Card className="p-6 border-2 border-border">
                <h3 className="text-2xl font-bold mb-6">Estrutura Semanal</h3>
                <div className="space-y-6">
                  {trainingPlan.weekly_structure.slice(0, 4).map((week) => (
                    <div key={week.week} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">Semana {week.week}</h4>
                        <span className="text-sm text-muted-foreground">
                          Volume: {week.totalVolume.toFixed(1)} km
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {week.workouts.map((workout, idx) => (
                          <Card key={idx} className="p-4 bg-card/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium capitalize">
                                {workout.day}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  workout.type === "easy"
                                    ? "bg-green-500/20 text-green-300"
                                    : workout.type === "moderate"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {workout.type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{workout.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <TrainingCalendar
                weeklyStructure={trainingPlan.weekly_structure}
                startDate={trainingPlan.user_profile.start_date ? new Date(trainingPlan.user_profile.start_date) : undefined}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6 border-2 border-border">
                <h3 className="text-2xl font-bold mb-4">Configurações do Plano</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Objetivo:</label>
                    <p className="text-muted-foreground">{studentData?.objective}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Distância Meta:</label>
                    <p className="text-muted-foreground">
                      {studentData?.distance === "custom"
                        ? `${studentData?.custom_distance ?? 0} km`
                        : studentData?.distance?.includes("k")
                        ? studentData.distance
                        : studentData?.distance
                        ? `${studentData.distance} km`
                        : "N/D"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Frequência Semanal:</label>
                    <p className="text-muted-foreground">{studentData?.weekly_frequency}x por semana</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dias Disponíveis:</label>
                    <p className="text-muted-foreground">{studentData?.available_days?.join(", ")}</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/summary")}>
                    Editar Perfil
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Logo */}
        <div className="fixed bottom-4 right-4 opacity-70">
          <img
            src="/logo-gon-outdoor.png"
            alt="GON Outdoor"
            className="w-16 h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
