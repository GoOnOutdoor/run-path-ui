# Guia de Migração do Supabase - Campos de Trilha

## 📋 Resumo
Esta migração adiciona **24 novos campos** à tabela `students` para suportar o questionário de corrida de trilha.

## 🗂️ Arquivo de Migração
- **Arquivo**: `supabase/migrations/20251009_add_trail_fields.sql`
- **Objetivo**: Adicionar campos para perguntas de trilha (T1 até T11) e pergunta 0 (tipo de corrida)

## 🚀 Opções para Aplicar a Migração

### Opção 1: Via Dashboard do Supabase (Mais Simples)

1. **Acesse o Dashboard**:
   - Vá para https://app.supabase.com
   - Selecione seu projeto

2. **Abra o SQL Editor**:
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Cole o SQL**:
   - Abra o arquivo `supabase/migrations/20251009_add_trail_fields.sql`
   - Copie todo o conteúdo
   - Cole no editor SQL

4. **Execute**:
   - Clique em "Run" (ou pressione `Ctrl+Enter`)
   - Aguarde a confirmação de sucesso

### Opção 2: Via Supabase CLI (Local)

```bash
# Se estiver usando Supabase local
npx supabase db push

# Ou se tiver Supabase CLI instalado
supabase db push
```

### Opção 3: Via Script SQL Direto

Se você preferir, pode executar o SQL diretamente no psql ou em qualquer cliente PostgreSQL conectado ao seu banco Supabase.

## 📊 Campos Adicionados

### Pergunta 0
- `race_type` (TEXT) - Tipo de corrida: 'road' ou 'trail'

### Perguntas de Trilha (T1-T11)

#### Dados da Prova Alvo
- `trail_objective` (TEXT) - Objetivo na trilha
- `has_target_race` (TEXT) - Tem prova alvo? (yes/no)
- `trail_race_name` (TEXT) - Nome da prova
- `trail_race_date` (DATE) - Data da prova
- `trail_race_distance` (INTEGER) - Distância em km (0-50)
- `trail_race_elevation` (INTEGER) - Desnível positivo em metros
- `trail_race_terrain` (TEXT) - Tipo de terreno
- `trail_race_technical_level` (INTEGER) - Nível técnico (1-5)
- `trail_race_goal` (TEXT) - Meta na prova (comfort/perform)

#### Dados Pessoais
- `trail_gender` (TEXT) - Gênero
- `trail_birth_date` (DATE) - Data de nascimento

#### Experiência
- `trail_experience` (TEXT) - Nível de experiência
- `trail_max_distance` (INTEGER) - Maior distância finalizada
- `trail_max_elevation` (INTEGER) - Maior D+ em evento
- `trail_activity_level` (TEXT) - Nível de atividade (iniciantes)

#### Treino e Disponibilidade
- `trail_terrain_access` (TEXT[]) - Array de tipos de terreno disponíveis
- `trail_availability` (TEXT) - Disponibilidade para trilhas
- `trail_weekly_frequency` (INTEGER) - Frequência semanal (2-6)
- `trail_available_days` (TEXT[]) - Array de dias disponíveis
- `trail_trail_days` (TEXT[]) - Array de dias para trilha
- `trail_observations` (TEXT) - Observações especiais

## ✅ Verificação Pós-Migração

Após aplicar a migração, você pode verificar se os campos foram criados:

```sql
-- Via SQL Editor no Supabase Dashboard
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
  AND column_name LIKE 'trail_%'
  OR column_name = 'race_type'
ORDER BY ordinal_position;
```

## 🔄 Integração com o Código

### ✅ Já Implementado
- ✅ Interface `QuestionnaireData` atualizada com todos os campos de trilha
- ✅ Função `loadData()` carrega todos os campos de trilha do Supabase
- ✅ Função `saveData()` (auto-save) salva todos os campos de trilha
- ✅ Função `handleFinish()` salva todos os campos ao finalizar
- ✅ Função `getFieldName()` mapeia todos os IDs das perguntas de trilha

### 📝 Campos Mapeados no Frontend

| ID Pergunta | Campo no Banco | Tipo |
|-------------|----------------|------|
| 0 | race_type | TEXT |
| T1 | trail_objective | TEXT |
| T2 | has_target_race | TEXT |
| T2.1 | trail_race_name | TEXT |
| T2.2 | trail_race_date | DATE |
| T2.3 | trail_race_distance | INTEGER |
| T2.4 | trail_race_elevation | INTEGER |
| T2.5 | trail_race_terrain | TEXT |
| T2.5.1 | trail_race_technical_level | INTEGER |
| T2.6 | trail_race_goal | TEXT |
| T3 | trail_gender | TEXT |
| T4 | trail_birth_date | DATE |
| T5.A | trail_experience | TEXT |
| T5.A.1 | trail_max_distance | INTEGER |
| T5.A.2 | trail_max_elevation | INTEGER |
| T5.B | trail_activity_level | TEXT |
| T6 | trail_terrain_access | TEXT[] |
| T7 | trail_availability | TEXT |
| T8 | trail_weekly_frequency | INTEGER |
| T9 | trail_available_days | TEXT[] |
| T10 | trail_trail_days | TEXT[] |
| T11 | trail_observations | TEXT |

## 🧪 Teste de Funcionamento

Após aplicar a migração:

1. **Acesse o aplicativo**: http://localhost:8080
2. **Faça login** ou crie uma nova conta
3. **Escolha "Corrida de Trilha/Montanha"** na pergunta 0
4. **Preencha algumas perguntas** do questionário de trilha
5. **Verifique no Supabase Dashboard**:
   - Vá em "Table Editor" > "students"
   - Encontre seu registro
   - Verifique se os campos `trail_*` estão sendo salvos corretamente

## ⚠️ Notas Importantes

- ✅ A migração usa `ADD COLUMN IF NOT EXISTS` - é segura para executar múltiplas vezes
- ✅ Não remove nem modifica dados existentes
- ✅ Todos os campos são opcionais (nullable)
- ✅ Comentários foram adicionados para documentação

## 🆘 Problemas Comuns

### Erro: "permission denied"
**Solução**: Verifique se você tem permissões de admin no projeto Supabase.

### Erro: "column already exists"
**Solução**: Isso é normal se executar a migration múltiplas vezes. Pode ignorar.

### Dados não salvam
**Solução**:
1. Verifique o console do navegador (F12) por erros
2. Verifique se a migration foi aplicada corretamente
3. Verifique as permissões RLS (Row Level Security) na tabela students

## 📞 Suporte

Se encontrar problemas, verifique:
1. Console do navegador (F12)
2. Logs do Supabase Dashboard
3. Network tab para ver as requisições falhando
