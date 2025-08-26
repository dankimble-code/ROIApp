import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Clock, DollarSign, Download } from 'lucide-react';
import { Benchmark } from '@/types/coaching';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// import { PDFExportService } from '@/lib/pdf-export';

export function BenchmarkView() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBenchmarks((data || []) as Benchmark[]);
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load benchmarks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBenchmarks = async () => {
    try {
      toast({
        title: "PDF Export",
        description: "PDF export functionality is temporarily disabled for debugging."
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading benchmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Industry Benchmarks</h2>
          <p className="text-muted-foreground">
            Reference data from leading coaching effectiveness studies
          </p>
        </div>
        <Button onClick={handleExportBenchmarks} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Benchmark Cards */}
      <div className="grid gap-6">
        {benchmarks.map((benchmark) => (
          <Card key={benchmark.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{benchmark.label}</CardTitle>
                  <CardDescription>
                    Industry coaching effectiveness study
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {benchmark.data.coaching_effectiveness}% Effective
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI Range</p>
                    <p className="font-semibold">
                      {benchmark.data.roi_range.min}% - {benchmark.data.roi_range.max}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="font-semibold">
                      {benchmark.data.average_program_duration} months
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Typical Cost</p>
                    <p className="font-semibold">
                      ${benchmark.data.typical_cost_per_participant.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Effectiveness</p>
                    <p className="font-semibold">
                      {benchmark.data.coaching_effectiveness}%
                    </p>
                  </div>
                </div>
              </div>

              {benchmark.data.success_factors && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Key Success Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {benchmark.data.success_factors.map((factor: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Insights</CardTitle>
          <CardDescription>
            Key takeaways from industry studies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">ROI Range Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Industry studies consistently show executive coaching ROI ranging from 200% to 850%, 
                with most programs achieving 300-700% returns when properly implemented and measured.
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Program Duration Trends</h4>
              <p className="text-sm text-muted-foreground">
                Optimal coaching program duration averages 6-14 months, with longer programs 
                (12+ months) showing higher effectiveness rates and better ROI sustainability.
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Critical Success Factors</h4>
              <p className="text-sm text-muted-foreground">
                Executive engagement, clear objectives, measurement frameworks, and organizational 
                readiness consistently emerge as key factors determining program success across all studies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}