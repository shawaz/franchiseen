"use client";

import { LoadScript, LoadScriptProps } from '@react-google-maps/api';
import { ReactNode, useEffect, useState } from 'react';
import { useGoogleMapsPreload } from '@/hooks/useGoogleMapsPreload';

interface GoogleMapsLoaderProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
}

const libraries: LoadScriptProps['libraries'] = ['places']; // Removed geometry to reduce load time

// Global flag to prevent multiple loads
let isGoogleMapsLoading = false;

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
  const [error, setError] = useState<Error | null>(null);
  const { isLoaded: isPreloaded, isLoading: isPreloading } = useGoogleMapsPreload();
  const [isLoaded, setIsLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setIsMounted(true);
    
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
    }
  }, []);

  // Update loaded state when preload completes
  useEffect(() => {
    if (isPreloaded) {
      setIsLoaded(true);
    }
  }, [isPreloaded]);

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

  // Show loading state until mounted
  if (!isMounted) {
    return <>{loadingFallback}</>;
  }

  // If already loaded (either preloaded or loaded), render children directly
  if (isLoaded || isPreloaded) {
    console.log('GoogleMapsLoader: Google Maps already loaded, rendering children');
    return <>{children}</>;
  }

  // Show error if any
  if (error) {
    console.error('GoogleMapsLoader: Error occurred:', error);
    return <>{errorFallback(error)}</>;
  }

  // Show loading if preloading
  if (isPreloading) {
    console.log('GoogleMapsLoader: Preloading Google Maps, showing loading fallback');
    return <>{loadingFallback}</>;
  }

  // Check if already loading to prevent multiple loads
  if (isGoogleMapsLoading) {
    console.log('GoogleMapsLoader: Already loading, showing loading fallback');
    return <>{loadingFallback}</>;
  }

  console.log('GoogleMapsLoader: Rendering LoadScript with API key:', apiKey ? 'present' : 'missing');
  
  // Set loading flag
  isGoogleMapsLoading = true;
  
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={loadingFallback}
      preventGoogleFontsLoading={true} // Prevent loading Google Fonts
      onLoad={() => {
        console.log('Google Maps script loaded successfully');
        console.log('Google Maps loaded, window.google:', !!window.google);
        console.log('Google Maps loaded, window.google.maps:', !!window.google?.maps);
        console.log('Google Maps loaded, window.google.maps.places:', !!window.google?.maps?.places);
        isGoogleMapsLoading = false;
        setIsLoaded(true);
      }}
      onError={(err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error loading Google Maps:', error);
        console.error('Error details:', err);
        isGoogleMapsLoading = false;
        setError(error);
      }}
    >
      {children}
    </LoadScript>
  );
}
