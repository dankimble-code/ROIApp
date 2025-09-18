import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, TrendingUp } from 'lucide-react';
import { Footer } from './Footer';
import { BrandedLoader } from '@/components/ui/branded-loader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut, loading } = useAuth();
  
  console.log('AppLayout rendering - subtitle should show: by Daniel Kimble');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <BrandedLoader 
          size="xl" 
          message="Initializing Your ROI Dashboard..." 
          variant="resonance"
        />
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-primary/5 border-b border-primary/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-20 py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/c6e5ebea-b93f-43ad-8bda-afbe23315d8e.png" 
                  alt="Resonance Executive Coaching" 
                  className="h-16 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-primary">Resonance Executive Coaching</h1>
                  <p className="text-sm text-muted-foreground">Executive Leadership Development</p>
                  <p className="text-xs text-muted-foreground/80 italic">by Daniel Kimble</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}