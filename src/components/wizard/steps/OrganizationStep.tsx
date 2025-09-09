import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Organization } from '@/types/coaching';
import { useToast } from '@/hooks/use-toast';

interface OrganizationStepProps {
  data: Partial<Organization>;
  onChange: (data: Partial<Organization>) => void;
  onNext: () => void;
}

export function OrganizationStep({ data, onChange, onNext }: OrganizationStepProps) {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.employee_count || data.employee_count <= 0) {
      toast({
        title: "Employee Count Required",
        description: "Please enter the number of employees in your organization.",
        variant: "destructive",
      });
      return;
    }
    
    onNext();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={data.name || ''}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={data.industry || ''}
                onChange={(e) => onChange({ ...data, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_count">Employee Count *</Label>
              <Input
                id="employee_count"
                type="number"
                value={data.employee_count || ''}
                onChange={(e) => onChange({ ...data, employee_count: parseInt(e.target.value) || 0 })}
                required
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}