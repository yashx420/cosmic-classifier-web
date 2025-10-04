import { Button } from '@/components/ui/button';
import { Telescope, Database, Cpu, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background stars-bg relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16 pt-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Telescope className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold glow-text mb-6">
            🌌 Planopticon
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Discover Exoplanets with AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Explore thousands of exoplanets discovered by NASA's Kepler, K2, and TESS missions. 
            Our advanced machine learning models help validate and classify exoplanet candidates 
            from transit photometry data, pushing the boundaries of astronomical discovery.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="text-lg px-8 py-6 h-auto glow-border"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Start Exploring
          </Button>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>System Online</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span>NASA Archive Integration</span>
          </div>
        </header>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <div className="text-center p-6 rounded-lg glow-border bg-card/50">
            <Database className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">NASA Datasets</h3>
            <p className="text-muted-foreground">
              Access data from Kepler, K2, and TESS missions
            </p>
          </div>
          <div className="text-center p-6 rounded-lg glow-border bg-card/50">
            <Cpu className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Classification</h3>
            <p className="text-muted-foreground">
              Machine learning models trained on validated exoplanet data
            </p>
          </div>
          <div className="text-center p-6 rounded-lg glow-border bg-card/50">
            <Telescope className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interactive Explorer</h3>
            <p className="text-muted-foreground">
              Filter and analyze exoplanet characteristics
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Mission Control • Exoplanet Research Division</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
