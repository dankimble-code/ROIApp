import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Save, Settings, DollarSign } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useAdminBenefitDefaults, useUpdateBenefitDefault, BenefitDefault } from '@/hooks/useAdminBenefitDefaults';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function BenefitDefaultEditor({ benefit, onSave }: { benefit: BenefitDefault; onSave: (id: string, data: Partial<BenefitDefault>) => void }) {
  const [description, setDescription] = useState(benefit.description);
  const [value, setValue] = useState(benefit.default_value.toString());
  const [attribution, setAttribution] = useState(benefit.default_attribution.toString());
  const [confidence, setConfidence] = useState(benefit.default_confidence.toString());
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(benefit.id, {
      description,
      default_value: parseFloat(value) || 0,
      default_attribution: parseFloat(attribution) || 0,
      default_confidence: parseFloat(confidence) || 0,
    });
    setIsDirty(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`desc-${benefit.id}`}>Description</Label>
        <Textarea
          id={`desc-${benefit.id}`}
          value={description}
          onChange={handleChange(setDescription)}
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`value-${benefit.id}`}>Default Value ($)</Label>
          <Input
            id={`value-${benefit.id}`}
            type="number"
            min="0"
            value={value}
            onChange={handleChange(setValue)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`attr-${benefit.id}`}>Attribution (%)</Label>
          <Input
            id={`attr-${benefit.id}`}
            type="number"
            min="0"
            max="100"
            value={attribution}
            onChange={handleChange(setAttribution)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`conf-${benefit.id}`}>Confidence (%)</Label>
          <Input
            id={`conf-${benefit.id}`}
            type="number"
            min="0"
            max="100"
            value={confidence}
            onChange={handleChange(setConfidence)}
          />
        </div>
      </div>

      {isDirty && (
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: isLoadingRole } = useIsAdmin();
  const { data: benefitDefaults = [], isLoading: isLoadingDefaults } = useAdminBenefitDefaults();
  const updateBenefitDefault = useUpdateBenefitDefault();

  const handleSaveBenefitDefault = (id: string, data: Partial<BenefitDefault>) => {
    updateBenefitDefault.mutate({ id, data });
  };

  if (isLoadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center mb-4">
              You do not have admin privileges to access this page.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <Badge variant="default" className="bg-amber-500">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Manage default values and system configuration
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Logged in as: <strong>{user?.email}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Benefit Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Default Benefit Values
          </CardTitle>
          <CardDescription>
            Configure the default values that appear when users add benefits to their programs.
            These values will be used as templates for all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDefaults ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading defaults...</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {benefitDefaults.map((benefit) => (
                <AccordionItem key={benefit.id} value={benefit.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">{benefit.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(benefit.default_value)} • {benefit.default_attribution}% attr • {benefit.default_confidence}% conf
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <BenefitDefaultEditor 
                      benefit={benefit} 
                      onSave={handleSaveBenefitDefault}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
