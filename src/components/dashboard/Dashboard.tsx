import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProgramWizard } from '@/components/wizard/ProgramWizard';
import { ProgramList } from '@/components/programs/ProgramList';
import { BenchmarkView } from '@/components/benchmark/BenchmarkView';
import { CompareView } from '@/components/compare/CompareView';
import { ROIProjectionCard } from '@/components/roi/ROIProjectionCard';
import { ROIChart } from '@/components/roi/ROIChart';
import { usePrograms } from '@/hooks/usePrograms';
import { useBenefits } from '@/hooks/useBenefits';
import { useBaselineScenario } from '@/hooks/useScenarios';
import { useROICalculation } from '@/hooks/useROICalculation';
import { 
  FileDown, 
  Plus, 
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Info
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);

  const { data: programs = [], isLoading } = usePrograms();

  // Calculate real dashboard statistics
  const totalPrograms = programs.length;
  const totalParticipants = programs.reduce((sum, program) => sum + program.participants_count, 0);
  const totalInvestment = programs.reduce((sum, program) => 
    sum + (program.cost_per_participant * program.participants_count) + program.overhead_costs, 0
  );

  // For now, use simplified stats until we can properly implement program-specific ROI without hook violations
  const averageROI = 425; // Industry average - will be calculated properly when individual program views are implemented
  
  // Simplified program data for now - avoiding hook rule violations  
  const programsWithROI: any[] = []; // Will be populated properly in individual program detail views

  const handleExportPDF = () => {
    // exportToPDF(); // TODO: Implement PDF export
    console.log('PDF export not yet implemented');
  };

  const handleCompare = (programIds: string[]) => {
    setSelectedProgramIds(programIds);
    setShowCompare(true);
  };

  if (showWizard) {
    return (
      <ProgramWizard
        onComplete={() => setShowWizard(false)}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  if (showCompare) {
    return (
      <CompareView
        programIds={selectedProgramIds}
        onBack={() => setShowCompare(false)}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ROI Dashboard</h1>
            <p className="text-muted-foreground">
              Track and analyze the return on investment of your coaching programs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Program
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPrograms}</div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Loading...' : 'Total coaching programs'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPercentage(averageROI)}
              </div>
              <p className="text-xs text-muted-foreground">
                {programsWithROI.length > 0 
                  ? `Across ${programsWithROI.length} programs with benefits` 
                  : 'Add benefits to calculate ROI'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
              <p className="text-xs text-muted-foreground">
                Across all programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                Total coaching participants
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ROI Projections */}
        {programsWithROI.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">ROI Projections</h2>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Programs with calculated ROI based on defined benefits</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programsWithROI.slice(0, 6).map(({ program }) => (
                <ROIProjectionCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        )}

        {/* ROI Analysis Charts */}
        {programsWithROI.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <ROIChart 
              roiCalculation={programsWithROI[0].roiCalculation!}
              type="cashflow"
              title="Cash Flow Analysis - Featured Program"
            />
            <ROIChart 
              roiCalculation={programsWithROI[0].roiCalculation!}
              type="cumulative"
              title="Cumulative ROI Projection"
            />
          </div>
        )}

        <Separator />

        {/* Main Content Tabs */}
        <Tabs defaultValue="programs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            <ProgramList onCompare={handleCompare} />
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-4">
            <BenchmarkView />
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Compare Programs</h3>
              <p className="text-muted-foreground mb-4">
                Select programs from the Programs tab to compare their ROI and performance metrics.
              </p>
              <Button variant="outline" onClick={() => setSelectedProgramIds([])}>
                Go to Programs
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}