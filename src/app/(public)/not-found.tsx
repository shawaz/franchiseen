import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-stone-900 dark:to-stone-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="text-8xl font-bold text-blue-600 dark:text-blue-400">404</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Franchiseen Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">FRANCHISEEN</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/company/services"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Browse Services
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white dark:bg-stone-800 rounded-lg p-6 shadow-lg border border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            If you&apos;re having trouble finding what you&apos;re looking for, try these helpful links:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Link
              href="/company/services/franchisee"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Franchisee Services
            </Link>
            <Link
              href="/company/services/franchiser"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Franchiser Services
            </Link>
            <Link
              href="/company/services/franchise"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Franchise Operations
            </Link>
            <Link
              href="/company/services/property"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Property Services
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <Link
              href="/company/help"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
