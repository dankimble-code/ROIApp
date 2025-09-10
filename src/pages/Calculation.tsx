import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { PDFExportService } from '@/lib/pdf-export';

interface CalculationPageState {
  organization: any;
  program: any;
  benefits: any[];
}

export default function Calculation() {
  const navigate = useNavigate();
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
        benefits
      }
    });
  };

  const handleStartOver = () => {
    navigate('/');
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
            'Resonance Executive Coaching ROI Dashboard'
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

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleStartOver}>
          Start New Analysis
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
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