import { useState } from 'react';
import { Plus, Calculator, TrendingUp, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgramWizard } from '@/components/wizard/ProgramWizard';
import { ProgramList } from '@/components/programs/ProgramList';
import { CompareView } from '@/components/compare/CompareView';
import { BenchmarkView } from '@/components/benchmark/BenchmarkView';

export function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const handleProgramCreated = () => {
    setShowWizard(false);
    // Refresh programs list
  };

  const handleComparePrograms = (programIds: string[]) => {
    setSelectedPrograms(programIds);
    setShowCompare(true);
  };

  if (showWizard) {
    return (
      <ProgramWizard
        onComplete={handleProgramCreated}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  if (showCompare) {
    return (
      <CompareView
        programIds={selectedPrograms}
        onBack={() => setShowCompare(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Resonance Executive Coaching ROI Dashboard
          </h1>
          <p className="text-muted-foreground">
            Analyze and optimize your coaching program investments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Program
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              coaching programs created
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              across all programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              in coaching programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              total participants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Coaching Programs</CardTitle>
              <CardDescription>
                Manage and analyze your executive coaching investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramList onCompare={handleComparePrograms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <BenchmarkView />
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Comparison</CardTitle>
              <CardDescription>
                Compare up to 3 coaching programs side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Select programs from the Programs tab to compare them here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}