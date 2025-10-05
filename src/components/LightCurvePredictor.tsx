import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PredictionResult {
  prediction: string;
  probability: {
    no_planet: number;
    planet: number;
  };
  flux_points: number;
}

const API_URL = 'http://localhost:3001/api/predict';

const LightCurvePredictor = () => {
  const [fluxData, setFluxData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const { toast } = useToast();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fluxData.trim()) {
      toast({
        title: "Error",
        description: "Please enter flux values",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Parse flux values (comma or space separated)
      const fluxValues = fluxData
        .split(/[\s,]+/)
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));

      if (fluxValues.length === 0) {
        throw new Error('No valid flux values found');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flux: fluxValues }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      toast({
        title: "Prediction Complete",
        description: `Analyzed ${fluxValues.length} flux data points`,
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      toast({
        title: "Prediction Complete",
        description: "CSV file processed successfully",
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glow-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl glow-text">Exoplanet Classifier</CardTitle>
          <CardDescription>
            Analyze light curve data to identify exoplanet candidates
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'upload'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <FileUp className="inline-block mr-2 h-4 w-4" />
          Upload CSV
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'manual'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Sparkles className="inline-block mr-2 h-4 w-4" />
          Manual Entry
        </button>
      </div>

      {/* Content Area */}
      <Card className="glow-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          {activeTab === 'upload' ? (
            <form onSubmit={handleFileSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="csvFile" className="text-base font-semibold">CSV File Upload</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="csvFile" className="cursor-pointer">
                    <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {file ? file.name : 'Click to upload CSV file'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CSV should contain flux values in a single column
                    </p>
                  </label>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading || !file}
                className="w-full h-12 text-base"
                size="lg"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload & Predict
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fluxData" className="text-base font-semibold">Flux Values</Label>
                <Textarea
                  id="fluxData"
                  placeholder="Example: 1.0002, 0.9998, 1.0001, 0.9999, 1.0000, 1.0003, 0.9997..."
                  value={fluxData}
                  onChange={(e) => setFluxData(e.target.value)}
                  className="min-h-[250px] font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Enter normalized flux values separated by commas or spaces
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base"
                size="lg"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Predict Exoplanet
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="glow-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>
              Neural network classification based on light curve analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Classification</p>
                  <p className={`text-3xl font-bold ${
                    result.prediction === 'PLANET DETECTED' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {result.prediction}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Planet Probability</p>
                  <p className="text-3xl font-bold text-primary">
                    {(result.probability.planet * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Flux Data Points</p>
                  <p className="text-3xl font-bold">
                    {result.flux_points}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-background/50 border border-border p-6">
                <h4 className="font-semibold text-lg mb-4">Detailed Probabilities</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base">Category</TableHead>
                      <TableHead className="text-base">Probability</TableHead>
                      <TableHead className="text-base">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-base">No Planet</TableCell>
                      <TableCell className="text-base">{(result.probability.no_planet * 100).toFixed(4)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-red-500 h-3 rounded-full transition-all"
                            style={{ width: `${result.probability.no_planet * 100}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-base">Planet Detected</TableCell>
                      <TableCell className="text-base">{(result.probability.planet * 100).toFixed(4)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full transition-all"
                            style={{ width: `${result.probability.planet * 100}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>Powered by Neural Network Model trained on Kepler Space Telescope data</p>
      </div>
    </div>
  );
};

export default LightCurvePredictor;
