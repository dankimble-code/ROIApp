import { Mail, Phone, Globe, Shield } from 'lucide-react';
import resonanceLogo from '@/assets/resonance-logo.png';

interface BrandedHeaderProps {
  title?: string;
  subtitle?: string;
  classification?: string;
  showContactInfo?: boolean;
  className?: string;
}

export function BrandedHeader({ 
  title = "ROI Analysis Report",
  subtitle,
  classification = "Confidential ROI Analysis by Resonance Executive Coaching",
  showContactInfo = true,
  className = ""
}: BrandedHeaderProps) {
  return (
    <div className={`w-full bg-gradient-to-r from-primary/5 to-primary/10 border-b-2 border-primary/20 ${className}`}>
      <div className="max-w-full px-8 py-6">
        {/* Top row with logo, company info, and contact */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          {/* Logo and company information */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img 
                src={resonanceLogo} 
                alt="Resonance Executive Coaching Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Resonance Executive Coaching
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Executive Leadership Development
              </p>
            </div>
          </div>

          {/* Contact information */}
          {showContactInfo && (
            <div className="flex flex-col lg:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <a 
                  href="https://resonanceexecutivecoaching.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  resonanceexecutivecoaching.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a 
                  href="mailto:daniel@resonanceexecutivecoaching.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  daniel@resonanceexecutivecoaching.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a 
                  href="tel:+14085181185"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  408-518-1185
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Document title and classification */}
        <div className="border-t border-primary/20 pt-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {title}
              </h2>
              {subtitle && (
                <p className="text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Classification badge */}
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-md border border-primary/20">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">
                {classification}
              </span>
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="mt-3 pt-3 border-t border-muted/30">
            <p className="text-xs text-muted-foreground">
              Generated on: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}