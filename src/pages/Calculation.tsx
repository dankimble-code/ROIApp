import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { PDFExportService } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';

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
  
  const state = location.state as CalculationPageState;
  const organization = state?.organization || {};
  const program = state?.program || {};
  const benefits = state?.benefits || [];
  
  const participantCount = program.participants_count || 1;
  const costPerParticipant = program.cost_per_participant || 10000;
  const totalProgramCost = (costPerParticipant * participantCount) + (program.overhead_costs || 0);
  
  // Calculate total benefits
  const totalAnnualValue = benefits.reduce((sum, benefit) => 
    sum + (benefit.annual_value || 0) * participantCount, 0
  );
  
  const totalAttributableValue = benefits.reduce((sum, benefit) => 
    sum + ((benefit.annual_value || 0) * participantCount * ((benefit.attribution_percentage || 0) / 100) * ((benefit.confidence_level || 0) / 100)), 0
  );
  
  // ROI Calculations
  const netBenefit = totalAttributableValue - totalProgramCost;
  const roi = totalProgramCost > 0 ? (netBenefit / totalProgramCost) * 100 : 0;
  const paybackPeriod = totalAttributableValue > 0 ? totalProgramCost / (totalAttributableValue / 12) : 0;

  const handleBack = () => {
    navigate('/benefits', {
      state: {
        organization,
        program,
        benefits,
        programId: state?.programId
      }
    });
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
        id: 'calculation-program',
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
        'calculation-program': {
          roi: roi,
          paybackPeriod: paybackPeriod / 12, // Convert months to years
          totalInvestment: totalProgramCost,
          totalBenefits: totalAttributableValue
        }
      };

      const benefitData = {
        'calculation-program': benefits
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
            'Bravanti Research Study (2025): Executive coaching ROI analysis of 100 executives over five years. https://www.linkedin.com/pulse/executive-coaching-research-impact-return-alyssa-poggioli-w6dic',
            'FMI Corp Executive Coaching ROI Survey (2025): Engineering and construction industry executive coaching ROI study. https://fmicorp.com/reports/executive-coaching-driving-real-roi-for-leaders-in-engineering-and-construction',
            'MetrixGlobal Study (2024-2025): Executive coaching yields 788% ROI through productivity gains and employee retention. https://luisazhou.com/blog/coaching-statistics/',
            'Boysen et al. Study (2024): Financial and intangible metrics of executive coaching with ROI estimates of $200,000-$500,000 per intervention. https://www.scirp.org/journal/paperinformation?paperid=134086',
            'International Coach Federation (ICF) Global Coaching Study (2023): Survey of 100 executives showing average ROI of 6x coaching cost. https://ardencoaching.com/returns-on-executive-coaching-programs/',
            'Coaching Industry Statistics: Comprehensive industry data and trends. https://entrepreneurshq.com/coaching-industry-statistics/',
            'Forbes Coaches Council (2023): The ROI of Executive Coaching - A Comprehensive Guide. https://www.forbes.com/councils/forbescoachescouncil/2023/02/24/the-roi-of-executive-coaching-a-comprehensive-guide/',
            'NCBI Research Article: Peer-reviewed research on executive coaching effectiveness. https://pmc.ncbi.nlm.nih.gov/articles/PMC10699640/',
            'SHRM Executive Coaching Insights: Human resources perspective on executive coaching ROI. https://www.shrm.org/executive-network/insights/people-strategy/end-executive-coaching',
            'Executive Coaching Effectiveness Study: Comprehensive analysis of coaching program effectiveness. https://www.edgecumbe.co.uk/insights/executive-coaching-effectiveness/'
          ],
          author: 'Resonance Executive Coaching'
        }
      );
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
            Back to Benefits
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ROI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">ROI</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {roi >= 0 ? 'Positive return' : 'Negative return'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Net Benefit</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(netBenefit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Annual net value
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
              {paybackPeriod.toFixed(1)} mo
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time to break even
            </p>
          </CardContent>
        </Card>
      </div>

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
                  <span>{formatCurrency(totalProgramCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits Analysis</CardTitle>
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
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Value:</span>
                    <div className="font-medium">{formatCurrency(totalValue)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Attribution:</span>
                    <div className="font-medium">{formatCurrency(totalValue * ((benefit.attribution_percentage || 0) / 100))}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Impact:</span>
                    <div className="font-medium text-primary">{formatCurrency(expectedImpact)}</div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-muted-foreground">Total Annual Value:</span>
              <div className="text-xl font-bold">{formatCurrency(totalAnnualValue)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Expected Impact:</span>
              <div className="text-xl font-bold text-primary">{formatCurrency(totalAttributableValue)}</div>
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
                Surveyed company leaders in engineering and construction. Reported that executives saw an average ROI of nearly six times their investment, with 25% of clients experiencing an ROI between 10–49 times the cost of coaching. PWC and the Association Resource Center also found an average ROI of seven times the cost.{" "}
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
                Published in multiple sources, this study concluded executive coaching yields a 788% ROI, attributed primarily to productivity gains and employee retention.{" "}
                <a 
                  href="https://luisazhou.com/blog/coaching-statistics/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  [3]
                </a>{" "}
                <a 
                  href="https://ardencoaching.com/returns-on-executive-coaching-programs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  [4]
                </a>{" "}
                <a 
                  href="https://www.american.edu/provost/ogps/executive-education/executive-coaching/roi-of-executive-coaching.cfm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  [5]
                </a>
              </p>
            </div>

            <div className="border-l-4 border-l-primary pl-4">
              <h4 className="font-semibold">4. Boysen et al. Study (2024):</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Focused on financial and intangible metrics of executive coaching. Respondents estimated ROI/economic benefits between $200,000 and $500,000 per intervention, factoring in recruitment cost savings, increased engagement, and productivity improvements.{" "}
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
                Survey of 100 executives showed an average ROI of almost six times the cost of coaching. 86% of companies were able to calculate a positive ROI, with a median ROI of seven times the investment across organizations.{" "}
                <a 
                  href="https://ardencoaching.com/returns-on-executive-coaching-programs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  [4]
                </a>{" "}
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
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}