import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, Users, Target, ShieldCheck } from 'lucide-react';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { Footer } from '@/components/layout/Footer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAccessRequest } from '@/hooks/useAdminAccess';
// Using the standard logo
const resonanceLogo = '/resonance-logo.png';
export default function Auth() {
  const {
    user,
    signIn,
    loading
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestCompany, setRequestCompany] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const createAccessRequest = useCreateAccessRequest();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <BrandedLoader size="xl" message="Connecting to Resonance Platform..." variant="resonance" />
      </div>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAccessRequest.mutateAsync({
      email: requestEmail,
      fullName: requestName,
      company: requestCompany,
      message: requestMessage,
    });
    setRequestEmail('');
    setRequestName('');
    setRequestCompany('');
    setRequestMessage('');
    setShowRequestDialog(false);
  };
  return <div className="min-h-screen hero-gradient resonance-pattern-strong flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-8 section-gradient p-8 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-center lg:justify-start mb-4">
              <img src={resonanceLogo} alt="Resonance Executive Coaching" className="h-24 w-auto" />
            </div>
            <div className="space-y-3">
              
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                ROI Dashboard & Analytics Platform
              </h2>
              <p className="text-lg text-muted-foreground font-medium italic">
                Executive Leadership Development by Daniel Kimble
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your coaching investments into measurable business outcomes with 
                evidence-based ROI analysis and comprehensive program optimization tools.
              </p>
            </div>
            
            {/* Professional Credentials Badge */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-primary">Professional Excellence</p>
              <p className="text-xs text-muted-foreground">
                ICF Certified • 15+ Years Experience • Fortune 500 Portfolio • Evidence-Based Methodology
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="card-watermark flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-primary/10 shadow-resonance">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">ROI Analysis</h3>
                <p className="text-sm text-muted-foreground">Calculate payback, NPV</p>
              </div>
            </div>
            <div className="card-watermark flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-accent/10 shadow-resonance">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold">Sensitivity Analysis</h3>
                <p className="text-sm text-muted-foreground">Tornado charts</p>
              </div>
            </div>
            <div className="card-watermark flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-secondary/10 shadow-resonance">
              <Users className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="font-semibold">Benchmarking</h3>
                <p className="text-sm text-muted-foreground">Industry standards</p>
              </div>
            </div>
            <div className="card-watermark flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-primary/10 shadow-resonance">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Scenarios</h3>
                <p className="text-sm text-muted-foreground">Compare options</p>
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-divider lg:hidden"></div>

        {/* Auth Form */}
        <Card className="card-watermark w-full max-w-md mx-auto bg-gradient-card border-primary/20 shadow-elevated">
          <CardHeader className="text-center space-y-4">
            <div>
              <CardTitle className="text-2xl">Welcome to Resonance</CardTitle>
              <CardDescription className="text-base mt-2">
                Access your executive coaching ROI analytics platform
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Invitation-only access</p>
                    <p className="text-muted-foreground">
                      New accounts are provisioned by an administrator. If you need access,
                      please contact Resonance Executive Coaching for approval.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      Request Access
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Access</DialogTitle>
                      <DialogDescription>
                        Submit your details and an administrator can review your request for access.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRequestAccess} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="request-name">Full name</Label>
                        <Input id="request-name" value={requestName} onChange={e => setRequestName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-email">Email</Label>
                        <Input id="request-email" type="email" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-company">Company</Label>
                        <Input id="request-company" value={requestCompany} onChange={e => setRequestCompany(e.target.value)} placeholder="Optional" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-message">Message</Label>
                        <Textarea id="request-message" value={requestMessage} onChange={e => setRequestMessage(e.target.value)} placeholder="Optional context for the admin team." rows={3} />
                      </div>
                      <Button type="submit" className="w-full" disabled={createAccessRequest.isPending}>
                        {createAccessRequest.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>;
}
