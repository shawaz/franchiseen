"use client";

import { LoadScript, LoadScriptProps } from '@react-google-maps/api';
import { ReactNode, useEffect, useState, useRef } from 'react';

interface GoogleMapsLoaderProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
}

const libraries: LoadScriptProps['libraries'] = ['places', 'geometry', 'drawing', 'visualization'];

// Check if Google Maps API is already loaded
const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map;
};

export default function GoogleMapsLoader({ 
  children, 
  loadingFallback = (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  ),
  errorFallback = (error) => (
    <div className="text-red-500 p-4">
      Error loading Google Maps: {error.message}
    </div>
  )
}: GoogleMapsLoaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const loadingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    // Cleanup function
    return () => {
      loadingRef.current = false;
    };
  }, []);

  // Handle window load event as a fallback
  useEffect(() => {
    const handleLoad = () => {
      if (isGoogleMapsLoaded()) {
        setIsLoaded(true);
      }
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  // Show error if API key is missing
  if (!apiKey) {
    console.error('Google Maps API key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Google Maps API key is not configured. Please contact support or use manual input.
        </p>
      </div>
    );
  }

  // Show loading state
  if (!isMounted) {
    return <>{loadingFallback}</>;
  }

  // If already loaded, just render children
  if (isGoogleMapsLoaded() || isLoaded) {
    return <>{children}</>;
  }

  // Show error if any
  if (error) {
    return <>{errorFallback(error)}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={loadingFallback}
      onLoad={() => {
        console.log('Google Maps script loaded successfully');
        loadingRef.current = false;
        setIsLoaded(true);
      }}
      onError={(err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error loading Google Maps:', error);
        loadingRef.current = false;
        setError(error);
      }}
    >
      {children}
    </LoadScript>
  );
}
