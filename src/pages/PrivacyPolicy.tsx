import { AppLayout } from '@/components/layout/AppLayout';

const PrivacyPolicy = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="mb-6 text-sm text-muted-foreground">
            <p><strong>Effective date:</strong> September 24, 2025</p>
            <p><strong>App:</strong> Resonance Executive Coaching ROI Calculator ("the App")</p>
            <p><strong>Provider:</strong> Resonance Executive Coaching ("we," "us," "our")</p>
            <p><strong>Contact:</strong> daniel@resonanceexecutivecoaching.com</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1) Overview</h2>
            <p>This App is a standalone, front-end tool. It runs in your browser from static HTML, CSS, and JavaScript. We do not operate a server for the App and we do not receive or store your inputs.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2) What data the App handles</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>User inputs you type into the App (costs, benefits, assumptions) are processed locally in your browser to calculate results.</li>
              <li><strong>Local storage:</strong> The App can save scenarios to your device's browser storage so you can return later.</li>
              <li><strong>Exports you choose:</strong> You can export a PDF or JSON file. Those files are created on your device. You control where they are saved or shared.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3) What we do not collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No account creation.</li>
              <li>No databases.</li>
              <li>No telemetry or analytics.</li>
              <li>No cookies set by us.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4) Hosting and third-party libraries</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>If you access the App from a hosting service such as GitHub Pages or your own website, that host may log standard information like IP address, browser type, and timestamps. See the host's privacy policy.</li>
              <li>The App may load open-source libraries (for example, Chart.js, jsPDF, html2canvas). When loaded from a CDN, your IP address may be visible to that CDN. You can self-host these files to avoid third-party requests.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5) Optional offline use</h2>
            <p>If you enable the App's offline features or install it as a PWA, your browser may cache App files on your device so it works without a network connection. You can remove cached files by clearing your browser data.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6) Your controls</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>View or delete data:</strong> Use the App's controls to delete scenarios, or clear your browser's local storage and cached data.</li>
              <li><strong>Exports:</strong> Delete any PDFs or JSON files you created if you no longer need them.</li>
              <li><strong>Do Not Track:</strong> The App does not track users, and it does not respond to DNT signals because no tracking occurs.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7) Children's privacy</h2>
            <p>The App is not directed to children under 13 (or the age of digital consent in your region). We do not knowingly collect personal data from children.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8) Security</h2>
            <p>Because calculations and storage occur on your device, protect your device and browser. Do not export or share files that contain confidential business information unless you intend to.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9) International users</h2>
            <p>We do not receive your data. If you deploy the App in jurisdictions with privacy laws (for example, GDPR), you act as the data controller for any inputs you collect or export. Host and operate the App in a manner consistent with your legal obligations.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10) Changes to this policy</h2>
            <p>We may update this policy as the App evolves. We will post the new effective date when changes are made.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11) Contact</h2>
            <p>Questions or requests: <a href="mailto:daniel@resonanceexecutivecoaching.com" className="text-primary hover:underline">daniel@resonanceexecutivecoaching.com</a></p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default PrivacyPolicy;