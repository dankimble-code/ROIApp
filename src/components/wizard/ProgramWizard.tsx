import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OrganizationStep } from './steps/OrganizationStep';
import { ProgramStep } from './steps/ProgramStep';
import { BenefitsStep } from './steps/BenefitsStep';
import { ReviewStep } from './steps/ReviewStep';
import { Organization, Program, Benefit } from '@/types/coaching';
import { useCreateOrganization } from '@/hooks/useOrganizations';
import { useCreateProgram } from '@/hooks/usePrograms';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';

interface ProgramWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ProgramWizard({ onComplete, onCancel }: ProgramWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [organization, setOrganization] = useState<Partial<Organization>>({});
  const [program, setProgram] = useState<Partial<Program>>({});
  const [benefits, setBenefits] = useState<Partial<Benefit>[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const createOrganization = useCreateOrganization();
  const createProgram = useCreateProgram();

  // Track unsaved changes
  const { showPrompt, confirmNavigation, cancelNavigation, promptNavigation } = useUnsavedChanges({
    when: hasUnsavedChanges && !isSaving,
    message: 'You have unsaved changes in your program setup. Are you sure you want to leave?'
  });

  // Mark as having unsaved changes when any data is entered
  useEffect(() => {
    const hasData = 
      Object.keys(organization).length > 0 || 
      Object.keys(program).length > 0 || 
      benefits.length > 0;
    setHasUnsavedChanges(hasData && !isSaving);
  }, [organization, program, benefits, isSaving]);

  const steps = [
    { id: 1, title: 'Organization', description: 'Company information' },
    { id: 2, title: 'Program Details', description: 'Coaching program setup' },
    { id: 3, title: 'Benefits', description: 'Expected outcomes' },
    { id: 4, title: 'Review', description: 'Confirm and create' },
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSaving(true);
      // Create organization first
      const orgData = await createOrganization.mutateAsync({
        name: organization.name!,
        industry: organization.industry,
        employee_count: organization.employee_count,
      });

      // Then create program
      await createProgram.mutateAsync({
        organization_id: orgData.id,
        name: program.name!,
        duration_months: program.duration_months!,
        participants_count: program.participants_count!,
        cost_per_participant: program.cost_per_participant!,
        overhead_costs: program.overhead_costs || 0,
      });

      // Mark as saved
      setHasUnsavedChanges(false);
      onComplete();
    } catch (error) {
      console.error('Error creating program:', error);
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
          <BenefitsStep
            data={benefits}
            onChange={setBenefits}
            onNext={handleNext}
            onBack={handleBack}
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
          <h1 className="text-3xl font-bold text-foreground">Create New Program</h1>
          <p className="text-muted-foreground">
            Set up a new executive coaching program for ROI analysis
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