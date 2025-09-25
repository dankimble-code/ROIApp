import { AppLayout } from "@/components/layout/AppLayout";

export default function TermsOfService() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-white/90">
              Legal terms and conditions for using the Resonance Executive Coaching ROI Calculator
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Effective date:</strong> September 24, 2025
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>App:</strong> Resonance Executive Coaching ROI Calculator ("App")
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Provider:</strong> Resonance Executive Coaching ("we," "us," "our")
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Contact:</strong> daniel@resonanceexecutivecoaching.com
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">1) Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using the App, you agree to these Terms. If you do not agree, do not use the App.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">2) The Service</h2>
              <p className="mb-4">
                The App is a standalone, front-end calculator that runs in your browser. It helps estimate potential financial impact of executive coaching based on assumptions you enter. It has no server-side component and does not transmit your inputs to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">3) Not Professional Advice</h2>
              <p className="mb-4">
                The App provides calculations and visualizations for informational purposes only. It is not accounting, financial, investment, legal, HR, or management advice. You are responsible for your assumptions and decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">4) No Guarantees; Experimental Features</h2>
              <p className="mb-4">
                Outputs depend on your inputs and models. Results are estimates, not promises of performance or outcomes. The App may change, improve, or break; availability is not guaranteed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">5) Privacy & Local Storage</h2>
              <p className="mb-4">
                The App can store scenarios in your browser's local storage on your device. See the Privacy Policy for details. If you export PDFs or JSON, you decide where to save or share them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">6) Third-Party Libraries and Hosting</h2>
              <p className="mb-4">
                The App may load open-source libraries (e.g., Chart.js, jsPDF, html2canvas) and may be served from a third-party host (e.g., GitHub Pages). Those parties may receive technical information (e.g., IP address). Review their policies. You may self-host libraries to avoid CDNs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">7) Eligibility</h2>
              <p className="mb-4">
                You must be able to form a binding contract in your jurisdiction and use the App in compliance with applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">8) Acceptable Use</h2>
              <p className="mb-4">You will not:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the App for unlawful, fraudulent, or harmful purposes.</li>
                <li>Attempt to disrupt, reverse engineer, or bypass technical limitations.</li>
                <li>Misrepresent outputs as audited, certified, or guaranteed results.</li>
                <li>Remove notices or marks identifying ownership.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">9) Intellectual Property</h2>
              <p className="mb-4">
                We (or our licensors) own the App, its design, and underlying code, excluding third-party libraries and any content you input. Subject to these Terms, we grant you a revocable, non-exclusive, non-transferable license to use the App for its intended purpose.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">10) Your Inputs and Exports</h2>
              <p className="mb-4">
                You own the data you type into the App and the files you export. We do not receive your inputs by default. If you voluntarily send us exported files or feedback, you grant us a non-exclusive license to use that material to operate, improve, and support the App.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">11) Changes; Updates</h2>
              <p className="mb-4">
                We may modify or update the App or these Terms at any time. Material changes will be reflected by updating the Effective Date. Continued use means you accept the changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">12) Disclaimers</h2>
              <p className="mb-4">
                THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF ACCURACY, RELIABILITY, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">13) Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; LOST PROFITS; LOSS OF DATA; OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY. OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATING TO THE APP WILL NOT EXCEED USD $100 OR THE AMOUNT YOU PAID US FOR THE APP IN THE 12 MONTHS BEFORE THE CLAIM (WHICHEVER IS GREATER).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">14) Indemnification</h2>
              <p className="mb-4">
                You agree to defend, indemnify, and hold us harmless from claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of your use of the App, your inputs/exports, or your violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">15) Export, Compliance, and Use Restrictions</h2>
              <p className="mb-4">
                You are responsible for complying with applicable laws, including export controls, anti-corruption, and privacy laws, in relation to your use of the App and any data you process or export.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">16) Termination</h2>
              <p className="mb-4">
                You may stop using the App at any time. We may suspend or terminate access if we believe you violated these Terms. Sections that by their nature should survive termination will survive (e.g., IP ownership, disclaimers, limitations, indemnity, governing law).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">17) Governing Law; Venue</h2>
              <p className="mb-4">
                These Terms are governed by the laws of California, without regard to conflict-of-law rules. Courts located in California will have exclusive jurisdiction, and you consent to personal jurisdiction there.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">18) Entire Agreement; Severability; No Waiver</h2>
              <p className="mb-4">
                These Terms constitute the entire agreement between you and us regarding the App. If any provision is found unenforceable, the remaining provisions remain in effect. Our failure to enforce any provision is not a waiver.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">19) Feedback</h2>
              <p className="mb-4">
                If you provide feedback or suggestions, you grant us a non-exclusive, perpetual, irrevocable, royalty-free license to use them without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">20) Contact</h2>
              <p className="mb-4">
                Questions about these Terms: daniel@resonanceexecutivecoaching.com
              </p>
            </section>

            <div className="border-t border-border pt-8 mt-12">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-primary">Plain-English Summary</h3>
                <p className="text-sm text-muted-foreground italic">
                  (This summary is non-binding): This is a self-contained browser tool. You control your data and exports. We don't guarantee outcomes. Use it responsibly, follow the law, and don't rely on it as professional advice. If you need help applying results to your business, engage a qualified professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}