export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  note?: string;
  type: 'single' | 'multiple' | 'text' | 'date' | 'slider';
  applicableTo: string[] | 'all';
  required: boolean;
  options?: QuestionOption[];
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };
  skipIfAnswered?: boolean;
  specialBehavior?: string;
}

export const QUESTIONS: Question[] = [
  // Pergunta 1: Objetivo
  {
    id: '1',
    title: 'Qual seu objetivo na corrida?',
    type: 'single',
    applicableTo: 'all',
    required: true,
    options: [
      { value: 'race', label: 'Correr uma prova específica' },
      { value: 'distance', label: 'Correr uma distância específica' },
      { value: 'first_5k', label: 'Correr meus primeiros 5km' },
      { value: 'fitness', label: 'Melhorar meu condicionamento físico' },
      { value: 'return', label: 'Voltar a correr' },
      { value: 'help', label: 'Me ajude a definir meu objetivo' },
    ],
    specialBehavior: 'redirect_goal_help',
  },

  // Pergunta 2: Nome da Prova
  {
    id: '2',
    title: 'Qual o nome da prova?',
    type: 'text',
    applicableTo: ['race'],
    required: true,
  },

  // Pergunta 2.5: Data da Prova
  {
    id: '2.5',
    title: 'Qual a data da prova?',
    type: 'date',
    applicableTo: ['race'],
    required: true,
  },

  // Pergunta 3: Distância
  {
    id: '3',
    title: 'Qual distância?',
    type: 'single',
    applicableTo: ['race', 'distance'],
    required: true,
    options: [
      { value: '5k', label: '5k' },
      { value: '10k', label: '10k' },
      { value: '21k', label: '21k' },
      { value: '42k', label: '42k' },
      { value: 'custom', label: 'Personalizado' },
    ],
    specialBehavior: 'custom_distance_slider',
  },

  // Pergunta 4: Terreno
  {
    id: '4',
    title: 'Qual o terreno da sua prova/objetivo?',
    type: 'single',
    applicableTo: ['race', 'distance'],
    required: true,
    options: [
      {
        value: 'flat',
        label: 'Plano',
        description: 'Não terão subidas durante seu treinamento - recomendados para menos de 5m/km de ganho de elevação na sua prova',
      },
      {
        value: 'light_hills',
        label: 'Desníveis Leves',
        description: 'Poucas subidas durante seu treinamento - recomendados para menos de 7m/km de ganho de elevação na sua prova',
      },
      {
        value: 'moderate_hills',
        label: 'Desníveis Moderados',
        description: 'Poucas subidas durante seu treinamento - recomendados para entre 7m/km e 20m/km de ganho de elevação na sua prova',
      },
      {
        value: 'strong_hills',
        label: 'Desníveis Fortes',
        description: 'Muitas subidas durante seu treinamento - recomendados para mais de 20m/km de ganho de elevação na sua prova',
      },
    ],
  },

  // Pergunta 5: Gênero
  {
    id: '5',
    title: 'Qual seu gênero?',
    type: 'single',
    applicableTo: ['race', 'distance', 'first_5k', 'fitness', 'return'],
    required: true,
    skipIfAnswered: true,
    options: [
      { value: 'male', label: 'Masculino' },
      { value: 'female', label: 'Feminino' },
      { value: 'prefer_not_say', label: 'Prefiro não dizer' },
    ],
  },

  // Pergunta 6: Data de Nascimento
  {
    id: '6',
    title: 'Qual sua data de nascimento?',
    type: 'date',
    applicableTo: ['race', 'distance', 'first_5k', 'fitness', 'return'],
    required: true,
    skipIfAnswered: true,
  },

  // Pergunta 7: Experiência com Corrida
  {
    id: '7',
    title: 'Qual sua experiência com corrida?',
    type: 'single',
    applicableTo: ['race', 'distance', 'fitness'],
    required: true,
    options: [
      { value: 'beginner', label: 'Iniciante', description: 'consegue completar 5km em menos de 50mins' },
      {
        value: 'intermediate',
        label: 'Intermediário',
        description: 'você corre 5km regularmente, mas não tem um plano de treinamento estruturado',
      },
      {
        value: 'advanced',
        label: 'Avançado',
        description: 'Você regularmente corre 10km+ e faz alguns treinos estruturados - exemplo: treino de tiros',
      },
      {
        value: 'elite',
        label: 'Elite',
        description: 'Você corre 21km e/ou 42km regularmente e já está habituado com treinamento estruturado',
      },
    ],
  },

  // Pergunta 8: Nível de Atividade
  {
    id: '8',
    title: 'Qual seu nível atual de atividade física?',
    type: 'single',
    applicableTo: ['first_5k', 'return'],
    required: true,
    options: [
      { value: 'sedentary', label: 'Atualmente não faço nenhum tipo de exercício regular' },
      { value: 'light', label: 'Ocasionalmente pratico atividades físicas leves como caminhadas ou treinos leves' },
      { value: 'regular', label: 'Mesmo não sendo um corredor, me exercito regularmente' },
    ],
  },

  // Pergunta 9: Tempos Estimados
  {
    id: '9',
    title: 'Quais são seus tempos atuais?',
    subtitle: 'ex: faço 5k em 25mins e 21k em 1h50',
    note: 'Caso você não saiba o seu tempo, deixe a caixa em branco e a partir das suas respostas nas outras perguntas, prescreveremos um teste para avaliar o seu condicionamento atual',
    type: 'text',
    applicableTo: ['race', 'distance', 'fitness'],
    required: false,
  },

  // Pergunta 10: Frequência Semanal
  {
    id: '10',
    title: 'Quantas vezes por semana você quer treinar?',
    type: 'single',
    applicableTo: ['race', 'distance', 'first_5k', 'fitness', 'return'],
    required: true,
    options: [
      { value: '2', label: '2 vezes' },
      { value: '3', label: '3 vezes' },
      { value: '4', label: '4 vezes' },
      { value: '5', label: '5 vezes' },
      { value: '6', label: '6 vezes' },
    ],
    specialBehavior: 'dynamic_frequency_filter',
  },

  // Pergunta 11: Dias Disponíveis
  {
    id: '11',
    title: 'Quais dias da semana você pode treinar?',
    type: 'multiple',
    applicableTo: ['race', 'distance', 'first_5k', 'fitness', 'return'],
    required: true,
    options: [
      { value: 'Segunda', label: 'Segunda' },
      { value: 'Terça', label: 'Terça' },
      { value: 'Quarta', label: 'Quarta' },
      { value: 'Quinta', label: 'Quinta' },
      { value: 'Sexta', label: 'Sexta' },
      { value: 'Sábado', label: 'Sábado' },
      { value: 'Domingo', label: 'Domingo' },
    ],
  },

  // Pergunta 12: Observações Especiais
  {
    id: '12',
    title: 'Alguma observação especial sobre sua disponibilidade?',
    subtitle: 'Ex: "Quero fazer meus treinos longos no domingo" ou "Tenho no máximo 1 hora disponível para treinar durante a semana"',
    type: 'text',
    applicableTo: ['race', 'distance', 'first_5k', 'fitness', 'return'],
    required: false,
  },

  // Pergunta 13: Data de Início
  {
    id: '13',
    title: 'Quando você quer começar seu plano?',
    type: 'single',
    applicableTo: ['race', 'distance', 'first_5k', 'fitness', 'return'],
    required: true,
    options: [
      { value: 'today', label: 'Hoje' },
      { value: 'tomorrow', label: 'Amanhã' },
      { value: 'next_week', label: 'Próxima semana' },
      { value: 'custom', label: 'Personalizado' },
    ],
    specialBehavior: 'convert_start_date',
  },

  // Pergunta 14: Duração do Plano
  {
    id: '14',
    title: 'Qual a duração do seu plano?',
    type: 'single',
    applicableTo: ['distance'],
    required: true,
    options: [], // Dinâmico baseado na distância
    specialBehavior: 'dynamic_duration_options',
  },

  // Pergunta 15: Frequência de Testes
  {
    id: '15',
    title: 'Com que frequência você quer fazer testes de avaliação?',
    type: 'single',
    applicableTo: ['fitness', 'return'],
    required: true,
    options: [
      { value: 'never', label: 'Nunca' },
      { value: 'occasionally', label: 'Ocasionalmente' },
      { value: 'frequently', label: 'Frequentemente' },
    ],
  },
];
