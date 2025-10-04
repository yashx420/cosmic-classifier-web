import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Database, Filter, Info } from 'lucide-react';

// Sample exoplanet data
const sampleData = [
  { id: 1, name: 'Kepler-442b', dataset: 'Kepler', radius: 1.34, period: 112.3, temp: 233, disposition: 'CONFIRMED' },
  { id: 2, name: 'K2-18b', dataset: 'K2', radius: 2.24, period: 32.9, temp: 284, disposition: 'CONFIRMED' },
  { id: 3, name: 'TOI-700d', dataset: 'TESS', radius: 1.19, period: 37.4, temp: 269, disposition: 'CONFIRMED' },
  { id: 4, name: 'Kepler-186f', dataset: 'Kepler', radius: 1.17, period: 129.9, temp: 188, disposition: 'CONFIRMED' },
  { id: 5, name: 'K2-72e', dataset: 'K2', radius: 0.86, period: 24.2, temp: 290, disposition: 'CANDIDATE' },
  { id: 6, name: 'TOI-1452b', dataset: 'TESS', radius: 1.67, period: 11.1, temp: 326, disposition: 'CANDIDATE' },
  { id: 7, name: 'Kepler-62f', dataset: 'Kepler', radius: 1.41, period: 267.3, temp: 208, disposition: 'CONFIRMED' },
  { id: 8, name: 'K2-155d', dataset: 'K2', radius: 1.64, period: 40.7, temp: 257, disposition: 'CONFIRMED' },
];

const DataExplorer = () => {
  const [dataset, setDataset] = useState<string>('all');
  const [minRadius, setMinRadius] = useState<string>('');
  const [maxRadius, setMaxRadius] = useState<string>('');
  const [minPeriod, setMinPeriod] = useState<string>('');
  const [maxPeriod, setMaxPeriod] = useState<string>('');
  const [minTemp, setMinTemp] = useState<string>('');
  const [maxTemp, setMaxTemp] = useState<string>('');
  const [selectedPlanet, setSelectedPlanet] = useState<typeof sampleData[0] | null>(null);
  const [filteredData, setFilteredData] = useState(sampleData);

  const applyFilters = () => {
    let filtered = sampleData;

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
    setFilteredData(sampleData);
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
              Refine your search by dataset and exoplanet characteristics
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
            <CardTitle>Results ({filteredData.length} planets)</CardTitle>
            <CardDescription>
              Click on a planet to view detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Radius (R⊕)</TableHead>
                    <TableHead>Period (days)</TableHead>
                    <TableHead>Temp (K)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No planets match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((planet) => (
                      <TableRow key={planet.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{planet.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{planet.dataset}</Badge>
                        </TableCell>
                        <TableCell>{planet.radius.toFixed(2)}</TableCell>
                        <TableCell>{planet.period.toFixed(1)}</TableCell>
                        <TableCell>{planet.temp}</TableCell>
                        <TableCell>
                          <Badge variant={planet.disposition === 'CONFIRMED' ? 'default' : 'secondary'}>
                            {planet.disposition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPlanet(planet)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planet Details Dialog */}
      <Dialog open={!!selectedPlanet} onOpenChange={() => setSelectedPlanet(null)}>
        <DialogContent className="glow-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPlanet?.name}</DialogTitle>
            <DialogDescription>Detailed exoplanet information</DialogDescription>
          </DialogHeader>
          {selectedPlanet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dataset</p>
                  <p className="font-medium">{selectedPlanet.dataset}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedPlanet.disposition === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {selectedPlanet.disposition}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Radius</p>
                  <p className="font-medium">{selectedPlanet.radius.toFixed(2)} R⊕</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orbital Period</p>
                  <p className="font-medium">{selectedPlanet.period.toFixed(1)} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="font-medium">{selectedPlanet.temp} K</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  This exoplanet was discovered by the {selectedPlanet.dataset} mission using the transit method.
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
