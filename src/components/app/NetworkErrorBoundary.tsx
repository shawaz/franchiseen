'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
}

class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if the error is network-related
    const isNetworkError = this.isNetworkError(error);
    
    return {
      hasError: true,
      error,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log network errors specifically
    if (this.isNetworkError(error)) {
      console.error('Network error detected:', error.message);
    }
  }

  private static isNetworkError(error: Error): boolean {
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
  }

  private isNetworkError(error: Error): boolean {
    return NetworkErrorBoundary.isNetworkError(error);
  }

  render() {
    if (this.state.hasError) {
      // If we have a custom fallback, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If it's a network error, redirect to network error page
      if (this.state.isNetworkError) {
        // Use setTimeout to avoid hydration issues
        setTimeout(() => {
          window.location.href = '/network-error';
        }, 0);
        
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Redirecting to error page...</p>
            </div>
          </div>
        );
      }

      // For other errors, show a generic error message
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-stone-900 dark:to-stone-800">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-white dark:bg-stone-800 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
