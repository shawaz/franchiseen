"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('WalletErrorBoundary: Checking error:', error.message);
    
    // Check if it's a WalletStandardError or wallet-related error
    if (error.message.includes('WalletStandardError') || 
        error.message.includes('No underlying Wallet Standard wallet') ||
        error.message.includes('Wallet connection error') ||
        error.message.includes('No valid wallet account connected') ||
        error.message.includes('Wallet signer unavailable')) {
      console.log('WalletErrorBoundary: Catching wallet error:', error.message);
      return { hasError: true, error };
    }
    
    // For other errors, don't catch them
    console.log('WalletErrorBoundary: Not catching non-wallet error:', error.message);
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WalletErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Wallet Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              There was an issue with your wallet connection. This usually happens when:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
              <li>Your wallet was disconnected or unregistered</li>
              <li>You switched to a different wallet</li>
              <li>The wallet extension was updated</li>
            </ul>
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default WalletErrorBoundary;
