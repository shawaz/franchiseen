import React from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  const services = [
    {
      title: 'Franchisee Services',
      description: 'Discover, invest, and manage franchise opportunities with our comprehensive platform designed for franchisees.',
      href: '/company/services/franchisee',
      icon: '👥',
      features: ['View Franchise Opportunities', 'Buy & Trade Shares', 'Daily Payouts', 'Portfolio Management'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Franchiser Services',
      description: 'Scale your brand with our comprehensive franchise management platform. List your brand, get funded, and manage multiple outlets.',
      href: '/company/services/franchiser',
      icon: '🏢',
      features: ['Brand Listing', 'Multi-Location Funding', 'FOFO Support', 'Automated Payments'],
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Franchise Operations',
      description: 'Professional franchise management with dedicated managers and cashiers. Complete operational support for your franchise outlets.',
      href: '/company/services/franchise',
      icon: '⚙️',
      features: ['Professional Staff', 'Budget Management', 'Inventory Control', 'Daily Reconciliation'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Property Services',
      description: 'Transform your commercial properties into profitable franchise opportunities with blockchain-powered rental solutions.',
      href: '/company/services/property',
      icon: '🏗️',
      features: ['Property-Franchise Matching', 'Flexible Rentals', 'Blockchain Payments', 'Property Management'],
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-stone-800 dark:to-stone-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Comprehensive franchise solutions for every stakeholder in the ecosystem. From franchisees to property developers, we provide the tools and support you need to succeed.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`bg-gradient-to-r ${service.color} p-6`}>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{service.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {service.title}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {service.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    href={service.href}
                    className={`inline-flex items-center justify-center w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-opacity duration-200`}
                  >
                    Learn More
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-stone-50 dark:bg-stone-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose the service that best fits your needs and start your franchise journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
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
