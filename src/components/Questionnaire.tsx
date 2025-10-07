import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface QuestionnaireData {
  objective: string;
  event_name?: string;
  event_date?: Date;
  activity_level?: string;
  weekly_frequency: number;
  available_days: string[];
  distance: string;
  time_goal?: number;
  birth_date?: Date;
  experience?: string;
  injuries?: string;
  observations?: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  options: { value: string; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export const Questionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({
    objective: "",
    weekly_frequency: 3,
    available_days: [],
    distance: "5",
  });

  // Load existing data from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const { data: studentData, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading data:", error);
        return;
      }

      if (studentData) {
        setData({
          objective: studentData.objective || "",
          event_name: studentData.event_name || undefined,
          event_date: studentData.event_date ? new Date(studentData.event_date) : undefined,
          weekly_frequency: studentData.weekly_frequency || 3,
          available_days: studentData.available_days || [],
          distance: studentData.distance || "5",
          birth_date: studentData.birth_date ? new Date(studentData.birth_date) : undefined,
          observations: studentData.observations || "",
        });
      }
    };

    loadData();
  }, [user]);

  // Auto-save to Supabase on data change
  useEffect(() => {
    const saveData = async () => {
      if (!user || currentStep === 0) return;

      const { error } = await supabase
        .from("students")
        .upsert(
          {
            user_id: user.id,
            objective: data.objective,
            event_name: data.event_name,
            event_date: data.event_date?.toISOString().split('T')[0],
            weekly_frequency: data.weekly_frequency,
            available_days: data.available_days,
            distance: data.distance,
            birth_date: data.birth_date?.toISOString().split('T')[0],
            observations: data.observations,
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error("Error saving data:", error);
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [data, user, currentStep]);

  const updateData = (updates: Partial<QuestionnaireData>) => {
    setData({ ...data, ...updates });
  };

  const getQuestions = (): Question[] => {
    const baseQuestions: Question[] = [
      {
        id: "objective",
        title: "Qual seu objetivo na corrida?",
        type: "radio",
        options: [
          { value: "race", label: "Correr uma prova específica" },
          { value: "distance", label: "Correr uma distância específica" },
          { value: "first_5k", label: "Correr meus primeiros 5km" },
          { value: "fitness", label: "Melhorar meu condicionamento físico" },
          { value: "return", label: "Voltar a correr" },
          { value: "help", label: "Me ajude a definir meu objetivo" },
        ],
      },
    ];

    // Conditional questions based on objective
    if (data.objective === "race") {
      baseQuestions.push(
        {
          id: "event_name",
          title: "Qual o nome da prova?",
          type: "text",
          options: [],
        },
        {
          id: "event_date",
          title: "Qual a data da prova?",
          type: "date",
          options: [],
        }
      );
    }

    baseQuestions.push(
      {
        id: "activity_level",
        title: "Qual seu nível atual de atividade física?",
        type: "radio",
        options: [
          { value: "sedentary", label: "Sedentário (não pratico exercícios)" },
          { value: "beginner", label: "Iniciante (1-2x por semana)" },
          { value: "intermediate", label: "Intermediário (3-4x por semana)" },
          { value: "advanced", label: "Avançado (5+ vezes por semana)" },
        ],
      },
      {
        id: "experience",
        title: "Você já correu antes?",
        type: "radio",
        options: [
          { value: "never", label: "Nunca corri" },
          { value: "beginner", label: "Já corri algumas vezes" },
          { value: "regular", label: "Corro regularmente há menos de 1 ano" },
          { value: "experienced", label: "Corro regularmente há mais de 1 ano" },
        ],
      },
      {
        id: "weekly_frequency",
        title: "Quantas vezes por semana você quer treinar?",
        type: "radio",
        options: [
          { value: "2", label: "2 vezes por semana" },
          { value: "3", label: "3 vezes por semana" },
          { value: "4", label: "4 vezes por semana" },
          { value: "5", label: "5 vezes por semana" },
          { value: "6", label: "6 vezes por semana" },
        ],
      },
      {
        id: "available_days",
        title: "Quais dias da semana você pode treinar?",
        type: "checkbox",
        options: WEEKDAYS.map((day) => ({ value: day, label: day })),
      },
      {
        id: "distance",
        title: data.objective === "first_5k" 
          ? "Vamos focar nos seus primeiros 5km!" 
          : "Qual distância você quer correr?",
        type: data.objective === "first_5k" ? "info" : "slider",
        options: [],
        min: 1,
        max: 50,
        unit: "km",
      }
    );

    if (data.objective !== "first_5k") {
      baseQuestions.push({
        id: "time_goal",
        title: "Em quanto tempo você quer alcançar esse objetivo?",
        type: "slider",
        options: [],
        min: 8,
        max: 24,
        unit: "semanas",
      });
    }

    baseQuestions.push(
      {
        id: "birth_date",
        title: "Qual sua data de nascimento?",
        type: "date",
        options: [],
      },
      {
        id: "injuries",
        title: "Você tem ou teve alguma lesão recente?",
        type: "radio",
        options: [
          { value: "no", label: "Não" },
          { value: "yes", label: "Sim, vou detalhar no final" },
        ],
      },
      {
        id: "observations",
        title: "Observações adicionais (lesões, limitações, preferências)",
        type: "textarea",
        options: [],
      }
    );

    return baseQuestions;
  };

  const questions = getQuestions();
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canProceed = () => {
    const question = questions[currentStep];
    switch (question.id) {
      case "objective":
        return !!data.objective;
      case "event_name":
        return !!data.event_name;
      case "event_date":
        return !!data.event_date;
      case "activity_level":
        return !!data.activity_level;
      case "experience":
        return !!data.experience;
      case "weekly_frequency":
        return data.weekly_frequency > 0;
      case "available_days":
        return data.available_days.length > 0;
      case "birth_date":
        return !!data.birth_date;
      case "injuries":
        return !!data.injuries;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("students")
      .upsert(
        {
          user_id: user.id,
          objective: data.objective,
          event_name: data.event_name,
          event_date: data.event_date?.toISOString().split('T')[0],
          weekly_frequency: data.weekly_frequency,
          available_days: data.available_days,
          distance: data.distance,
          birth_date: data.birth_date?.toISOString().split('T')[0],
          observations: data.observations,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Questionário completo!",
        description: "Revise suas respostas antes de finalizar.",
      });
      navigate("/summary");
    }
  };

  const renderQuestion = () => {
    const question = questions[currentStep];

    switch (question.type) {
      case "radio":
        return (
          <RadioGroup
            value={data[question.id as keyof QuestionnaireData] as string}
            onValueChange={(value) => updateData({ [question.id]: value })}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  data[question.id as keyof QuestionnaireData] === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
                onClick={() => updateData({ [question.id]: option.value })}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  data.available_days.includes(option.value)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
                onClick={() => {
                  const newDays = data.available_days.includes(option.value)
                    ? data.available_days.filter((d) => d !== option.value)
                    : [...data.available_days, option.value];
                  updateData({ available_days: newDays });
                }}
              >
                <Checkbox
                  checked={data.available_days.includes(option.value)}
                  id={option.value}
                />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "slider":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">
                {question.id === "distance" ? data.distance : data.time_goal || 12}
              </span>
              <span className="text-2xl ml-2">{question.unit}</span>
            </div>
            <Slider
              value={[
                question.id === "distance"
                  ? parseInt(data.distance)
                  : data.time_goal || 12,
              ]}
              onValueChange={([value]) =>
                updateData({ [question.id]: question.id === "distance" ? String(value) : value })
              }
              min={question.min}
              max={question.max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.min}{question.unit}</span>
              <span>{question.max}{question.unit}</span>
            </div>
          </div>
        );

      case "text":
        return (
          <Input
            value={data[question.id as keyof QuestionnaireData] as string || ""}
            onChange={(e) => updateData({ [question.id]: e.target.value })}
            placeholder="Digite aqui..."
            className="text-lg p-6"
          />
        );

      case "textarea":
        return (
          <textarea
            value={data[question.id as keyof QuestionnaireData] as string || ""}
            onChange={(e) => updateData({ [question.id]: e.target.value })}
            placeholder="Digite suas observações..."
            className="w-full min-h-[150px] p-4 rounded-lg bg-card border-2 border-border focus:border-primary outline-none resize-none"
          />
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-14 text-lg",
                  !data[question.id as keyof QuestionnaireData] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {data[question.id as keyof QuestionnaireData] instanceof Date
                  ? format(data[question.id as keyof QuestionnaireData] as Date, "dd/MM/yyyy")
                  : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data[question.id as keyof QuestionnaireData] as Date}
                onSelect={(date) => date && updateData({ [question.id]: date })}
                disabled={(date) =>
                  question.id === "event_date"
                    ? date < new Date()
                    : date > new Date()
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case "info":
        return (
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-primary mb-4">5km</div>
            <p className="text-lg text-muted-foreground">
              Perfeito para começar! Vamos construir uma base sólida para você.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-card p-8 rounded-xl border-2 border-border animate-fade-in">
          <h2 className="text-2xl font-bold mb-8">{questions[currentStep].title}</h2>
          {renderQuestion()}
        </div>

        <div className="flex gap-4 mt-8">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious} className="flex-1">
              Anterior
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === totalSteps - 1 ? "Finalizar" : "Próxima"}
          </Button>
        </div>
      </div>
    </div>
  );
};
