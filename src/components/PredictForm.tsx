import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/predict';

interface FormData {
  period: string;
  duration: string;
  radius: string;
  depth: string;
  snr: string;
  disposition: string;
}

interface PredictionResult {
  kepler_name?: string;
  pl_name?: string;
  toi?: string;
  prediction: string;
  prob_0?: number;
  prob_1?: number;
  prob_2?: number;
}

export default function PredictForm() {
  const [form, setForm] = useState<FormData>({
    period: '',
    duration: '',
    radius: '',
    depth: '',
    snr: '',
    disposition: 'CANDIDATE'
  });

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PredictionResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleDispositionChange(value: string) {
    setForm(prev => ({ ...prev, disposition: value }));
  }

  async function submitJSON(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        period: parseFloat(form.period || '0'),
        duration: parseFloat(form.duration || '0'),
        radius: parseFloat(form.radius || '0'),
        depth: parseFloat(form.depth || '0'),
        snr: parseFloat(form.snr || '0'),
        disposition: form.disposition
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(Array.isArray(data) ? data : [data]);
      toast.success('Prediction complete!');
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function submitFile(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(API_URL, { method: 'POST', body: fd });
      const text = await res.text();
      const data = JSON.parse(text);
      setResult(Array.isArray(data) ? data : [data]);
      toast.success('Batch prediction complete!');
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Single Prediction Form */}
      <Card className="glow-border bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 glow-text">
            <Sparkles className="h-6 w-6" />
            Single Planet Analysis
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter exoplanet parameters for classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitJSON} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period" className="text-sm font-medium">
                  Orbital Period (days)
                </Label>
                <Input
                  id="period"
                  name="period"
                  type="number"
                  step="any"
                  value={form.period}
                  onChange={handleChange}
                  className="bg-secondary/30 border-border/50 focus:border-primary focus:glow-border transition-all"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Transit Duration (hours)
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  step="any"
                  value={form.duration}
                  onChange={handleChange}
                  className="bg-secondary/30 border-border/50 focus:border-primary focus:glow-border transition-all"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius" className="text-sm font-medium">
                  Planet Radius (R⊕)
                </Label>
                <Input
                  id="radius"
                  name="radius"
                  type="number"
                  step="any"
                  value={form.radius}
                  onChange={handleChange}
                  className="bg-secondary/30 border-border/50 focus:border-primary focus:glow-border transition-all"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depth" className="text-sm font-medium">
                  Transit Depth (ppm)
                </Label>
                <Input
                  id="depth"
                  name="depth"
                  type="number"
                  step="any"
                  value={form.depth}
                  onChange={handleChange}
                  className="bg-secondary/30 border-border/50 focus:border-primary focus:glow-border transition-all"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="snr" className="text-sm font-medium">
                  Signal-to-Noise Ratio
                </Label>
                <Input
                  id="snr"
                  name="snr"
                  type="number"
                  step="any"
                  value={form.snr}
                  onChange={handleChange}
                  className="bg-secondary/30 border-border/50 focus:border-primary focus:glow-border transition-all"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disposition" className="text-sm font-medium">
                  Current Disposition
                </Label>
                <Select value={form.disposition} onValueChange={handleDispositionChange}>
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CANDIDATE">CANDIDATE</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="FALSE POSITIVE">FALSE POSITIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold glow-border"
            >
              {loading ? 'Analyzing...' : 'Run Classification'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card className="glow-border bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 glow-text">
            <Upload className="h-6 w-6" />
            Batch CSV Upload
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload multiple planets for batch analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-all">
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-primary/70" />
                <p className="text-sm font-medium">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV format with planet parameters
                </p>
              </div>
            </Label>
          </div>

          <Button 
            onClick={submitFile} 
            disabled={loading || !file}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold glow-border"
          >
            {loading ? 'Processing...' : 'Analyze Batch'}
          </Button>

          {/* Results Table */}
          {result && result.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 glow-text">Analysis Results</h3>
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/50">
                      <TableHead className="font-semibold">Planet ID</TableHead>
                      <TableHead className="font-semibold">Classification</TableHead>
                      <TableHead className="font-semibold">Probabilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.map((r, idx) => (
                      <TableRow key={idx} className="hover:bg-secondary/20">
                        <TableCell className="font-mono">
                          {r.kepler_name || r.pl_name || r.toi || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            r.prediction === 'CONFIRMED' 
                              ? 'bg-primary/20 text-primary' 
                              : r.prediction === 'FALSE POSITIVE'
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {r.prediction}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {r.prob_0 !== undefined && r.prob_1 !== undefined
                            ? `FP: ${(r.prob_0 * 100).toFixed(1)}% | CAND: ${(r.prob_1 * 100).toFixed(1)}%${r.prob_2 !== undefined ? ` | CONF: ${(r.prob_2 * 100).toFixed(1)}%` : ''}`
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
