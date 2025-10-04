import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataExplorer from '@/components/DataExplorer';
import PredictForm from '@/components/PredictForm';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background stars-bg relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold glow-text mb-2">
              🌌 Planopticon Dashboard
            </h1>
            <p className="text-muted-foreground">
              Explore and analyze exoplanet data
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="explorer" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="explorer">Data Explorer</TabsTrigger>
            <TabsTrigger value="classifier">AI Classifier</TabsTrigger>
          </TabsList>

          <TabsContent value="explorer">
            <DataExplorer />
          </TabsContent>

          <TabsContent value="classifier">
            <PredictForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
