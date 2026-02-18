import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePrograms } from '@/hooks/usePrograms';
import { useIsAdmin } from '@/hooks/useUserRole';
import { ProgramWizard } from '@/components/wizard/ProgramWizard';
import { ProgramList } from '@/components/programs/ProgramList';
import { CompareView } from '@/components/compare/CompareView';
import { ExportProgramDialog } from '@/components/export/ExportProgramDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  FileDown, 
  Shield, 
  Target, 
  Users, 
  DollarSign 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrandedLoader } from '@/components/ui/branded-loader';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const { data: programs = [], isLoading } = usePrograms();
  
  const [showWizard, setShowWizard] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Calculate real statistics
  const totalPrograms = programs.length;
  const totalParticipants = programs.reduce((sum, program) => sum + program.participants_count, 0);
  const totalInvestment = programs.reduce((sum, program) => 
    sum + (program.cost_per_participant * program.participants_count) + (program.overhead_costs || 0), 0
  );

  const handleExportPDF = async (programIds: string[]) => {
    setIsExporting(true);
    try {
      const { PDFExportService } = await import('@/lib/pdf-export');
      const { supabase } = await import('@/integrations/supabase/client');
      const pdfService = new PDFExportService();
      
      const selectedPrograms = programs.filter(p => programIds.includes(p.id));
      
      // Fetch all benefits for selected programs
      const { data: allBenefits } = await supabase
        .from('benefits')
        .select('*')
        .in('program_id', programIds);
      
      // Group benefits by program
      const benefitsByProgram: Record<string, any[]> = {};
      (allBenefits || []).forEach(benefit => {
        if (!benefitsByProgram[benefit.program_id]) {
          benefitsByProgram[benefit.program_id] = [];
        }
        benefitsByProgram[benefit.program_id].push(benefit);
      });

      // Calculate ROI for each program
      const roiCalculations: Record<string, any> = {};

      selectedPrograms.forEach(program => {
        const programBenefits = benefitsByProgram[program.id] || [];
        if (programBenefits.length === 0) return;

        const totalProgramCost = (program.cost_per_participant * program.participants_count) + (program.overhead_costs || 0);
        const annualCosts = totalProgramCost / program.duration_months * 12;
        const discountRate = 0.08;
        
        const totalAnnualBenefits = programBenefits.reduce((sum, benefit) => {
          return sum + (benefit.annual_value * program.participants_count * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100));
        }, 0);

        const analysisYears = Math.max(5, Math.ceil(program.duration_months / 12) + 2);
        
        const yearlyBreakdown = [];
        let cumulativeCashFlow = -totalProgramCost;
        let npv = -totalProgramCost;
        let paybackPeriod = 0;

        for (let year = 1; year <= analysisYears; year++) {
          const isCoachingYear = year <= Math.ceil(program.duration_months / 12);
          const costs = isCoachingYear ? annualCosts : 0;
          const benefits = year <= Math.ceil(program.duration_months / 12) 
            ? totalAnnualBenefits * (year / Math.ceil(program.duration_months / 12))
            : totalAnnualBenefits;

          const netCashFlow = benefits - costs;
          cumulativeCashFlow += netCashFlow;
          
          const discountedCashFlow = netCashFlow / Math.pow(1 + discountRate, year);
          npv += discountedCashFlow;

          if (paybackPeriod === 0 && cumulativeCashFlow >= 0) {
            const previousCumulative = cumulativeCashFlow - netCashFlow;
            paybackPeriod = year - 1 + Math.abs(previousCumulative) / netCashFlow;
          }

          yearlyBreakdown.push({
            year,
            benefits: Math.round(benefits),
            costs: Math.round(costs),
            cumulative: Math.round(cumulativeCashFlow)
          });
        }

        const totalInvestmentCalc = totalProgramCost;
        const totalBenefits = totalAnnualBenefits * analysisYears;
        const netBenefit = totalBenefits - totalInvestmentCalc;
        const roi = (netBenefit / totalInvestmentCalc) * 100;

        roiCalculations[program.id] = {
          roi: Math.round(roi * 10) / 10,
          npv: Math.round(npv),
          paybackPeriod: Math.round((paybackPeriod || analysisYears) * 10) / 10,
          totalInvestment: Math.round(totalInvestmentCalc),
          totalBenefits: Math.round(totalBenefits),
          netBenefit: Math.round(netBenefit),
          yearlyBreakdown
        };
      });

      const selectedTotalInvestment = selectedPrograms.reduce((sum, program) => 
        sum + (program.cost_per_participant * program.participants_count) + (program.overhead_costs || 0), 0
      );
      const selectedTotalParticipants = selectedPrograms.reduce((sum, program) => sum + program.participants_count, 0);

      // Build the report URL linking back to the app
      const reportUrl = window.location.origin;

      const dashboardData = {
        programs: selectedPrograms.map(p => ({ 
          ...p, 
          organization: { 
            id: p.organization_id || 'temp-id',
            user_id: 'temp-user-id',
            name: p.organization?.name || 'Unknown Organization',
            industry: p.organization?.industry || 'Not specified',
            employee_count: p.organization?.employee_count || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } 
        })),
        benefits: benefitsByProgram,
        roiCalculations,
        stats: {
          activePrograms: selectedPrograms.length,
          averageROI: 425,
          totalInvestment: selectedTotalInvestment,
          totalParticipants: selectedTotalParticipants
        }
      };

      await pdfService.exportDashboard(dashboardData, {
        title: selectedPrograms.length === 1 
          ? `ROI Analysis: ${selectedPrograms[0].name}`
          : 'Executive Coaching ROI Dashboard Report',
        subtitle: selectedPrograms.length === 1
          ? `Comprehensive ROI analysis for ${selectedPrograms[0].organization?.name || 'Unknown Organization'}`
          : `Comprehensive analysis of ${selectedPrograms.length} coaching programs and their return on investment`,
        includeLogo: true,
        includeFootnotes: true,
        reportUrl,
        sources: [
          'Resonance Executive Coaching Internal Analytics',
          'Industry benchmarks from PwC, MetrixGlobal, and Center for Creative Leadership studies',
          'Program data collected from organization assessments and participant feedback'
        ],
        author: 'Resonance Executive Coaching'
      });

      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting dashboard PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCompare = (programIds: string[]) => {
    setSelectedProgramIds(programIds);
    setShowCompare(true);
  };

  if (showWizard) {
    return (
      <AppLayout>
        <ProgramWizard
          onComplete={() => setShowWizard(false)}
          onCancel={() => setShowWizard(false)}
        />
      </AppLayout>
    );
  }

  if (showCompare) {
    return (
      <AppLayout>
        <CompareView
          programIds={selectedProgramIds}
          onBack={() => setShowCompare(false)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="space-y-8 brand-watermark resonance-pattern">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between hero-gradient rounded-lg p-6 shadow-resonance border border-primary/10">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Coaching Programs
              </h1>
              <p className="text-muted-foreground text-lg">
                Select a program to view its ROI Calculation Summary
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Resonance Executive Coaching
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  by Daniel Kimble
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin')} 
                  className="shadow-sm hover:shadow-md transition-resonance border-amber-500/50 text-amber-600 hover:bg-amber-50"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Settings
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowExportDialog(true)} className="shadow-sm hover:shadow-md transition-resonance">
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={() => setShowWizard(true)} className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-resonance">
                <Plus className="mr-2 h-4 w-4" />
                New Program
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-watermark bg-gradient-card shadow-resonance hover:shadow-elevated transition-resonance border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalPrograms}</div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? <BrandedLoader size="sm" message="" variant="spinner" /> : 'Total coaching programs'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-watermark bg-gradient-card shadow-resonance hover:shadow-elevated transition-resonance border border-secondary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{formatCurrency(totalInvestment)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all programs
                </p>
              </CardContent>
            </Card>

            <Card className="card-watermark bg-gradient-card shadow-resonance hover:shadow-elevated transition-resonance border border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalParticipants}</div>
                <p className="text-xs text-muted-foreground">
                  Total coaching participants
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Program List */}
          <div className="section-gradient bg-gradient-card rounded-lg p-6 shadow-resonance border border-primary/5">
            <ProgramList onCompare={handleCompare} onShowWizard={() => setShowWizard(true)} />
          </div>
        </div>
      </TooltipProvider>

      <ExportProgramDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        programs={programs}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />
    </AppLayout>
  );
};

export default Index;
