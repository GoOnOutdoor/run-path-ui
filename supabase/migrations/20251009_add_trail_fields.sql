-- Migration to add trail running questionnaire fields to students table

-- Add new columns for trail running questions
ALTER TABLE public.students
  -- Pergunta 0: Tipo de corrida
  ADD COLUMN IF NOT EXISTS race_type TEXT,

  -- Pergunta T1: Objetivo na Trilha
  ADD COLUMN IF NOT EXISTS trail_objective TEXT,

  -- Pergunta T2: Tem prova alvo?
  ADD COLUMN IF NOT EXISTS has_target_race TEXT,

  -- Pergunta T2.1: Nome da prova (trilha)
  ADD COLUMN IF NOT EXISTS trail_race_name TEXT,

  -- Pergunta T2.2: Data da prova (trilha)
  ADD COLUMN IF NOT EXISTS trail_race_date DATE,

  -- Pergunta T2.3: Distância da prova (trilha)
  ADD COLUMN IF NOT EXISTS trail_race_distance INTEGER,

  -- Pergunta T2.4: Desnível positivo
  ADD COLUMN IF NOT EXISTS trail_race_elevation INTEGER,

  -- Pergunta T2.5: Tipo de terreno da prova
  ADD COLUMN IF NOT EXISTS trail_race_terrain TEXT,

  -- Pergunta T2.5.1: Nível técnico da prova
  ADD COLUMN IF NOT EXISTS trail_race_technical_level INTEGER,

  -- Pergunta T2.6: Meta na prova
  ADD COLUMN IF NOT EXISTS trail_race_goal TEXT,

  -- Pergunta T3: Gênero (trilha)
  ADD COLUMN IF NOT EXISTS trail_gender TEXT,

  -- Pergunta T4: Data de nascimento (trilha)
  ADD COLUMN IF NOT EXISTS trail_birth_date DATE,

  -- Pergunta T5.A: Experiência em trilhas
  ADD COLUMN IF NOT EXISTS trail_experience TEXT,

  -- Pergunta T5.A.1: Maior distância finalizada
  ADD COLUMN IF NOT EXISTS trail_max_distance INTEGER,

  -- Pergunta T5.A.2: Maior D+ em evento
  ADD COLUMN IF NOT EXISTS trail_max_elevation INTEGER,

  -- Pergunta T5.B: Nível de atividade (trilha - iniciantes)
  ADD COLUMN IF NOT EXISTS trail_activity_level TEXT,

  -- Pergunta T6: Terreno e acesso para treinar (array)
  ADD COLUMN IF NOT EXISTS trail_terrain_access TEXT[],

  -- Pergunta T7: Disponibilidade para treinar em trilhas
  ADD COLUMN IF NOT EXISTS trail_availability TEXT,

  -- Pergunta T8: Frequência semanal (trilha)
  ADD COLUMN IF NOT EXISTS trail_weekly_frequency INTEGER,

  -- Pergunta T9: Dias disponíveis (trilha) (array)
  ADD COLUMN IF NOT EXISTS trail_available_days TEXT[],

  -- Pergunta T10: Dias de trilha (array)
  ADD COLUMN IF NOT EXISTS trail_trail_days TEXT[],

  -- Pergunta T11: Observações especiais (trilha)
  ADD COLUMN IF NOT EXISTS trail_observations TEXT,

  -- Pergunta T12: Data de início (trilha)
  ADD COLUMN IF NOT EXISTS trail_start_date DATE,
  ADD COLUMN IF NOT EXISTS trail_start_date_option TEXT;

-- Add comments to document the trail fields
COMMENT ON COLUMN public.students.race_type IS 'Pergunta 0: Tipo de corrida (road, trail)';
COMMENT ON COLUMN public.students.trail_objective IS 'Pergunta T1: Objetivo na corrida de trilha (trail_beginner, trail_transition, trail_evolve, trail_performance, trail_help)';
COMMENT ON COLUMN public.students.has_target_race IS 'Pergunta T2: Tem prova-alvo? (yes, no)';
COMMENT ON COLUMN public.students.trail_race_name IS 'Pergunta T2.1: Nome da prova de trilha';
COMMENT ON COLUMN public.students.trail_race_date IS 'Pergunta T2.2: Data da prova de trilha';
COMMENT ON COLUMN public.students.trail_race_distance IS 'Pergunta T2.3: Distância da prova de trilha em km (0-50)';
COMMENT ON COLUMN public.students.trail_race_elevation IS 'Pergunta T2.4: Desnível altimétrico positivo em metros';
COMMENT ON COLUMN public.students.trail_race_terrain IS 'Pergunta T2.5: Tipo de terreno da prova (dirt_road, runnable_trail, technical_trail, traverse, mixed, unknown)';
COMMENT ON COLUMN public.students.trail_race_technical_level IS 'Pergunta T2.5.1: Nível técnico da prova (1-5)';
COMMENT ON COLUMN public.students.trail_race_goal IS 'Pergunta T2.6: Meta na prova (comfort, perform)';
COMMENT ON COLUMN public.students.trail_gender IS 'Pergunta T3: Gênero para trilha (male, female, prefer_not_say)';
COMMENT ON COLUMN public.students.trail_birth_date IS 'Pergunta T4: Data de nascimento para trilha';
COMMENT ON COLUMN public.students.trail_experience IS 'Pergunta T5.A: Experiência em trilhas (trail_beginner, trail_intermediate, trail_advanced, trail_elite)';
COMMENT ON COLUMN public.students.trail_max_distance IS 'Pergunta T5.A.1: Maior distância já finalizada em km';
COMMENT ON COLUMN public.students.trail_max_elevation IS 'Pergunta T5.A.2: Maior D+ em um evento em metros';
COMMENT ON COLUMN public.students.trail_activity_level IS 'Pergunta T5.B: Nível de atividade para iniciantes em trilha (sedentary, light, regular)';
COMMENT ON COLUMN public.students.trail_terrain_access IS 'Pergunta T6: Tipos de terrenos com acesso para treinar (array: dirt_road, light_trail, technical_trail, long_climb, stairs, treadmill, no_trail)';
COMMENT ON COLUMN public.students.trail_availability IS 'Pergunta T7: Disponibilidade para treinar em trilhas (any_day, twice_week, once_week, not_every_week)';
COMMENT ON COLUMN public.students.trail_weekly_frequency IS 'Pergunta T8: Frequência semanal de treinos em trilha (2-6)';
COMMENT ON COLUMN public.students.trail_available_days IS 'Pergunta T9: Dias disponíveis para treinar (array: Segunda-Domingo)';
COMMENT ON COLUMN public.students.trail_trail_days IS 'Pergunta T10: Dias que consegue ir à trilha (array: Segunda-Domingo)';
COMMENT ON COLUMN public.students.trail_observations IS 'Pergunta T11: Observações especiais sobre trilha';
COMMENT ON COLUMN public.students.trail_start_date IS 'Pergunta T12: Data de início da planilha de treinos (trilha)';
COMMENT ON COLUMN public.students.trail_start_date_option IS 'Pergunta T12: Opção escolhida para data de início (today, tomorrow, next_week, custom)';
