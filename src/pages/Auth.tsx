import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Users, Target } from 'lucide-react';
import { BrandedLoader } from '@/components/ui/branded-loader';
// Using the correct logo from uploads
const resonanceLogo = '/lovable-uploads/c6e5ebea-b93f-43ad-8bda-afbe23315d8e.png';
export default function Auth() {
  const {
    user,
    signIn,
    signUp,
    loading
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signUp(email, password);
    setIsSubmitting(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center lg:justify-start mb-4">
              <img src={resonanceLogo} alt="Resonance Executive Coaching" className="h-24 w-auto" />
            </div>
            <div className="space-y-3">
              
              <h2 className="text-2xl font-semibold text-foreground">
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
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-primary">Professional Excellence</p>
              <p className="text-xs text-muted-foreground">
                ICF Certified • 15+ Years Experience • Fortune 500 Portfolio • Evidence-Based Methodology
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">ROI Analysis</h3>
                <p className="text-sm text-muted-foreground">Calculate payback, NPV</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Sensitivity Analysis</h3>
                <p className="text-sm text-muted-foreground">Tornado charts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Benchmarking</h3>
                <p className="text-sm text-muted-foreground">Industry standards</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Scenarios</h3>
                <p className="text-sm text-muted-foreground">Compare options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div>
              <CardTitle className="text-2xl">Welcome to Resonance</CardTitle>
              <CardDescription className="text-base mt-2">
                Access your executive coaching ROI analytics platform
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
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
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      </div>
      
      {/* Footer */}
      <div className="bg-primary/5 border-t border-primary/10 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Resonance Executive Coaching • Professional Leadership Development • 
            <span className="font-medium">Daniel Kimble, ICF Certified Executive Coach</span>
          </p>
        </div>
      </div>
    </div>;
}