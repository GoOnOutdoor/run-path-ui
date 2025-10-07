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
import { QUESTIONS, Question, QuestionOption } from "@/lib/questions";

interface QuestionnaireData {
  // Pergunta 1
  objective?: string;

  // Pergunta 2 e 2.5
  event_name?: string;
  event_date?: Date;

  // Pergunta 3
  distance?: string;
  custom_distance?: number;

  // Pergunta 4
  terrain?: string;

  // Pergunta 5
  gender?: string;

  // Pergunta 6
  birth_date?: Date;

  // Pergunta 7
  experience?: string;

  // Pergunta 8
  activity_level?: string;

  // Pergunta 9
  estimated_times?: string;

  // Pergunta 10
  weekly_frequency?: string;

  // Pergunta 11
  available_days?: string[];

  // Pergunta 12
  special_observations?: string;

  // Pergunta 13
  start_date?: Date;
  start_date_option?: string;

  // Pergunta 14
  plan_duration?: string;
  custom_duration?: number;

  // Pergunta 15
  test_frequency?: string;
}

export const Questionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({
    available_days: [],
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
          objective: studentData.objective || undefined,
          event_name: studentData.event_name || undefined,
          event_date: studentData.event_date ? new Date(studentData.event_date) : undefined,
          distance: studentData.distance || undefined,
          custom_distance: studentData.custom_distance || undefined,
          terrain: studentData.terrain || undefined,
          gender: studentData.gender || undefined,
          birth_date: studentData.birth_date ? new Date(studentData.birth_date) : undefined,
          experience: studentData.experience || undefined,
          activity_level: studentData.activity_level || undefined,
          estimated_times: studentData.estimated_times || undefined,
          weekly_frequency: studentData.weekly_frequency?.toString() || undefined,
          available_days: studentData.available_days || [],
          special_observations: studentData.special_observations || undefined,
          start_date: studentData.start_date ? new Date(studentData.start_date) : undefined,
          start_date_option: studentData.start_date_option || undefined,
          plan_duration: studentData.plan_duration || undefined,
          custom_duration: studentData.custom_duration || undefined,
          test_frequency: studentData.test_frequency || undefined,
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
            distance: data.distance,
            custom_distance: data.custom_distance,
            terrain: data.terrain,
            gender: data.gender,
            birth_date: data.birth_date?.toISOString().split('T')[0],
            experience: data.experience,
            activity_level: data.activity_level,
            estimated_times: data.estimated_times,
            weekly_frequency: data.weekly_frequency ? parseInt(data.weekly_frequency) : null,
            available_days: data.available_days,
            special_observations: data.special_observations,
            start_date: data.start_date?.toISOString().split('T')[0],
            start_date_option: data.start_date_option,
            plan_duration: data.plan_duration,
            custom_duration: data.custom_duration,
            test_frequency: data.test_frequency,
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

  // Filtra as perguntas aplicáveis baseado no objetivo selecionado
  const getApplicableQuestions = (): Question[] => {
    const objective = data.objective;

    return QUESTIONS.filter(q => {
      if (q.applicableTo === 'all') return true;
      if (!objective) return q.id === '1'; // Apenas primeira pergunta se não tiver objetivo

      return q.applicableTo.includes(objective);
    }).filter(q => {
      // Pula perguntas já respondidas (se configurado)
      if (q.skipIfAnswered) {
        const fieldName = getFieldName(q.id);
        return !data[fieldName as keyof QuestionnaireData];
      }
      return true;
    });
  };

  const getFieldName = (questionId: string): string => {
    const fieldMap: Record<string, string> = {
      '1': 'objective',
      '2': 'event_name',
      '2.5': 'event_date',
      '3': 'distance',
      '4': 'terrain',
      '5': 'gender',
      '6': 'birth_date',
      '7': 'experience',
      '8': 'activity_level',
      '9': 'estimated_times',
      '10': 'weekly_frequency',
      '11': 'available_days',
      '12': 'special_observations',
      '13': 'start_date_option',
      '14': 'plan_duration',
      '15': 'test_frequency',
    };
    return fieldMap[questionId] || '';
  };

  // Filtros dinâmicos para pergunta 10 (Frequência Semanal)
  const getFilteredFrequencyOptions = (): QuestionOption[] => {
    const baseOptions = QUESTIONS.find(q => q.id === '10')?.options || [];
    let filtered = [...baseOptions];

    // Filtro por objetivo
    if (data.objective === 'first_5k' || data.objective === 'return') {
      filtered = filtered.filter(opt => ['2', '3'].includes(opt.value));
    } else if (data.objective === 'fitness') {
      filtered = filtered.filter(opt => ['2', '3', '4'].includes(opt.value));
    }

    // Filtro por experiência
    if (data.experience === 'beginner') {
      filtered = filtered.filter(opt => !['4', '5', '6'].includes(opt.value));
    } else if (data.experience === 'intermediate') {
      filtered = filtered.filter(opt => !['5', '6'].includes(opt.value));
    } else if (data.experience === 'advanced') {
      filtered = filtered.filter(opt => opt.value !== '6');
    }

    // Filtro por distância
    const distanceValue = data.distance === 'custom' ? data.custom_distance : parseInt(data.distance?.replace('k', '') || '0');
    if (distanceValue > 10) {
      filtered = filtered.filter(opt => opt.value !== '2');
    }

    return filtered;
  };

  // Opções dinâmicas para pergunta 14 (Duração do Plano)
  const getDurationOptions = (): QuestionOption[] => {
    const distanceValue = data.distance === 'custom' ? data.custom_distance : parseInt(data.distance?.replace('k', '') || '0');

    if (distanceValue <= 10) {
      return [
        { value: '8', label: '8 semanas', description: 'Para quem já vem de uma boa sequência de treinos' },
        { value: '10', label: '10 semanas', description: 'Recomendado' },
        { value: '12', label: '12 semanas', description: 'Para quem quer construir uma base sólida' },
        { value: 'custom', label: 'Personalizado' },
      ];
    } else if (distanceValue <= 21) {
      return [
        { value: '10', label: '10 semanas', description: 'Para quem já vem de uma boa sequência de treinos' },
        { value: '12', label: '12 semanas', description: 'Recomendado' },
        { value: '14', label: '14 semanas', description: 'Para quem quer construir uma base sólida' },
        { value: 'custom', label: 'Personalizado' },
      ];
    } else {
      return [
        { value: '14', label: '14 semanas', description: 'Para quem já vem de uma boa sequência de treinos' },
        { value: '16', label: '16 semanas', description: 'Recomendado' },
        { value: '18', label: '18 semanas', description: 'Para quem quer construir uma base sólida' },
        { value: 'custom', label: 'Personalizado' },
      ];
    }
  };

  const getMinDurationWeeks = (): number => {
    const distanceValue = data.distance === 'custom' ? data.custom_distance : parseInt(data.distance?.replace('k', '') || '0');

    if (distanceValue <= 10) return 8;
    if (distanceValue <= 21) return 10;
    return 14;
  };

  // Conversão de data para pergunta 13
  const convertStartDate = (option: string): Date => {
    const today = new Date();

    switch (option) {
      case 'today':
        return today;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      case 'next_week':
        const nextMonday = new Date(today);
        const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        return nextMonday;
      default:
        return today;
    }
  };

  const questions = getApplicableQuestions();
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canProceed = () => {
    const question = questions[currentStep];
    if (!question.required) return true;

    const fieldName = getFieldName(question.id);
    const value = data[fieldName as keyof QuestionnaireData];

    if (question.type === 'multiple') {
      return Array.isArray(value) && value.length > 0;
    }

    // Para pergunta 13, se escolher custom, precisa ter data selecionada
    if (question.id === '13' && data.start_date_option === 'custom') {
      return !!data.start_date;
    }

    // Para pergunta 3, se escolher custom, precisa ter distância
    if (question.id === '3' && data.distance === 'custom') {
      return !!data.custom_distance;
    }

    // Para pergunta 14, se escolher custom, precisa ter duração
    if (question.id === '14' && data.plan_duration === 'custom') {
      return !!data.custom_duration;
    }

    return !!value;
  };

  const handleNext = () => {
    const question = questions[currentStep];

    // Handle special behaviors
    if (question.id === '1' && data.objective === 'help') {
      navigate('/goal-help');
      return;
    }

    if (question.id === '13' && data.start_date_option && data.start_date_option !== 'custom') {
      updateData({ start_date: convertStartDate(data.start_date_option) });
    }

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
          distance: data.distance,
          custom_distance: data.custom_distance,
          terrain: data.terrain,
          gender: data.gender,
          birth_date: data.birth_date?.toISOString().split('T')[0],
          experience: data.experience,
          activity_level: data.activity_level,
          estimated_times: data.estimated_times,
          weekly_frequency: data.weekly_frequency ? parseInt(data.weekly_frequency) : null,
          available_days: data.available_days,
          special_observations: data.special_observations,
          start_date: data.start_date?.toISOString().split('T')[0],
          start_date_option: data.start_date_option,
          plan_duration: data.plan_duration,
          custom_duration: data.custom_duration,
          test_frequency: data.test_frequency,
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
    const fieldName = getFieldName(question.id);

    switch (question.type) {
      case 'single':
        let options = question.options || [];

        // Aplicar filtros dinâmicos
        if (question.id === '10') {
          options = getFilteredFrequencyOptions();
        } else if (question.id === '14') {
          options = getDurationOptions();
        }

        return (
          <RadioGroup
            value={data[fieldName as keyof QuestionnaireData] as string}
            onValueChange={(value) => updateData({ [fieldName]: value })}
            className="space-y-3"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex flex-col space-y-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  data[fieldName as keyof QuestionnaireData] === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
                onClick={() => updateData({ [fieldName]: option.value })}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1 font-medium">
                    {option.label}
                  </Label>
                </div>
                {option.description && (
                  <p className="text-sm text-muted-foreground ml-7">{option.description}</p>
                )}
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  data.available_days?.includes(option.value)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
                onClick={() => {
                  const currentDays = data.available_days || [];
                  const newDays = currentDays.includes(option.value)
                    ? currentDays.filter((d) => d !== option.value)
                    : [...currentDays, option.value];
                  updateData({ available_days: newDays });
                }}
              >
                <Checkbox
                  checked={data.available_days?.includes(option.value)}
                  id={option.value}
                />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Input
            value={data[fieldName as keyof QuestionnaireData] as string || ""}
            onChange={(e) => updateData({ [fieldName]: e.target.value })}
            placeholder="Digite aqui..."
            className="text-lg p-6"
          />
        );

      case 'date':
        const dateValue = data[fieldName as keyof QuestionnaireData] as Date | undefined;
        const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          const parts = value.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime())) {
                updateData({ [fieldName]: date });
              }
            }
          }
        };

        return (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="DD/MM/AAAA"
              value={dateValue ? format(dateValue, "dd/MM/yyyy") : ""}
              onChange={handleDateInput}
              className="text-lg p-6"
              maxLength={10}
              onKeyDown={(e) => {
                const input = e.currentTarget.value;
                const key = e.key;

                if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) {
                  return;
                }

                if (e.ctrlKey || e.metaKey) {
                  return;
                }

                if (!/[0-9\/]/.test(key)) {
                  e.preventDefault();
                  return;
                }

                if (key !== '/' && /^\d{2}$/.test(input)) {
                  e.currentTarget.value = input + '/';
                } else if (key !== '/' && /^\d{2}\/\d{2}$/.test(input)) {
                  e.currentTarget.value = input + '/';
                }
              }}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Ou selecione no calendário
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => date && updateData({ [fieldName]: date })}
                  disabled={(date) =>
                    question.id === '2.5'
                      ? date < new Date()
                      : date > new Date()
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderizar slider personalizado se aplicável
  const renderCustomSlider = () => {
    const question = questions[currentStep];

    if (question.id === '3' && data.distance === 'custom') {
      return (
        <div className="mt-6 space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold text-primary">{data.custom_distance || 1}</span>
            <span className="text-2xl ml-2">km</span>
          </div>
          <Slider
            value={[data.custom_distance || 1]}
            onValueChange={([value]) => updateData({ custom_distance: value })}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      );
    }

    if (question.id === '14' && data.plan_duration === 'custom') {
      const min = getMinDurationWeeks();
      return (
        <div className="mt-6 space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold text-primary">{data.custom_duration || min}</span>
            <span className="text-2xl ml-2">semanas</span>
          </div>
          <Slider
            value={[data.custom_duration || min]}
            onValueChange={([value]) => updateData({ custom_duration: value })}
            min={min}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{min} semanas</span>
            <span>24 semanas</span>
          </div>
        </div>
      );
    }

    if (question.id === '13' && data.start_date_option === 'custom') {
      return (
        <div className="mt-6 space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-12"
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.start_date ? format(data.start_date, "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.start_date}
                onSelect={(date) => date && updateData({ start_date: date })}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    return null;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando questionário...</p>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold mb-2">{questions[currentStep].title}</h2>
          {questions[currentStep].subtitle && (
            <p className="text-sm text-muted-foreground mb-4">{questions[currentStep].subtitle}</p>
          )}
          {questions[currentStep].note && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-muted-foreground">{questions[currentStep].note}</p>
            </div>
          )}
          {renderQuestion()}
          {renderCustomSlider()}
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
