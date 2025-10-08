import React from 'react';

export default function FranchisePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Franchise Policy</h1>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Franchise Platform Overview</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong> operates Franchiseen, a revolutionary 
            franchise management platform that transforms traditional franchising through innovative blockchain 
            technology, AI-powered analytics, and comprehensive operational support.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform serves as the complete ecosystem for franchise operations, connecting franchisors, 
            franchisees, property developers, and investors through a seamless, technology-driven experience 
            that ensures transparency, efficiency, and profitability for all stakeholders.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Platform Mission</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-0">
              To democratize franchise opportunities through technology, making franchise ownership accessible, 
              transparent, and profitable for everyone while maintaining the highest standards of operational excellence.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Franchise Standards and Requirements</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Franchisor Requirements</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To list a franchise on our platform, franchisors must meet rigorous standards ensuring quality, 
            sustainability, and mutual success:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Legal Compliance:</strong> Valid business registration, franchise disclosure documents, and regulatory compliance</li>
            <li><strong>Financial Stability:</strong> Minimum 3 years of profitable operations with audited financial statements</li>
            <li><strong>Operational Excellence:</strong> Proven track record with at least 5 successful franchise locations</li>
            <li><strong>Brand Protection:</strong> Registered trademarks, copyrights, and comprehensive IP protection</li>
            <li><strong>Support Systems:</strong> 24/7 support, comprehensive training programs, and marketing assistance</li>
            <li><strong>Quality Assurance:</strong> Established SOPs, quality control systems, and brand consistency protocols</li>
            <li><strong>Technology Integration:</strong> Willingness to adopt blockchain technology and digital payment systems</li>
            <li><strong>Growth Potential:</strong> Clear expansion strategy and market opportunity assessment</li>
            <li><strong>Ethical Standards:</strong> Commitment to fair franchising practices and franchisee success</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Franchisee Qualifications</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Prospective franchisees undergo comprehensive evaluation to ensure success and platform compatibility:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Financial Capacity:</strong> Minimum net worth of $250,000 with liquid assets of $100,000+</li>
            <li><strong>Business Acumen:</strong> 3+ years of business management or relevant industry experience</li>
            <li><strong>Commitment:</strong> Full-time dedication to franchise operations and brand compliance</li>
            <li><strong>Location Suitability:</strong> Prime location with demographic analysis and market potential</li>
            <li><strong>Legal Compliance:</strong> Clean background check and ability to meet all regulatory requirements</li>
            <li><strong>Technology Adoption:</strong> Willingness to use digital tools, blockchain payments, and platform systems</li>
            <li><strong>Cultural Fit:</strong> Alignment with brand values and commitment to customer service excellence</li>
            <li><strong>Growth Mindset:</strong> Desire to grow and expand within the franchise network</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Technology Integration and Innovation</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Blockchain Technology</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform leverages cutting-edge blockchain technology to revolutionize franchise operations:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Smart Contracts:</strong> Automated royalty collection, fee management, and payout distribution</li>
            <li><strong>Transparent Transactions:</strong> Immutable record of all financial transactions and operations</li>
            <li><strong>Fractional Ownership:</strong> Tokenized franchise shares enabling micro-investments</li>
            <li><strong>Automated Compliance:</strong> Smart contract enforcement of franchise agreements and standards</li>
            <li><strong>Real-time Analytics:</strong> Live performance tracking and predictive analytics</li>
            <li><strong>Secure Payments:</strong> Cryptocurrency and traditional payment integration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 AI-Powered Operations</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Artificial intelligence enhances every aspect of franchise management:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Predictive Analytics:</strong> Sales forecasting and demand prediction</li>
            <li><strong>Inventory Optimization:</strong> AI-driven stock management and reorder automation</li>
            <li><strong>Customer Insights:</strong> Behavioral analysis and personalized marketing</li>
            <li><strong>Performance Monitoring:</strong> Real-time KPI tracking and anomaly detection</li>
            <li><strong>Dynamic Pricing:</strong> Market-responsive pricing optimization</li>
            <li><strong>Risk Assessment:</strong> Automated risk evaluation and mitigation strategies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Franchise Operations Management</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Professional Management Services</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform provides comprehensive franchise operations management with certified professionals:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Certified Managers:</strong> Industry-certified professionals with 5+ years experience</li>
            <li><strong>Specialized Cashiers:</strong> Trained cashiers for advanced POS systems and reconciliation</li>
            <li><strong>Recruitment Services:</strong> Vetted staff hiring through franchisor or company networks</li>
            <li><strong>Inventory Systems:</strong> AI-powered stock control with automated reordering</li>
            <li><strong>Financial Oversight:</strong> Real-time budget tracking and automated financial reporting</li>
            <li><strong>Quality Assurance:</strong> Continuous monitoring and improvement of operations</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Daily Operations</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Standard operational procedures include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Opening Procedures:</strong> Standardized store opening and preparation</li>
            <li><strong>Customer Service:</strong> Consistent service delivery and quality standards</li>
            <li><strong>Sales Management:</strong> POS operations and transaction processing</li>
            <li><strong>Inventory Control:</strong> Stock management and reorder processes</li>
            <li><strong>Closing Procedures:</strong> End-of-day reconciliation and reporting</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Financial Management and Payments</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Blockchain-Powered Payments</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform utilizes blockchain technology for transparent and automated financial management:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Automated Royalties:</strong> Smart contracts for royalty and fee collection</li>
            <li><strong>Team Payments:</strong> Automated salary and commission distribution</li>
            <li><strong>Maintenance Fees:</strong> Scheduled maintenance and operational cost payments</li>
            <li><strong>Franchisee Payouts:</strong> Daily revenue distribution to franchisees</li>
            <li><strong>Transparent Records:</strong> Immutable transaction history on blockchain</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Financial Reporting</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Comprehensive financial reporting includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Daily Reports:</strong> Sales, expenses, and profit/loss statements</li>
            <li><strong>Monthly Summaries:</strong> Comprehensive financial performance analysis</li>
            <li><strong>Quarterly Reviews:</strong> Detailed operational and financial assessments</li>
            <li><strong>Annual Audits:</strong> Independent financial audits and compliance reviews</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Quality Assurance and Compliance</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Brand Standards</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All franchises must maintain consistent brand standards:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Visual Identity:</strong> Consistent logos, colors, and signage</li>
            <li><strong>Service Standards:</strong> Uniform customer service protocols</li>
            <li><strong>Product Quality:</strong> Standardized product specifications and quality</li>
            <li><strong>Store Layout:</strong> Consistent interior design and layout standards</li>
            <li><strong>Marketing Materials:</strong> Approved promotional materials and campaigns</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 Compliance Monitoring</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Regular compliance monitoring includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Regular Inspections:</strong> Scheduled and surprise operational inspections</li>
            <li><strong>Performance Metrics:</strong> KPI tracking and performance evaluation</li>
            <li><strong>Customer Feedback:</strong> Review monitoring and customer satisfaction surveys</li>
            <li><strong>Financial Audits:</strong> Regular financial compliance and accuracy reviews</li>
            <li><strong>Training Assessments:</strong> Staff competency and training compliance checks</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Training and Development</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Initial Training Programs</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Comprehensive training programs for new franchisees and staff:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Franchise Orientation:</strong> Business model, operations, and expectations</li>
            <li><strong>Operational Training:</strong> Day-to-day operations and procedures</li>
            <li><strong>Customer Service:</strong> Service standards and customer interaction protocols</li>
            <li><strong>Financial Management:</strong> Budgeting, reporting, and financial controls</li>
            <li><strong>Technology Training:</strong> POS systems, inventory management, and digital tools</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.2 Ongoing Development</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Continuous development and improvement programs:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Regular Updates:</strong> New procedures, products, and service enhancements</li>
            <li><strong>Skill Development:</strong> Advanced training and certification programs</li>
            <li><strong>Best Practices:</strong> Sharing successful strategies across the network</li>
            <li><strong>Technology Updates:</strong> Training on new systems and digital innovations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Property and Location Management</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.1 Location Selection</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Strategic location selection and management:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Market Analysis:</strong> Demographic and market potential assessment</li>
            <li><strong>Site Evaluation:</strong> Location suitability and accessibility analysis</li>
            <li><strong>Competition Review:</strong> Competitive landscape and positioning</li>
            <li><strong>Financial Viability:</strong> Cost-benefit analysis and ROI projections</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.2 Property Services</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Comprehensive property management services:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Lease Management:</strong> Negotiation and management of lease agreements</li>
            <li><strong>Maintenance Services:</strong> Property upkeep and facility management</li>
            <li><strong>Compliance Monitoring:</strong> Building codes and safety regulation compliance</li>
            <li><strong>Insurance Management:</strong> Property and liability insurance coordination</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Dispute Resolution</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            In the event of disputes, we follow a structured resolution process:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Initial Consultation:</strong> Direct discussion between parties</li>
            <li><strong>Mediation:</strong> Neutral third-party mediation services</li>
            <li><strong>Arbitration:</strong> Binding arbitration if mediation fails</li>
            <li><strong>Legal Action:</strong> Court proceedings as a last resort</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All disputes are subject to the laws of the United Arab Emirates and the jurisdiction 
            of Dubai courts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Information</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              For questions about our Franchise Policy, please contact:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Dubai, United Arab Emirates</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Franchise Department: <a href="mailto:franchise@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">franchise@franchiseen.com</a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-0">
              Operations Manager: <a href="mailto:operations@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">operations@franchiseen.com</a>
            </p>
          </div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            This Franchise Policy is subject to the laws of the United Arab Emirates and is designed 
            to ensure the highest standards of franchise operations across our platform.
          </p>
        </div>
      </div>
    </div>
  );
}
