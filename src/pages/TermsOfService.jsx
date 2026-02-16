import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

export default function TermsOfServicePage({ isDarkMode }) {
  return (
    <div className={`min-h-screen pb-safe-bottom ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 to-slate-100'} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80'} backdrop-blur-xl shadow-lg`}>
          <CardHeader>
            <CardTitle className={`text-3xl flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <FileText className="w-8 h-8" />
              Terms of Service
            </CardTitle>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Last Updated: February 16, 2026
            </p>
          </CardHeader>
          <CardContent className={`prose ${isDarkMode ? 'prose-invert' : 'prose-slate'} max-w-none`}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using FossilFinder ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              FossilFinder provides AI-powered archaeological and paleontological analysis tools, including but not limited to:
            </p>
            <ul>
              <li>Photo analysis and fossil/artifact identification</li>
              <li>Discovery logging and management</li>
              <li>Community features including forums, social feeds, and expert connections</li>
              <li>Educational resources and virtual tours</li>
              <li>Multi-scan analysis tools</li>
            </ul>

            <h2>3. User Accounts and Age Requirements</h2>
            <p>
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul>
              <li>Be at least 13 years of age (COPPA compliance)</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p>
              Users under 13 have restricted access to social features including forums and FosFeed for safety purposes.
            </p>

            <h2>4. User Content and Conduct</h2>
            <p>
              You retain ownership of content you upload but grant FossilFinder a license to use, display, and distribute your content within the Service. You agree not to:
            </p>
            <ul>
              <li>Upload false, misleading, or fraudulent content</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload harmful, offensive, or inappropriate content</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Spam or engage in commercial solicitation</li>
              <li>Attempt to manipulate the AI analysis systems</li>
              <li>Interfere with the Service's operation</li>
            </ul>

            <h2>5. AI Analysis Disclaimer</h2>
            <p>
              AI analysis results are provided for informational and educational purposes only. FossilFinder makes no guarantees regarding:
            </p>
            <ul>
              <li>Accuracy of fossil or artifact identification</li>
              <li>Age or geological period estimates</li>
              <li>Scientific or monetary value assessments</li>
              <li>Legal ownership or discovery rights</li>
            </ul>
            <p>
              Users should consult qualified archaeologists or paleontologists for professional verification before making significant decisions based on AI analysis.
            </p>

            <h2>6. Discovery Location and Legal Compliance</h2>
            <p>
              Users are solely responsible for:
            </p>
            <ul>
              <li>Obtaining necessary permits before collecting fossils or artifacts</li>
              <li>Complying with local, state, and federal laws regarding archaeological finds</li>
              <li>Respecting private property and protected areas</li>
              <li>Reporting significant discoveries to appropriate authorities when required</li>
            </ul>
            <p>
              FossilFinder is not responsible for any legal issues arising from fossil/artifact collection or discovery.
            </p>

            <h2>7. Community Guidelines and Moderation</h2>
            <p>
              We reserve the right to:
            </p>
            <ul>
              <li>Review and moderate user-generated content</li>
              <li>Remove content that violates these terms</li>
              <li>Suspend or terminate accounts for violations</li>
              <li>Use AI moderation tools to flag inappropriate content</li>
              <li>Issue warnings or bans at our discretion</li>
            </ul>

            <h2>8. Data Usage and AI Training</h2>
            <p>
              By uploading discoveries, you acknowledge that:
            </p>
            <ul>
              <li>Analysis data may be used to improve AI models</li>
              <li>Public discoveries may be visible to other users</li>
              <li>Aggregate data may be used for research purposes</li>
              <li>Personal information is handled per our Privacy Policy</li>
            </ul>

            <h2>9. Expert Connections</h2>
            <p>
              FossilFinder facilitates connections with archaeological and paleontological experts but:
            </p>
            <ul>
              <li>Does not guarantee expert responses or availability</li>
              <li>Is not responsible for expert advice or opinions</li>
              <li>Does not verify expert credentials (information sourced from web)</li>
            </ul>

            <h2>10. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by FossilFinder and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              FossilFinder shall not be liable for:
            </p>
            <ul>
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or use</li>
              <li>Damages from user-generated content</li>
              <li>Service interruptions or technical issues</li>
              <li>Third-party actions or content</li>
            </ul>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless FossilFinder from any claims, damages, or expenses arising from your use of the Service or violation of these terms.
            </p>

            <h2>13. Service Modifications and Termination</h2>
            <p>
              We reserve the right to:
            </p>
            <ul>
              <li>Modify or discontinue the Service at any time</li>
              <li>Change these Terms of Service with notice</li>
              <li>Terminate accounts that violate these terms</li>
            </ul>

            <h2>14. Third-Party Services</h2>
            <p>
              The Service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of third parties.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us through the Contact Admin feature within the application.
            </p>

            <h2>17. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>

            <h2>18. Entire Agreement</h2>
            <p>
              These Terms of Service, together with the Privacy Policy, constitute the entire agreement between you and FossilFinder regarding the use of the Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}