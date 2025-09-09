import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Program } from '@/types/coaching';

interface ProgramStepProps {
  data: Partial<Program>;
  onChange: (data: Partial<Program>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProgramStep({ data, onChange, onNext, onBack }: ProgramStepProps) {
  // Set default cost per participant if not already set
  useEffect(() => {
    if (!data.cost_per_participant) {
      onChange({ ...data, cost_per_participant: 10000 });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="program_name">Program Name *</Label>
              <Input
                id="program_name"
                value={data.name || ''}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_months">Duration (months) *</Label>
              <Input
                id="duration_months"
                type="number"
                value={data.duration_months || ''}
                onChange={(e) => onChange({ ...data, duration_months: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants_count">Number of Participants *</Label>
              <Input
                id="participants_count"
                type="number"
                value={data.participants_count || ''}
                onChange={(e) => onChange({ ...data, participants_count: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_per_participant">Cost per Participant ($) *</Label>
              <Input
                id="cost_per_participant"
                type="number"
                value={data.cost_per_participant || 10000}
                onChange={(e) => onChange({ ...data, cost_per_participant: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overhead_costs">Overhead Costs ($)</Label>
              <Input
                id="overhead_costs"
                type="number"
                value={data.overhead_costs || ''}
                onChange={(e) => onChange({ ...data, overhead_costs: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>Previous</Button>
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}