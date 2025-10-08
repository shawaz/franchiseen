import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to Franchiseen, operated by <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong> 
            (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our 
            franchise management platform and related services (collectively, the &quot;Service&quot;).
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
            with any part of these terms, then you may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Company Information</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Company Name:</strong> ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Registration:</strong> Dubai, United Arab Emirates</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Platform:</strong> Franchiseen</p>
            <p className="text-gray-700 dark:text-gray-300 mb-0"><strong>Service:</strong> Franchise Management Platform with Blockchain Technology</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By using our Service, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>You are at least 18 years old and have the legal capacity to enter into these Terms</li>
            <li>You have the authority to bind any entity you represent to these Terms</li>
            <li>Your use of the Service will not violate any applicable law or regulation</li>
            <li>All information you provide is accurate, current, and complete</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Description of Service</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Franchiseen is a comprehensive franchise management platform that provides:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Franchisee Services:</strong> Franchise discovery, investment opportunities, share trading, and daily payouts</li>
            <li><strong>Franchiser Services:</strong> Brand listing, multi-location funding, FOFO support, and automated payments</li>
            <li><strong>Franchise Operations:</strong> Professional management, staff assignment, and operational support</li>
            <li><strong>Property Services:</strong> Property-franchise matching and blockchain-powered rental solutions</li>
            <li><strong>Blockchain Technology:</strong> Secure transactions, smart contracts, and automated payment systems</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. User Accounts</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To access certain features of our Service, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Promptly notifying us of any unauthorized use of your account</li>
            <li>Ensuring your account information remains accurate and up-to-date</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Investment and Financial Services</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Important Investment Notice</p>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Franchise investments carry inherent risks. Past performance does not guarantee future results. 
              Please consult with financial advisors before making investment decisions.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform facilitates franchise investments but does not provide investment advice. You acknowledge that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>All investment decisions are your sole responsibility</li>
            <li>Franchise investments may result in loss of capital</li>
            <li>We are not liable for investment losses or decisions</li>
            <li>You should conduct your own due diligence before investing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Blockchain and Cryptocurrency</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our Service utilizes blockchain technology and may involve cryptocurrency transactions. You understand that:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Cryptocurrency values can be highly volatile</li>
            <li>Blockchain transactions are generally irreversible</li>
            <li>You are responsible for the security of your digital wallets</li>
            <li>We do not guarantee the performance or security of blockchain networks</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Prohibited Uses</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You may not use our Service for any unlawful purpose or in any way that could damage, disable, 
            or impair the Service. Prohibited activities include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Violating any applicable laws or regulations</li>
            <li>Transmitting malicious code or harmful content</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Interfering with other users&apos; use of the Service</li>
            <li>Using the Service for fraudulent or deceptive purposes</li>
            <li>Violating intellectual property rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Intellectual Property</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Service and its original content, features, and functionality are owned by ADVANCED FUTURE 
            INFORMATION TECHNOLOGY LLC and are protected by international copyright, trademark, patent, 
            trade secret, and other intellectual property laws.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You may not copy, modify, distribute, sell, or lease any part of our Service without our 
            express written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Privacy and Data Protection</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
            your information when you use our Service. By using our Service, you agree to the collection 
            and use of information in accordance with our Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To the fullest extent permitted by law, ADVANCED FUTURE INFORMATION TECHNOLOGY LLC shall not 
            be liable for any indirect, incidental, special, consequential, or punitive damages, including 
            without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Governing Law and Jurisdiction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These Terms shall be interpreted and governed by the laws of the United Arab Emirates. Any 
            disputes arising from these Terms shall be subject to the exclusive jurisdiction of the 
            courts of Dubai, UAE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Changes to Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, 
            we will provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Contact Information</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Dubai, United Arab Emirates</p>
            <p className="text-gray-700 dark:text-gray-300 mb-0">
              Email: <a href="mailto:legal@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">legal@franchiseen.com</a>
            </p>
          </div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            These Terms of Service constitute the entire agreement between you and ADVANCED FUTURE INFORMATION TECHNOLOGY LLC 
            regarding the use of the Franchiseen platform.
          </p>
        </div>
      </div>
    </div>
  );
}
