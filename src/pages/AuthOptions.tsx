import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const AuthOptions = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground">
            Escolha uma opção para continuar
          </p>
        </div>

        <Card className="p-8 space-y-4">
          <Link to="/login" className="block">
            <Button className="w-full" size="lg">
              Fazer Login
            </Button>
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Link to="/register" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Criar Conta
            </Button>
          </Link>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar para início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthOptions;
