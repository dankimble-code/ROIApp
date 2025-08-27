import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ROICalculation } from '@/types/coaching';
import { formatCurrency } from '@/lib/utils';

interface ROIChartProps {
  roiCalculation: ROICalculation;
  type?: 'cashflow' | 'cumulative';
  title?: string;
}

export function ROIChart({ roiCalculation, type = 'cashflow', title }: ROIChartProps) {
  const chartConfig = {
    benefits: {
      label: 'Benefits',
      color: 'hsl(var(--primary))',
    },
    costs: {
      label: 'Costs',
      color: 'hsl(var(--destructive))',
    },
    netCashFlow: {
      label: 'Net Cash Flow',
      color: 'hsl(var(--primary))',
    },
    cumulativeCashFlow: {
      label: 'Cumulative Cash Flow',
      color: 'hsl(var(--chart-2))',
    },
  };

  const data = roiCalculation.yearlyBreakdown.map(year => ({
    year: `Year ${year.year}`,
    benefits: year.benefits,
    costs: year.costs,
    netCashFlow: year.netCashFlow,
    cumulativeCashFlow: year.cumulativeCashFlow,
  }));

  if (type === 'cumulative') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Cumulative Cash Flow'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => formatCurrency(value as number)}
                  />} 
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeCashFlow"
                  stroke="var(--color-cumulativeCashFlow)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                {/* Zero line */}
                <Line
                  type="monotone"
                  dataKey={() => 0}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Annual Cash Flow Analysis'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value) => formatCurrency(value as number)}
                />} 
              />
              <Bar
                dataKey="benefits"
                fill="var(--color-benefits)"
                name="Benefits"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="costs"
                fill="var(--color-costs)"
                name="Costs"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}