import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, LineChart } from 'lucide-react';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/predict-lightcurve';

const LightCurvePredictor = () => {
  const [fluxData, setFluxData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
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
    <div className="grid md:grid-cols-2 gap-6">
      {/* Manual Input */}
      <Card className="glow-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            <CardTitle>Manual Flux Input</CardTitle>
          </div>
          <CardDescription>
            Enter flux values from light curve data (comma or space separated)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fluxData">Flux Values</Label>
              <Textarea
                id="fluxData"
                placeholder="Example: 1.0002, 0.9998, 1.0001, 0.9999, 1.0000..."
                value={fluxData}
                onChange={(e) => setFluxData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter normalized flux values separated by commas or spaces
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Predict Exoplanet
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card className="glow-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <CardTitle>Upload CSV File</CardTitle>
          </div>
          <CardDescription>
            Upload a CSV file containing flux values (one column)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="csvFile" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {file ? file.name : 'Click to upload CSV file'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    CSV should contain flux values in a single column
                  </p>
                </label>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !file}
              className="w-full"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Predict
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="md:col-span-2 glow-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>
              Neural network classification based on light curve analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Classification</p>
                  <p className={`text-2xl font-bold ${
                    result.prediction === 'PLANET DETECTED' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {result.prediction}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Planet Probability</p>
                  <p className="text-2xl font-bold text-primary">
                    {(result.probability.planet * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Flux Data Points</p>
                  <p className="text-2xl font-bold">
                    {result.flux_points}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-background/50 border border-border p-4">
                <h4 className="font-semibold mb-3">Detailed Probabilities</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">No Planet</TableCell>
                      <TableCell>{(result.probability.no_planet * 100).toFixed(4)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${result.probability.no_planet * 100}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Planet Detected</TableCell>
                      <TableCell>{(result.probability.planet * 100).toFixed(4)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
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
    </div>
  );
};

export default LightCurvePredictor;
