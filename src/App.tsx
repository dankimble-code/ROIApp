import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLoadingScreen } from "@/components/ui/app-loading-screen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Benefits from "./pages/Benefits";
import Calculation from "./pages/Calculation";
import Styleguide from "./pages/Styleguide";
import EmailConfirmed from "./pages/EmailConfirmed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Show loading screen on first visit only
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('app-loaded');
    if (hasVisited) {
      setShowLoadingScreen(false);
      setAppReady(true);
    } else {
      sessionStorage.setItem('app-loaded', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
    setAppReady(true);
  };

  if (showLoadingScreen) {
    return <AppLoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (!appReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/benefits" element={<Benefits />} />
                <Route path="/calculation" element={<Calculation />} />
                <Route path="/styleguide" element={<Styleguide />} />
                <Route path="/email-confirmed" element={<EmailConfirmed />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
