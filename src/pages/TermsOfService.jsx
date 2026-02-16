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
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-900'} font-semibold mb-2`}>Important Notice</p>
              <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                These Terms of Service are a legally binding agreement. By using FossilFinder, you agree to be bound by these terms. Please read them carefully.
              </p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or using FossilFinder ("the Service," "we," "our," or "us"), operated by Connor Seay, you ("User," "you," or "your") accept and agree to be legally bound by these Terms of Service ("Terms"), whether you are a registered user or a visitor. If you do not agree to these Terms in their entirety, you must immediately cease using the Service.
            </p>
            <p>
              Your continued use of the Service following the posting of changes to these Terms will mean you accept those changes. We reserve the right to modify these Terms at any time, and will provide notice of material changes via email or in-app notification.
            </p>

            <h2>2. Service Description and Scope</h2>
            <p>
              FossilFinder is an AI-powered web application designed for amateur archaeologists, paleontology enthusiasts, and professionals to analyze, document, and share fossil and artifact discoveries. The Service includes, but is not limited to:
            </p>
            <ul>
              <li><strong>AI Analysis Engine:</strong> Artificial intelligence-powered photo analysis providing fossil and artifact identification, geological period estimation, and significance assessment</li>
              <li><strong>Discovery Management:</strong> Digital cataloging system for organizing personal fossil and artifact collections with photos, locations, and metadata</li>
              <li><strong>Multi-Scan Technology:</strong> Advanced scanning tools to identify multiple points of interest within a single image</li>
              <li><strong>Social Platform (FosFeed):</strong> Social media-style feed for sharing and discovering public fossil finds from the community</li>
              <li><strong>Community Forum:</strong> Discussion boards for identification help, technique sharing, and community interaction</li>
              <li><strong>Expert Matching:</strong> AI-powered search to connect users with relevant archaeological and paleontological experts</li>
              <li><strong>Educational Resources:</strong> Learning materials, virtual tours, and archaeological information</li>
              <li><strong>Discovery Map:</strong> Interactive mapping of fossil discoveries with GPS integration</li>
              <li><strong>Gamification System:</strong> Points, badges, achievements, and leaderboards to encourage engagement</li>
              <li><strong>Community Showcase:</strong> Featured discoveries and staff-selected highlights</li>
            </ul>

            <h2>3. Eligibility and Account Requirements</h2>
            
            <h3>3.1 Age Requirements</h3>
            <p>
              <strong>MINIMUM AGE REQUIREMENT:</strong> You must be at least 13 years of age to create an account and use the Service. This requirement is mandated by the Children's Online Privacy Protection Act (COPPA). 
            </p>
            <p>
              <strong>STRICT PROHIBITION:</strong> Users under 13 years of age are strictly prohibited from accessing or using the Service in any capacity. We do not knowingly collect personal information from children under 13. If we discover that a user is under 13, the account will be immediately terminated and all personal information will be deleted.
            </p>
            <p>
              <strong>PARENTAL RESPONSIBILITY:</strong> Users who are 13 years of age or older but under 18 years of age should have parental or guardian supervision while using the Service, particularly when sharing location information or interacting with other users.
            </p>
            <p>
              <strong>PARENTAL REPORTING:</strong> If you are a parent or guardian and believe your child under 13 has accessed the Service, please contact us immediately through the Contact Admin feature so we can delete their account and information.
            </p>

            <h3>3.2 Age Verification</h3>
            <p>
              We may require age verification to ensure COPPA compliance. By providing your date of birth during verification, you represent and warrant that you are at least 13 years of age. 
            </p>
            <p>
              <strong>DATA RETENTION:</strong> Your complete date of birth is immediately deleted after verification. We only retain: (1) whether you meet the minimum age requirement, and (2) a timestamp of when verification occurred, for compliance audit purposes. This limited retention is necessary to demonstrate COPPA compliance if questioned by regulators.
            </p>
            <p>
              <strong>FALSE INFORMATION:</strong> Providing false age information is a violation of these Terms and may result in immediate account termination.
            </p>

            <h3>3.3 Account Registration</h3>
            <p>
              To access certain features, you must register for an account by providing:
            </p>
            <ul>
              <li>A valid email address</li>
              <li>Your full name</li>
              <li>A display name (pseudonyms encouraged for privacy)</li>
              <li>Age verification</li>
              <li>Acceptance of these Terms and our Privacy Policy</li>
            </ul>
            <p>
              You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>

            <h3>3.4 Account Security</h3>
            <p>
              You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Immediately notifying us of any unauthorized use or security breach</li>
              <li>Logging out at the end of each session</li>
            </ul>
            <p>
              We cannot and will not be liable for any loss or damage arising from your failure to comply with account security obligations.
            </p>

            <h3>3.5 One Account Per Person</h3>
            <p>
              You may maintain only one account. Creating multiple accounts to circumvent bans, manipulate gamification systems, or for any other purpose is strictly prohibited.
            </p>

            <h2>4. User Content and Licensing</h2>

            <h3>4.1 Your Content Ownership</h3>
            <p>
              You retain all ownership rights to content you upload to the Service, including photographs, descriptions, comments, forum posts, and other materials ("User Content"). However, by uploading User Content, you grant FossilFinder a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Service.
            </p>

            <h3>4.2 License Scope</h3>
            <p>
              The license you grant allows us to:
            </p>
            <ul>
              <li>Display your public discoveries to other users</li>
              <li>Use discovery images and data to train and improve AI models</li>
              <li>Include your content in community features (FosFeed, showcase, maps)</li>
              <li>Create derivative works for analysis purposes</li>
              <li>Use aggregated, anonymized data for research and improvement</li>
            </ul>

            <h3>4.3 Content Representations and Warranties</h3>
            <p>
              By uploading User Content, you represent and warrant that:
            </p>
            <ul>
              <li>You own or have the necessary rights to upload the content</li>
              <li>The content is accurate to the best of your knowledge</li>
              <li>The content does not violate any laws or third-party rights</li>
              <li>You obtained necessary permissions for photographing discoveries on private property</li>
              <li>You have complied with all applicable laws regarding fossil collection</li>
            </ul>

            <h3>4.4 Prohibited Content</h3>
            <p>
              You agree not to upload, post, or share content that:
            </p>
            <ul>
              <li>Is false, misleading, fraudulent, or deceptive</li>
              <li>Infringes on intellectual property rights, privacy rights, or any other rights of third parties</li>
              <li>Contains viruses, malware, or other harmful code</li>
              <li>Is illegal, obscene, defamatory, threatening, harassing, hateful, racially or ethnically offensive, or encourages illegal activity</li>
              <li>Depicts or glorifies violence or dangerous activities</li>
              <li>Contains personal information of others without consent</li>
              <li>Is spam, advertising, or commercial solicitation</li>
              <li>Impersonates any person or entity</li>
              <li>Depicts illegal fossil or artifact collection activities</li>
              <li><strong>Reveals precise GPS coordinates for significant fossil discoveries on public lands, protected areas, or archaeological sites</strong> (to prevent looting and comply with federal protection laws)</li>
              <li><strong>Facilitates or encourages unauthorized fossil collection on federal lands, national parks, monuments, or protected sites</strong></li>
            </ul>
            <p>
              <strong>GPS COORDINATE RESTRICTIONS:</strong> While general location sharing (e.g., "Morrison Formation, Colorado") is permitted, posting exact GPS coordinates or detailed access directions for significant paleontological sites on public or protected lands is prohibited to prevent site degradation and comply with the Paleontological Resources Preservation Act and Archaeological Resources Protection Act.
            </p>

            <h2>5. Prohibited Conduct</h2>
            <p>
              In addition to content restrictions, you agree not to:
            </p>
            <ul>
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Harass, bully, stalk, threaten, or harm other users</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Use bots, scrapers, or automated tools without permission</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
              <li>Attempt to manipulate AI analysis results through adversarial techniques</li>
              <li>Circumvent any security features or access controls</li>
              <li>Collect or harvest data from other users without consent</li>
              <li>Create or distribute exploits, cheats, or hacks</li>
              <li>Engage in any activity that could damage our reputation or business</li>
            </ul>

            <h2>6. AI Analysis: Disclaimers and Limitations</h2>

            <h3>6.1 Educational Purpose Only</h3>
            <p>
              <strong>CRITICAL DISCLAIMER:</strong> AI analysis results are provided solely for educational and informational purposes. They are NOT professional archaeological or paleontological assessments and should not be relied upon for:
            </p>
            <ul>
              <li>Legal determinations of ownership or rights</li>
              <li>Commercial valuation or sale pricing</li>
              <li>Scientific publication or citation</li>
              <li>Legal compliance or reporting obligations</li>
              <li>Safety assessments regarding handling or preservation</li>
            </ul>

            <h3>6.2 No Accuracy Guarantees</h3>
            <p>
              We make NO warranties, express or implied, regarding:
            </p>
            <ul>
              <li>Accuracy of species or artifact identification</li>
              <li>Correctness of geological period or age estimates</li>
              <li>Reliability of significance assessments</li>
              <li>Completeness of analysis results</li>
              <li>Suitability for any particular purpose</li>
            </ul>
            <p>
              AI models can and do make mistakes. Confidence scores are statistical probabilities, not guarantees of accuracy.
            </p>

            <h3>6.3 Professional Verification Required</h3>
            <p>
              For any discovery of potential scientific, historical, or monetary value, you MUST seek verification from qualified professionals including:
            </p>
            <ul>
              <li>Licensed archaeologists or paleontologists</li>
              <li>Museum curators or university researchers</li>
              <li>State or federal archaeological authorities</li>
              <li>Professional appraisers (for commercial purposes)</li>
            </ul>

            <h3>6.4 AI Model Updates</h3>
            <p>
              We continuously update and improve our AI models. Results for the same image may change over time as models improve. We are not liable for discrepancies between analyses conducted at different times.
            </p>

            <h2>7. Legal Compliance for Fossil and Artifact Collection</h2>

            <h3>7.1 Your Sole Responsibility</h3>
            <p>
              You are SOLELY and EXCLUSIVELY responsible for:
            </p>
            <ul>
              <li>Knowing and complying with federal laws (including the Antiquities Act, Archaeological Resources Protection Act, Paleontological Resources Preservation Act)</li>
              <li>Knowing and complying with state and local laws regarding fossil and artifact collection</li>
              <li>Obtaining all necessary permits, licenses, and permissions before collecting</li>
              <li>Respecting private property rights and obtaining landowner permission</li>
              <li>Avoiding collection in protected areas (national parks, monuments, tribal lands, etc.)</li>
              <li>Reporting significant discoveries when legally required</li>
              <li>Proper handling and preservation of collected items</li>
            </ul>

            <h3>7.2 Legal Penalties Warning</h3>
            <p>
              Illegal collection of fossils or artifacts can result in:
            </p>
            <ul>
              <li>Criminal prosecution and imprisonment</li>
              <li>Substantial fines (potentially hundreds of thousands of dollars)</li>
              <li>Forfeiture of collected items and equipment</li>
              <li>Civil liability for damages</li>
            </ul>
            <p>
              <strong>FossilFinder is NOT a substitute for legal advice. Consult with legal professionals or regulatory authorities before collecting in any questionable location.</strong>
            </p>

            <h3>7.3 No Legal Advice</h3>
            <p>
              Nothing in the Service constitutes legal advice regarding collection rights, ownership, or reporting obligations. We strongly encourage consultation with appropriate legal and scientific authorities.
            </p>

            <h2>8. Community Guidelines and Standards</h2>

            <h3>8.1 Respectful Interaction</h3>
            <p>
              Users must:
            </p>
            <ul>
              <li>Treat all community members with respect and courtesy</li>
              <li>Engage in constructive discussions and debates</li>
              <li>Provide helpful feedback when assisting with identifications</li>
              <li>Credit others' discoveries and ideas appropriately</li>
              <li>Report violations of community guidelines</li>
            </ul>

            <h3>8.2 Scientific Integrity</h3>
            <p>
              When sharing discoveries or providing identifications:
            </p>
            <ul>
              <li>Be honest about provenance and collection circumstances</li>
              <li>Do not misrepresent your expertise or credentials</li>
              <li>Acknowledge uncertainty when appropriate</li>
              <li>Correct errors when discovered</li>
              <li>Respect scientific consensus while allowing for discussion</li>
            </ul>

            <h3>8.3 Age-Appropriate Content</h3>
            <p>
              Given that users as young as 13 may access the Service:
            </p>
            <ul>
              <li>Keep content appropriate for all ages</li>
              <li>Avoid graphic depictions of violence or death</li>
              <li>No sexual or suggestive content</li>
              <li>No promotion of dangerous activities</li>
            </ul>

            <h2>9. Moderation and Enforcement</h2>

            <h3>9.1 Content Moderation</h3>
            <p>
              We reserve the right, but assume no obligation, to:
            </p>
            <ul>
              <li>Monitor and review User Content</li>
              <li>Remove or modify content that violates these Terms</li>
              <li>Use AI-powered moderation tools to flag inappropriate content</li>
              <li>Manually review flagged or reported content</li>
              <li>Make final determinations regarding content appropriateness</li>
            </ul>

            <h3>9.2 Account Actions</h3>
            <p>
              Violations may result in:
            </p>
            <ul>
              <li><strong>Verbal Warning:</strong> First-time or minor violations</li>
              <li><strong>Formal Warning:</strong> Logged warning with potential restrictions</li>
              <li><strong>Temporary Suspension:</strong> Account access temporarily revoked</li>
              <li><strong>Permanent Ban:</strong> Complete account termination for severe or repeated violations</li>
            </ul>
            <p>
              We may take any of these actions immediately and without prior notice for severe violations. Appeals can be submitted through the Contact Admin feature.
            </p>

            <h3>9.3 Name Privacy Protection</h3>
            <p>
              For your safety, administrators may censor your display name if it contains your real name. You will be notified and asked to choose a pseudonym. This is for your privacy protection, not a disciplinary action.
            </p>

            <h2>10. Expert Connections and Third-Party Information</h2>

            <h3>10.1 Expert Matching Service</h3>
            <p>
              <strong>CRITICAL WARNING:</strong> The Expert Matching feature uses AI to search publicly available web information for relevant experts. This is an automated search tool only.
            </p>
            <p>
              <strong>NO VERIFICATION PERFORMED:</strong> We:
            </p>
            <ul>
              <li>Do NOT verify credentials, qualifications, licenses, or affiliations</li>
              <li>Do NOT conduct background checks or safety screenings</li>
              <li>Do NOT endorse or guarantee any expert's advice or opinions</li>
              <li>Are NOT responsible for communications with experts</li>
              <li>Do NOT guarantee expert availability, response, or legitimacy</li>
              <li>Do NOT verify the expert is who they claim to be</li>
            </ul>
            <p>
              <strong>USER BEWARE:</strong> Exercise extreme caution when contacting any expert. Independently verify credentials through official channels (university websites, professional organizations, state licensing boards) before sharing personal information, location data, or meeting in person. Never meet experts alone or share precise location information of valuable discoveries without proper verification.
            </p>

            <h3>10.2 Expert Liability</h3>
            <p>
              Any interactions with experts are solely between you and the expert. FossilFinder is not a party to these interactions and assumes no liability for:
            </p>
            <ul>
              <li>Accuracy or quality of expert advice</li>
              <li>Professional conduct of experts</li>
              <li>Fees charged by experts</li>
              <li>Disputes arising from expert interactions</li>
            </ul>

            <h3>10.3 Third-Party Links</h3>
            <p>
              The Service may contain links to third-party websites, resources, or services. We do not control and are not responsible for third-party content, privacy practices, or terms of service.
            </p>

            <h2>11. Gamification, Points, and Rewards</h2>

            <h3>11.1 Virtual Items Only</h3>
            <p>
              Points, badges, and leaderboard rankings are virtual items with NO monetary value. They:
            </p>
            <ul>
              <li>Cannot be exchanged for money or goods</li>
              <li>Cannot be transferred between accounts</li>
              <li>May be adjusted or recalculated at our discretion</li>
              <li>Are forfeit upon account termination</li>
            </ul>

            <h3>11.2 Fair Play</h3>
            <p>
              Manipulation of the gamification system through automated tools, multiple accounts, or fraudulent discoveries is strictly prohibited and will result in account termination.
            </p>

            <h2>12. Data Usage and Privacy</h2>
            <p>
              Your use of the Service is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to our collection, use, and sharing of your information as described in the Privacy Policy.
            </p>
            <p>
              Key privacy points:
            </p>
            <ul>
              <li>Public discoveries are visible to all users and may be used to train AI models</li>
              <li>Location data may be displayed on public maps</li>
              <li>We do not sell your personal information</li>
              <li>You have rights to access, correct, and delete your data</li>
            </ul>

            <h2>13. Intellectual Property Rights</h2>

            <h3>13.1 Our Intellectual Property</h3>
            <p>
              The Service, including its code, design, features, functionality, text, graphics, logos, and software, is owned by FossilFinder and protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              "FossilFinder" and associated logos are trademarks of Connor Seay. You may not use these marks without prior written permission.
            </p>

            <h3>13.2 Limited License to Use</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial purposes in accordance with these Terms. This license does not include any right to:
            </p>
            <ul>
              <li>Resell or commercial use of the Service</li>
              <li>Collection or use of product listings or descriptions</li>
              <li>Derivative use of the Service or its contents</li>
              <li>Downloading or copying account information for the benefit of another party</li>
              <li>Use of data mining, robots, or similar data gathering tools</li>
            </ul>

            <h2>13. Disclaimers and Limitations of Liability</h2>

            <h3>13.1 "AS IS" and "AS AVAILABLE"</h3>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
              <li>Warranties regarding accuracy, reliability, or completeness of content</li>
              <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding results obtained from use of the Service</li>
            </ul>

            <h3>13.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FOSSILFINDER AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from unauthorized access to your account</li>
              <li>Damages resulting from reliance on AI analysis results</li>
              <li>Damages from user content or conduct of other users</li>
              <li>Damages from legal violations arising from fossil collection</li>
              <li>Damages from service interruptions or technical issues</li>
            </ul>
            <p>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST SIX MONTHS, OR $100, WHICHEVER IS GREATER.
            </p>

            <h3>13.3 Jurisdictional Limitations</h3>
            <p>
              Some jurisdictions do not allow limitations on implied warranties or limitation of liability for incidental or consequential damages. In such jurisdictions, our liability is limited to the greatest extent permitted by law.
            </p>

            <h2>14. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless FossilFinder, its officers, directors, employees, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your use or misuse of the Service</li>
              <li>Your User Content</li>
              <li>Your violation of any rights of another party</li>
              <li>Your fossil or artifact collection activities</li>
              <li>Your violation of any laws or regulations</li>
            </ul>

            <h2>15. Dispute Resolution and Arbitration</h2>

            <h3>15.1 Informal Resolution</h3>
            <p>
              Before filing any formal dispute, you agree to attempt to resolve the dispute informally by contacting us through the Contact Admin feature. We will attempt to resolve the dispute informally within 30 days.
            </p>

            <h3>15.2 Binding Arbitration</h3>
            <p>
              If informal resolution fails, you agree that any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration under the rules of the American Arbitration Association, rather than in court, except that:
            </p>
            <ul>
              <li>You may assert claims in small claims court if they qualify</li>
              <li>You or we may seek equitable relief in court for intellectual property infringement</li>
            </ul>

            <h3>15.3 Class Action Waiver</h3>
            <p>
              YOU AND FOSSILFINDER AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
            </p>

            <h2>16. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States and the State of Delaware, without regard to its conflict of law principles. 
            </p>
            <p>
              <strong>EXCLUSIVE JURISDICTION:</strong> Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in New Castle County, Delaware. You consent to the personal jurisdiction of such courts and waive any objection to venue in such courts.
            </p>
            <p>
              <strong>EXCEPTION:</strong> Either party may seek injunctive relief in any court of competent jurisdiction to protect intellectual property rights.
            </p>

            <h2>17. Changes to Service and Terms</h2>

            <h3>17.1 Service Modifications</h3>
            <p>
              We reserve the right to:
            </p>
            <ul>
              <li>Modify, suspend, or discontinue the Service (or any part thereof) at any time</li>
              <li>Change or remove features</li>
              <li>Impose usage limits</li>
              <li>Change pricing models (if applicable in the future)</li>
            </ul>
            <p>
              We are not liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>

            <h3>17.2 Terms Modifications</h3>
            <p>
              We may revise these Terms from time to time. Material changes will be notified via:
            </p>
            <ul>
              <li>Email to your registered email address</li>
              <li>In-app notification upon next login</li>
              <li>Update to the "Last Updated" date at the top of these Terms</li>
            </ul>
            <p>
              Continued use of the Service after changes constitutes acceptance of the revised Terms. If you do not agree to the new Terms, you must stop using the Service and may request account deletion.
            </p>

            <h2>18. Account Termination</h2>

            <h3>18.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by contacting us through the Contact Admin feature. Upon termination:
            </p>
            <ul>
              <li>Your access to the Service will be revoked</li>
              <li>Your personal information will be deleted or anonymized</li>
              <li>Your discoveries may be deleted or anonymized based on your preference</li>
              <li>Public contributions (forum posts) may be retained in anonymized form</li>
            </ul>

            <h3>18.2 Termination by Us</h3>
            <p>
              We may suspend or terminate your account immediately, without notice, for:
            </p>
            <ul>
              <li>Violation of these Terms</li>
              <li>Suspected fraudulent, abusive, or illegal activity</li>
              <li>Upon your request</li>
              <li>Extended periods of inactivity</li>
              <li>Business or legal reasons</li>
            </ul>

            <h3>18.3 Effect of Termination</h3>
            <p>
              Upon termination:
            </p>
            <ul>
              <li>All licenses granted to you terminate</li>
              <li>We may delete your data per our retention policies</li>
              <li>Sections that by their nature should survive (liability limitations, indemnification, dispute resolution) remain in effect</li>
            </ul>

            <h2>19. Miscellaneous Provisions</h2>

            <h3>19.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and FossilFinder and supersede all prior agreements and understandings, whether written or oral.
            </p>

            <h3>19.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions.
            </p>

            <h3>19.3 Waiver</h3>
            <p>
              No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and our failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
            </p>

            <h3>19.4 Assignment</h3>
            <p>
              You may not assign or transfer these Terms or your account without our prior written consent. We may assign or transfer these Terms, in whole or in part, without restriction.
            </p>

            <h3>19.5 Force Majeure</h3>
            <p>
              We shall not be liable for any failure to perform our obligations where such failure results from causes beyond our reasonable control, including but not limited to natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
            </p>

            <h3>19.6 Headings</h3>
            <p>
              Section headings are for convenience only and shall not govern the meaning or interpretation of these Terms.
            </p>

            <h2>20. Contact Information</h2>
            <p>
              For questions, concerns, or notices regarding these Terms of Service, please contact us through:
            </p>
            <ul>
              <li><strong>In-App Contact:</strong> Use the "Contact Admin" feature in the sidebar menu</li>
              <li><strong>Legal Notices:</strong> Send to the email address provided in the Contact Admin form</li>
            </ul>
            <p>
              All legal notices must be in writing and will be deemed given when received.
            </p>

            <h2>21. Acknowledgment</h2>
            <p>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}