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
  type: 'single' | 'multiple' | 'text' | 'date' | 'slider' | 'number';
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
  conditionalDisplay?: {
    dependsOn: string;
    values: string[];
  };
}

export const QUESTIONS: Question[] = [
  // ==================== PERGUNTA 0: TIPO DE CORRIDA ====================
  {
    id: '0',
    title: 'Você quer treinar para qual tipo de corrida?',
    type: 'single',
    applicableTo: 'all',
    required: true,
    options: [
      { value: 'road', label: 'Corrida de Asfalto' },
      { value: 'trail', label: 'Corrida de Trilha/Montanha' },
    ],
  },

  // ==================== PERGUNTAS DE ASFALTO (ORIGINAL) ====================

  // Pergunta 1: Objetivo (Asfalto)
  {
    id: '1',
    title: 'Qual seu objetivo na corrida?',
    type: 'single',
    applicableTo: ['road'],
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

  // ==================== PERGUNTAS DE TRILHA ====================

  // Pergunta T1: Objetivo na Trilha
  {
    id: 'T1',
    title: 'Qual seu objetivo na corrida de trilha?',
    type: 'single',
    applicableTo: ['trail'],
    required: true,
    options: [
      { value: 'trail_beginner', label: 'Começar nas corridas de trilha', description: 'nunca corri' },
      { value: 'trail_transition', label: 'Transição do asfalto para as trilhas', description: 'tenho experiência em asfalto, mas quero entrar nas trilhas' },
      { value: 'trail_evolve', label: 'Evoluir nas trilhas', description: 'para quem já corre em trilhas e está buscando melhorar' },
      { value: 'trail_performance', label: 'Performance', description: 'para quem quer superar seus limites' },
      { value: 'trail_help', label: 'Me ajude a definir meu objetivo' },
    ],
  },

  // Pergunta T2: Tem Prova Alvo?
  {
    id: 'T2',
    title: 'Você tem alguma prova-alvo?',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: 'yes', label: 'Sim' },
      { value: 'no', label: 'Não' },
    ],
  },

  // Pergunta T2.1: Nome da Prova (Trilha)
  {
    id: 'T2.1',
    title: 'Qual o nome da prova?',
    type: 'text',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    conditionalDisplay: {
      dependsOn: 'T2',
      values: ['yes'],
    },
  },

  // Pergunta T2.2: Data da Prova (Trilha)
  {
    id: 'T2.2',
    title: 'Qual a data da prova?',
    type: 'date',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    conditionalDisplay: {
      dependsOn: 'T2',
      values: ['yes'],
    },
  },

  // Pergunta T2.3: Distância da Prova (Trilha)
  {
    id: 'T2.3',
    title: 'Qual a distância da prova?',
    type: 'slider',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    note: 'Caso sua prova seja maior do que 50km, recomendamos fortemente o acompanhamento de um de nossos treinadores.',
    sliderConfig: {
      min: 0,
      max: 50,
      step: 1,
      unit: 'km',
    },
    conditionalDisplay: {
      dependsOn: 'T2',
      values: ['yes'],
    },
  },

  // Pergunta T2.4: Desnível Positivo
  {
    id: 'T2.4',
    title: 'Qual o desnível altimétrico positivo da prova (em metros)?',
    type: 'number',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    note: 'Caso você não saiba essa informação, coloque um valor aproximado. Isso impacta quanto de subida semana a semana treinaremos.',
    conditionalDisplay: {
      dependsOn: 'T2',
      values: ['yes'],
    },
  },

  // Pergunta T2.5: Tipo de Terreno
  {
    id: 'T2.5',
    title: 'Qual o tipo de terreno dessa prova?',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    note: 'Caso você não saiba essa informação, selecione a opção "Não sei" que um de nossos especialistas avaliará a prova através do nome registrado e auxiliará a automação, porém isso resultará a um pouco mais de tempo para seu plano ficar pronto',
    options: [
      { value: 'dirt_road', label: 'Estradão' },
      { value: 'runnable_trail', label: 'Trilhas corríveis' },
      { value: 'technical_trail', label: 'Trilhas técnicas (raízes/pedras)' },
      { value: 'traverse', label: 'Travessias' },
      { value: 'mixed', label: 'Misto' },
      { value: 'unknown', label: 'Não sei' },
    ],
    specialBehavior: 'show_technical_level_slider',
    conditionalDisplay: {
      dependsOn: 'T2',
      values: ['yes'],
    },
  },

  // Pergunta T2.5.1: Nível Técnico (Slider condicional)
  {
    id: 'T2.5.1',
    title: 'Nível técnico da prova',
    subtitle: '1 = pouco técnica; 5 = extremamente técnico',
    type: 'slider',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    sliderConfig: {
      min: 1,
      max: 5,
      step: 1,
      unit: '',
    },
    conditionalDisplay: {
      dependsOn: 'T2.5',
      values: ['dirt_road', 'runnable_trail', 'technical_trail', 'traverse', 'mixed'],
    },
  },

  // Pergunta T2.6: Meta na Prova
  {
    id: 'T2.6',
    title: 'Qual a sua meta nessa prova?',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: 'comfort', label: 'Concluir a prova com conforto (reduzir sofrimento e riscos)' },
      { value: 'perform', label: 'Performar na prova' },
    ],
    conditionalDisplay: {
      dependsOn: 'T2',
      values: ['yes'],
    },
  },

  // Pergunta T3: Gênero (Trilha)
  {
    id: 'T3',
    title: 'Qual seu gênero?',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    skipIfAnswered: true,
    options: [
      { value: 'male', label: 'Masculino' },
      { value: 'female', label: 'Feminino' },
      { value: 'prefer_not_say', label: 'Prefiro não dizer' },
    ],
  },

  // Pergunta T4: Data de Nascimento (Trilha)
  {
    id: 'T4',
    title: 'Qual sua data de nascimento?',
    type: 'date',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    skipIfAnswered: true,
  },

  // Pergunta T5.A: Experiência em Trilhas
  {
    id: 'T5.A',
    title: 'Como você avaliaria sua experiência em trilhas?',
    type: 'single',
    applicableTo: ['trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: 'trail_beginner', label: 'Iniciante', description: 'nunca corri trilha' },
      { value: 'trail_intermediate', label: 'Intermediário', description: 'já finalizei provas curtas (menos de 20 km)' },
      { value: 'trail_advanced', label: 'Avançado', description: 'já finalizei provas de 25 a 50 km' },
      { value: 'trail_elite', label: 'Elite', description: 'já finalizei provas de 60 a 100 km' },
    ],
  },

  // Pergunta T5.A.1: Maior Distância Finalizada
  {
    id: 'T5.A.1',
    title: 'Maior distância já finalizada (km)',
    type: 'number',
    applicableTo: ['trail_transition', 'trail_evolve', 'trail_performance'],
    required: false,
  },

  // Pergunta T5.A.2: Maior D+ em Evento
  {
    id: 'T5.A.2',
    title: 'Maior D+ em um evento (m)',
    type: 'number',
    applicableTo: ['trail_transition', 'trail_evolve', 'trail_performance'],
    required: false,
  },

  // Pergunta T5.B: Nível de Atividade (Trilha - Iniciantes)
  {
    id: 'T5.B',
    title: 'Como você avaliaria seu nível de atividade?',
    type: 'single',
    applicableTo: ['trail_beginner'],
    required: true,
    options: [
      { value: 'sedentary', label: 'Atualmente não faço nenhum tipo de exercício regular' },
      { value: 'light', label: 'Ocasionalmente pratico atividades físicas leves como caminhadas ou treinos leves' },
      { value: 'regular', label: 'Mesmo não sendo um corredor, me exercito regularmente' },
    ],
  },

  // Pergunta T6: Terreno e Acesso para Treinar
  {
    id: 'T6',
    title: 'Quais tipos de terrenos você tem acesso para treinar?',
    subtitle: 'Sem trilhas, dá para simular com ladeira/esteira, mas ajustaremos expectativas.',
    type: 'multiple',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: 'dirt_road', label: 'Estradão/terra batida' },
      { value: 'light_trail', label: 'Trilhas leves' },
      { value: 'technical_trail', label: 'Trilhas técnicas (raízes/pedras)' },
      { value: 'long_climb', label: 'Subida longa contínua (>15 min)' },
      { value: 'stairs', label: 'Escadarias/ladeiras urbanas' },
      { value: 'treadmill', label: 'Esteira com inclinação' },
      { value: 'no_trail', label: 'Sem acesso a trilha (apenas asfaltos/parques)' },
    ],
  },

  // Pergunta T7: Disponibilidade para Treinar em Trilhas
  {
    id: 'T7',
    title: 'Qual a sua disponibilidade para treinar em trilhas?',
    subtitle: 'O ideal para maior performance é no mínimo 1x por semana, mas caso você selecione a última opção, adaptaremos aos seus recursos dando opção de treinos na cidade ou montanha dependendo da sua disponibilidade',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: 'any_day', label: 'Consigo qualquer dia durante a semana' },
      { value: 'twice_week', label: 'Consigo 2x por semana' },
      { value: 'once_week', label: 'Consigo 1x por semana' },
      { value: 'not_every_week', label: 'Não consigo toda semana' },
    ],
  },

  // Pergunta T8: Frequência Semanal (Trilha)
  {
    id: 'T8',
    title: 'Quantas vezes por semana você quer treinar?',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: '2', label: '2 vezes' },
      { value: '3', label: '3 vezes' },
      { value: '4', label: '4 vezes' },
      { value: '5', label: '5 vezes' },
      { value: '6', label: '6 vezes' },
    ],
  },

  // Pergunta T9: Dias Disponíveis (Trilha)
  {
    id: 'T9',
    title: 'Quais dias da semana você pode treinar?',
    type: 'multiple',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
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

  // Pergunta T10: Dias de Trilha
  {
    id: 'T10',
    title: 'Que dias você consegue ir à trilha?',
    note: 'Caso você não consiga ir à trilha toda semana, marque o dia que você tem maior disponibilidade de tempo para treinos longos',
    type: 'multiple',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
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

  // Pergunta T11: Observações Especiais (Trilha)
  {
    id: 'T11',
    title: 'Observações especiais',
    subtitle: 'Ex: Tenho no máximo 1 hora disponível para treinar durante a semana',
    type: 'text',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: false,
  },

  // Pergunta T12: Data de Início (Trilha)
  {
    id: 'T12',
    title: 'Que dia você quer dar início a sua planilha de treinos?',
    type: 'single',
    applicableTo: ['trail_beginner', 'trail_transition', 'trail_evolve', 'trail_performance'],
    required: true,
    options: [
      { value: 'today', label: 'Hoje' },
      { value: 'tomorrow', label: 'Amanhã' },
      { value: 'next_week', label: 'Próxima semana' },
      { value: 'custom', label: 'Personalizado' },
    ],
    specialBehavior: 'convert_start_date',
  },
];
