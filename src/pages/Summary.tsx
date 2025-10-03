import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit2, Check, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StudentData {
  objective: string;
  event_name?: string;
  event_date?: string;
  weekly_frequency: number;
  available_days: string[];
  distance: string;
  birth_date?: string;
  observations?: string;
}

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const OBJECTIVE_LABELS: Record<string, string> = {
  race: "Correr uma prova específica",
  distance: "Correr uma distância específica",
  first_5k: "Correr meus primeiros 5km",
  fitness: "Melhorar meu condicionamento físico",
  return: "Voltar a correr",
  help: "Me ajude a definir meu objetivo",
};

export default function Summary() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<StudentData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [showObjectiveWarning, setShowObjectiveWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

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
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!studentData) {
        navigate("/dashboard");
        return;
      }

      setData(studentData);
    };

    if (user) {
      loadData();
    }
  }, [user, navigate, toast]);

  const handleEdit = (field: string, currentValue: any) => {
    if (field === "objective") {
      setShowObjectiveWarning(true);
      return;
    }
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!user || !editingField) return;

    const { error } = await supabase
      .from("students")
      .update({ [editingField]: editValue })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setData({ ...data!, [editingField]: editValue });
    setEditingField(null);
    setEditValue(null);

    toast({
      title: "Salvo!",
      description: "Sua resposta foi atualizada.",
    });
  };

  const validateData = (): boolean => {
    if (!data) return false;

    // Validate distance vs frequency
    const distance = parseInt(data.distance);
    const frequency = data.weekly_frequency;

    if (distance > 10 && frequency < 3) {
      setValidationMessage(
        "Para distâncias acima de 10km, recomendamos treinar pelo menos 3 vezes por semana. Deseja continuar mesmo assim?"
      );
      setShowValidationWarning(true);
      return false;
    }

    if (data.available_days.length < frequency) {
      setValidationMessage(
        `Você selecionou ${data.available_days.length} dias disponíveis, mas quer treinar ${frequency}x por semana. Por favor, ajuste suas respostas.`
      );
      toast({
        title: "Inconsistência detectada",
        description: validationMessage,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFinish = async () => {
    if (!validateData()) return;

    setIsSubmitting(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Perfil completo!",
      description: "Seus dados foram processados com sucesso.",
    });

    navigate("/dashboard");
  };

  const handleRestartQuestionnaire = () => {
    navigate("/dashboard");
    toast({
      title: "Reiniciando questionário",
      description: "Você será redirecionado para refazer o questionário.",
    });
  };

  const renderEditDialog = () => {
    if (!editingField || !data) return null;

    const renderEditField = () => {
      switch (editingField) {
        case "event_name":
          return (
            <div className="space-y-2">
              <Label>Nome da Prova</Label>
              <Input
                value={editValue || ""}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Digite o nome da prova"
              />
            </div>
          );

        case "event_date":
          return (
            <div className="space-y-2">
              <Label>Data da Prova</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editValue ? format(new Date(editValue), "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editValue ? new Date(editValue) : undefined}
                    onSelect={(date) => date && setEditValue(date.toISOString().split('T')[0])}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          );

        case "weekly_frequency":
          return (
            <div className="space-y-4">
              <Label>Frequência Semanal</Label>
              <RadioGroup
                value={String(editValue)}
                onValueChange={(value) => setEditValue(parseInt(value))}
              >
                {[2, 3, 4, 5, 6].map((freq) => (
                  <div key={freq} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(freq)} id={`freq-${freq}`} />
                    <Label htmlFor={`freq-${freq}`}>{freq} vezes por semana</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );

        case "available_days":
          return (
            <div className="space-y-3">
              <Label>Dias Disponíveis</Label>
              {WEEKDAYS.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    checked={editValue?.includes(day)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setEditValue([...(editValue || []), day]);
                      } else {
                        setEditValue(editValue?.filter((d: string) => d !== day));
                      }
                    }}
                    id={day}
                  />
                  <Label htmlFor={day}>{day}</Label>
                </div>
              ))}
            </div>
          );

        case "distance":
          return (
            <div className="space-y-4">
              <Label>Distância (km)</Label>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">{editValue}</span>
                <span className="text-xl ml-2">km</span>
              </div>
              <Slider
                value={[parseInt(editValue)]}
                onValueChange={([value]) => setEditValue(String(value))}
                min={1}
                max={50}
                step={1}
              />
            </div>
          );

        case "birth_date":
          return (
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editValue ? format(new Date(editValue), "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editValue ? new Date(editValue) : undefined}
                    onSelect={(date) => date && setEditValue(date.toISOString().split('T')[0])}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          );

        case "observations":
          return (
            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                value={editValue || ""}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Digite suas observações..."
                className="w-full min-h-[100px] p-3 rounded-lg bg-background border-2 border-border focus:border-primary outline-none resize-none"
              />
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
        <DialogContent className="bg-card border-2 border-border">
          <DialogHeader>
            <DialogTitle>Editar Resposta</DialogTitle>
          </DialogHeader>
          <div className="py-4">{renderEditField()}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingField(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Resumo do Seu Perfil</h1>
          <p className="text-muted-foreground">
            Revise suas respostas antes de finalizar
          </p>
        </div>

        {/* Objective */}
        <Card className="p-6 border-2 border-border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Objetivo Principal</h3>
              <p className="text-lg">{OBJECTIVE_LABELS[data.objective]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit("objective", data.objective)}
              className="text-primary"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Event Details - Only if objective is race */}
        {data.objective === "race" && (
          <>
            {data.event_name && (
              <Card className="p-6 border-2 border-border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Nome da Prova</h3>
                    <p className="text-lg">{data.event_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("event_name", data.event_name)}
                    className="text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}

            {data.event_date && (
              <Card className="p-6 border-2 border-border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Data da Prova</h3>
                    <p className="text-lg">{format(new Date(data.event_date), "dd/MM/yyyy")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("event_date", data.event_date)}
                    className="text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Weekly Frequency */}
        <Card className="p-6 border-2 border-border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Frequência Semanal</h3>
              <p className="text-lg">{data.weekly_frequency}x por semana</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit("weekly_frequency", data.weekly_frequency)}
              className="text-primary"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Available Days */}
        <Card className="p-6 border-2 border-border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Dias Disponíveis</h3>
              <p className="text-lg">{data.available_days.join(", ")}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit("available_days", data.available_days)}
              className="text-primary"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Distance */}
        {data.objective !== "first_5k" && (
          <Card className="p-6 border-2 border-border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Distância Objetivo</h3>
                <p className="text-lg">{data.distance} km</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit("distance", data.distance)}
                className="text-primary"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Birth Date */}
        {data.birth_date && (
          <Card className="p-6 border-2 border-border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Data de Nascimento</h3>
                <p className="text-lg">{format(new Date(data.birth_date), "dd/MM/yyyy")}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit("birth_date", data.birth_date)}
                className="text-primary"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Observations */}
        {data.observations && (
          <Card className="p-6 border-2 border-border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-lg whitespace-pre-wrap">{data.observations}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit("observations", data.observations)}
                className="text-primary"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Finalizar
              </>
            )}
          </Button>
        </div>

        {/* Edit Dialog */}
        {renderEditDialog()}

        {/* Objective Warning Dialog */}
        <AlertDialog open={showObjectiveWarning} onOpenChange={setShowObjectiveWarning}>
          <AlertDialogContent className="bg-card border-2 border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Mudar Objetivo Principal
              </AlertDialogTitle>
              <AlertDialogDescription>
                Alterar seu objetivo principal pode afetar todo o questionário. Você precisará refazer
                algumas perguntas. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRestartQuestionnaire}>
                Sim, Reiniciar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Validation Warning Dialog */}
        <AlertDialog open={showValidationWarning} onOpenChange={setShowValidationWarning}>
          <AlertDialogContent className="bg-card border-2 border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Atenção
              </AlertDialogTitle>
              <AlertDialogDescription>{validationMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Revisar Respostas</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowValidationWarning(false);
                  handleFinish();
                }}
              >
                Continuar Mesmo Assim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
