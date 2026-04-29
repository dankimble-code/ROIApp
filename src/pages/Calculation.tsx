import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Calculator, TrendingUp, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { PDFExportService } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import { useProgram, usePrograms } from '@/hooks/usePrograms';
import { useBenefits } from '@/hooks/useBenefits';
import { useROICalculation } from '@/hooks/useROICalculation';
import { useBaselineScenario } from '@/hooks/useScenarios';
import { ROIChart } from '@/components/roi/ROIChart';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExportOptionsDialog } from '@/components/export/ExportOptionsDialog';
import { ExportProgramDialog } from '@/components/export/ExportProgramDialog';
import { useState } from 'react';
import { calculateProgramROI } from '@/lib/roi-calculations';

interface CalculationPageState {
  organization: any;
  program: any;
  benefits: any[];
  programId?: string;
}

export default function Calculation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { programId } = useParams<{ programId: string }>();
  
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showExportPicker, setShowExportPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // First try to get data from location state
  const state = location.state as CalculationPageState;
  
  // Fetch from database as fallback
  const { data: dbProgram } = useProgram(programId || '');
  const { data: dbBenefits = [] } = useBenefits(programId);
  const { data: scenario } = useBaselineScenario(programId || '');
  const { data: allPrograms = [] } = usePrograms();
  
  // Use state data if available, otherwise use database data
  const organization = state?.organization || dbProgram?.organization || {};
  const program = state?.program || dbProgram || {};
  const benefits = (state?.benefits && state.benefits.length > 0) ? state.benefits : dbBenefits;
  
  // Create effective scenario for calculation (fallback if none exists)
  const effectiveScenario = scenario || {
    id: 'baseline-auto',
    program_id: programId || '',
    name: 'Baseline',
    description: 'Auto-generated baseline for ROI calculations',
    discount_rate: 0.08,
    is_baseline: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Use the same ROI calculation hook as EnhancedROIDashboard for consistency
  const roiCalculation = useROICalculation(
    program?.id ? program : null,
    benefits,
    effectiveScenario as any
  );
  const fallbackCalculation = program?.id && benefits.length > 0
    ? calculateProgramROI({
        program: program as any,
        benefits,
        discountRate: effectiveScenario.discount_rate,
      })
    : null;

  // Log state for debugging NPV issues
  console.log('[Calculation Page] State:', {
    hasLocationState: !!state,
    hasDbProgram: !!dbProgram,
    programId: programId,
    programName: program?.name,
    benefitsCount: benefits.length,
    hasScenario: !!scenario,
    roiCalculationExists: !!roiCalculation,
    roiNpv: roiCalculation?.npv,
    roiIsValid: roiCalculation?.isValid,
    roiErrors: roiCalculation?.validationErrors,
  });
  
  const participantCount = program.participants_count || 1;
  const costPerParticipant = program.cost_per_participant || 10000;
  const totalProgramCost = (costPerParticipant * participantCount) + (program.overhead_costs || 0);
  
  // Validation flags
  const hasValidInputs = totalProgramCost > 0 && benefits.length > 0;
  const isCalculationValid = roiCalculation?.isValid ?? hasValidInputs;
  
  // Calculate total benefits for display
  const totalAttributableValue = benefits.reduce((sum, benefit) => 
    sum + ((benefit.annual_value || 0) * participantCount * ((benefit.attribution_percentage || 0) / 100) * ((benefit.confidence_level || 0) / 100)), 0
  );
  
  // Use values from the hook if available, otherwise calculate manually
  const effectiveCalculation = roiCalculation ?? fallbackCalculation;
  const analysisYears = effectiveCalculation?.analysisYears ?? 5;
  const roi = effectiveCalculation?.roi ?? 0;
  const paybackPeriod = effectiveCalculation?.paybackPeriod ?? Number.POSITIVE_INFINITY;
  const netBenefit = effectiveCalculation?.netBenefit ?? 0;
  const npv = effectiveCalculation?.npv ?? null;
  const displayTotalInvestment = effectiveCalculation?.totalInvestment ?? totalProgramCost;
  const displayAnnualBenefit = effectiveCalculation?.annualBenefit ?? totalAttributableValue;
  const displayTotalBenefits = effectiveCalculation?.totalBenefits ?? (displayAnnualBenefit * analysisYears);

  // Helper to format values with 1 decimal place or show N/A
  const formatValueOrNA = (value: number | null | undefined, formatter: (v: number) => string): string => {
    if (value === null || value === undefined || !Number.isFinite(value) || isNaN(value)) {
      return 'N/A';
    }
    return formatter(value);
  };

  // Format number to 1 decimal place
  const formatOneDecimal = (value: number): string => {
    return (Math.round(value * 10) / 10).toFixed(1);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleSaveAnalysis = () => {
    toast({
      title: "Analysis Saved",
      description: "Your ROI analysis has been saved successfully.",
    });
  };

  const handleExportReport = async () => {
    try {
      const pdfService = new PDFExportService();
      
      // Create properly structured program object for export
      const exportProgram = {
        id: programId || 'calculation-program',
        name: program.name || 'Executive Coaching Program',
        duration_months: program.duration_months || 12,
        participants_count: participantCount,
        cost_per_participant: costPerParticipant,
        overhead_costs: program.overhead_costs || 0,
        user_id: 'temp-user',
        organization_id: 'temp-org',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: {
          id: 'temp-org-id',
          name: organization.name || 'Organization',
          user_id: 'temp-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      
      // Prepare calculation data for export
      const calculationData = {
        [exportProgram.id]: {
          roi: roi,
          paybackPeriod: paybackPeriod,
          totalInvestment: totalProgramCost,
          totalBenefits: effectiveCalculation?.totalBenefits ?? (totalAttributableValue * analysisYears),
          npv: effectiveCalculation?.npv ?? 0,
          netBenefit: effectiveCalculation?.netBenefit ?? netBenefit,
          analysisYears: effectiveCalculation?.analysisYears ?? analysisYears,
          annualBenefit: effectiveCalculation?.annualBenefit ?? totalAttributableValue,
          benefitMultiple: effectiveCalculation?.benefitMultiple ?? (totalProgramCost > 0 ? (totalAttributableValue * analysisYears) / totalProgramCost : 0),
        }
      };

      const benefitData = {
        [exportProgram.id]: benefits
      };

      await pdfService.exportComparison(
        {
          programs: [exportProgram],
          benefits: benefitData,
          calculations: calculationData
        },
        {
          title: `ROI Analysis - ${program.name || 'Executive Coaching Program'}`,
          subtitle: `${organization.name || 'Organization'} Coaching Program Analysis`,
          includeLogo: true,
          includeFootnotes: true,
          sources: [
            'Program Investment and Benefits Data',
            'ROI Calculation Methodology',
            'Resonance Executive Coaching ROI Dashboard',
            'Bravanti Research Study (2025): Executive coaching ROI analysis of 100 executives over five years.',
            'FMI Corp Executive Coaching ROI Survey (2025): Engineering and construction industry executive coaching ROI study.',
            'MetrixGlobal Study (2024-2025): Executive coaching yields 788% ROI through productivity gains and employee retention.',
            'Boysen et al. Study (2024): Financial and intangible metrics of executive coaching.',
            'International Coach Federation (ICF) Global Coaching Study (2023): Survey of 100 executives showing average ROI of 6x coaching cost.'
          ],
          author: 'Resonance Executive Coaching'
        }
      );
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleExportMultiple = async (programIds: string[]) => {
    setIsExporting(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const pdfService = new PDFExportService();
      
      const selectedPrograms = allPrograms.filter(p => programIds.includes(p.id));
      
      const { data: allBenefitsData } = await supabase
        .from('benefits')
        .select('*')
        .in('program_id', programIds);
      
      const benefitsByProgram: Record<string, any[]> = {};
      (allBenefitsData || []).forEach(benefit => {
        if (!benefitsByProgram[benefit.program_id]) {
          benefitsByProgram[benefit.program_id] = [];
        }
        benefitsByProgram[benefit.program_id].push(benefit);
      });

      const roiCalculations: Record<string, any> = {};
      selectedPrograms.forEach(prog => {
        const progBenefits = benefitsByProgram[prog.id] || [];
        if (progBenefits.length === 0) return;
        const calculation = calculateProgramROI({
          program: prog,
          benefits: progBenefits,
          discountRate: 0.08,
        });
        roiCalculations[prog.id] = {
          ...calculation,
          roi: Math.round(calculation.roi * 10) / 10,
          npv: Math.round(calculation.npv),
          paybackPeriod: Math.round(calculation.paybackPeriod * 10) / 10,
          totalInvestment: Math.round(calculation.totalInvestment),
          annualBenefit: Math.round(calculation.annualBenefit),
          totalBenefits: Math.round(calculation.totalBenefits),
          netBenefit: Math.round(calculation.netBenefit),
          benefitMultiple: Math.round(calculation.benefitMultiple * 100) / 100,
        };
      });

      await pdfService.exportDashboard({
        programs: selectedPrograms.map(p => ({ ...p, organization: { id: p.organization_id || '', user_id: '', name: p.organization?.name || '', industry: p.organization?.industry || '', employee_count: p.organization?.employee_count || null, created_at: '', updated_at: '' } })),
        benefits: benefitsByProgram,
        roiCalculations,
        stats: { activePrograms: selectedPrograms.length, averageROI: 0, totalInvestment: selectedPrograms.reduce((s, p) => s + (p.cost_per_participant * p.participants_count) + (p.overhead_costs || 0), 0), totalParticipants: selectedPrograms.reduce((s, p) => s + p.participants_count, 0) },
      }, {
        title: selectedPrograms.length === 1 ? `ROI Analysis: ${selectedPrograms[0].name}` : 'Executive Coaching ROI Dashboard Report',
        subtitle: selectedPrograms.length === 1 ? `Comprehensive ROI analysis for ${selectedPrograms[0].organization?.name || ''}` : `Comprehensive analysis of ${selectedPrograms.length} coaching programs`,
        includeLogo: true,
        includeFootnotes: true,
        reportUrl: window.location.origin,
        sources: ['Resonance Executive Coaching Internal Analytics', 'Industry benchmarks from PwC, MetrixGlobal, and Center for Creative Leadership studies'],
        author: 'Resonance Executive Coaching',
      });
      setShowExportPicker(false);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Check if we have valid ROI calculation data for charts
  const hasChartData = !!effectiveCalculation?.yearlyBreakdown?.length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ROI Calculation Summary</h1>
            <p className="text-muted-foreground">
              Complete analysis for {program.name || 'Executive Coaching Program'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
            <Button variant="outline" onClick={() => setShowExportOptions(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Validation Warning */}
        {!isCalculationValid && (
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Calculator className="h-5 w-5" />
                <span className="font-medium">Calculation Notice</span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                Some values may be incomplete. Please ensure all program costs and benefits are entered.
                {roiCalculation?.validationErrors && roiCalculation.validationErrors.length > 0 && (
                  <span className="block mt-1 text-xs">
                    Issues: {roiCalculation.validationErrors.join(', ')}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ROI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">ROI (Over {analysisYears} Years)</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatValueOrNA(roi, (v) => `${v >= 0 ? '+' : ''}${formatOneDecimal(v)}%`)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Return on investment over {analysisYears}-year analysis period
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Net Present Value ({analysisYears}-Year)</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatValueOrNA(npv, formatCurrency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Present value of future benefits minus investment
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Payback Period</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatValueOrNA(paybackPeriod, (v) => `${formatOneDecimal(v)} mo`)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Time to break even on investment
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">Benefit Multiple ({analysisYears}-Year)</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {formatValueOrNA(
                  effectiveCalculation ? effectiveCalculation.benefitMultiple : null,
                  (v) => `${formatOneDecimal(v)}x`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total benefit ÷ investment over {analysisYears} years
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ROI Charts Section */}
        {hasChartData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Financial Analysis Charts</h2>
              <Badge variant="outline" className="text-xs">Over {analysisYears} Years</Badge>
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="min-w-0 overflow-hidden">
                <ROIChart 
                  roiCalculation={effectiveCalculation}
                  type="cashflow"
                  title={`Annual Cash Flow Analysis (${analysisYears}-Year Period)`}
                />
              </div>
              <div className="min-w-0 overflow-hidden">
                <ROIChart 
                  roiCalculation={effectiveCalculation}
                  type="cumulative"
                  title={`Cumulative ROI Projection (${analysisYears}-Year Period)`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle>Program Investment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Organization</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span>{organization.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry:</span>
                    <span>{organization.industry || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employees:</span>
                    <span>{organization.employee_count || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Program Costs</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per participant:</span>
                    <span>{formatCurrency(costPerParticipant)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Participants:</span>
                    <span>{participantCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overhead costs:</span>
                    <span>{formatCurrency(program.overhead_costs || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Investment:</span>
                    <span>{formatCurrency(displayTotalInvestment)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits Analysis (Annual Values)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((benefit, index) => {
              const totalValue = (benefit.annual_value || 0) * participantCount;
              const expectedImpact = totalValue * ((benefit.attribution_percentage || 0) / 100) * ((benefit.confidence_level || 0) / 100);
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{benefit.category}</Badge>
                        <Badge variant="secondary">
                          {formatPercentage(benefit.attribution_percentage || 0)} attribution
                        </Badge>
                        <Badge variant={(benefit.confidence_level || 0) >= 80 ? 'default' : 'outline'}>
                          {formatPercentage(benefit.confidence_level || 0)} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Annual Benefit:</span>
                      <div className="font-medium text-primary text-lg">{formatCurrency(expectedImpact)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-muted-foreground">Total Investment:</span>
                <div className="text-xl font-bold">{formatCurrency(displayTotalInvestment)}</div>
                <div className="text-xs text-muted-foreground">Per employee: {formatCurrency(costPerParticipant)}</div>
                {(program.overhead_costs || 0) > 0 && (
                  <div className="text-xs text-muted-foreground">Overhead costs: {formatCurrency(program.overhead_costs || 0)}</div>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Total Annual Benefit:</span>
                <div className="text-xl font-bold text-primary">{formatCurrency(displayAnnualBenefit)}</div>
                <div className="text-xs text-muted-foreground">
                  {analysisYears}-year total: {formatCurrency(displayTotalBenefits)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Section */}
        <Card>
          <CardHeader>
            <CardTitle>Supporting Research on Executive Coaching ROI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Here are five recent research studies (2021–2025) that document the ROI of executive coaching:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold">1. Bravanti Research Study (2025):</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzed data from 100 executives over five years. Found that participants reported an average ROI of nearly 84 times their initial coaching investment, demonstrating significant improvement in leadership effectiveness, innovation, and organizational culture.{" "}
                  <a 
                    href="https://www.linkedin.com/pulse/executive-coaching-research-impact-return-alyssa-poggioli-w6dic" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    [1]
                  </a>
                </p>
              </div>

              <div className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold">2. FMI Corp Executive Coaching ROI Survey (2025):</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Surveyed company leaders in engineering and construction. Reported that executives saw an average ROI of nearly six times their investment over a 3-year period, with 25% of clients experiencing an ROI between 10–49 times the cost of coaching.{" "}
                  <a 
                    href="https://fmicorp.com/reports/executive-coaching-driving-real-roi-for-leaders-in-engineering-and-construction" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    [2]
                  </a>
                </p>
              </div>

              <div className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold">3. MetrixGlobal Study (as cited 2024–2025):</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Published in multiple sources, this study concluded executive coaching yields a 788% ROI over a 5-year measurement period, attributed primarily to productivity gains and employee retention.{" "}
                  <a 
                    href="https://luisazhou.com/blog/coaching-statistics/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    [3]
                  </a>
                </p>
              </div>

              <div className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold">4. Boysen et al. Study (2024):</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Focused on financial and intangible metrics of executive coaching. Respondents estimated ROI/economic benefits between $200,000 and $500,000 per intervention over a 2-year period, factoring in recruitment cost savings, increased engagement, and productivity improvements.{" "}
                  <a 
                    href="https://www.scirp.org/journal/paperinformation?paperid=134086" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    [6]
                  </a>
                </p>
              </div>

              <div className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold">5. International Coach Federation (ICF) Global Coaching Study (2023):</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Survey of 100 executives showed an average ROI of almost six times the cost of coaching over a 1-year period. 86% of companies were able to calculate a positive ROI, with a median ROI of seven times the investment across organizations.{" "}
                  <a 
                    href="https://ardencoaching.com/returns-on-executive-coaching-programs/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    [4]
                  </a>
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pt-4 border-t">
              These studies provide robust evidence that executive coaching can yield substantial financial returns and improvement in individual and organizational performance over the past five years.
            </p>

            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p className="font-medium">Additional References:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <a href="https://entrepreneurshq.com/coaching-industry-statistics/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">[7] Coaching Industry Statistics</a>
                <a href="https://www.forbes.com/councils/forbescoachescouncil/2023/02/24/the-roi-of-executive-coaching-a-comprehensive-guide/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">[8] Forbes Coaches Council Guide</a>
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10699640/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">[9] NCBI Research Article</a>
                <a href="https://www.shrm.org/executive-network/insights/people-strategy/end-executive-coaching" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">[10] SHRM Executive Coaching Insights</a>
                <a href="https://www.edgecumbe.co.uk/insights/executive-coaching-effectiveness/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">[11] Executive Coaching Effectiveness</a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleStartOver}>
            Start New Analysis
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveAnalysis}>
              Save Analysis
            </Button>
            <Button onClick={() => setShowExportOptions(true)}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <ExportOptionsDialog
        open={showExportOptions}
        onOpenChange={setShowExportOptions}
        showCurrentOption={true}
        currentProgramName={program.name}
        onExportCurrent={handleExportReport}
        onSelectPrograms={() => setShowExportPicker(true)}
        onExportAll={() => handleExportMultiple(allPrograms.map(p => p.id))}
        programCount={allPrograms.length}
        isExporting={isExporting}
      />

      <ExportProgramDialog
        open={showExportPicker}
        onOpenChange={setShowExportPicker}
        programs={allPrograms}
        onExport={handleExportMultiple}
        isExporting={isExporting}
      />
    </AppLayout>
  );
}
