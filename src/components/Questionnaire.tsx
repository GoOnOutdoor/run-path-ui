import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
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
  // Pergunta 0: Tipo de corrida
  race_type?: string;

  // Pergunta 1: Objetivo (Asfalto)
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

  // ===== PERGUNTAS DE TRILHA =====
  // T1: Objetivo na Trilha
  trail_objective?: string;

  // T2: Tem prova alvo?
  has_target_race?: string;

  // T2.1-T2.6: Dados da prova alvo
  trail_race_name?: string;
  trail_race_date?: Date;
  trail_race_distance?: number;
  trail_race_elevation?: number;
  trail_race_terrain?: string;
  trail_race_technical_level?: number;
  trail_race_goal?: string;

  // T3-T4: Dados pessoais
  trail_gender?: string;
  trail_birth_date?: Date;

  // T5.A: Experiência em trilhas
  trail_experience?: string;
  trail_max_distance?: number;
  trail_max_elevation?: number;

  // T5.B: Nível de atividade (iniciantes)
  trail_activity_level?: string;

  // T6-T7: Acesso e disponibilidade
  trail_terrain_access?: string[];
  trail_availability?: string;

  // T8-T10: Frequência e dias
  trail_weekly_frequency?: string;
  trail_available_days?: string[];
  trail_trail_days?: string[];

  // T11: Observações
  trail_observations?: string;

  // T12: Data de início (trilha)
  trail_start_date?: Date;
  trail_start_date_option?: string;

  // Store answers dynamically by question ID
  [key: string]: any;
}

