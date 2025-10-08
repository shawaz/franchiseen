import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) 
            operates the Franchiseen platform and is committed to protecting your privacy. This Privacy 
            Policy explains how we collect, use, disclose, and safeguard your information when you use 
            our franchise management platform.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By using our Service, you consent to the data practices described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Personal Information</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Account Information:</strong> Name, email address, phone number, date of birth</li>
            <li><strong>Identity Verification:</strong> Government-issued ID, passport, or driver&apos;s license</li>
            <li><strong>Financial Information:</strong> Bank account details, payment methods, tax information</li>
            <li><strong>Business Information:</strong> Company details, business registration, franchise information</li>
            <li><strong>Investment Information:</strong> Investment preferences, risk tolerance, portfolio data</li>
            <li><strong>Communication:</strong> Messages, support tickets, feedback, and correspondence</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Technical Information</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We automatically collect certain technical information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, interactions with our Service</li>
            <li><strong>Location Data:</strong> General geographic location based on IP address</li>
            <li><strong>Cookies and Tracking:</strong> Information collected through cookies and similar technologies</li>
            <li><strong>Blockchain Data:</strong> Transaction hashes, wallet addresses, smart contract interactions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Service Provision:</strong> To provide, maintain, and improve our franchise management platform</li>
            <li><strong>Account Management:</strong> To create and manage user accounts and authenticate users</li>
            <li><strong>Investment Services:</strong> To facilitate franchise investments and manage investment portfolios</li>
            <li><strong>Financial Operations:</strong> To process payments, manage wallets, and handle transactions</li>
            <li><strong>Compliance:</strong> To comply with legal obligations, including KYC/AML requirements</li>
            <li><strong>Communication:</strong> To send notifications, updates, and respond to inquiries</li>
            <li><strong>Security:</strong> To protect against fraud, unauthorized access, and other security threats</li>
            <li><strong>Analytics:</strong> To analyze usage patterns and improve our Service</li>
            <li><strong>Marketing:</strong> To send promotional materials and relevant business opportunities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Information Sharing and Disclosure</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may share your information in the following circumstances:
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Service Providers</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We share information with trusted third-party service providers who assist us in operating our platform, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li>Cloud hosting and infrastructure providers</li>
            <li>Payment processors and financial institutions</li>
            <li>Identity verification and compliance services</li>
            <li>Blockchain network providers and node operators</li>
            <li>Customer support and communication platforms</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Legal Requirements</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may disclose your information when required by law or to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li>Comply with legal obligations and regulatory requirements</li>
            <li>Respond to lawful requests from government authorities</li>
            <li>Protect our rights, property, or safety, or that of our users</li>
            <li>Prevent fraud or other illegal activities</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.3 Business Transfers</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred 
            as part of the transaction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Blockchain and Cryptocurrency</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Blockchain Transparency Notice</p>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Blockchain transactions are public and permanent. Once recorded on the blockchain, 
              transaction data cannot be deleted or modified.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform utilizes blockchain technology, which has specific privacy implications:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Public Ledger:</strong> Blockchain transactions are publicly visible and immutable</li>
            <li><strong>Wallet Addresses:</strong> Your wallet addresses may be linked to your identity</li>
            <li><strong>Transaction History:</strong> All blockchain transactions are permanently recorded</li>
            <li><strong>Smart Contracts:</strong> Contract interactions are publicly auditable</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement appropriate technical and organizational measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Encryption:</strong> Data is encrypted in transit and at rest using industry-standard protocols</li>
            <li><strong>Access Controls:</strong> Strict access controls and authentication mechanisms</li>
            <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
            <li><strong>Secure Infrastructure:</strong> Cloud-based infrastructure with enterprise-grade security</li>
            <li><strong>Employee Training:</strong> Regular security training for all employees</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We retain your information for as long as necessary to provide our Service and comply with 
            legal obligations:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Account Information:</strong> Retained while your account is active and for 7 years after closure</li>
            <li><strong>Financial Records:</strong> Retained for 7 years as required by UAE law</li>
            <li><strong>Identity Verification:</strong> Retained for 5 years for compliance purposes</li>
            <li><strong>Blockchain Data:</strong> Permanently recorded on the blockchain and cannot be deleted</li>
            <li><strong>Communication:</strong> Retained for 3 years for customer support purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Your Rights and Choices</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
            <li><strong>Objection:</strong> Object to certain processing of your information</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To exercise these rights, please contact us at <a href="mailto:privacy@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@franchiseen.com</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. International Data Transfers</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place for international transfers, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Standard contractual clauses approved by relevant authorities</li>
            <li>Adequacy decisions for certain jurisdictions</li>
            <li>Certification schemes and codes of conduct</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Children&apos;s Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our Service is not intended for children under 18 years of age. We do not knowingly collect 
            personal information from children under 18. If we become aware that we have collected 
            personal information from a child under 18, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies and similar technologies to enhance your experience:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Marketing Cookies:</strong> Used for targeted advertising and marketing</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Posting the new Privacy Policy on this page</li>
            <li>Sending you an email notification</li>
            <li>Displaying a notice on our Service</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your continued use of our Service after any changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Contact Information</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Dubai, United Arab Emirates</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Email: <a href="mailto:privacy@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@franchiseen.com</a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-0">
              Data Protection Officer: <a href="mailto:dpo@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@franchiseen.com</a>
            </p>
          </div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            This Privacy Policy is governed by the laws of the United Arab Emirates and is designed 
            to comply with applicable data protection regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
