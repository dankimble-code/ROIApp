import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  Calculator, 
  TrendingUp, 
  Clock, 
  Target,
  ChevronDown,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ROICalculation } from '@/types/coaching';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useState } from 'react';
import { BrandDivider, BrandList } from '@/components/ui/brand-elements';

interface ROIExplanationPanelProps {
  roiCalculation: ROICalculation;
  programName: string;
  methodology?: string;
}

export function ROIExplanationPanel({ 
  roiCalculation, 
  programName, 
  methodology = "Phillips ROI Methodology Level 4-5" 
}: ROIExplanationPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getROIInterpretation = (roi: number) => {
    if (roi >= 500) return { label: 'Excellent', variant: 'default' as const, description: 'Outstanding return, top 20% of coaching programs' };
    if (roi >= 300) return { label: 'Good', variant: 'secondary' as const, description: 'Above industry average performance' };
    if (roi >= 150) return { label: 'Fair', variant: 'outline' as const, description: 'Meets typical coaching ROI expectations' };
    return { label: 'Below Average', variant: 'destructive' as const, description: 'Below typical coaching program returns' };
  };

  const interpretation = getROIInterpretation(roiCalculation.roi);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              ROI Calculation Explanation
            </CardTitle>
            <CardDescription>
              Understanding how {programName}'s return on investment is calculated
            </CardDescription>
          </div>
          <Badge variant={interpretation.variant}>
            {interpretation.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 section-navy rounded-lg">
            <div className="text-2xl font-bold text-resonance-navy">
              {formatPercentage(roiCalculation.roi)}
            </div>
            <div className="text-sm text-muted-foreground">ROI</div>
          </div>
          <div className="text-center p-3 section-orange rounded-lg">
            <div className="text-2xl font-bold text-resonance-orange">
              {formatCurrency(roiCalculation.npv, true)}
            </div>
            <div className="text-sm text-muted-foreground">NPV</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">
              {(Math.round(roiCalculation.paybackPeriod * 10) / 10).toFixed(1)} mo
            </div>
            <div className="text-sm text-muted-foreground">Payback</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">
              {(roiCalculation.totalBenefits / roiCalculation.totalInvestment).toFixed(1)}x
            </div>
            <div className="text-sm text-muted-foreground">Multiple</div>
          </div>
        </div>

        <Separator />

        {/* ROI Formula Breakdown */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto text-left"
              onClick={() => toggleSection('formula')}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">ROI Calculation Formula</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                expandedSections.includes('formula') ? 'rotate-180' : ''
              }`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-center font-mono text-lg mb-4">
                  ROI = (Total Benefits - Total Investment) ÷ Total Investment × 100
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  ROI = ({formatCurrency(roiCalculation.totalBenefits)} - {formatCurrency(roiCalculation.totalInvestment)}) ÷ {formatCurrency(roiCalculation.totalInvestment)} × 100 = {formatPercentage(roiCalculation.roi)}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Total Benefits Calculation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sum of all quantified benefits over the program duration, adjusted for attribution and confidence levels.
                  </p>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(roiCalculation.totalBenefits)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Investment</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Program costs including participant fees, overhead, and implementation expenses.
                  </p>
                  <div className="text-lg font-bold">
                    {formatCurrency(roiCalculation.totalInvestment)}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* NPV Explanation */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto text-left"
              onClick={() => toggleSection('npv')}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Net Present Value (NPV)</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                expandedSections.includes('npv') ? 'rotate-180' : ''
              }`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                NPV accounts for the time value of money by discounting future cash flows to present value.
                A positive NPV indicates the program creates value.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current NPV:</span>
                  <span className={`text-lg font-bold ${roiCalculation.npv > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(roiCalculation.npv)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roiCalculation.npv > 0 
                    ? 'Program creates positive economic value' 
                    : 'Program value is below investment cost'
                  }
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Payback Period */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto text-left"
              onClick={() => toggleSection('payback')}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Payback Period Analysis</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                expandedSections.includes('payback') ? 'rotate-180' : ''
              }`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The payback period shows how long it takes for cumulative benefits to equal the initial investment.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Payback Period:</span>
                  <span className="text-lg font-bold">
                    {(Math.round(roiCalculation.paybackPeriod * 10) / 10).toFixed(1)} months
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roiCalculation.paybackPeriod <= 12 
                    ? 'Fast payback - excellent for cash flow' 
                    : roiCalculation.paybackPeriod <= 24
                    ? 'Reasonable payback period'
                    : 'Longer payback - focus on long-term value'
                  }
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Methodology & Sources */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto text-left"
              onClick={() => toggleSection('methodology')}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Methodology & Research</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                expandedSections.includes('methodology') ? 'rotate-180' : ''
              }`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Calculation Methodology</h4>
                <p className="text-sm text-muted-foreground">
                  {methodology} - Industry standard for measuring training and coaching program effectiveness.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Industry Benchmarks</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {interpretation.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Industry Average ROI:</span>
                    <span className="font-medium">425%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Typical Range:</span>
                    <span className="font-medium">300% - 700%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Payback:</span>
                    <span className="font-medium">14 months</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Research Sources</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Manchester Consulting Group (2023) - Executive Coaching ROI Study</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span className="text-muted-foreground">ICF Global Coaching Study (2024) - Industry Benchmarks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Phillips ROI Institute - ROI Methodology Standards</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}