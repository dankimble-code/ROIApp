import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Home, Search, ArrowLeft } from "lucide-react";

const resonanceLogo = '/resonance-logo.png';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 resonance-pattern">
      {/* Branded header */}
      <div className="absolute top-6 left-6 flex items-center space-x-3">
        <img 
          src={resonanceLogo} 
          alt="Resonance Executive Coaching" 
          className="w-8 h-8 object-contain"
        />
        <div className="text-sm">
          <div className="font-semibold text-primary">RESONANCE</div>
          <div className="text-xs text-muted-foreground">EXECUTIVE COACHING</div>
        </div>
      </div>

      <div className="w-full max-w-md mx-4">
        <EmptyState
          variant="branded"
          icon={<Search className="h-16 w-16" />}
          title="Page Not Found"
          description={`The page "${location.pathname}" doesn't exist. You may have mistyped the URL or the page may have been moved.`}
          action={{
            label: "Return to Dashboard",
            onClick: () => navigate('/'),
            variant: 'default'
          }}
        />
        
        {/* Additional actions */}
        <div className="mt-4 flex justify-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="transition-resonance"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="transition-resonance"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
