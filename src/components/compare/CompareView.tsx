import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { Program, Organization, Benefit } from '@/types/coaching';
import { usePrograms } from '@/hooks/usePrograms';
import { useBenefits } from '@/hooks/useBenefits';
import { PDFExportService, ComparisonData } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';

interface CompareViewProps {
  programIds: string[];
  onBack: () => void;
}

export function CompareView({ programIds, onBack }: CompareViewProps) {
  const { data: allPrograms = [] } = usePrograms();
  const programs = allPrograms.filter(program => programIds.includes(program.id));
  const { toast } = useToast();
  
  // Fetch benefits for each program
  const benefitQueries = programIds.map(id => useBenefits(id));
  const benefitsByProgram = Object.fromEntries(
    programIds.map((id, index) => [id, benefitQueries[index].data || []])
  );

  const isLoading = benefitQueries.some(query => query.isLoading);

  const calculateROI = (program: Program & { organization: Organization }) => {
    const benefits = benefitsByProgram[program.id] || [];
    const totalInvestment = (program.cost_per_participant * program.participants_count) + program.overhead_costs;
    const totalBenefits = benefits.reduce((sum, benefit) => 
      sum + (benefit.annual_value * (benefit.attribution_percentage / 100)), 0
    );
    return totalBenefits > 0 ? ((totalBenefits - totalInvestment) / totalInvestment) * 100 : 0;
  };

  const calculatePayback = (program: Program & { organization: Organization }) => {
    const benefits = benefitsByProgram[program.id] || [];
    const totalInvestment = (program.cost_per_participant * program.participants_count) + program.overhead_costs;
    const annualBenefits = benefits.reduce((sum, benefit) => 
      sum + (benefit.annual_value * (benefit.attribution_percentage / 100)), 0
    );
    return annualBenefits > 0 ? totalInvestment / annualBenefits : 0;
  };

  const handleExportComparison = async () => {
    try {
      const pdfService = new PDFExportService();
      
      // Prepare calculations for each program
      const calculations: Record<string, any> = {};
      programs.forEach(program => {
        const benefits = benefitsByProgram[program.id] || [];
        const totalInvestment = (program.cost_per_participant * program.participants_count) + program.overhead_costs;
        const totalBenefits = benefits.reduce((sum, benefit) => 
          sum + (benefit.annual_value * (benefit.attribution_percentage / 100)), 0
        );
        
        calculations[program.id] = {
          roi: calculateROI(program),
          paybackPeriod: calculatePayback(program),
          totalInvestment,
          totalBenefits
        };
      });

      const comparisonData: ComparisonData = {
        programs,
        benefits: benefitsByProgram,
        calculations
      };

      const sources = [
        'International Coaching Federation (ICF) - Global Coaching Study 2023',
        'Harvard Business Review - The Case for Executive Coaching',
        'Phillips, J. & Phillips, P. - ROI in Executive Coaching',
        'Resonance Executive Coaching - Program Analysis Framework'
      ];

      await pdfService.exportComparison(comparisonData, {
        title: 'Executive Coaching Program Comparison',
        subtitle: `Analysis of ${programs.length} Coaching Programs`,
        includeLogo: true,
        includeFootnotes: true,
        sources,
        author: 'Daniel Kimble'
      });

      toast({
        title: "PDF Export Successful",
        description: "Program comparison report has been downloaded successfully."
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading comparison...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Program Comparison</h1>
            <p className="text-muted-foreground">
              Comparing {programs.length} coaching programs
            </p>
          </div>
        </div>
        <Button onClick={handleExportComparison}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Side-by-Side Comparison</CardTitle>
          <CardDescription>
            Key metrics and financial analysis for selected programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Metric</th>
                  {programs.map((program) => (
                    <th key={program.id} className="text-left p-4 font-medium">
                      {program.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Organization</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4">
                      {program.organization?.name}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Duration</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4">
                      {program.duration_months} months
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Participants</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4">
                      {program.participants_count}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Cost per Participant</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4">
                      ${program.cost_per_participant.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Total Investment</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4 font-semibold">
                      ${((program.cost_per_participant * program.participants_count) + program.overhead_costs).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Expected ROI</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4 font-semibold text-green-600">
                      {calculateROI(program).toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Payback Period</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4">
                      {calculatePayback(program).toFixed(1)} years
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Benefits Count</td>
                  {programs.map((program) => (
                    <td key={program.id} className="p-4">
                      {benefitsByProgram[program.id]?.length || 0} benefits
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="grid gap-6">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <CardTitle>{program.name} - Detailed Analysis</CardTitle>
              <CardDescription>
                {program.organization?.name} • {program.participants_count} participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Financial Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Investment</p>
                      <p className="font-medium text-lg">
                        ${((program.cost_per_participant * program.participants_count) + program.overhead_costs).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected ROI</p>
                      <p className="font-medium text-lg text-green-600">
                        {calculateROI(program).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payback Period</p>
                      <p className="font-medium text-lg">
                        {calculatePayback(program).toFixed(1)} years
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Benefits</p>
                      <p className="font-medium text-lg">
                        {benefitsByProgram[program.id]?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {benefitsByProgram[program.id] && benefitsByProgram[program.id].length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Benefits</h4>
                    <div className="space-y-2">
                      {benefitsByProgram[program.id].map((benefit) => (
                        <div key={benefit.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{benefit.description}</p>
                            <p className="text-sm text-muted-foreground">{benefit.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${benefit.annual_value.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {benefit.attribution_percentage}% attribution
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}