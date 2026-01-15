import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OrganizationStep } from './steps/OrganizationStep';
import { ProgramStep } from './steps/ProgramStep';
import { BenefitsStep } from './steps/BenefitsStep';
import { PrefilledBenefitsStep } from './steps/PrefilledBenefitsStep';
import { ReviewStep } from './steps/ReviewStep';
import { Organization, Program, Benefit, BenefitCategory } from '@/types/coaching';
import { useCreateOrganization, useUpdateOrganization } from '@/hooks/useOrganizations';
import { useCreateProgram, useUpdateProgram } from '@/hooks/usePrograms';
import { useBulkCreateBenefits } from '@/hooks/useBenefits';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useBenefitDefaults } from '@/hooks/useBenefitDefaults';

interface ProgramWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  editingProgram?: Program & { organization?: Organization };
}

export function ProgramWizard({ onComplete, onCancel, editingProgram }: ProgramWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [organization, setOrganization] = useState<Partial<Organization>>(
    editingProgram?.organization ? { ...editingProgram.organization } : {}
  );
  const [program, setProgram] = useState<Partial<Program>>(
    editingProgram ? { 
      id: editingProgram.id,
      name: editingProgram.name,
      duration_months: editingProgram.duration_months,
      participants_count: editingProgram.participants_count,
      cost_per_participant: editingProgram.cost_per_participant,
      overhead_costs: editingProgram.overhead_costs,
    } : {}
  );
  const [benefits, setBenefits] = useState<Partial<Benefit>[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createdProgramId, setCreatedProgramId] = useState<string | undefined>(editingProgram?.id);

  // Store initial values to compare against for detecting actual changes
  const initialOrganization = useRef<Partial<Organization>>(
    editingProgram?.organization ? { ...editingProgram.organization } : {}
  );
  const initialProgram = useRef<Partial<Program>>(
    editingProgram ? { 
      id: editingProgram.id,
      name: editingProgram.name,
      duration_months: editingProgram.duration_months,
      participants_count: editingProgram.participants_count,
      cost_per_participant: editingProgram.cost_per_participant,
      overhead_costs: editingProgram.overhead_costs,
    } : {}
  );

  const createOrganization = useCreateOrganization();
  const createProgram = useCreateProgram();
  const updateOrganization = useUpdateOrganization();
  const updateProgram = useUpdateProgram();
  const bulkCreateBenefits = useBulkCreateBenefits();
  const { defaults: benefitDefaults } = useBenefitDefaults();

  const isEditing = !!editingProgram;

  // Track unsaved changes
  const { showPrompt, confirmNavigation, cancelNavigation, promptNavigation } = useUnsavedChanges({
    when: hasUnsavedChanges && !isSaving,
    message: 'You have unsaved changes in your program setup. Are you sure you want to leave?'
  });

  // Mark as having unsaved changes only when actual changes are made
  useEffect(() => {
    const orgChanged = JSON.stringify(organization) !== JSON.stringify(initialOrganization.current);
    const programChanged = JSON.stringify(program) !== JSON.stringify(initialProgram.current);
    const benefitsChanged = benefits.length > 0;
    
    setHasUnsavedChanges((orgChanged || programChanged || benefitsChanged) && !isSaving);
  }, [organization, program, benefits, isSaving]);

  const steps = [
    { id: 1, title: 'Organization', description: 'Company information' },
    { id: 2, title: 'Program Details', description: 'Coaching program setup' },
    { id: 3, title: 'Benefits', description: 'Expected outcomes' },
    { id: 4, title: 'Review', description: 'Confirm and create' },
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep === 2 && currentStep + 1 === 3) {
      // Auto-create benefits when moving from Program Details to Benefits
      await createProgramAndBenefits();
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createProgramAndBenefits = async () => {
    try {
      setIsSaving(true);
      
      let orgData, programData;
      
      if (isEditing && editingProgram) {
        // Update existing organization and program
        if (editingProgram.organization?.id) {
          await updateOrganization.mutateAsync({
            id: editingProgram.organization.id,
            data: {
              name: organization.name!,
              industry: organization.industry,
              employee_count: organization.employee_count,
            }
          });
          orgData = editingProgram.organization;
        }

        programData = await updateProgram.mutateAsync({
          id: editingProgram.id,
          data: {
            name: program.name!,
            duration_months: program.duration_months!,
            participants_count: program.participants_count!,
            cost_per_participant: program.cost_per_participant!,
            overhead_costs: program.overhead_costs || 0,
          }
        });
        setCreatedProgramId(editingProgram.id);
      } else {
        // Create new organization and program
        orgData = await createOrganization.mutateAsync({
          name: organization.name!,
          industry: organization.industry,
          employee_count: organization.employee_count,
        });

        programData = await createProgram.mutateAsync({
          organization_id: orgData.id,
          name: program.name!,
          duration_months: program.duration_months!,
          participants_count: program.participants_count!,
          cost_per_participant: program.cost_per_participant!,
          overhead_costs: program.overhead_costs || 0,
        });
        setCreatedProgramId(programData.id);
      }

      // Only create default benefits for new programs, not when editing
      if (!isEditing) {
        // Use database-driven benefit defaults
        const categoriesToCreate: BenefitCategory[] = [
          'Customer Satisfaction',
          'Innovation',
          'Decision Making',
          'Retention Improvement',
          'Team Effectiveness',
          'Performance Enhancement',
          'Productivity Gains',
        ];

        const defaultBenefits = categoriesToCreate.map((category) => {
          const template = benefitDefaults[category];
          return {
            program_id: programData.id,
            category,
            description: template.description,
            annual_value: template.value,
            attribution_percentage: template.attribution,
            confidence_level: template.confidence,
          };
        });

        await bulkCreateBenefits.mutateAsync(defaultBenefits);
      }
      
      // Navigate directly to the calculation page with the program
      setCurrentStep(currentStep + 1);
      setIsSaving(false);
    } catch (error) {
      console.error('Error creating program and benefits:', error);
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSaving(true);
      
      // Mark as saved
      setHasUnsavedChanges(false);
      onComplete();
    } catch (error) {
      console.error('Error completing program:', error);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && !isSaving) {
      if (!promptNavigation('/')) {
        return; // Navigation was blocked, show prompt
      }
    }
    onCancel();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OrganizationStep
            data={organization}
            onChange={setOrganization}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ProgramStep
            data={program}
            onChange={setProgram}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <PrefilledBenefitsStep
            onNext={handleNext}
            onBack={handleBack}
            programId={createdProgramId}
            participantCount={program.participants_count || 1}
            organization={organization}
            program={program}
          />
        );
      case 4:
        return (
          <ReviewStep
            organization={organization}
            program={program}
            benefits={benefits}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Program' : 'Create New Program'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modify your existing executive coaching program' : 'Set up a new executive coaching program for ROI analysis'}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep - 1].description}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <Card 
            key={step.id} 
            className={`cursor-pointer transition-colors ${
              step.id === currentStep 
                ? 'border-primary bg-primary/5' 
                : step.id < currentStep 
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : 'border-muted'
            }`}
            onClick={() => step.id < currentStep && setCurrentStep(step.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : step.id < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showPrompt}
        onConfirm={() => {
          confirmNavigation();
          onCancel();
        }}
        onCancel={cancelNavigation}
        message="You have unsaved changes in your program setup. Are you sure you want to leave?"
      />
    </div>
  );
}