export const Questionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>({
    available_days: [],
  });
  const [showGoalHelpBanner, setShowGoalHelpBanner] = useState(false);
  const [dateInputValue, setDateInputValue] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // Handle goal selection from GoalHelp wizard
  useEffect(() => {
    const state = location.state as { selectedGoal?: string; fromGoalHelp?: boolean };
    if (state?.fromGoalHelp && state?.selectedGoal) {
      setData(prev => ({
        ...prev,
        objective: state.selectedGoal,
        race_type: 'road' // GoalHelp is for road running
      }));
      // Clear the state to avoid re-applying
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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

      // Clean up 'help' objective if it was saved
      if (studentData && (studentData.objective === 'help' || studentData.trail_objective === 'trail_help')) {
        await supabase
          .from("students")
          .update({
            objective: studentData.objective === 'help' ? null : studentData.objective,
            trail_objective: studentData.trail_objective === 'trail_help' ? null : studentData.trail_objective,
          })
          .eq("user_id", user.id);
      }

      if (studentData) {
        setData({
          // Pergunta 0 e Asfalto
          race_type: studentData.race_type || undefined,
          objective: (studentData.objective === 'help' ? undefined : studentData.objective) || undefined,
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

          // Trilha
          trail_objective: studentData.trail_objective || undefined,
          has_target_race: studentData.has_target_race || undefined,
          trail_race_name: studentData.trail_race_name || undefined,
          trail_race_date: studentData.trail_race_date ? new Date(studentData.trail_race_date) : undefined,
          trail_race_distance: studentData.trail_race_distance || undefined,
          trail_race_elevation: studentData.trail_race_elevation || undefined,
          trail_race_terrain: studentData.trail_race_terrain || undefined,
          trail_race_technical_level: studentData.trail_race_technical_level || undefined,
          trail_race_goal: studentData.trail_race_goal || undefined,
          trail_gender: studentData.trail_gender || undefined,
          trail_birth_date: studentData.trail_birth_date ? new Date(studentData.trail_birth_date) : undefined,
          trail_experience: studentData.trail_experience || undefined,
          trail_max_distance: studentData.trail_max_distance || undefined,
          trail_max_elevation: studentData.trail_max_elevation || undefined,
          trail_activity_level: studentData.trail_activity_level || undefined,
          trail_terrain_access: studentData.trail_terrain_access || [],
          trail_availability: studentData.trail_availability || undefined,
          trail_weekly_frequency: studentData.trail_weekly_frequency?.toString() || undefined,
          trail_available_days: studentData.trail_available_days || [],
          trail_trail_days: studentData.trail_trail_days || [],
          trail_observations: studentData.trail_observations || undefined,
          trail_start_date: studentData.trail_start_date ? new Date(studentData.trail_start_date) : undefined,
          trail_start_date_option: studentData.trail_start_date_option || undefined,
        });
      }
    };

    loadData();
  }, [user]);

  // Auto-save to Supabase on data change
  useEffect(() => {
    const saveData = async () => {
      if (!user || currentStep === 0) return;

      // Don't save if objective is 'help' (it's a redirect, not a real objective)
      if (data.objective === 'help' || data.trail_objective === 'trail_help') return;

      const { error } = await supabase
        .from("students")
        .upsert(
          {
            user_id: user.id,
            // Pergunta 0 e Asfalto
            race_type: data.race_type,
            objective: data.objective === 'help' ? null : data.objective,
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

            // Trilha
            trail_objective: data.trail_objective,
            has_target_race: data.has_target_race,
            trail_race_name: data.trail_race_name,
            trail_race_date: data.trail_race_date?.toISOString().split('T')[0],
            trail_race_distance: data.trail_race_distance,
            trail_race_elevation: data.trail_race_elevation,
            trail_race_terrain: data.trail_race_terrain,
            trail_race_technical_level: data.trail_race_technical_level,
            trail_race_goal: data.trail_race_goal,
            trail_gender: data.trail_gender,
            trail_birth_date: data.trail_birth_date?.toISOString().split('T')[0],
            trail_experience: data.trail_experience,
            trail_max_distance: data.trail_max_distance,
            trail_max_elevation: data.trail_max_elevation,
            trail_activity_level: data.trail_activity_level,
            trail_terrain_access: data.trail_terrain_access,
            trail_availability: data.trail_availability,
            trail_weekly_frequency: data.trail_weekly_frequency ? parseInt(data.trail_weekly_frequency) : null,
            trail_available_days: data.trail_available_days,
            trail_trail_days: data.trail_trail_days,
            trail_observations: data.trail_observations,
            trail_start_date: data.trail_start_date?.toISOString().split('T')[0],
            trail_start_date_option: data.trail_start_date_option,
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

    // If user selects 'help' objective, navigate immediately to GoalHelp
    if (updates.objective === 'help') {
      setTimeout(() => {
        navigate('/goal-help');
      }, 100);
    }
  };

  // Sincroniza o input de data com o valor atual da pergunta de data
  useEffect(() => {
    const questions = getApplicableQuestions();
    const currentQuestion = questions[currentStep];

    if (currentQuestion && currentQuestion.type === 'date') {
      const fieldName = getFieldName(currentQuestion.id);
      const currentDateValue = data[fieldName as keyof QuestionnaireData] as Date | undefined;

      if (currentDateValue) {
        setDateInputValue(format(currentDateValue, "dd/MM/yyyy"));
      } else {
        setDateInputValue("");
      }
    }
  }, [currentStep, data]);

  // Filtra as perguntas aplicáveis baseado no tipo de corrida e objetivo selecionado
  const getApplicableQuestions = (): Question[] => {
    const raceType = data.race_type;
    const objective = data.objective;
    const trailObjective = data.trail_objective;

    const filteredQuestions = QUESTIONS.filter(q => {
      // Pergunta 0: Tipo de corrida
      if (q.id === '0') {
        // Sempre mostra se não tem race_type
        if (!raceType) return true;
        // Se tem race_type mas ainda NÃO foi marcada como respondida, mantém visível
        if (!answeredQuestions.has('0')) return true;
        // Caso contrário, oculta
        return false;
      }

      // Se não tem race_type, não mostra outras perguntas
      if (!raceType) return false;

      // Pergunta aplicável a todos
      if (q.applicableTo === 'all') return true;

      // Fluxo de ASFALTO
      if (raceType === 'road') {
        // Pergunta 1: Objetivo de asfalto
        if (q.id === '1') {
          // Sempre mostra se não tem objetivo
          if (!objective || objective === 'help') return true;
          // Se tem objective mas ainda NÃO foi marcada como respondida, mantém visível
          if (!answeredQuestions.has('1')) return true;
          // Caso contrário, oculta
          return false;
        }

        // Se não tem objetivo, não mostra outras perguntas
        if (!objective || objective === 'help') return false;

        // Filtra perguntas aplicáveis ao objetivo de asfalto
        return q.applicableTo.includes(objective);
      }

      // Fluxo de TRILHA
      if (raceType === 'trail') {
        // Pergunta T1: Objetivo de trilha
        if (q.id === 'T1') {
          // Sempre mostra se não tem trail_objective
          if (!trailObjective || trailObjective === 'trail_help') return true;
          // Se tem trail_objective mas ainda NÃO foi marcada como respondida, mantém visível
          if (!answeredQuestions.has('T1')) return true;
          // Caso contrário, oculta
          return false;
        }

        // Se não tem trail_objective, não mostra outras perguntas
        if (!trailObjective || trailObjective === 'trail_help') return false;

        // Filtra perguntas aplicáveis ao objetivo de trilha
        return q.applicableTo.includes(trailObjective);
      }

      return false;
    }).filter(q => {
      // Aplica lógica de conditional display
      if (q.conditionalDisplay) {
        const { dependsOn, values } = q.conditionalDisplay;
        const dependentValue = data[getFieldName(dependsOn) as keyof QuestionnaireData];
        return dependentValue && values.includes(dependentValue as string);
      }

      // Pula perguntas já respondidas (se configurado)
      if (q.skipIfAnswered) {
        const fieldName = getFieldName(q.id);
        return !data[fieldName as keyof QuestionnaireData];
      }

      return true;
    });

    return filteredQuestions;
  };

  const getFieldName = (questionId: string): string => {
    const fieldMap: Record<string, string> = {
      // Pergunta 0
      '0': 'race_type',

      // Perguntas de Asfalto
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

      // Perguntas de Trilha
      'T1': 'trail_objective',
      'T2': 'has_target_race',
      'T2.1': 'trail_race_name',
      'T2.2': 'trail_race_date',
      'T2.3': 'trail_race_distance',
      'T2.4': 'trail_race_elevation',
      'T2.5': 'trail_race_terrain',
      'T2.5.1': 'trail_race_technical_level',
      'T2.6': 'trail_race_goal',
      'T3': 'trail_gender',
      'T4': 'trail_birth_date',
      'T5.A': 'trail_experience',
      'T5.A.1': 'trail_max_distance',
      'T5.A.2': 'trail_max_elevation',
      'T5.B': 'trail_activity_level',
      'T6': 'trail_terrain_access',
      'T7': 'trail_availability',
      'T8': 'trail_weekly_frequency',
      'T9': 'trail_available_days',
      'T10': 'trail_trail_days',
      'T11': 'trail_observations',
      'T12': 'trail_start_date_option',
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

  // Guard: se currentStep está além do número de perguntas, ajusta
  useEffect(() => {
    if (currentStep >= questions.length && questions.length > 0) {
      setCurrentStep(questions.length - 1);
    }
  }, [currentStep, questions.length]);


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

    // Para pergunta T12, se escolher custom, precisa ter data selecionada
    if (question.id === 'T12' && data.trail_start_date_option === 'custom') {
      return !!data.trail_start_date;
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
      // Don't save 'help' as objective, clear it
      updateData({ objective: undefined });
      // Show banner when user returns without selecting
      setShowGoalHelpBanner(true);
      navigate('/goal-help');
      return;
    }

    if (question.id === '13' && data.start_date_option && data.start_date_option !== 'custom') {
      updateData({ start_date: convertStartDate(data.start_date_option) });
    }

    if (question.id === 'T12' && data.trail_start_date_option && data.trail_start_date_option !== 'custom') {
      updateData({ trail_start_date: convertStartDate(data.trail_start_date_option) });
    }

    // Marca esta pergunta como respondida E avança para próxima
    // Fazemos isso em um único setState para garantir atomicidade
    setAnsweredQuestions(prev => {
      const newAnswered = new Set(prev).add(question.id);

      // Depois de marcar como respondida, precisamos recalcular as perguntas
      // e encontrar qual será o próximo índice
      // Como não podemos chamar getApplicableQuestions aqui (causaria loop),
      // vamos apenas incrementar o step e deixar o useEffect ajustar
      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          handleFinish();
        }
      }, 0);

      return newAnswered;
    });
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
          // Pergunta 0 e Asfalto
          race_type: data.race_type,
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

          // Trilha
          trail_objective: data.trail_objective,
          has_target_race: data.has_target_race,
          trail_race_name: data.trail_race_name,
          trail_race_date: data.trail_race_date?.toISOString().split('T')[0],
          trail_race_distance: data.trail_race_distance,
          trail_race_elevation: data.trail_race_elevation,
          trail_race_terrain: data.trail_race_terrain,
          trail_race_technical_level: data.trail_race_technical_level,
          trail_race_goal: data.trail_race_goal,
          trail_gender: data.trail_gender,
          trail_birth_date: data.trail_birth_date?.toISOString().split('T')[0],
          trail_experience: data.trail_experience,
          trail_max_distance: data.trail_max_distance,
          trail_max_elevation: data.trail_max_elevation,
          trail_activity_level: data.trail_activity_level,
          trail_terrain_access: data.trail_terrain_access,
          trail_availability: data.trail_availability,
          trail_weekly_frequency: data.trail_weekly_frequency ? parseInt(data.trail_weekly_frequency) : null,
          trail_available_days: data.trail_available_days,
          trail_trail_days: data.trail_trail_days,
          trail_observations: data.trail_observations,
          trail_start_date: data.trail_start_date?.toISOString().split('T')[0],
          trail_start_date_option: data.trail_start_date_option,
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
        const currentValues = (data[fieldName as keyof QuestionnaireData] as string[]) || [];

        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                  currentValues.includes(option.value)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
                onClick={() => {
                  const newValues = currentValues.includes(option.value)
                    ? currentValues.filter((v) => v !== option.value)
                    : [...currentValues, option.value];
                  updateData({ [fieldName]: newValues });
                }}
              >
                <Checkbox
                  checked={currentValues.includes(option.value)}
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

        const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let value = e.target.value.replace(/[^\d\/]/g, ''); // Remove caracteres não numéricos exceto /

          // Auto-adiciona barras
          if (value.length === 2 && dateInputValue.length === 1) {
            value = value + '/';
          } else if (value.length === 5 && dateInputValue.length === 4) {
            value = value + '/';
          }

          // Limita a 10 caracteres (DD/MM/AAAA)
          if (value.length <= 10) {
            setDateInputValue(value);

            // Tenta fazer parse da data quando estiver completa
            if (value.length === 10) {
              const parts = value.split('/');
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year) &&
                    day >= 1 && day <= 31 &&
                    month >= 0 && month <= 11 &&
                    year >= 1900 && year <= 2100) {
                  const date = new Date(year, month, day);
                  if (!isNaN(date.getTime())) {
                    updateData({ [fieldName]: date });
                  }
                }
              }
            } else {
              // Se não estiver completo e havia uma data, limpa
              if (dateValue) {
                updateData({ [fieldName]: undefined });
              }
            }
          }
        };

        return (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="DD/MM/AAAA"
              value={dateInputValue}
              onChange={handleDateInputChange}
              className="text-lg p-6"
              maxLength={10}
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
                  disabled={(date) => {
                    // Perguntas de data da prova permitem apenas datas futuras
                    if (question.id === '2.5' || question.id === 'T2.2') {
                      return date < new Date();
                    }
                    // Pergunta de data de nascimento permite apenas datas passadas
                    return date > new Date();
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={data[fieldName as keyof QuestionnaireData] as number || ""}
            onChange={(e) => updateData({ [fieldName]: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Digite um número..."
            className="text-lg p-6"
          />
        );

      case 'slider':
        const sliderValue = data[fieldName as keyof QuestionnaireData] as number;
        const config = question.sliderConfig || { min: 0, max: 100, step: 1, unit: '' };

        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{sliderValue || config.min}</span>
              <span className="text-2xl ml-2">{config.unit}</span>
            </div>
            <Slider
              value={[sliderValue || config.min]}
              onValueChange={([value]) => updateData({ [fieldName]: value })}
              min={config.min}
              max={config.max}
              step={config.step}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{config.min} {config.unit}</span>
              <span>{config.max} {config.unit}</span>
            </div>
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

    if (question.id === 'T12' && data.trail_start_date_option === 'custom') {
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
                {data.trail_start_date ? format(data.trail_start_date, "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.trail_start_date}
                onSelect={(date) => date && updateData({ trail_start_date: date })}
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

  if (questions.length === 0 || !questions[currentStep]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando questionário...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {showGoalHelpBanner && data.objective === 'help' && (
          <Alert className="mb-6 border-primary bg-primary/10">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Podemos recomendar um objetivo em 30s. Quer tentar?</span>
              <Button
                size="sm"
                variant="default"
                onClick={() => navigate('/goal-help')}
                className="ml-4"
              >
                Sim, me ajude
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
            <div className={cn(
              "rounded-lg p-3 mb-6",
              // Notas em laranja para perguntas específicas de trilha
              ['T2.3', 'T2.4', 'T2.5'].includes(questions[currentStep].id)
                ? "bg-orange-500/10 border border-orange-500/20"
                : "bg-primary/10 border border-primary/20"
            )}>
              <p className={cn(
                "text-sm",
                ['T2.3', 'T2.4', 'T2.5'].includes(questions[currentStep].id)
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground"
              )}>{questions[currentStep].note}</p>
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
