import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Organization, Program, Benefit } from '@/types/coaching';
import { useBenefits, useUpdateBenefit, useDeleteBenefit } from '@/hooks/useBenefits';
import { BenefitForm } from '@/components/benefits/BenefitForm';
import { EnhancedROIDashboard } from '@/components/roi/EnhancedROIDashboard';
import { BrandSection, MetricCard } from '@/components/ui/brand-elements';
import { TrendingUp, Users, Target, DollarSign, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PrefilledBenefitsStepProps {
  onNext: () => void;
  onBack: () => void;
  programId?: string;
  participantCount?: number;
  organization?: Partial<Organization>;
  program?: Partial<Program>;
}

export function PrefilledBenefitsStep({ 
  onNext, 
  onBack, 
  programId, 
  participantCount = 1, 
  organization, 
  program 
}: PrefilledBenefitsStepProps) {
  const navigate = useNavigate();
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  
  const { data: benefits = [], isLoading } = useBenefits(programId);
  const updateBenefit = useUpdateBenefit();
  const deleteBenefit = useDeleteBenefit();

  // Calculate totals
  const totalAnnualValue = benefits.reduce((sum, benefit) => 
    sum + (benefit.annual_value * participantCount), 0
  );
  
  const totalExpectedImpact = benefits.reduce((sum, benefit) => 
    sum + (benefit.annual_value * participantCount * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100)), 0
  );

  const handleUpdateBenefit = (benefitData: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingBenefit) return;
    
    updateBenefit.mutate(
      {
        id: editingBenefit.id,
        data: {
          category: benefitData.category,
          description: benefitData.description,
          annual_value: benefitData.annual_value,
          attribution_percentage: benefitData.attribution_percentage,
          confidence_level: benefitData.confidence_level,
        },
      },
      {
        onSuccess: () => {
          setEditingBenefit(null);
        },
      }
    );
  };

  const handleDeleteBenefit = (benefitId: string) => {
    if (window.confirm('Are you sure you want to delete this benefit?')) {
      deleteBenefit.mutate(benefitId);
    }
  };

  const handleCalculateTotal = () => {
    if (programId) {
      navigate(`/calculation/${programId}`, {
        state: {
          organization,
          program,
          benefits,
          programId
        }
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // Create a mock program object for the ROI dashboard
  const dashboardProgram = {
    id: programId!,
    name: program?.name || 'Executive Coaching Program',
    duration_months: program?.duration_months || 12,
    participants_count: program?.participants_count || participantCount,
    cost_per_participant: program?.cost_per_participant || 5000,
    overhead_costs: program?.overhead_costs || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    organization_id: 'temp',
    organization: {
      id: 'temp',
      name: organization?.name || 'Organization',
      industry: organization?.industry || 'Technology',
      employee_count: organization?.employee_count || 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  };

  // Show edit form if editing a benefit
  if (editingBenefit) {
    return (
      <BenefitForm
        benefit={editingBenefit}
        onSubmit={handleUpdateBenefit}
        onCancel={() => setEditingBenefit(null)}
        isEditing={true}
        participantCount={participantCount}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Program Benefits Summary */}
      <BrandSection>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-resonance-navy dark:text-white">
            <Target className="h-5 w-5" />
            Program Benefits & Expected Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Total Annual Value (All Participants)"
              value={formatCurrency(totalAnnualValue)}
              description={`Per participant: ${formatCurrency(totalAnnualValue / participantCount)}`}
            />
            <MetricCard
              title="Expected Impact (All Participants)"
              value={formatCurrency(totalExpectedImpact)}
              description={`Per participant: ${formatCurrency(totalExpectedImpact / participantCount)}`}
            />
          </div>

          <Separator className="bg-resonance-navy/20" />

          {/* Benefits List */}
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-resonance-orange/20 hover:border-resonance-orange/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-resonance-navy dark:text-white">
                          {benefit.category}
                        </h4>
                        <Badge variant="outline" className="border-resonance-orange text-resonance-orange">
                          {benefit.attribution_percentage}% attribution
                        </Badge>
                        <Badge variant="outline" className="border-resonance-navy text-resonance-navy dark:border-white dark:text-white">
                          {benefit.confidence_level}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBenefit(benefit)}
                          className="border-resonance-orange text-resonance-orange hover:bg-resonance-orange hover:text-white"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBenefit(benefit.id)}
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Per Participant:</div>
                        <div className="font-semibold text-resonance-navy dark:text-white">
                          {formatCurrency(benefit.annual_value)}
                        </div>
                        <div className="text-sm text-muted-foreground">Expected Impact:</div>
                        <div className="font-semibold text-resonance-orange">
                          {formatCurrency(benefit.annual_value * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100))}
                        </div>
                      </div>
                      <Separator className="bg-resonance-navy/20" />
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Total:</div>
                        <div className="font-semibold text-resonance-navy dark:text-white">
                          {formatCurrency(benefit.annual_value * participantCount)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total:</div>
                        <div className="font-semibold text-resonance-orange">
                          {formatCurrency(benefit.annual_value * participantCount * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back to Program Setup
            </Button>
            <Button onClick={handleCalculateTotal} className="bg-resonance-orange hover:bg-resonance-orange/90">
              Calculate Total Value
            </Button>
          </div>
        </CardContent>
      </BrandSection>

      {/* Full ROI Dashboard */}
      <EnhancedROIDashboard program={dashboardProgram} />
    </div>
  );
}