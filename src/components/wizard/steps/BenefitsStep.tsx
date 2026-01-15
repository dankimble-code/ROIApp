import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Benefit } from '@/types/coaching';
import { useBenefits, useCreateBenefit, useUpdateBenefit, useDeleteBenefit } from '@/hooks/useBenefits';
import { BenefitForm } from '@/components/benefits/BenefitForm';
import { Plus, Edit, Trash2, Info, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface BenefitsStepProps {
  data: Partial<Benefit>[];
  onChange: (data: Partial<Benefit>[]) => void;
  onNext: () => void;
  onBack: () => void;
  programId?: string;
  participantCount?: number;
  organization?: any;
  program?: any;
}

export function BenefitsStep({ data, onChange, onNext, onBack, programId, participantCount = 1, organization, program }: BenefitsStepProps) {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  
  const { data: benefits = [], isLoading } = useBenefits(programId);
  const createBenefit = useCreateBenefit();
  const updateBenefit = useUpdateBenefit();
  const deleteBenefit = useDeleteBenefit();

  const handleCreateBenefit = (benefitData: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!programId) return;
    
    createBenefit.mutate(
      { ...benefitData, program_id: programId },
      {
        onSuccess: () => {
          setShowForm(false);
          onChange(benefits);
        },
      }
    );
  };

  const handleUpdateBenefit = (benefitData: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingBenefit) return;
    
    updateBenefit.mutate(
      { 
        id: editingBenefit.id, 
        data: benefitData 
      },
      {
        onSuccess: () => {
          setEditingBenefit(null);
          onChange(benefits);
        },
      }
    );
  };

  const handleDeleteBenefit = (id: string) => {
    deleteBenefit.mutate(id, {
      onSuccess: () => {
        onChange(benefits);
      },
    });
  };

  const totalAnnualValue = benefits.reduce((sum, benefit) => sum + benefit.annual_value * participantCount, 0);
  const totalAttributableValue = benefits.reduce((sum, benefit) => 
    sum + (benefit.annual_value * participantCount * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100)), 0
  );

  if (showForm) {
    return (
      <BenefitForm
        onSubmit={handleCreateBenefit}
        onCancel={() => setShowForm(false)}
        participantCount={participantCount}
        existingBenefits={benefits}
      />
    );
  }

  if (editingBenefit) {
    return (
      <BenefitForm
        benefit={editingBenefit}
        onSubmit={handleUpdateBenefit}
        onCancel={() => setEditingBenefit(null)}
        participantCount={participantCount}
        existingBenefits={benefits}
        isEditing
      />
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Program Benefits
            </CardTitle>
            <Button onClick={() => {
              navigate('/benefits', {
                state: { organization, program }
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits Summary */}
          {benefits.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{formatCurrency((program?.cost_per_participant || 0) * participantCount + (program?.overhead_costs || 0))}</div>
                  <p className="text-sm text-muted-foreground">Total Program Investment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per employee: {formatCurrency(program?.cost_per_participant || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(totalAttributableValue)}</div>
                  <p className="text-sm text-muted-foreground">Total Benefit (ROI)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per participant: {formatCurrency(totalAttributableValue / participantCount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          {/* Benefits List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading benefits...</p>
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No benefits added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add benefits to calculate ROI projections for your coaching program.
              </p>
              <Button onClick={() => {
                navigate('/benefits', {
                  state: { organization, program }
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Benefit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {benefits.map((benefit) => {
                const expectedImpact = benefit.annual_value * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100);
                
                return (
                  <Card key={benefit.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{benefit.category}</Badge>
                            <Badge variant="secondary">
                              {formatPercentage(benefit.attribution_percentage)} attribution
                            </Badge>
                            <Badge variant={benefit.confidence_level >= 80 ? 'default' : 'outline'}>
                              {formatPercentage(benefit.confidence_level)} confidence
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{benefit.description}</p>
                          <div className="text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Benefit (ROI):</span>
                              <div className="font-medium text-primary text-lg">{formatCurrency(expectedImpact * participantCount)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBenefit(benefit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBenefit(benefit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Previous
          </Button>
          <Button 
            onClick={() => {
              navigate('/benefits', {
                state: { organization, program }
              });
            }}
          >
            Add Benefits
          </Button>
        </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}