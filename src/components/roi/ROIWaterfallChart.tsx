import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ROICalculation, Benefit } from '@/types/coaching';
import { formatCurrency } from '@/lib/utils';

interface ROIWaterfallChartProps {
  roiCalculation: ROICalculation;
  benefits: Benefit[];
  title?: string;
}

interface WaterfallData {
  name: string;
  value: number;
  cumulative: number;
  type: 'investment' | 'benefit' | 'total';
  color: string;
}

export function ROIWaterfallChart({ 
  roiCalculation, 
  benefits, 
  title = "ROI Waterfall Analysis" 
}: ROIWaterfallChartProps) {
  
  // Create waterfall data structure
  const createWaterfallData = (): WaterfallData[] => {
    const data: WaterfallData[] = [];
    let cumulative = 0;

    // Starting point (investment as negative)
    const investment = -roiCalculation.totalInvestment;
    cumulative += investment;
    data.push({
      name: 'Investment',
      value: investment,
      cumulative: cumulative,
      type: 'investment',
      color: 'hsl(var(--destructive))'
    });

    // Add each benefit category
    const benefitsByCategory = benefits.reduce((acc, benefit) => {
      const attributedValue = (benefit.annual_value * benefit.attribution_percentage / 100) * 
                             (benefit.confidence_level / 100);
      
      if (!acc[benefit.category]) {
        acc[benefit.category] = 0;
      }
      acc[benefit.category] += attributedValue;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(benefitsByCategory).forEach(([category, value]) => {
      cumulative += value;
      data.push({
        name: category.replace(' ', '\n'),
        value: value,
        cumulative: cumulative,
        type: 'benefit',
        color: 'hsl(var(--primary))'
      });
    });

    // Net result
    data.push({
      name: 'Net\nBenefit',
      value: roiCalculation.netBenefit,
      cumulative: cumulative,
      type: 'total',
      color: roiCalculation.netBenefit > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'
    });

    return data;
  };

  const waterfallData = createWaterfallData();

  const chartConfig = {
    value: {
      label: 'Value',
    },
    cumulative: {
      label: 'Cumulative',
    },
  };

  // Custom bar chart component for waterfall effect
  const WaterfallBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const isNegative = payload.value < 0;
    const barHeight = Math.abs(height);
    const barY = isNegative ? y : y + height - barHeight;

    return (
      <rect
        x={x}
        y={barY}
        width={width}
        height={barHeight}
        fill={payload.color}
        className="transition-opacity hover:opacity-80"
      />
    );
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'value') {
      return [formatCurrency(Math.abs(value)), value < 0 ? 'Investment' : 'Benefit'];
    }
    return [formatCurrency(value), 'Cumulative'];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual breakdown showing how investment flows to net benefit through each benefit category
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={waterfallData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, true)}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Category: ${label.replace('\n', ' ')}`}
                />} 
              />
              
              {/* Zero reference line */}
              <ReferenceLine 
                y={0} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              
              {/* Waterfall bars */}
              <Bar 
                dataKey="value"
                shape={WaterfallBar}
                radius={[2, 2, 2, 2]}
              />
              
              {/* Connector lines for cumulative effect */}
              {waterfallData.map((item, index) => {
                if (index === waterfallData.length - 1) return null;
                const nextItem = waterfallData[index + 1];
                const currentEnd = item.cumulative;
                const nextStart = nextItem.cumulative - nextItem.value;
                
                return (
                  <ReferenceLine
                    key={`connector-${index}`}
                    segment={[
                      { x: index + 0.4, y: currentEnd },
                      { x: index + 0.6, y: nextStart }
                    ]}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span>Investment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>Benefits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-muted-foreground"></div>
            <span>Net Result</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}