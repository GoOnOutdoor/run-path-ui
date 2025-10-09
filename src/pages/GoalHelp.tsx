import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, HelpCircle, CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

type GoalType = 'race' | 'distance' | 'first_5k' | 'fitness' | 'return';

interface GoalOption {
  value: GoalType;
  label: string;
  microcopy: string;
  benefits: string[];
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'race',
    label: 'Correr uma prova específica',
    microcopy: 'Perfeito para você que já está inscrito em uma prova (ou já tem uma prova em mente) e treinar para ela da maneira mais eficiente e segura o possível.',
    benefits: [
      'Treino personalizado para sua data de prova',
      'Preparação específica para distância e terreno'
    ]
  },
  {
    value: 'distance',
    label: 'Correr uma distância específica',
    microcopy: 'Para aqueles que buscam se desafiar em correr uma distância que nunca correram antes ou querem melhorar suas marcas pessoais nessa distância - sem necessariamente ser em uma prova',
    benefits: [
      'Foco em atingir sua meta de distância',
      'Melhoria progressiva de performance'
    ]
  },
  {
    value: 'first_5k',
    label: 'Correr meus primeiros 5km',
    microcopy: 'Para você que nunca correu e quer começar com o pé direito no mundo das corridas, saindo do zero aos 5km.',
    benefits: [
      'Programa do zero para iniciantes',
      'Progressão segura e sem lesões'
    ]
  },
  {
    value: 'fitness',
    label: 'Melhorar meu condicionamento físico',
    microcopy: 'Um plano para quem quer incluir a corrida em seu estilo de vida. Para pessoas que buscam correr sem cobranças de provas, paces e distâncias.',
    benefits: [
      'Sem pressão de provas ou tempos',
      'Foco em saúde e consistência'
    ]
  },
  {
    value: 'return',
    label: 'Voltar a correr',
    microcopy: 'Você já correu e que bom que está de volta! Perfeito para pessoas que querem retomar a corrida de maneira segura e eficiente, minimizando o risco de lesões e adaptando a sua rotina.',
    benefits: [
      'Retorno gradual e seguro',
      'Adaptado para quem já tem experiência'
    ]
  }
];

type WizardStep = 'step1' | 'step2' | 'step3' | 'recommendation';

interface WizardAnswers {
  hasRace?: boolean;
  wantsFocusDistance?: boolean;
  userDescription?: string;
}

