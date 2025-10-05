import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Database, Filter, Info } from 'lucide-react';

type Planet = {
  id: number;
  name: string;
  dataset: 'Kepler' | 'K2' | 'TESS';
  radius: number;
  period: number;
  temp: number;        // unified from eq_temp / pl_eqt / koi_teq
  disposition: string; // CONFIRMED / CANDIDATE / FALSE POSITIVE
  raw?: Record<string, any>;
};

const DATASETS = [
  { key: 'Kepler', path: '/data/kepler.csv' },
  { key: 'K2', path: '/data/k2.csv' },
  { key: 'TESS', path: '/data/tess.csv' },
] as const;

const dispositionNormalize = (val: any) => {
  if (!val) return 'CANDIDATE';
  const s = String(val).toUpperCase();
  if (['CONFIRMED', 'C'].includes(s)) return 'CONFIRMED';
  if (['FALSE POSITIVE', 'FP'].includes(s)) return 'FALSE POSITIVE';
  return 'CANDIDATE';
};

function standardizeRow(row: any, dataset: string): Planet | null {
  // Extract & normalize columns per dataset
  try {
    let period: number | undefined;
    let radius: number | undefined;
    let eq_temp: number | undefined;
    let disposition: string | undefined;
    let name: string | undefined;

    if (dataset === 'Kepler') {
      period = parseFloat(row['koi_period']);
      radius = parseFloat(row['koi_prad']);
      eq_temp = parseFloat(row['koi_teq']);
      disposition = row['koi_disposition'];
      // Prioritize confirmed Kepler planet name, then KOI ID
      name = row['kepler_name'] || row['kepoi_name'] || `KepID-${row['kepid']}`;
    } else if (dataset === 'K2') {
      period = parseFloat(row['pl_orbper']);
      radius = parseFloat(row['pl_rade']);
      eq_temp = parseFloat(row['pl_eqt']);
      disposition = row['disposition'] || row['k2_disposition'];
      // For K2, use planet name as is (often includes EPIC prefix)
      name = row['pl_name'] || row['hostname'] || 'K2-Object';
    } else if (dataset === 'TESS') {
      period = parseFloat(row['pl_orbper']);
      radius = parseFloat(row['pl_rade']);
      eq_temp = parseFloat(row['pl_eqt']);
      disposition = row['tfopwg_disp'] || row['disposition'];
      // Prioritize TOI ID, then TIC ID, then planet name
      name = (row['toi'] ? `TOI-${row['toi']}` : null) || 
             (row['tid'] ? `TIC-${row['tid']}` : null) || 
             row['pl_name'] || 
             row['hostname'] || 
             'TESS-Object';
    }

    if (
      period === undefined || isNaN(period) ||
      radius === undefined || isNaN(radius) ||
      eq_temp === undefined || isNaN(eq_temp)
    ) {
      return null;
    }

    return {
      id: 0, // temporary, will assign later
      name: name || `${dataset}-Object`,
      dataset: dataset as Planet['dataset'],
      radius,
      period,
      temp: eq_temp,
      disposition: dispositionNormalize(disposition),
      raw: row
    };
  } catch {
    return null;
  }
}

