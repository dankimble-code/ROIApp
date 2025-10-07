import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, DollarSign } from 'lucide-react';
import { Program } from '@/types/coaching';
import { formatCurrency } from '@/lib/utils';
import { EnhancedROIDashboard } from '@/components/roi/EnhancedROIDashboard';
import { useBenefits } from '@/hooks/useBenefits';
interface ProgramDetailViewProps {
  program: Program & { organization: { name: string } };
  onBack: () => void;
}

export function ProgramDetailView({ program, onBack }: ProgramDetailViewProps) {
  const { data: benefits = [], isLoading: isBenefitsLoading } = useBenefits(program.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <p className="text-muted-foreground">{program.organization.name}</p>
        </div>
      </div>

      {/* Program Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Program Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{program.participants_count}</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{program.duration_months}</div>
                <div className="text-sm text-muted-foreground">Months</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(program.cost_per_participant)}
                </div>
                <div className="text-sm text-muted-foreground">Per Participant</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency((program.cost_per_participant * program.participants_count) + program.overhead_costs)}
                </div>
                <div className="text-sm text-muted-foreground">Total Investment</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Badge variant="secondary">Active</Badge>
            <Badge variant="outline">Executive Coaching</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Benefits List */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          {isBenefitsLoading ? (
            <div className="text-sm text-muted-foreground">Loading benefits…</div>
          ) : benefits.length > 0 ? (
            <div className="grid gap-3">
              {benefits.map((b) => (
                <div key={b.id} className="flex items-start justify-between p-3 rounded-md border">
                  <div className="space-y-1">
                    <div className="font-medium">{b.category}</div>
                    <div className="text-sm text-muted-foreground">{b.description}</div>
                    <div className="flex gap-2 pt-1">
                      <Badge variant="outline">{b.attribution_percentage}% attribution</Badge>
                      <Badge variant="outline">{b.confidence_level}% confidence</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Per Participant</div>
                    <div className="font-semibold">{formatCurrency(b.annual_value)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No benefits found for this program.</div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced ROI Dashboard */}
      <EnhancedROIDashboard program={program} />
    </div>
  );
}