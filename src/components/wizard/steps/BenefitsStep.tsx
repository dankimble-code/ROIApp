import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Benefit } from '@/types/coaching';

interface BenefitsStepProps {
  data: Partial<Benefit>[];
  onChange: (data: Partial<Benefit>[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BenefitsStep({ data, onChange, onNext, onBack }: BenefitsStepProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Benefits configuration coming soon...</p>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>Previous</Button>
          <Button onClick={onNext}>Next Step</Button>
        </div>
      </CardContent>
    </Card>
  );
}