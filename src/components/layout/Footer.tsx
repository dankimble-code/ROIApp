import { MapPin, Phone, Mail, Globe, Users } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Resonance Executive Coaching</h3>
              <p className="text-sm text-primary-foreground/80 mb-3">
                Executive Leadership Development
              </p>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">
                Transforming leaders through evidence-based coaching methodologies 
                and comprehensive ROI-focused development programs.
              </p>
            </div>
            <div className="text-sm text-primary-foreground/80">
              <p className="font-medium">Founded by Daniel Kimble</p>
              <p>Certified Executive Coach & Leadership Development Specialist</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Contact Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-accent" />
                <a 
                  href="https://resonanceexecutivecoaching.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  resonanceexecutivecoaching.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-accent" />
                <a 
                  href="mailto:daniel@resonanceexecutivecoaching.com"
                  className="hover:text-accent transition-colors"
                >
                  daniel@resonanceexecutivecoaching.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-accent" />
                <a 
                  href="tel:+14085181185"
                  className="hover:text-accent transition-colors"
                >
                  408-518-1185
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-accent" />
                <a 
                  href="https://www.linkedin.com/in/dankimble/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  LinkedIn: Daniel Kimble
                </a>
              </div>
            </div>
          </div>

          {/* Professional Credentials */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Professional Excellence</h4>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <p>• International Coach Federation (ICF) Certified</p>
              <p>• 15+ Years Executive Leadership Experience</p>
              <p>• Evidence-Based Coaching Methodologies</p>
              <p>• ROI-Focused Development Programs</p>
              <p>• Fortune 500 Client Portfolio</p>
            </div>
            <div className="pt-2 text-xs text-primary-foreground/60">
              <p className="mb-1">
                <strong>Methodology:</strong> Our ROI calculations are based on peer-reviewed 
                research and industry best practices.
              </p>
              <p>
                <strong>Disclaimer:</strong> Results may vary. Individual outcomes depend on 
                commitment, implementation, and organizational context.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-primary-foreground/20">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-primary-foreground/60">
              © 2024 Resonance Executive Coaching. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs text-primary-foreground/60">
              <a href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</a>
              <span>Terms of Service</span>
              <span>Professional Standards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}