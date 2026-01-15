import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

      {/* Benefits Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBenefitsLoading ? (
            <div className="text-sm text-muted-foreground">Loading benefits…</div>
          ) : benefits.length > 0 ? (
            <>
              {benefits.map((benefit) => {
                const totalValue = benefit.annual_value * program.participants_count;
                const attributionValue = totalValue * (benefit.attribution_percentage / 100);
                const expectedImpact = attributionValue * (benefit.confidence_level / 100);
                
                return (
                  <div key={benefit.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{benefit.category}</Badge>
                          <Badge variant="secondary">
                            {benefit.attribution_percentage}% attribution
                          </Badge>
                          <Badge variant={benefit.confidence_level >= 80 ? 'default' : 'outline'}>
                            {benefit.confidence_level}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Value:</span>
                        <div className="font-medium">{formatCurrency(totalValue)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attribution:</span>
                        <div className="font-medium">{formatCurrency(attributionValue)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Impact:</span>
                        <div className="font-medium text-primary">{formatCurrency(expectedImpact)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-muted-foreground">Total Annual Value:</span>
                  <div className="text-xl font-bold">
                    {formatCurrency(benefits.reduce((sum, b) => sum + b.annual_value * program.participants_count, 0))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Expected Impact:</span>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(benefits.reduce((sum, b) => 
                      sum + (b.annual_value * program.participants_count * (b.attribution_percentage / 100) * (b.confidence_level / 100)), 0
                    ))}
                  </div>
                </div>
              </div>
            </>
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