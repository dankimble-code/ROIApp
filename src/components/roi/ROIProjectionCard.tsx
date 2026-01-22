import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Program, Benefit, ROICalculation } from '@/types/coaching';
import { useROICalculation } from '@/hooks/useROICalculation';
import { useBaselineScenario } from '@/hooks/useScenarios';
import { useBenefits } from '@/hooks/useBenefits';
import { TrendingUp, DollarSign, Clock, AlertCircle, Info } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface ROIProjectionCardProps {
  program: Program & { organization: { name: string } };
}

export function ROIProjectionCard({ program }: ROIProjectionCardProps) {
  const { data: benefits = [] } = useBenefits(program.id);
  const { data: scenario } = useBaselineScenario(program.id);
  const roiCalculation = useROICalculation(program, benefits, scenario);

  if (!roiCalculation || benefits.length === 0) {
    return (
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {program.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{program.organization.name}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Add benefits to calculate ROI projections
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getROIStatus = (roi: number) => {
    if (roi >= 300) return { label: 'Excellent', variant: 'default' as const };
    if (roi >= 150) return { label: 'Good', variant: 'secondary' as const };
    if (roi >= 50) return { label: 'Fair', variant: 'outline' as const };
    return { label: 'Poor', variant: 'destructive' as const };
  };

  const roiStatus = getROIStatus(roiCalculation.roi);

  return (
    <TooltipProvider>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="truncate">{program.name}</span>
            </div>
            <Badge variant={roiStatus.variant}>{roiStatus.label}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{program.organization.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ROI Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">ROI</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Return on Investment: (Total Benefits - Total Investment) / Total Investment × 100</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatPercentage(roiCalculation.roi)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">NPV</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Net Present Value: Future cash flows discounted to present value</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(roiCalculation.npv)}
              </p>
            </div>
          </div>

          {/* Investment & Benefits */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Investment</p>
              </div>
              <p className="font-semibold">{formatCurrency(roiCalculation.totalInvestment)}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Annual Benefits</p>
              </div>
              <p className="font-semibold text-green-600">
                {formatCurrency(roiCalculation.totalBenefits / roiCalculation.yearlyBreakdown.length)}
              </p>
            </div>
          </div>

          {/* Payback Period */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Payback Period</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time required to recover the initial investment</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge variant="outline">
              {roiCalculation.paybackPeriod > 5 
                ? '5+ years' 
                : `${(Math.round(roiCalculation.paybackPeriod * 10) / 10).toFixed(1)} years`
              }
            </Badge>
          </div>

          {/* Program Details */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{program.participants_count} participants</span>
            <span>{program.duration_months} months</span>
            <span>{benefits.length} benefits</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}