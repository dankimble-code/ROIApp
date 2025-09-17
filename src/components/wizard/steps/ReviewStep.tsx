import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Organization, Program, Benefit } from '@/types/coaching';
import { Loader2 } from 'lucide-react';

interface ReviewStepProps {
  organization: Partial<Organization>;
  program: Partial<Program>;
  benefits: Partial<Benefit>[];
  onComplete: () => void;
  onBack: () => void;
}

export function ReviewStep({ organization, program, benefits, onComplete, onBack }: ReviewStepProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onComplete();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Organization</h3>
            <p>Name: {organization.name}</p>
            <p>Industry: {organization.industry}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Program</h3>
            <p>Name: {program.name}</p>
            <p>Duration: {program.duration_months} months</p>
            <p>Participants: {program.participants_count}</p>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isCreating}>
            Previous
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Program...
              </>
            ) : (
              'Create Program'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}