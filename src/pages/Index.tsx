import PredictForm from '@/components/PredictForm';
import { Satellite } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background stars-bg relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Satellite className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold glow-text">
              Exoplanet Classification System
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced machine learning analysis for exoplanet candidate validation and classification
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>System Online</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span>NASA Exoplanet Archive Integration</span>
          </div>
        </header>

        {/* Main Form */}
        <main>
          <PredictForm />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Mission Control • Exoplanet Research Division</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
