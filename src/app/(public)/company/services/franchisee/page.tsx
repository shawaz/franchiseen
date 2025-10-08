import React from 'react';
import Link from 'next/link';

export default function FranchiseePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-stone-800 dark:to-stone-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Franchisee Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover, invest, and manage franchise opportunities with our comprehensive platform designed for franchisees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/company/services/franchiser" 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed as a Franchisee
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform provides all the tools and resources you need to find, invest in, and manage your franchise investments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* View Franchises */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                View Franchise Opportunities
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Browse through our extensive catalog of franchise opportunities from verified brands across various industries.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Detailed franchise information and requirements</li>
                <li>• Financial projections and ROI estimates</li>
                <li>• Location-based search and filtering</li>
                <li>• Brand reputation and success metrics</li>
              </ul>
            </div>

            {/* Start New Franchise */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Start New Franchise
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Launch your franchise journey with our streamlined application process and comprehensive support system.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Simplified application process</li>
                <li>• Automated document verification</li>
                <li>• Franchise agreement management</li>
                <li>• Onboarding and training support</li>
              </ul>
            </div>

            {/* Buy Franchise Shares */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Buy Franchise Shares
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Invest in franchise opportunities through our secure blockchain-based share trading platform.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Fractional ownership opportunities</li>
                <li>• Secure blockchain transactions</li>
                <li>• Real-time share pricing</li>
                <li>• Automated dividend distribution</li>
              </ul>
            </div>

            {/* Trade Franchise Shares */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Trade Franchise Shares
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Buy and sell franchise shares on our secure marketplace with real-time pricing and instant settlements.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• 24/7 trading marketplace</li>
                <li>• Instant settlement via blockchain</li>
                <li>• Price alerts and notifications</li>
                <li>• Portfolio tracking and analytics</li>
              </ul>
            </div>

            {/* Daily Payouts */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Get Daily Payouts
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Receive your franchise earnings automatically through our blockchain-powered payout system.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Automated daily revenue distribution</li>
                <li>• Transparent payout calculations</li>
                <li>• Multiple payment methods</li>
                <li>• Real-time earnings tracking</li>
              </ul>
            </div>

            {/* Portfolio Management */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Portfolio Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track and manage all your franchise investments with comprehensive analytics and reporting tools.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Real-time portfolio valuation</li>
                <li>• Performance analytics and reports</li>
                <li>• Risk assessment tools</li>
                <li>• Investment recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-stone-50 dark:bg-stone-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your Franchise Journey?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of successful franchisees who trust Franchiseen for their investment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started Today
            </Link>
            <Link 
              href="/company/help" 
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      </div>
  );
}
