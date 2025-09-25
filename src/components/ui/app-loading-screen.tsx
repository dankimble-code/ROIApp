import { useEffect, useState } from 'react';
import resonanceLogo from '@/assets/resonance-logo.png';

interface AppLoadingScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export function AppLoadingScreen({ onComplete, minDisplayTime = 2000 }: AppLoadingScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'fade-in' | 'scale' | 'glow' | 'complete'>('fade-in');

  useEffect(() => {
    const timeline = [
      { phase: 'scale', delay: 500 },
      { phase: 'glow', delay: 1000 },
      { phase: 'complete', delay: minDisplayTime }
    ];

    const timeouts = timeline.map(({ phase, delay }) =>
      setTimeout(() => setAnimationPhase(phase as any), delay)
    );

    // Complete loading after minimum display time
    const completeTimeout = setTimeout(onComplete, minDisplayTime + 500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete, minDisplayTime]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background pattern */}
      <div className="absolute inset-0 resonance-pattern opacity-20" />
      
      {/* Logo container */}
      <div className="relative flex flex-col items-center space-y-6">
        {/* Logo with animations */}
        <div className={`
          relative transition-all duration-1000 ease-out
          ${animationPhase === 'fade-in' ? 'opacity-0 scale-90' : ''}
          ${animationPhase === 'scale' ? 'opacity-100 scale-100' : ''}
          ${animationPhase === 'glow' ? 'opacity-100 scale-105' : ''}
          ${animationPhase === 'complete' ? 'opacity-100 scale-100' : ''}
        `}>
          {/* Glow effect */}
          <div className={`
            absolute inset-0 rounded-full blur-xl transition-opacity duration-1000
            bg-gradient-to-r from-primary via-accent to-secondary
            ${animationPhase === 'glow' || animationPhase === 'complete' ? 'opacity-30' : 'opacity-0'}
          `} />
          
          {/* Logo image */}
          <img 
            src={resonanceLogo} 
            alt="Resonance Executive Coaching"
            className="relative w-24 h-24 object-contain z-10"
          />
        </div>

        {/* Company name with staggered animation */}
        <div className={`
          text-center space-y-2 transition-all duration-1000 delay-300
          ${animationPhase === 'fade-in' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
        `}>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            RESONANCE
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            EXECUTIVE COACHING
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`
          transition-opacity duration-500 delay-700
          ${animationPhase === 'complete' ? 'opacity-0' : 'opacity-100'}
        `}>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  w-2 h-2 rounded-full bg-primary/60 animate-pulse
                  animation-delay-${i * 200}
                `}
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fade out overlay */}
      <div className={`
        absolute inset-0 bg-background transition-opacity duration-500
        ${animationPhase === 'complete' ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
}