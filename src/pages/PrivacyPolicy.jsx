import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage({ isDarkMode }) {
  return (
    <div className={`min-h-screen pb-safe-bottom ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 to-slate-100'} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80'} backdrop-blur-xl shadow-lg`}>
          <CardHeader>
            <CardTitle className={`text-3xl flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <Shield className="w-8 h-8" />
              Privacy Policy
            </CardTitle>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Last Updated: February 16, 2026
            </p>
          </CardHeader>
          <CardContent className={`prose ${isDarkMode ? 'prose-invert' : 'prose-slate'} max-w-none`}>
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-900'} font-semibold mb-2`}>Your Privacy Matters</p>
              <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                This Privacy Policy explains how FossilFinder collects, uses, stores, and protects your personal information. We are committed to transparency and your privacy rights.
              </p>
            </div>

            <h2>1. Introduction and Scope</h2>
            <p>
              This Privacy Policy describes the privacy practices of FossilFinder ("we," "our," "us," or "Service"), operated by Connor Seay. This policy applies to information collected through our web application, including all features, tools, and services offered.
            </p>
            <p>
              By using FossilFinder, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with this policy, please do not use the Service.
            </p>
            <p>
              <strong>Effective Date:</strong> February 16, 2026<br />
              <strong>Last Updated:</strong> February 16, 2026
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, information collected automatically, and information from third-party sources.
            </p>
            
            <h3>2.1 Personal Information</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address, full name, display name, profile picture</li>
              <li><strong>Age Verification:</strong> Date of birth is collected during age verification and immediately deleted after processing. We retain only: (1) a boolean flag indicating you are 13 or older, and (2) timestamp of verification for COPPA compliance audit purposes</li>
              <li><strong>User Preferences:</strong> Notification settings, followed topics, theme preferences</li>
            </ul>

            <h3>2.2 Discovery Data</h3>
            <ul>
              <li><strong>Uploaded Photos:</strong> Images of fossils and artifacts you submit for analysis</li>
              <li><strong>Location Data:</strong> GPS coordinates of discovery locations (if provided)</li>
              <li><strong>Analysis Results:</strong> AI-generated classifications, descriptions, and metadata</li>
              <li><strong>User Notes:</strong> Comments, descriptions, and metadata you add</li>
            </ul>

            <h3>2.3 Community Content</h3>
            <ul>
              <li>Forum posts and replies</li>
              <li>Comments on discoveries</li>
              <li>FosFeed interactions (likes, follows, shares)</li>
              <li>Messages to administrators</li>
            </ul>

            <h3>2.4 Usage Information</h3>
            <ul>
              <li><strong>Activity Logs:</strong> Pages visited, features used, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Analytics Data:</strong> User engagement metrics, feature usage statistics</li>
            </ul>

            <h3>2.5 Security and Moderation Data</h3>
            <ul>
              <li>Security event logs</li>
              <li>Rate limiting data</li>
              <li>Content reports and moderation actions</li>
              <li>Audit logs for administrative actions</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            
            <h3>3.1 Service Provision</h3>
            <ul>
              <li>Provide AI-powered fossil and artifact analysis</li>
              <li>Manage user accounts and authentication</li>
              <li>Store and display discoveries</li>
              <li>Enable community features (forums, FosFeed, messaging)</li>
              <li>Connect users with expert archaeologists and paleontologists</li>
            </ul>

            <h3>3.2 AI Improvement</h3>
            <ul>
              <li>Train and improve AI analysis models using discovery data</li>
              <li>Enhance accuracy of fossil/artifact identification</li>
              <li>Develop new analysis features</li>
            </ul>

            <h3>3.3 Safety and Compliance</h3>
            <ul>
              <li>Verify age for COPPA compliance (users under 13)</li>
              <li>Moderate content for community safety</li>
              <li>Detect and prevent abuse, spam, and security threats</li>
              <li>Enforce Terms of Service</li>
            </ul>

            <h3>3.4 Communication</h3>
            <ul>
              <li>Send service-related notifications</li>
              <li>Respond to contact requests and support inquiries</li>
              <li>Deliver administrative announcements</li>
              <li>Send email notifications based on user preferences</li>
            </ul>

            <h3>3.5 Analytics and Research</h3>
            <ul>
              <li>Analyze usage patterns to improve the Service</li>
              <li>Generate aggregate statistics (no individual identification)</li>
              <li>Conduct archaeological/paleontological research with anonymized data</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>

            <h3>4.1 Public Information</h3>
            <p>
              The following information may be visible to other users based on your privacy settings:
            </p>
            <ul>
              <li>Display name (not real name if censored for privacy)</li>
              <li>Profile picture and bio</li>
              <li>Public discoveries and their details</li>
              <li>Forum posts and comments</li>
              <li>FosFeed activity</li>
              <li>Badges and points on leaderboards</li>
            </ul>

            <h3>4.2 We Do NOT Sell Your Data</h3>
            <p>
              We do not sell, rent, or trade your personal information to third parties for their commercial purposes.
            </p>

            <h3>4.3 Service Providers</h3>
            <p>
              We may share information with trusted third-party service providers who assist in:
            </p>
            <ul>
              <li>Cloud hosting and data storage</li>
              <li>Email delivery services</li>
              <li>AI and machine learning services</li>
              <li>Analytics tools</li>
            </ul>
            <p>
              These providers are contractually obligated to protect your information and use it only for specified purposes.
            </p>

            <h3>4.4 Legal Requirements</h3>
            <p>
              We may disclose information when required by law or to:
            </p>
            <ul>
              <li>Comply with legal processes (subpoenas, court orders)</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect rights, property, or safety of FossilFinder, users, or the public</li>
              <li>Report significant archaeological finds to authorities when legally required</li>
            </ul>

            <h2>5. Data Retention</h2>
            <ul>
              <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after deletion</li>
              <li><strong>Discoveries:</strong> Retained indefinitely unless you delete them or close your account</li>
              <li><strong>Birthday Information:</strong> Immediately deleted after age verification (only over/under 13 status retained)</li>
              <li><strong>Audit Logs:</strong> Retained for security and compliance purposes (typically 1-2 years)</li>
              <li><strong>Analytics Data:</strong> Anonymized and retained for service improvement</li>
            </ul>

            <h2>6. Your Privacy Rights and Choices</h2>

            <h3>6.1 Access and Update</h3>
            <p>
              You can access and update your personal information through your profile settings.
            </p>

            <h3>6.2 Discovery Visibility</h3>
            <p>
              You can set discoveries to:
            </p>
            <ul>
              <li><strong>Public:</strong> Visible to all users</li>
              <li><strong>Private:</strong> Visible only to you</li>
              <li><strong>Shared:</strong> Visible to specific users you choose</li>
            </ul>

            <h3>6.3 Name Privacy</h3>
            <p>
              If your real name is detected in your display name, administrators may censor it for your privacy protection. You'll be notified to choose a different display name.
            </p>

            <h3>6.4 Data Deletion</h3>
            <p>
              You can request account deletion by contacting an administrator. Upon deletion:
            </p>
            <ul>
              <li>Personal information is removed</li>
              <li>Discoveries may be anonymized or deleted based on your preference</li>
              <li>Public contributions (forum posts) may be retained in anonymized form</li>
            </ul>

            <h3>6.5 Notification Preferences</h3>
            <p>
              You can customize email notifications through your profile settings.
            </p>

            <h2>7. Children's Privacy (COPPA Compliance)</h2>
            
            <h3>7.1 Strict Age Requirement</h3>
            <p>
              <strong>NO USERS UNDER 13:</strong> FossilFinder does not permit children under 13 years of age to use the Service. This is a strict prohibition in compliance with the Children's Online Privacy Protection Act (COPPA).
            </p>
            
            <h3>7.2 Age Verification Process</h3>
            <ul>
              <li>Users must verify they are at least 13 years old during account creation</li>
              <li>Date of birth is collected solely for age verification and is immediately deleted after processing</li>
              <li>We retain only a boolean flag (over/under 13) and verification timestamp for compliance purposes</li>
              <li>If we discover a user is under 13, the account is immediately terminated and all data is deleted</li>
            </ul>
            
            <h3>7.3 Parental Notification</h3>
            <p>
              If you are a parent or guardian and believe your child under 13 has created an account or provided personal information to us, please contact us immediately through the Contact Admin feature. We will promptly:
            </p>
            <ul>
              <li>Terminate the account</li>
              <li>Delete all personal information associated with the account</li>
              <li>Prevent future access from the associated email address</li>
            </ul>
            
            <h3>7.4 No Intentional Collection</h3>
            <p>
              We do not knowingly collect, use, or disclose personal information from children under 13. Our Service is designed and intended for users 13 years of age and older.
            </p>

            <h2>8. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information:
            </p>
            <ul>
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure authentication systems</li>
              <li>Access controls and monitoring</li>
              <li>Regular security audits</li>
              <li>AI-powered abuse detection</li>
              <li>Rate limiting to prevent automated attacks</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and stored in countries outside your residence. By using the Service, you consent to such transfers.
            </p>

            <h2>10. Cookies and Tracking</h2>
            <p>
              We use local storage and session data to:
            </p>
            <ul>
              <li>Maintain login sessions</li>
              <li>Remember user preferences (theme, settings)</li>
              <li>Improve user experience</li>
            </ul>
            <p>
              We do not use third-party advertising cookies.
            </p>

            <h2>11. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites (expert profiles, educational resources). We are not responsible for the privacy practices of these sites.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification for material changes</li>
            </ul>

            <h2>13. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the California Consumer Privacy Act:
            </p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of sale (we don't sell your data)</li>
              <li>Right to request deletion of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h2>14. European Privacy Rights (GDPR)</h2>
            <p>
              If you are in the European Economic Area, you have rights under GDPR including:
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>

            <h2>15. Contact Us</h2>
            <p>
              For questions about this Privacy Policy or to exercise your privacy rights, please contact us through the Contact Admin feature within the application.
            </p>

            <h2>16. Data Processing Lawful Basis</h2>
            <p>
              We process your data based on:
            </p>
            <ul>
              <li><strong>Consent:</strong> You agree to data collection when creating an account</li>
              <li><strong>Contract:</strong> Processing necessary to provide the Service</li>
              <li><strong>Legal Obligation:</strong> COPPA compliance, legal requirements</li>
              <li><strong>Legitimate Interest:</strong> Service improvement, security, fraud prevention</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}