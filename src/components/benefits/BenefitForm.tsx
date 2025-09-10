import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BENEFIT_CATEGORIES, BenefitCategory, Benefit } from '@/types/coaching';
import { Info, Plus, X } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface BenefitFormProps {
  benefit?: Partial<Benefit>;
  onSubmit: (benefit: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
  participantCount?: number;
  usedCategories?: BenefitCategory[];
}

export function BenefitForm({ 
  benefit, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  participantCount = 1,
  usedCategories = []
}: BenefitFormProps) {
  const [category, setCategory] = useState<BenefitCategory>(benefit?.category as BenefitCategory || 'Productivity Gains');
  const [description, setDescription] = useState(benefit?.description || '');
  const [annualValue, setAnnualValue] = useState(benefit?.annual_value?.toString() || '');
  const [attribution, setAttribution] = useState([benefit?.attribution_percentage || 50]);
  const [confidence, setConfidence] = useState([benefit?.confidence_level || 80]);

  // Filter out used categories unless editing the current benefit
  const availableCategories = BENEFIT_CATEGORIES.filter(cat => 
    !usedCategories.includes(cat) || (isEditing && cat === benefit?.category)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const annualValueNum = parseFloat(annualValue);
    if (isNaN(annualValueNum) || annualValueNum <= 0) {
      return;
    }

    onSubmit({
      program_id: benefit?.program_id || '',
      category,
      description,
      annual_value: annualValueNum,
      attribution_percentage: attribution[0],
      confidence_level: confidence[0],
    });
  };

  const getBenefitTemplate = (category: BenefitCategory) => {
    const templates = {
      'Productivity Gains': {
        description: 'Increased productivity from improved focus and time management skills per participant',
        value: 10000,
        attribution: 50,
      },
      'Leadership Development': {
        description: 'Enhanced leadership capabilities per participant leading to better team performance',
        value: 10000,
        attribution: 50,
      },
      'Retention Improvement': {
        description: 'Reduced turnover costs per participant through improved employee satisfaction',
        value: 15000,
        attribution: 50,
      },
      'Performance Enhancement': {
        description: 'Improved individual performance metrics per participant',
        value: 10000,
        attribution: 50,
      },
      'Decision Making': {
        description: 'Better decision-making per participant leading to cost savings and opportunities',
        value: 10000,
        attribution: 50,
      },
      'Team Effectiveness': {
        description: 'Improved collaboration and team dynamics per participant',
        value: 10000,
        attribution: 50,
      },
      'Innovation': {
        description: 'Increased innovation and creative problem-solving per participant',
        value: 10000,
        attribution: 50,
      },
      'Customer Satisfaction': {
        description: 'Improved customer relationships and satisfaction scores per participant',
        value: 10000,
        attribution: 50,
      },
      'Other': {
        description: 'Custom benefit specific to your organization per participant',
        value: 10000,
        attribution: 50,
      },
    };
    return templates[category];
  };

  const applyTemplate = () => {
    const template = getBenefitTemplate(category);
    setDescription(template.description);
    setAnnualValue(template.value.toString());
    setAttribution([template.attribution]);
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Benefit' : 'Add New Benefit'}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Benefit Category</Label>
              <div className="flex gap-2">
                <Select value={category} onValueChange={(value) => setCategory(value as BenefitCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={applyTemplate}
                  disabled={!category || !availableCategories.includes(category)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Use Default Definition
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe how coaching will deliver this benefit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            {/* Annual Value Per Participant */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="annualValue">Annual Value Per Participant</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expected annual monetary value of this benefit per participant</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="annualValue"
                type="number"
                placeholder="10000"
                value={annualValue}
                onChange={(e) => setAnnualValue(e.target.value)}
                required
                min="0"
              />
              {annualValue && !isNaN(parseFloat(annualValue)) && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Per participant: {formatCurrency(parseFloat(annualValue))} per year
                  </p>
                  <p className="text-sm font-medium text-primary">
                    Total program: {formatCurrency(parseFloat(annualValue) * participantCount)} per year
                  </p>
                </div>
              )}
            </div>

            {/* Attribution Percentage */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Attribution to Coaching</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>What percentage of this benefit can be attributed to coaching?</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="outline">
                  {formatPercentage(attribution[0])}
                </Badge>
              </div>
              <Slider
                value={attribution}
                onValueChange={setAttribution}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Confidence Level */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Confidence Level</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How confident are you that this benefit will be achieved?</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant={confidence[0] >= 80 ? 'default' : confidence[0] >= 60 ? 'secondary' : 'outline'}>
                  {formatPercentage(confidence[0])}
                </Badge>
              </div>
              <Slider
                value={confidence}
                onValueChange={setConfidence}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low (10%)</span>
                <span>High (100%)</span>
              </div>
            </div>

            {/* Expected Impact Preview */}
            {annualValue && !isNaN(parseFloat(annualValue)) && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expected Annual Impact:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Per Participant:</span>
                        <div className="font-bold text-primary">
                          {formatCurrency(
                            parseFloat(annualValue) * (attribution[0] / 100) * (confidence[0] / 100)
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Total Program:</span>
                        <div className="font-bold text-primary">
                          {formatCurrency(
                            parseFloat(annualValue) * participantCount * (attribution[0] / 100) * (confidence[0] / 100)
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(parseFloat(annualValue))} × {participantCount} participants × {formatPercentage(attribution[0])} attribution × {formatPercentage(confidence[0])} confidence
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!description || !annualValue}
              >
                {isEditing ? 'Update Benefit' : 'Add Benefit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}