export default function GoalHelp() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('step1');
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [recommendedGoal, setRecommendedGoal] = useState<GoalType | null>(null);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const handleAnswer = (key: keyof WizardAnswers, value: boolean | string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // Lógica de navegação
    if (currentStep === 'step1') {
      if (key === 'hasRace' && value === true) {
        setRecommendedGoal('race');
        setCurrentStep('recommendation');
      } else if (key === 'hasRace' && value === false) {
        setCurrentStep('step2');
      }
    } else if (currentStep === 'step2') {
      if (key === 'wantsFocusDistance' && value === true) {
        setRecommendedGoal('distance');
        setCurrentStep('recommendation');
      } else if (key === 'wantsFocusDistance' && value === false) {
        setCurrentStep('step3');
      }
    } else if (currentStep === 'step3') {
      if (key === 'userDescription') {
        // Determinar recomendação baseada na descrição
        let goal: GoalType = 'fitness';
        if (value === 'beginner') goal = 'first_5k';
        else if (value === 'fitness') goal = 'fitness';
        else if (value === 'return') goal = 'return';

        setRecommendedGoal(goal);
        setCurrentStep('recommendation');
      }
    }
  };

  const handleConfirmGoal = () => {
    if (recommendedGoal) {
      // Navegar de volta ao questionário com o objetivo selecionado
      navigate('/dashboard', {
        state: {
          selectedGoal: recommendedGoal,
          fromGoalHelp: true
        }
      });
    }
  };

  const handleSelectManualGoal = (goal: GoalType) => {
    navigate('/dashboard', {
      state: {
        selectedGoal: goal,
        fromGoalHelp: true
      }
    });
  };

  const getAnswersSummary = () => {
    const summary: string[] = [];

    if (answers.hasRace === true) {
      summary.push('Você já tem uma prova em mente');
    } else if (answers.hasRace === false) {
      summary.push('Você ainda não tem uma prova em mente');

      if (answers.wantsFocusDistance === true) {
        summary.push('Você quer focar em uma distância específica');
      } else if (answers.wantsFocusDistance === false) {
        summary.push('Você não tem certeza sobre focar em uma distância');

        if (answers.userDescription === 'beginner') {
          summary.push('Você é iniciante e quer começar do zero');
        } else if (answers.userDescription === 'fitness') {
          summary.push('Você quer saúde e consistência sem pressão de provas');
        } else if (answers.userDescription === 'return') {
          summary.push('Você já correu antes e está voltando agora');
        }
      }
    }

    return summary;
  };

  const renderHeader = () => (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar ao questionário
      </Button>
      <h1 className="text-3xl font-bold mb-2">Vamos definir seu objetivo em 30 segundos</h1>
      <p className="text-muted-foreground">
        Assim ajustamos seu plano e as próximas perguntas para o que faz mais sentido pra você.
      </p>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Você já tem alguma prova em mente?</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Ter inscrição ou alvo desejado mesmo sem inscrição</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-24 text-lg font-semibold"
          onClick={() => handleAnswer('hasRace', true)}
        >
          Sim, já tenho
        </Button>
        <Button
          variant="outline"
          className="h-24 text-lg font-semibold"
          onClick={() => handleAnswer('hasRace', false)}
        >
          Ainda não
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Você quer focar em uma distância?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-24 text-lg font-semibold"
          onClick={() => handleAnswer('wantsFocusDistance', true)}
        >
          Sim
        </Button>
        <Button
          variant="outline"
          className="h-24 text-lg font-semibold"
          onClick={() => handleAnswer('wantsFocusDistance', false)}
        >
          Não tenho certeza
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Qual dessas descrições parece mais com você hoje?</h2>

      <div className="grid grid-cols-1 gap-4">
        <Card
          className="cursor-pointer hover:border-primary transition-all"
          onClick={() => handleAnswer('userDescription', 'beginner')}
        >
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Sou iniciante e quero começar do zero</h3>
            <p className="text-sm text-muted-foreground">→ Correr meus primeiros 5 km</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-all"
          onClick={() => handleAnswer('userDescription', 'fitness')}
        >
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Quero saúde/consistência sem pressão de provas</h3>
            <p className="text-sm text-muted-foreground">→ Melhorar meu condicionamento físico</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-all"
          onClick={() => handleAnswer('userDescription', 'return')}
        >
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Já corri antes e estou voltando agora</h3>
            <p className="text-sm text-muted-foreground">→ Voltar a correr</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRecommendation = () => {
    const goal = GOAL_OPTIONS.find(g => g.value === recommendedGoal);
    if (!goal) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recomendação para você</h2>

        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-xl mb-2">{goal.label}</h3>
                <p className="text-muted-foreground mb-4">{goal.microcopy}</p>
                <ul className="space-y-2">
                  {goal.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>Como chegamos aqui?</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  {getAnswersSummary().map((answer, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{answer}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-3">
          <Button
            onClick={handleConfirmGoal}
            className="w-full h-12 text-base font-semibold"
          >
            Confirmar objetivo e voltar ao questionário
          </Button>

          <Button
            variant="link"
            onClick={() => setShowAllOptions(true)}
            className="w-full"
          >
            Quero explorar outras opções
          </Button>
        </div>

        {showAllOptions && (
          <div className="space-y-4 mt-6 pt-6 border-t">
            <h3 className="font-semibold text-lg">Todos os objetivos disponíveis</h3>
            <div className="grid grid-cols-1 gap-4">
              {GOAL_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => handleSelectManualGoal(option.value)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{option.label}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{option.microcopy}</p>
                    <ul className="space-y-1">
                      {option.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        {renderHeader()}

        <Card className="p-8">
          {currentStep === 'step1' && renderStep1()}
          {currentStep === 'step2' && renderStep2()}
          {currentStep === 'step3' && renderStep3()}
          {currentStep === 'recommendation' && renderRecommendation()}
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Você pode mudar de objetivo a qualquer momento nas configurações do plano — flexibilidade faz parte do método Go On.
          </p>
        </div>
      </div>
    </div>
  );
}
