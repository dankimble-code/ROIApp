import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Settings, RotateCcw } from 'lucide-react';
import { useBenefitDefaults, BenefitDefaultConfig } from '@/hooks/useBenefitDefaults';
import { BenefitCategory } from '@/types/coaching';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function BenefitDefaultsSettings() {
  const { defaults, updateDefault, resetDefaults, categories } = useBenefitDefaults();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleValueChange = (category: BenefitCategory, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateDefault(category, { value: numValue });
    }
  };

  const handleAttributionChange = (category: BenefitCategory, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      updateDefault(category, { attribution: numValue });
    }
  };

  const handleReset = () => {
    resetDefaults();
    toast({
      title: "Defaults Reset",
      description: "All benefit default values have been reset to original values.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Default Values
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Default Benefit Values</DialogTitle>
          <DialogDescription>
            Set your preferred default values for each benefit category. These will be used when you click "Use Default Definition".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{category}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatCurrency(defaults[category]?.value || 0)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${category}-value`}>Default Annual Value ($)</Label>
                      <Input
                        id={`${category}-value`}
                        type="number"
                        min="0"
                        value={defaults[category]?.value || 0}
                        onChange={(e) => handleValueChange(category, e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${category}-attribution`}>Default Attribution (%)</Label>
                      <Input
                        id={`${category}-attribution`}
                        type="number"
                        min="0"
                        max="100"
                        value={defaults[category]?.attribution || 50}
                        onChange={(e) => handleAttributionChange(category, e.target.value)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
