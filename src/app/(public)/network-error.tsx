'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NetworkError() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial online status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Force a page reload to retry connection
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-stone-900 dark:to-stone-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Network Error Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto text-red-600 dark:text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {isOnline ? 'Connection Error' : 'No Internet'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {isOnline ? 'Service Unavailable' : 'No Internet Connection'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {isOnline 
              ? "We're having trouble connecting to our servers. The Denet cluster might be temporarily unavailable. Please try again in a few moments."
              : "It looks like you're not connected to the internet. Please check your connection and try again."
            }
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

        {/* Connection Status */}
        <div className="mb-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isOnline 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            {isOnline ? 'Server Connection Issue' : 'No Internet Connection'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {retryCount > 0 ? `Retry (${retryCount})` : 'Try Again'}
          </button>
          <Link
            href="/"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white dark:bg-stone-800 rounded-lg p-6 shadow-lg border border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Troubleshooting Tips
          </h3>
          <div className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {!isOnline ? (
              <>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Check your internet connection and try refreshing the page</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Try connecting to a different network or using mobile data</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Restart your router or modem if the problem persists</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Our servers might be temporarily down for maintenance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>The Denet cluster might be experiencing high traffic</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Try again in a few minutes or contact support if the issue persists</span>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <Link
                href="/company/help"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Contact Support →
              </Link>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Error occurred at: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-retry indicator */}
        {retryCount > 0 && (
          <div className="mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">Attempting to reconnect...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
