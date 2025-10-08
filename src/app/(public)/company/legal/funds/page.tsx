import React from 'react';

export default function InvestmentPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Investment Policy</h1>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Investment Platform Overview</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong> operates Franchiseen as a revolutionary 
            investment platform that democratizes franchise investing through cutting-edge blockchain technology, 
            AI-powered analytics, and comprehensive risk management systems.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform represents the future of franchise investing, offering unprecedented transparency, 
            liquidity, and accessibility while maintaining the highest standards of investor protection and 
            regulatory compliance.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Investment Philosophy</h4>
            <p className="text-green-800 dark:text-green-200 text-sm mb-0">
              We believe in making franchise investments accessible to everyone while ensuring maximum 
              transparency, security, and profitability through innovative technology and expert management.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Investment Opportunities</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Franchise Investment Types</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform offers diverse franchise investment opportunities designed to meet various investor profiles and risk tolerances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Direct Franchise Ownership:</strong> Complete franchise unit ownership with full operational control (Min: $500K)</li>
            <li><strong>Fractional Share Investments:</strong> Tokenized franchise shares starting from $100 for micro-investors</li>
            <li><strong>Multi-Unit Portfolio:</strong> Diversified investment across 3-10 franchise locations (Min: $1M)</li>
            <li><strong>Property-Franchise Bundles:</strong> Real estate + franchise combinations with guaranteed rental income</li>
            <li><strong>FOFO Model:</strong> Franchise-Owned, Franchise-Operated with professional management teams</li>
            <li><strong>Growth Stage Investments:</strong> Early-stage franchise concepts with high growth potential</li>
            <li><strong>Established Brand Investments:</strong> Proven franchise systems with stable returns</li>
            <li><strong>International Franchises:</strong> Global franchise expansion opportunities</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Investment Vehicles</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Investment opportunities are available through multiple innovative vehicles:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Traditional Fiat:</strong> USD, EUR, AED, and other major currencies with instant processing</li>
            <li><strong>Cryptocurrency:</strong> Bitcoin, Ethereum, USDC, and other major cryptocurrencies</li>
            <li><strong>Security Tokens:</strong> Regulated digital securities representing franchise ownership</li>
            <li><strong>Utility Tokens:</strong> Platform-specific tokens for reduced fees and enhanced benefits</li>
            <li><strong>Smart Contracts:</strong> Automated investment, management, and payout systems</li>
            <li><strong>Hybrid Portfolios:</strong> Mixed traditional and digital asset investment strategies</li>
            <li><strong>Leveraged Investments:</strong> Margin trading and leveraged positions for qualified investors</li>
            <li><strong>Staking Programs:</strong> Token staking for passive income and governance rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. AI-Powered Investment Management</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Intelligent Investment Analytics</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform employs advanced artificial intelligence to optimize investment decisions and maximize returns:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Predictive Modeling:</strong> Machine learning algorithms for franchise performance forecasting</li>
            <li><strong>Risk Assessment:</strong> AI-powered risk analysis and portfolio optimization</li>
            <li><strong>Market Analysis:</strong> Real-time market trend analysis and opportunity identification</li>
            <li><strong>Performance Optimization:</strong> Automated rebalancing and strategy adjustments</li>
            <li><strong>Sentiment Analysis:</strong> Social media and news sentiment tracking for investment insights</li>
            <li><strong>Dynamic Pricing:</strong> Real-time franchise valuation and pricing optimization</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Automated Investment Strategies</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            AI-driven investment strategies tailored to investor preferences:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Conservative Strategy:</strong> Low-risk, stable return investments with established brands</li>
            <li><strong>Balanced Strategy:</strong> Mix of stable and growth investments for moderate risk tolerance</li>
            <li><strong>Growth Strategy:</strong> High-growth potential investments with emerging franchise concepts</li>
            <li><strong>Income Strategy:</strong> Focus on high-dividend franchise investments for regular income</li>
            <li><strong>Global Strategy:</strong> Diversified international franchise portfolio</li>
            <li><strong>Custom Strategy:</strong> Personalized investment approach based on individual goals</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Risk Assessment and Management</h2>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Important Risk Warning</p>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              All investments carry inherent risks. Past performance does not guarantee future results. 
              You may lose some or all of your invested capital. Please carefully consider your investment 
              objectives and risk tolerance before investing.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Investment Risks</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Franchise investments carry specific risks that investors should understand:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Business Risk:</strong> Franchise performance may not meet expectations</li>
            <li><strong>Market Risk:</strong> Economic conditions affecting franchise profitability</li>
            <li><strong>Location Risk:</strong> Geographic factors impacting business success</li>
            <li><strong>Competition Risk:</strong> Market competition and saturation</li>
            <li><strong>Regulatory Risk:</strong> Changes in laws and regulations</li>
            <li><strong>Technology Risk:</strong> Platform and blockchain technology risks</li>
            <li><strong>Liquidity Risk:</strong> Difficulty in selling investments quickly</li>
            <li><strong>Currency Risk:</strong> Foreign exchange fluctuations for international investments</li>
            <li><strong>Operational Risk:</strong> Management and operational challenges</li>
            <li><strong>Brand Risk:</strong> Brand reputation and market perception risks</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Risk Mitigation Strategies</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement comprehensive strategies to manage investment risks:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>AI-Powered Due Diligence:</strong> Machine learning analysis of franchise performance and market conditions</li>
            <li><strong>Portfolio Diversification:</strong> Automated diversification across multiple investments and sectors</li>
            <li><strong>Professional Management:</strong> Certified experts in operational and financial management</li>
            <li><strong>Insurance Coverage:</strong> Comprehensive insurance for business operations and investor protection</li>
            <li><strong>Real-time Monitoring:</strong> 24/7 performance monitoring with AI-powered alerts</li>
            <li><strong>Exit Strategies:</strong> Multiple exit options including secondary markets and buyback programs</li>
            <li><strong>Hedging Strategies:</strong> Currency and market hedging for international investments</li>
            <li><strong>Stress Testing:</strong> Regular stress testing and scenario analysis</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Investment Process</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Investor Qualification</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To invest through our platform, investors must meet certain qualifications:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Financial Capacity:</strong> Minimum investment thresholds and net worth requirements</li>
            <li><strong>Investment Experience:</strong> Relevant investment experience and knowledge</li>
            <li><strong>Risk Tolerance:</strong> Understanding of investment risks and ability to bear losses</li>
            <li><strong>Legal Compliance:</strong> Compliance with applicable securities laws and regulations</li>
            <li><strong>Identity Verification:</strong> KYC/AML compliance and identity verification</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Investment Execution</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The investment process includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Investment Selection:</strong> Review and selection of investment opportunities</li>
            <li><strong>Due Diligence:</strong> Comprehensive analysis of investment prospects</li>
            <li><strong>Investment Agreement:</strong> Legal documentation and terms</li>
            <li><strong>Funding:</strong> Investment capital deployment</li>
            <li><strong>Monitoring:</strong> Ongoing investment performance tracking</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Blockchain and Digital Assets</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Digital Asset Investments</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our platform utilizes blockchain technology for investment management:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Tokenized Investments:</strong> Franchise shares represented as digital tokens</li>
            <li><strong>Smart Contracts:</strong> Automated investment and payout mechanisms</li>
            <li><strong>Transparent Records:</strong> Immutable investment transaction history</li>
            <li><strong>Automated Payouts:</strong> Smart contract-based dividend distributions</li>
            <li><strong>Fractional Ownership:</strong> Investment in fractional franchise shares</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 Digital Asset Risks</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Digital asset investments carry additional risks:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Technology Risk:</strong> Blockchain technology and smart contract risks</li>
            <li><strong>Volatility Risk:</strong> Digital asset price volatility</li>
            <li><strong>Regulatory Risk:</strong> Changing regulations for digital assets</li>
            <li><strong>Security Risk:</strong> Digital wallet and key management risks</li>
            <li><strong>Liquidity Risk:</strong> Limited secondary market for digital assets</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Investment Performance and Reporting</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Performance Metrics</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Investment performance is tracked using various metrics:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Return on Investment (ROI):</strong> Overall investment return calculations</li>
            <li><strong>Cash Flow Analysis:</strong> Regular income and expense tracking</li>
            <li><strong>Profit Margins:</strong> Operating profit and margin analysis</li>
            <li><strong>Market Performance:</strong> Comparison with market benchmarks</li>
            <li><strong>Risk-Adjusted Returns:</strong> Returns adjusted for investment risk</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.2 Reporting Requirements</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Regular reporting includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Monthly Reports:</strong> Detailed performance and financial reports</li>
            <li><strong>Quarterly Reviews:</strong> Comprehensive investment analysis</li>
            <li><strong>Annual Statements:</strong> Complete annual performance summaries</li>
            <li><strong>Real-time Updates:</strong> Live performance tracking through digital dashboards</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Investor Protection and Safeguards</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.1 Investor Rights</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Investors have specific rights and protections:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Information Rights:</strong> Access to comprehensive investment information</li>
            <li><strong>Voting Rights:</strong> Participation in major investment decisions</li>
            <li><strong>Financial Transparency:</strong> Detailed financial reporting and audits</li>
            <li><strong>Exit Rights:</strong> Defined exit mechanisms and liquidity options</li>
            <li><strong>Dispute Resolution:</strong> Structured dispute resolution processes</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.2 Safeguards and Protections</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Multiple safeguards protect investor interests:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
            <li><strong>Segregated Accounts:</strong> Investor funds held in separate accounts</li>
            <li><strong>Professional Management:</strong> Experienced investment and operational management</li>
            <li><strong>Insurance Coverage:</strong> Comprehensive insurance for business operations</li>
            <li><strong>Regulatory Compliance:</strong> Adherence to applicable investment regulations</li>
            <li><strong>Independent Audits:</strong> Regular independent financial audits</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Fees and Charges</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Investment fees and charges include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Management Fees:</strong> Ongoing investment management charges</li>
            <li><strong>Performance Fees:</strong> Fees based on investment performance</li>
            <li><strong>Transaction Fees:</strong> Costs for investment transactions</li>
            <li><strong>Platform Fees:</strong> Technology platform usage charges</li>
            <li><strong>Legal and Administrative:</strong> Legal and administrative costs</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All fees are disclosed upfront and detailed in investment agreements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Regulatory Compliance</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our investment platform operates in compliance with applicable regulations:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li><strong>Securities Regulations:</strong> Compliance with applicable securities laws</li>
            <li><strong>Anti-Money Laundering:</strong> AML compliance and monitoring</li>
            <li><strong>Know Your Customer:</strong> KYC requirements and verification</li>
            <li><strong>Data Protection:</strong> Privacy and data protection compliance</li>
            <li><strong>Tax Compliance:</strong> Tax reporting and compliance obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact Information</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              For questions about our Investment Policy, please contact:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>ADVANCED FUTURE INFORMATION TECHNOLOGY LLC</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Dubai, United Arab Emirates</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Investment Department: <a href="mailto:investments@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">investments@franchiseen.com</a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Compliance Officer: <a href="mailto:compliance@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">compliance@franchiseen.com</a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-0">
              Risk Management: <a href="mailto:risk@franchiseen.com" className="text-blue-600 dark:text-blue-400 hover:underline">risk@franchiseen.com</a>
            </p>
          </div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            This Investment Policy is subject to the laws of the United Arab Emirates and is designed 
            to provide comprehensive guidance for franchise investments through our platform.
          </p>
        </div>
      </div>
    </div>
  );
}
