import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Settings, Shield } from 'lucide-react';
import { useBenefitDefaults } from '@/hooks/useBenefitDefaults';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useUserRole';

export function BenefitDefaultsSettings() {
  const { defaults, categories, isLoading } = useBenefitDefaults();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();

  const handleGoToAdminSettings = () => {
    setOpen(false);
    navigate('/admin');
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
          <DialogTitle>Benefit Default Values</DialogTitle>
          <DialogDescription>
            These are the current default values for each benefit category. They are used when creating new programs or clicking "Use Default Definition".
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading defaults...</div>
        ) : (
          <div className="space-y-4 py-4">
            <Accordion type="single" collapsible className="w-full">
              {categories.filter(c => c !== 'Other').map((category) => (
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
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4 space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Annual Value:</span>
                            <div className="font-medium">{formatCurrency(defaults[category]?.value || 0)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Attribution:</span>
                            <div className="font-medium">{formatPercentage(defaults[category]?.attribution || 50)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence:</span>
                            <div className="font-medium">{formatPercentage(defaults[category]?.confidence || 80)}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground pt-2">
                          {defaults[category]?.description}
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {isAdmin && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>As an admin, you can edit these defaults in Admin Settings.</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          {isAdmin && (
            <Button variant="outline" onClick={handleGoToAdminSettings}>
              <Shield className="h-4 w-4 mr-2" />
              Go to Admin Settings
            </Button>
          )}
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
