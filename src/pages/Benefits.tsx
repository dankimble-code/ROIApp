import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { BenefitForm } from '@/components/benefits/BenefitForm';
import { Plus, Edit, Trash2, Info, TrendingUp, ArrowLeft, Calculator, Save } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Benefit, BenefitCategory } from '@/types/coaching';
import { useCreateProgram, useProgram, useUpdateProgram } from '@/hooks/usePrograms';
import { useCreateOrganization } from '@/hooks/useOrganizations';
import { useBenefits, useCreateBenefit, useUpdateBenefit, useDeleteBenefit } from '@/hooks/useBenefits';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BenefitsPageState {
  organization: any;
  program: any;
  benefits?: any[];
  programId?: string;
}

export default function Benefits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Get passed state from wizard or navigation
  const state = location.state as BenefitsPageState;
  const organization = state?.organization || {};
  const program = state?.program || {};
  const participantCount = program.participants_count || 1;

  // Hooks for database operations
  const createOrganization = useCreateOrganization();
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const programQuery = useProgram(currentProgramId || '');
  const benefitsQuery = useBenefits(currentProgramId);
  const createBenefit = useCreateBenefit();
  const updateBenefit = useUpdateBenefit();
  const deleteBenefit = useDeleteBenefit();

  // Get benefits from database or use empty array
  const benefits = benefitsQuery.data || [];
  
  // Used categories tracking - don't count "Other" as used since multiples are allowed  
  const usedCategories = benefits.map(benefit => benefit.category).filter(cat => cat !== 'Other') as BenefitCategory[];

  // Create or get existing program
  useEffect(() => {
    const initializeProgram = async () => {
      // If we have a program ID in state, use it
      if (state?.programId) {
        setCurrentProgramId(state.programId);
        return;
      }

      // If we have organization and program data, create them in the database
      if (organization.name && program.name && !currentProgramId) {
        try {
          setIsSaving(true);
          
          // Create organization first
          const orgData = await createOrganization.mutateAsync({
            name: organization.name,
            industry: organization.industry,
            employee_count: organization.employee_count,
          });

          // Then create program
          const programData = await createProgram.mutateAsync({
            organization_id: orgData.id,
            name: program.name,
            duration_months: program.duration_months || 12,
            participants_count: program.participants_count || 1,
            cost_per_participant: program.cost_per_participant || 10000,
            overhead_costs: program.overhead_costs || 0,
          });

          setCurrentProgramId(programData.id);
          
          // If we have benefits from state, create them in database
          if (state?.benefits && state.benefits.length > 0) {
            for (const benefit of state.benefits) {
              await createBenefit.mutateAsync({
                program_id: programData.id,
                category: benefit.category,
                description: benefit.description,
                annual_value: benefit.annual_value,
                attribution_percentage: benefit.attribution_percentage,
                confidence_level: benefit.confidence_level,
              });
            }
          }
        } catch (error) {
          console.error('Error initializing program:', error);
          toast({
            title: "Error",
            description: "Failed to save program. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      }
    };

    initializeProgram();
  }, [organization, program, state, currentProgramId]);

  const handleCreateBenefit = async (benefitData: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentProgramId) {
      toast({
        title: "Error",
        description: "Program not initialized. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBenefit.mutateAsync({
        ...benefitData,
        program_id: currentProgramId,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating benefit:', error);
    }
  };

  const handleUpdateBenefit = async (benefitData: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingBenefit) return;
    
    try {
      await updateBenefit.mutateAsync({
        id: editingBenefit.id,
        data: benefitData,
      });
      setEditingBenefit(null);
    } catch (error) {
      console.error('Error updating benefit:', error);
    }
  };

  const handleDeleteBenefit = async (id: string) => {
    try {
      await deleteBenefit.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting benefit:', error);
    }
  };

  const handleCalculateTotal = () => {
    navigate('/calculation', {
      state: {
        organization: programQuery.data?.organization || organization,
        program: programQuery.data || program,
        benefits,
        programId: currentProgramId
      }
    });
  };

  const handleBack = () => {
    navigate('/', {
      state: {
        organization: programQuery.data?.organization || organization,
        program: programQuery.data || program,
        benefits,
        programId: currentProgramId
      }
    });
  };

  // Show loading state while initializing
  if (isSaving || benefitsQuery.isLoading || (currentProgramId && programQuery.isLoading)) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isSaving ? 'Saving program...' : 'Loading benefits...'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalAnnualValue = benefits.reduce((sum, benefit) => sum + (benefit.annual_value || 0) * participantCount, 0);
  const totalAttributableValue = benefits.reduce((sum, benefit) => 
    sum + ((benefit.annual_value || 0) * participantCount * ((benefit.attribution_percentage || 0) / 100) * ((benefit.confidence_level || 0) / 100)), 0
  );

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <BenefitForm
          onSubmit={handleCreateBenefit}
          onCancel={() => setShowForm(false)}
          participantCount={participantCount}
          usedCategories={usedCategories}
          existingBenefits={benefits}
        />
      </div>
    );
  }

  if (editingBenefit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <BenefitForm
          benefit={editingBenefit}
          onSubmit={handleUpdateBenefit}
          onCancel={() => setEditingBenefit(null)}
          participantCount={participantCount}
          usedCategories={usedCategories}
          existingBenefits={benefits}
          isEditing
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Program Benefits</h1>
            <p className="text-muted-foreground">
              Define the expected benefits and outcomes for {program.name || 'your coaching program'}
            </p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wizard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Expected Benefits & Outcomes
              </CardTitle>
            <Button 
              onClick={() => setShowForm(true)} 
              disabled={benefits.length >= 13} // 8 unique categories + 5 "Other" benefits max
            >
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
                  <div className="text-2xl font-bold">{formatCurrency(totalAnnualValue)}</div>
                  <p className="text-sm text-muted-foreground">Total Annual Value (All Participants)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per participant: {formatCurrency(totalAnnualValue / participantCount)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(totalAttributableValue)}</div>
                  <p className="text-sm text-muted-foreground">Expected Impact (All Participants)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per participant: {formatCurrency(totalAttributableValue / participantCount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

            <Separator />

            {/* Benefits List */}
            {benefits.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No benefits added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add benefits to calculate ROI projections for your coaching program.
                </p>
              <Button 
                onClick={() => setShowForm(true)} 
                disabled={benefits.length >= 13} // 8 unique categories + 5 "Other" benefits max
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Benefit
              </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {benefits.map((benefit) => {
                  const expectedImpact = (benefit.annual_value || 0) * ((benefit.attribution_percentage || 0) / 100) * ((benefit.confidence_level || 0) / 100);
                  
                  return (
                    <Card key={benefit.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{benefit.category}</Badge>
                              <Badge variant="secondary">
                                {formatPercentage(benefit.attribution_percentage || 0)} attribution
                              </Badge>
                              <Badge variant={(benefit.confidence_level || 0) >= 80 ? 'default' : 'outline'}>
                                {formatPercentage(benefit.confidence_level || 0)} confidence
                              </Badge>
                            </div>
                            <p className="text-sm mb-3">{benefit.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Per Participant:</span>
                                <div className="font-medium">{formatCurrency(benefit.annual_value || 0)}</div>
                                <span className="text-xs text-muted-foreground">Total: {formatCurrency((benefit.annual_value || 0) * participantCount)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Expected Impact:</span>
                                <div className="font-medium text-primary">{formatCurrency(expectedImpact)}</div>
                                <span className="text-xs text-muted-foreground">Total: {formatCurrency(expectedImpact * participantCount)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingBenefit(benefit as Benefit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBenefit(benefit.id!)}
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

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Program Setup
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  disabled={!currentProgramId}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Saved
                </Button>
                <Button 
                  onClick={handleCalculateTotal}
                  disabled={benefits.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Total Value
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}