const DataExplorer = () => {
  const [dataset, setDataset] = useState<string>('all');
  const [minRadius, setMinRadius] = useState<string>('');
  const [maxRadius, setMaxRadius] = useState<string>('');
  const [minPeriod, setMinPeriod] = useState<string>('');
  const [maxPeriod, setMaxPeriod] = useState<string>('');
  const [minTemp, setMinTemp] = useState<string>('');
  const [maxTemp, setMaxTemp] = useState<string>('');

  const [allData, setAllData] = useState<Planet[]>([]);
  const [filteredData, setFilteredData] = useState<Planet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch & build unified dataset
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const collected: Planet[] = [];
      for (const entry of DATASETS) {
        try {
          const res = await fetch(entry.path);
          if (!res.ok) throw new Error(`${entry.path} ${res.status}`);
          const csvText = await res.text();

          // Remove NASA comment lines (starting with #)
          const cleanedText = csvText
            .split('\n')
            .filter(line => !line.trim().startsWith('#'))
            .join('\n');

          // Parse
          const parsed = Papa.parse(cleanedText, {
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
          });

          if (parsed.errors.length) {
            console.warn(`Parse warnings for ${entry.path}`, parsed.errors.slice(0, 3));
          }

          (parsed.data as any[]).forEach((row) => {
            const p = standardizeRow(row, entry.key);
            if (p) collected.push(p);
          });
        } catch (e: any) {
          console.error(e);
          setError(prev => prev ? prev + ` | ${e.message}` : e.message);
        }
      }

      // Assign stable IDs
      collected.forEach((p, idx) => (p.id = idx + 1));

      if (!cancelled) {
        setAllData(collected);
        setFilteredData(collected);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const applyFilters = () => {
    let filtered = allData;

    if (dataset !== 'all') {
      filtered = filtered.filter(p => p.dataset === dataset);
    }

    if (minRadius) {
      filtered = filtered.filter(p => p.radius >= parseFloat(minRadius));
    }
    if (maxRadius) {
      filtered = filtered.filter(p => p.radius <= parseFloat(maxRadius));
    }

    if (minPeriod) {
      filtered = filtered.filter(p => p.period >= parseFloat(minPeriod));
    }
    if (maxPeriod) {
      filtered = filtered.filter(p => p.period <= parseFloat(maxPeriod));
    }

    if (minTemp) {
      filtered = filtered.filter(p => p.temp >= parseFloat(minTemp));
    }
    if (maxTemp) {
      filtered = filtered.filter(p => p.temp <= parseFloat(maxTemp));
    }

    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setDataset('all');
    setMinRadius('');
    setMaxRadius('');
    setMinPeriod('');
    setMaxPeriod('');
    setMinTemp('');
    setMaxTemp('');
    setFilteredData(allData);
  };

  return (
    <>
      <div className="grid gap-6">
        {/* Filters Card */}
        <Card className="glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Refine your search across Kepler, K2, and TESS standardized catalogs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dataset Selection */}
            <div className="space-y-2">
              <Label htmlFor="dataset" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Dataset
              </Label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Datasets</SelectItem>
                  <SelectItem value="Kepler">Kepler</SelectItem>
                  <SelectItem value="K2">K2</SelectItem>
                  <SelectItem value="TESS">TESS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Radius Filter */}
              <div className="space-y-2">
                <Label>Radius (Earth radii)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={minRadius}
                    onChange={(e) => setMinRadius(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={maxRadius}
                    onChange={(e) => setMaxRadius(e.target.value)}
                  />
                </div>
              </div>

              {/* Period Filter */}
              <div className="space-y-2">
                <Label>Orbital Period (days)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={minPeriod}
                    onChange={(e) => setMinPeriod(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={maxPeriod}
                    onChange={(e) => setMaxPeriod(e.target.value)}
                  />
                </div>
              </div>

              {/* Temperature Filter */}
              <div className="space-y-2">
                <Label>Temperature (K)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minTemp}
                    onChange={(e) => setMinTemp(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="glow-border">
          <CardHeader>
            <CardTitle>
              Results {loading ? '(Loading...)' : `(${filteredData.length} planets)`}
            </CardTitle>
            <CardDescription>
              {error ? <span className="text-destructive">Data load issue: {error}</span> : 'Click info to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Planet ID</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Radius (R⊕)</TableHead>
                    <TableHead>Period (days)</TableHead>
                    <TableHead>Temp (K)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading catalogs...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No planets match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.slice(0, 500).map(p => ( // slice to avoid huge DOM
                      <TableRow key={p.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.dataset}</Badge></TableCell>
                        <TableCell>{p.radius.toFixed(2)}</TableCell>
                        <TableCell>{p.period.toFixed(2)}</TableCell>
                        <TableCell>{Math.round(p.temp)}</TableCell>
                        <TableCell>
                          <Badge variant={p.disposition === 'CONFIRMED' ? 'default' : (p.disposition === 'FALSE POSITIVE' ? 'destructive' : 'secondary')}>
                            {p.disposition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPlanet(p)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {!loading && filteredData.length > 500 && (
                <p className="text-xs text-muted-foreground px-4 py-2">
                  Showing first 500 rows (apply more filters to narrow results)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planet Details Dialog */}
      <Dialog open={!!selectedPlanet} onOpenChange={() => setSelectedPlanet(null)}>
        <DialogContent className="glow-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPlanet?.name}</DialogTitle>
            <DialogDescription>Standardized catalog entry</DialogDescription>
          </DialogHeader>
          {selectedPlanet && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Dataset</p>
                  <p className="font-medium">{selectedPlanet.dataset}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disposition</p>
                  <p className="font-medium">{selectedPlanet.disposition}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Radius (R⊕)</p>
                  <p className="font-medium">{selectedPlanet.radius.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Period (days)</p>
                  <p className="font-medium">{selectedPlanet.period.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Equilibrium Temp (K)</p>
                  <p className="font-medium">{Math.round(selectedPlanet.temp)}</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-muted-foreground">
                  Raw standardized fields are available in memory (see developer tools). This entry was created by client-side normalization.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataExplorer;
