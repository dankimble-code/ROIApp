import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is already authenticated and not loading, redirect to dashboard after a brief delay
    if (user && !loading) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Welcome to Resonance Executive Coaching
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your email has been successfully verified. You can now access your ROI Dashboard and start analyzing the impact of executive coaching on your organization.
              </p>
              
              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/', { replace: true })} 
                  className="w-full"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need help getting started?
              </p>
              <a 
                href="https://resonanceexecutivecoaching.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium"
              >
                Visit Resonance Executive Coaching
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmed;