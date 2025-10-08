'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const isNetworkError = () => {
    const networkErrorMessages = [
      'Network request failed',
      'Failed to fetch',
      'Connection refused',
      'Network error',
      'Connection timeout',
      'ERR_NETWORK',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED',
      'ConvexError',
      'CONVEX_ERROR',
      'denet',
      'cluster',
      'service unavailable',
      'server error',
      'gateway timeout',
      'bad gateway',
    ];

    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();
    
    return networkErrorMessages.some(keyword => 
      errorMessage.includes(keyword) || errorName.includes(keyword)
    );
  };

  const isNetwork = isNetworkError();

  React.useEffect(() => {
    if (isNetwork) {
      window.location.href = '/network-error';
    }
  }, [isNetwork]);

  if (isNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Detected network error, redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-stone-900 dark:to-stone-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <svg className="w-24 h-24 mx-auto text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            An unexpected error occurred. Please try again or contact support if the problem persists.
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
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
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
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            If this error keeps happening, please contact our support team with the error details below.
          </p>
          
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <Link
              href="/company/help"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact Support →
            </Link>
          </div>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white mb-2">
                Error Details (Development Only)
              </summary>
              <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                <div><strong>Message:</strong> {error.message}</div>
                <div><strong>Name:</strong> {error.name}</div>
                {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Error occurred timestamp */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Error occurred at: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
