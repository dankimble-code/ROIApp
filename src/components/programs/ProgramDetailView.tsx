import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, DollarSign } from 'lucide-react';
import { Program } from '@/types/coaching';
import { formatCurrency } from '@/lib/utils';
import { EnhancedROIDashboard } from '@/components/roi/EnhancedROIDashboard';

interface ProgramDetailViewProps {
  program: Program & { organization: { name: string } };
  onBack: () => void;
}

export function ProgramDetailView({ program, onBack }: ProgramDetailViewProps) {
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

      {/* Enhanced ROI Dashboard */}
      <EnhancedROIDashboard program={program} />
    </div>
  );
}