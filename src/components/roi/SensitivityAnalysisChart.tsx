import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useSensitivityAnalysis } from '@/hooks/useROICalculation';
import { Program, Scenario, Benefit } from '@/types/coaching';
import { formatPercentage } from '@/lib/utils';

interface SensitivityAnalysisChartProps {
  program: Program;
  benefits: Benefit[];
  scenario: Scenario;
  baseROI: number;
  title?: string;
}

export function SensitivityAnalysisChart({ 
  program, 
  benefits, 
  scenario, 
  baseROI,
  title = "Sensitivity Analysis" 
}: SensitivityAnalysisChartProps) {
  const sensitivityData = useSensitivityAnalysis(program, benefits, scenario, baseROI);
  const isLoading = false; // useSensitivityAnalysis returns data directly

  if (isLoading || !sensitivityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">Calculating sensitivity analysis...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by impact magnitude
  const sortedData = [...sensitivityData].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Create chart data with low/high scenarios
  const chartData = sortedData.map(item => ({
    parameter: item.parameter.replace(' ', '\n'),
    lowROI: item.lowROI,
    baseROI: baseROI,
    highROI: item.highROI,
    impact: item.impact,
    range: item.highROI - item.lowROI
  }));

  const chartConfig = {
    lowROI: {
      label: 'Low Scenario',
      color: 'hsl(var(--destructive))',
    },
    baseROI: {
      label: 'Base Case',
      color: 'hsl(var(--muted))',
    },
    highROI: {
      label: 'High Scenario', 
      color: 'hsl(var(--primary))',
    },
  };

  // Find highest impact parameter
  const highestImpact = sortedData[0];
  const criticalThreshold = 20; // 20% impact considered critical

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How changes in key parameters affect ROI outcomes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Critical Risk Alert */}
        {Math.abs(highestImpact.impact) > criticalThreshold && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>High Sensitivity Detected:</strong> {highestImpact.parameter} has {Math.abs(highestImpact.impact).toFixed(0)}% impact on ROI. 
              Consider risk mitigation strategies for this parameter.
            </AlertDescription>
          </Alert>
        )}

        {/* Sensitivity Chart */}
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <XAxis 
                type="number"
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                type="category"
                dataKey="parameter" 
                tick={{ fontSize: 11 }}
                width={75}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => {
                    const labelMap = {
                      'lowROI': 'Low Scenario',
                      'baseROI': 'Base Case',
                      'highROI': 'High Scenario'
                    };
                    return [formatPercentage(value as number), labelMap[name as keyof typeof labelMap] || name];
                  }}
                  labelFormatter={(label) => `Parameter: ${label.replace('\n', ' ')}`}
                />} 
              />
              
              {/* Base case reference line */}
              <ReferenceLine 
                x={baseROI} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                strokeWidth={2}
              />
              
              {/* ROI Range Bars */}
              <Bar dataKey="lowROI" fill="hsl(var(--destructive))" radius={[2, 0, 0, 2]} />
              <Bar dataKey="highROI" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Parameter Impact Summary */}
        <div className="space-y-3">
          <h4 className="font-medium">Parameter Impact Ranking</h4>
          <div className="space-y-2">
            {sortedData.slice(0, 3).map((item, index) => (
              <div key={item.parameter} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">{item.parameter}</div>
                    <div className="text-xs text-muted-foreground">
                      Range: {formatPercentage(item.lowROI)} to {formatPercentage(item.highROI)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    Math.abs(item.impact) > criticalThreshold ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {item.impact > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(item.impact).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.abs(item.impact) > criticalThreshold ? 'High Impact' : 'Moderate Impact'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Risk Assessment</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • <strong>Most Sensitive:</strong> {highestImpact.parameter} ({Math.abs(highestImpact.impact).toFixed(0)}% impact)
            </p>
            <p>
              • <strong>ROI Range:</strong> {formatPercentage(Math.min(...sortedData.map(d => d.lowROI)))} to {formatPercentage(Math.max(...sortedData.map(d => d.highROI)))}
            </p>
            <p>
              • <strong>Recommendation:</strong> {Math.abs(highestImpact.impact) > criticalThreshold 
                ? 'Monitor high-impact parameters closely and develop contingency plans'
                : 'ROI appears robust to parameter variations'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}