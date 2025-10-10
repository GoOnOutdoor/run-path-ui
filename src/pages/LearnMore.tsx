import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  TrendingUp,
  Mountain,
  CheckCircle2,
  Users,
  Globe
} from "lucide-react";
import logo from "@/assets/logo.png";

const LearnMore = () => {

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Logo - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <img
          src={logo}
          alt="Go On Outdoor"
          className="w-12 h-12 object-contain"
        />
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="Go On Outdoor"
              className="w-40 h-40 object-contain"
            />
          </div>

          <div className="flex flex-col items-center space-y-3">
            <h1 className="text-[2.65rem] md:text-[3.19rem] font-bold text-foreground whitespace-nowrap">
              A metodologia Go On, <span className="text-orange-500">agora no seu bolso</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Com apenas 3 minutos, receba seu plano personalizado para seu objetivo e rotina
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center pt-8">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-500" />
              <p className="text-lg font-semibold">
                Mais de 350 atletas ao redor do Brasil e do Mundo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-orange-500" />
              <p className="text-lg font-semibold">
                Presente em 19 países
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                QUERO MEUS TREINOS AGORA
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            O QUE A GO ON AI OFERECE?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* IA + Experiência Humana */}
            <Card className="border-2 hover:border-orange-500 transition-colors">
              <CardContent className="pt-6 text-center space-y-4">
                <Brain className="w-16 h-16 mx-auto text-orange-500" />
                <h3 className="text-2xl font-bold">IA + Experiência Humana</h3>
                <p className="text-muted-foreground">
                  Algoritmo treinado com dados reais.
                </p>
              </CardContent>
            </Card>

            {/* Evolução Constante */}
            <Card className="border-2 hover:border-orange-500 transition-colors">
              <CardContent className="pt-6 text-center space-y-4">
                <TrendingUp className="w-16 h-16 mx-auto text-orange-500" />
                <h3 className="text-2xl font-bold">Evolução Constante</h3>
                <p className="text-muted-foreground">
                  Treinos se adaptam automaticamente ao seu progresso e rotina
                </p>
              </CardContent>
            </Card>

            {/* Do 5K à Ultra */}
            <Card className="border-2 hover:border-orange-500 transition-colors">
              <CardContent className="pt-6 text-center space-y-4">
                <Mountain className="w-16 h-16 mx-auto text-orange-500" />
                <h3 className="text-2xl font-bold">Do 5K à Ultra</h3>
                <p className="text-muted-foreground">
                  Metodologia testada e validada com mais de 350 atletas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            COMO FUNCIONA
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <p className="text-xl">
                  <span className="font-bold text-orange-500">Responda</span> o questionário
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <p className="text-xl">
                  <span className="font-bold text-orange-500">Receba</span> seu plano personalizado de corrida na hora
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <p className="text-xl">
                  <span className="font-bold text-orange-500">Treine</span> com acompanhamento inteligente (integração ao Strava)
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <p className="text-xl">
                  <span className="font-bold text-orange-500">Evolua</span> rumo aos seus objetivos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            DÚVIDAS RÁPIDAS (FAQ)
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-4 bg-background">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Funciona para iniciantes?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Sim! Do primeiro 5K às ultras de montanha
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-4 bg-background">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Preciso de equipamentos especiais?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Não! Adaptamos aos seus recursos e local de treino
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-4 bg-background">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Posso cancelar quando quiser?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Claro! Sem fidelidade, cancele a qualquer momento
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            A METODOLOGIA QUE FORMA CAMPEÕES
          </h2>

          <p className="text-xl text-muted-foreground">
            A mesma estratégia usada pelos melhores atletas brasileiros de trail running, agora acessível para todos.
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">Planos personalizados de corrida</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">Integração com Strava</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">App exclusivo Go On AI</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-lg">Ajustes automáticos baseados em IA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-orange-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold whitespace-nowrap">
            Junte-se aos atletas de 19 países que já confiam na Go On
          </h2>

          <div className="mt-20">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                RESPONDER O QUESTIONÁRIO
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LearnMore;
