import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';
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
              <div className="flex items-center gap-2">
                <Label htmlFor="overhead_costs">Overhead Costs ($)</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      type="button" 
                      className="text-primary hover:text-primary/80 text-sm underline flex items-center gap-1"
                    >
                      (Guidance)
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Overhead Costs Guidance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <p>
                        Admin and overhead costs capture the indirect but real expenses associated with running an executive coaching program. They are not the coaching fees themselves, but the additional resources your organization invests to make the program successful. Examples include:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Administrative support time:</strong> Scheduling coaching sessions, handling calendar coordination, or managing program logistics.</li>
                        <li><strong>Internal program management:</strong> Time your HR, L&D, or operations staff spend selecting coaches, tracking progress, and managing the engagement.</li>
                        <li><strong>Technology & tools:</strong> Costs for any platforms, software, or assessment tools that support the coaching process (beyond the primary coaching fees).</li>
                        <li><strong>Facilities or travel:</strong> Expenses for booking meeting rooms, travel, or accommodations if sessions occur in person.</li>
                        <li><strong>Overhead allocation:</strong> A proportion of general business expenses (IT, HR, office space, utilities) attributable to supporting the coaching program.</li>
                      </ul>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <p className="font-medium">💡 Tip for users:</p>
                        <p>
                          If you're unsure, start with a simple estimate (e.g., 10–20% of total coaching fees) and adjust later as you collect more accurate data. The goal is to acknowledge the hidden costs of running a program so that ROI calculations don't overstate the net benefit.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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