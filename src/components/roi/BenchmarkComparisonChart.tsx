import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatPercentage } from '@/lib/utils';
import { useIndustryBenchmarks, useROIBenchmarkComparison } from '@/hooks/useIndustryBenchmarks';
import { Benefit } from '@/types/coaching';

interface BenchmarkComparisonChartProps {
  programROI: number;
  programName: string;
  benefits: Benefit[];
  title?: string;
}

export function BenchmarkComparisonChart({ 
  programROI, 
  programName, 
  benefits,
  title = "Industry Benchmark Comparison" 
}: BenchmarkComparisonChartProps) {
  const { data: benchmarks, isLoading } = useIndustryBenchmarks();
  
  // Get primary benefit category for more accurate comparison
  const primaryCategory = benefits.length > 0 
    ? benefits.reduce((prev, current) => 
        (prev.annual_value > current.annual_value) ? prev : current
      ).category
    : undefined;

  const { data: comparison } = useROIBenchmarkComparison(programROI, primaryCategory);

  if (isLoading || !benchmarks || !comparison) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">Loading benchmark data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      name: 'Industry\nMinimum',
      roi: comparison.benchmark.roiRange.min,
      type: 'benchmark',
      color: 'hsl(218 48% 13% / 0.6)' // Light navy
    },
    {
      name: 'Industry\nAverage', 
      roi: comparison.benchmark.averageROI,
      type: 'benchmark',
      color: 'hsl(218 48% 13%)' // Resonance navy
    },
    {
      name: programName.length > 15 ? programName.substring(0, 15) + '...' : programName,
      roi: programROI,
      type: 'program',
      color: programROI >= comparison.benchmark.averageROI 
        ? 'hsl(17 100% 60%)' // Resonance orange for good performance
        : 'hsl(218 48% 13%)' // Resonance navy for below average
    },
    {
      name: 'Industry\nMaximum',
      roi: comparison.benchmark.roiRange.max,
      type: 'benchmark', 
      color: 'hsl(17 100% 60% / 0.6)' // Light orange
    }
  ];

  const chartConfig = {
    roi: {
      label: 'ROI %',
      color: 'hsl(var(--primary))',
    },
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'excellent': { variant: 'default' as const, label: 'Excellent' },
      'good': { variant: 'secondary' as const, label: 'Good' },
      'average': { variant: 'outline' as const, label: 'Average' },
      'below-average': { variant: 'destructive' as const, label: 'Below Average' }
    };
    return variants[status as keyof typeof variants] || variants.average;
  };

  const statusBadge = getStatusBadge(comparison.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Comparing your program against {comparison.benchmark.category.toLowerCase()} industry standards
            </p>
          </div>
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                interval={0}
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [formatPercentage(value as number), 'ROI']}
                  labelFormatter={(label) => label.replace('\n', ' ')}
                />} 
              />
              
              {/* Average line reference */}
              <ReferenceLine 
                y={comparison.benchmark.averageROI} 
                stroke="hsl(var(--secondary))" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: "Industry Average", position: "top" }}
              />
              
              <Bar
                dataKey="roi"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Performance Summary */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Percentile Rank</div>
              <div className="text-2xl font-bold text-primary">{comparison.percentile}th</div>
            </div>
            <div className="text-center">
              <div className="font-medium">vs Average</div>
              <div className={`text-2xl font-bold ${
                comparison.comparison.vsAverage > 0 ? 'text-primary' : 'text-destructive'
              }`}>
                {comparison.comparison.vsAverage > 0 ? '+' : ''}{comparison.comparison.vsAverage.toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Category</div>
              <div className="text-sm font-medium">{comparison.benchmark.category}</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Sample Size</div>
              <div className="text-sm">{comparison.benchmark.sampleSize} programs</div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-2">Benchmark Interpretation</div>
            <p className="text-sm text-muted-foreground">
              {programROI >= comparison.benchmark.roiRange.max && 
                "Outstanding performance! Your program is in the top tier of coaching initiatives."
              }
              {programROI >= comparison.benchmark.averageROI && programROI < comparison.benchmark.roiRange.max &&
                "Strong performance above industry average. Your program demonstrates solid value creation."
              }
              {programROI >= comparison.benchmark.roiRange.min && programROI < comparison.benchmark.averageROI &&
                "Performance within typical range but below average. Consider optimization opportunities."
              }
              {programROI < comparison.benchmark.roiRange.min &&
                "Performance below typical range. Review program design and benefit measurement."
              }
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              Source: {comparison.benchmark.source} (n={comparison.benchmark.sampleSize})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}