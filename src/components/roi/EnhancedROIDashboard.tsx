import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Target,
  Download,
  Info
} from 'lucide-react';
import { Program, Benefit, Scenario } from '@/types/coaching';
import { useROICalculation } from '@/hooks/useROICalculation';
import { useBaselineScenario } from '@/hooks/useScenarios';
import { useBenefits } from '@/hooks/useBenefits';
import { ROIExplanationPanel } from './ROIExplanationPanel';
import { ROIWaterfallChart } from './ROIWaterfallChart';
import { BenchmarkComparisonChart } from './BenchmarkComparisonChart';
import { SensitivityAnalysisChart } from './SensitivityAnalysisChart';
import { ROIChart } from './ROIChart';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PDFExportService } from '@/lib/pdf-export';
import { BrandedHeader } from './BrandedHeader';
import { BrandDivider, BrandSection, MetricCard } from '@/components/ui/brand-elements';

interface EnhancedROIDashboardProps {
  program: Program & { organization: { name: string } };
}

export function EnhancedROIDashboard({ program }: EnhancedROIDashboardProps) {
  const navigate = useNavigate();
  const { data: benefits = [] } = useBenefits(program.id);
  const { data: scenario } = useBaselineScenario(program.id);
  // Fallback to a default baseline scenario if none exists so details still render
  const effectiveScenario = scenario || {
    id: 'baseline-auto',
    program_id: program.id,
    name: 'Baseline',
    description: 'Auto-generated baseline for ROI calculations',
    discount_rate: 0.08,
    is_baseline: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any;
  const roiCalculation = useROICalculation(program, benefits, effectiveScenario);

  const handleAddBenefits = () => {
    navigate('/benefits', {
      state: {
        programId: program.id,
        organization: program.organization,
        program: program,
        benefits: benefits
      }
    });
  };

  if (!roiCalculation || benefits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">ROI Analysis Not Available</h3>
          <p className="text-muted-foreground text-center mb-4">
            Add benefits to this program to see comprehensive ROI analysis with industry benchmarks and explanations.
          </p>
          <Button variant="outline" onClick={handleAddBenefits}>
            Add Benefits
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getROIStatus = (roi: number) => {
    if (roi >= 500) return { label: 'Excellent', variant: 'default' as const };
    if (roi >= 300) return { label: 'Good', variant: 'secondary' as const };
    if (roi >= 150) return { label: 'Fair', variant: 'outline' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  const roiStatus = getROIStatus(roiCalculation.roi);

  const handleExportReport = async () => {
    try {
      const pdfService = new PDFExportService();
      
      // Create a properly structured program object for export
      const exportProgram = {
        ...program,
        organization: {
          id: 'temp-id',
          name: program.organization.name,
          user_id: 'temp-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      
      // Prepare calculation data for export
      const calculationData = {
        [program.id]: {
          roi: roiCalculation.roi,
          paybackPeriod: roiCalculation.paybackPeriod,
          totalInvestment: roiCalculation.totalInvestment,
          totalBenefits: roiCalculation.totalBenefits
        }
      };

      const benefitData = {
        [program.id]: benefits
      };

      await pdfService.exportComparison(
        {
          programs: [exportProgram],
          benefits: benefitData,
          calculations: calculationData
        },
        {
          title: `ROI Analysis - ${program.name}`,
          subtitle: `${program.organization.name} Executive Coaching Program`,
          includeLogo: true,
          includeFootnotes: true,
          sources: [
            'Internal Program Data and Financial Calculations',
            'Industry Benchmarks from Executive Coaching Research',
            'Resonance Executive Coaching ROI Dashboard'
          ],
          author: 'Resonance Executive Coaching'
        }
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      // You could add a toast notification here for user feedback
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Branded Header */}
        <BrandedHeader 
          title={`ROI Analysis: ${program.name}`}
          subtitle={`${program.organization.name} • ${program.participants_count} participants • ${program.duration_months} months`}
        />

        {/* Key Metrics Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Performance Metrics
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Financial analysis and return on investment calculations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={roiStatus.variant}>
                  {roiStatus.label} ROI
                </Badge>
                <Button variant="outline" size="sm" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard
                title={`ROI (${roiCalculation.analysisYears}-Year)`}
                value={formatPercentage(roiCalculation.roi)}
                description={`Net benefits as percentage of investment over ${roiCalculation.analysisYears} years`}
                variant="navy"
              />
              
              <MetricCard
                title={`NPV (${roiCalculation.analysisYears}-Year)`}
                value={formatCurrency(roiCalculation.npv, true)}
                description={`Present value of ${roiCalculation.analysisYears}-year cash flows minus investment`}
                variant="orange"
              />
              
              <MetricCard
                title="Payback Period"
                value={`${(Math.round(roiCalculation.paybackPeriod * 10) / 10).toFixed(1)} months`}
                description="Time to recover initial investment"
                variant="navy"
              />
              
              <MetricCard
                title={`Benefit Multiple (${roiCalculation.analysisYears}-Year)`}
                value={`${(Math.round((roiCalculation.totalBenefits / roiCalculation.totalInvestment) * 10) / 10).toFixed(1)}x`}
                description={`Total ${roiCalculation.analysisYears}-year benefits divided by investment`}
                variant="orange"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="waterfall" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="sensitivity" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Risk Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="section-navy rounded-lg p-6">
                <ROIChart 
                  roiCalculation={roiCalculation}
                  type="cashflow"
                  title="Annual Cash Flow Analysis"
                />
              </div>
              <div className="section-orange rounded-lg p-6">
                <ROIChart 
                  roiCalculation={roiCalculation}
                  type="cumulative"
                  title="Cumulative ROI Projection"
                />
              </div>
            </div>
            <BrandDivider />
            <ROIExplanationPanel 
              roiCalculation={roiCalculation}
              programName={program.name}
            />
          </TabsContent>

          <TabsContent value="waterfall" className="space-y-6">
            <BrandSection variant="navy">
              <ROIWaterfallChart 
                roiCalculation={roiCalculation}
                benefits={benefits}
                title="ROI Waterfall Analysis"
              />
            </BrandSection>
            <BrandDivider />
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Participant Costs</span>
                      <span className="font-medium">
                        {formatCurrency(program.cost_per_participant * program.participants_count)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overhead Costs</span>
                      <span className="font-medium">
                        {formatCurrency(program.overhead_costs)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Investment</span>
                      <span>{formatCurrency(roiCalculation.totalInvestment)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Benefit Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{benefit.category}</span>
                        <span className="font-medium text-sm">
                          {formatCurrency((benefit.annual_value * benefit.attribution_percentage / 100) * (benefit.confidence_level / 100))}
                        </span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Benefits</span>
                      <span>{formatCurrency(roiCalculation.totalBenefits)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-6">
            <BrandSection variant="orange">
              <BenchmarkComparisonChart 
                programROI={roiCalculation.roi}
                programName={program.name}
                benefits={benefits}
              />
            </BrandSection>
          </TabsContent>

          <TabsContent value="sensitivity" className="space-y-6">
            {scenario && (
              <BrandSection variant="navy">
                <SensitivityAnalysisChart 
                  program={program}
                  benefits={benefits}
                  scenario={scenario}
                  baseROI={roiCalculation.roi}
                />
              </BrandSection>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}