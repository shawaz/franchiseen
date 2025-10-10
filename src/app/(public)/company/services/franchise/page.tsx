import React from 'react';
import Link from 'next/link';

export default function FranchisePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-stone-800 dark:to-stone-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Franchise Operations
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional franchise management with dedicated managers and cashiers. Complete operational support for your franchise outlets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/company/services/property" 
                className="border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-3 rounded-lg font-semibold transition-colors"
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
              Complete Franchise Operations Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our professional team handles all aspects of your franchise operations, from budget management to daily reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Manager Assignment */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Professional Manager Assignment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Expert managers are assigned to handle all operational aspects of your franchise location.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Budget planning and management</li>
                <li>• Expense tracking and control</li>
                <li>• Team management and scheduling</li>
                <li>• Inventory oversight and optimization</li>
                <li>• Tax compliance and reporting</li>
                <li>• Daily payout management</li>
              </ul>
            </div>

            {/* Cashier Assignment */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Dedicated Cashier Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Professional cashiers handle all point-of-sale operations and daily reconciliation processes.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• POS system management</li>
                <li>• Order processing and tracking</li>
                <li>• Stock management and monitoring</li>
                <li>• Daily reconciliation processes</li>
                <li>• Budget verification and reporting</li>
                <li>• Payout confirmation and execution</li>
              </ul>
            </div>

            {/* Staff Hiring Options */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Flexible Staff Hiring
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Choose between hiring staff through the franchisor or our company&apos;s professional recruitment service.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Franchisor-provided staff</li>
                <li>• Company-recruited professionals</li>
                <li>• Comprehensive background checks</li>
                <li>• Industry-specific training</li>
                <li>• Performance monitoring</li>
                <li>• Ongoing support and development</li>
              </ul>
            </div>

            {/* Budget Management */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Comprehensive Budget Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Professional budget planning, monitoring, and control to ensure optimal financial performance.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Monthly budget planning</li>
                <li>• Expense categorization and tracking</li>
                <li>• Cost optimization strategies</li>
                <li>• Financial reporting and analysis</li>
                <li>• Profit margin monitoring</li>
                <li>• Cash flow management</li>
              </ul>
            </div>

            {/* Inventory Management */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Advanced Inventory Control
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sophisticated inventory management system to optimize stock levels and reduce waste.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• Real-time stock tracking</li>
                <li>• Automated reorder points</li>
                <li>• Supplier relationship management</li>
                <li>• Waste reduction strategies</li>
                <li>• Quality control processes</li>
                <li>• Inventory valuation and reporting</li>
              </ul>
            </div>

            {/* Daily Reconciliation */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Daily Reconciliation Process
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Automated daily reconciliation to ensure accurate financial records and timely payouts.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>• End-of-day financial reconciliation</li>
                <li>• Budget vs. actual comparison</li>
                <li>• Automated payout calculations</li>
                <li>• Transaction verification</li>
                <li>• Exception reporting and alerts</li>
                <li>• Audit trail maintenance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Process Flow Section */}
      <div className="bg-stone-50 dark:bg-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Our Franchise Operations Work
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our streamlined process ensures smooth operations and maximum profitability for your franchise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Staff Assignment</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Professional managers and cashiers are assigned to your franchise location.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Operations Setup</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Complete setup of POS systems, inventory tracking, and operational procedures.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Daily Operations</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Ongoing management of sales, inventory, staff, and customer service.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reconciliation & Payouts</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Daily financial reconciliation and automated payout distribution.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Franchise Operations?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional management ensures optimal performance and profitability for your franchise investment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Experienced managers handle all operational aspects with proven expertise.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Efficient Operations</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Streamlined processes ensure maximum efficiency and customer satisfaction.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transparent Financials</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Clear financial reporting and automated payout systems for complete transparency.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-stone-50 dark:bg-stone-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready for Professional Franchise Operations?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Let our expert team handle all operational aspects while you focus on growing your investment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Operations Today
            </Link>
            <Link 
              href="/company/help" 
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Operations Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
