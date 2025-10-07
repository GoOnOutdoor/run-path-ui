# Instruções para Aplicar Migration no Supabase

## Opção 1: Usando o Supabase Dashboard (Recomendado)

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard/project/ehluzcvzntavfgiugdxr

2. No menu lateral, clique em **SQL Editor**

3. Clique em **New Query**

4. Cole o seguinte SQL:

```sql
-- Migration to add all 15 questionnaire fields to students table

-- Add new columns to students table
ALTER TABLE public.students
  -- Pergunta 3: custom distance
  ADD COLUMN IF NOT EXISTS custom_distance INTEGER,

  -- Pergunta 4: terrain
  ADD COLUMN IF NOT EXISTS terrain TEXT,

  -- Pergunta 5: gender
  ADD COLUMN IF NOT EXISTS gender TEXT,

  -- Pergunta 7: experience
  ADD COLUMN IF NOT EXISTS experience TEXT,

  -- Pergunta 8: activity_level
  ADD COLUMN IF NOT EXISTS activity_level TEXT,

  -- Pergunta 9: estimated_times
  ADD COLUMN IF NOT EXISTS estimated_times TEXT,

  -- Pergunta 12: special_observations
  ADD COLUMN IF NOT EXISTS special_observations TEXT,

  -- Pergunta 13: start_date and option
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS start_date_option TEXT,

  -- Pergunta 14: plan_duration
  ADD COLUMN IF NOT EXISTS plan_duration TEXT,
  ADD COLUMN IF NOT EXISTS custom_duration INTEGER,

  -- Pergunta 15: test_frequency
  ADD COLUMN IF NOT EXISTS test_frequency TEXT;

-- Add comments to document the fields
COMMENT ON COLUMN public.students.objective IS 'Pergunta 1: Objetivo na corrida (race, distance, first_5k, fitness, return, help)';
COMMENT ON COLUMN public.students.event_name IS 'Pergunta 2: Nome da prova';
COMMENT ON COLUMN public.students.event_date IS 'Pergunta 2.5: Data da prova';
COMMENT ON COLUMN public.students.distance IS 'Pergunta 3: Distância (5k, 10k, 21k, 42k, custom)';
COMMENT ON COLUMN public.students.custom_distance IS 'Pergunta 3: Distância personalizada em km (1-50)';
COMMENT ON COLUMN public.students.terrain IS 'Pergunta 4: Terreno (flat, light_hills, moderate_hills, strong_hills)';
COMMENT ON COLUMN public.students.gender IS 'Pergunta 5: Gênero (male, female, prefer_not_say)';
COMMENT ON COLUMN public.students.birth_date IS 'Pergunta 6: Data de nascimento';
COMMENT ON COLUMN public.students.experience IS 'Pergunta 7: Experiência com corrida (beginner, intermediate, advanced, elite)';
COMMENT ON COLUMN public.students.activity_level IS 'Pergunta 8: Nível de atividade física (sedentary, light, regular)';
COMMENT ON COLUMN public.students.estimated_times IS 'Pergunta 9: Tempos estimados atuais';
COMMENT ON COLUMN public.students.weekly_frequency IS 'Pergunta 10: Frequência semanal (2-6 vezes)';
COMMENT ON COLUMN public.students.available_days IS 'Pergunta 11: Dias disponíveis (Segunda-Domingo)';
COMMENT ON COLUMN public.students.special_observations IS 'Pergunta 12: Observações especiais sobre disponibilidade';
COMMENT ON COLUMN public.students.start_date IS 'Pergunta 13: Data de início do plano';
COMMENT ON COLUMN public.students.start_date_option IS 'Pergunta 13: Opção de data escolhida (today, tomorrow, next_week, custom)';
COMMENT ON COLUMN public.students.plan_duration IS 'Pergunta 14: Duração do plano em semanas (8-18 ou custom)';
COMMENT ON COLUMN public.students.custom_duration IS 'Pergunta 14: Duração personalizada em semanas';
COMMENT ON COLUMN public.students.test_frequency IS 'Pergunta 15: Frequência de testes (never, occasionally, frequently)';
COMMENT ON COLUMN public.students.observations IS 'Campo legado - substituído por special_observations';
```

5. Clique em **Run** (ou pressione Ctrl+Enter)

6. Você deve ver a mensagem "Success. No rows returned"

## Opção 2: Usando Supabase CLI (se instalado)

```bash
# Se você tiver o Supabase CLI instalado
supabase db push
```

## Verificação

Após aplicar a migration, você pode verificar se funcionou:

1. No Supabase Dashboard, vá em **Table Editor**
2. Selecione a tabela `students`
3. Você deve ver todas as novas colunas adicionadas

## Campos Adicionados

A migration adiciona os seguintes campos à tabela `students`:

- `custom_distance` (INTEGER) - Distância personalizada em km
- `terrain` (TEXT) - Tipo de terreno
- `gender` (TEXT) - Gênero
- `experience` (TEXT) - Experiência com corrida
- `activity_level` (TEXT) - Nível de atividade física
- `estimated_times` (TEXT) - Tempos estimados atuais
- `special_observations` (TEXT) - Observações especiais
- `start_date` (DATE) - Data de início do plano
- `start_date_option` (TEXT) - Opção de data escolhida
- `plan_duration` (TEXT) - Duração do plano
- `custom_duration` (INTEGER) - Duração personalizada
- `test_frequency` (TEXT) - Frequência de testes

## Troubleshooting

Se você receber erro dizendo que alguma coluna já existe, não se preocupe. O `IF NOT EXISTS` garante que a migration é idempotente (pode ser executada múltiplas vezes sem problemas).
