import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-trail.jpg";

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
          Trail Running
          <span className="block text-primary mt-2">Training System</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Treine com inteligência. Conquiste montanhas. Supere seus limites.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link to="/auth">
            <Button size="lg" className="text-base">
              Começar Agora
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-base">
            Saiba Mais
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
