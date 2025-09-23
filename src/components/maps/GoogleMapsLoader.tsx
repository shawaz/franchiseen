"use client";

import { LoadScript, LoadScriptProps } from '@react-google-maps/api';
import { ReactNode, useEffect, useState, useRef } from 'react';

interface GoogleMapsLoaderProps {
  children: ReactNode;
}

const libraries: LoadScriptProps['libraries'] = ['places'];

// Check if Google Maps API is already loaded
const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && window.google && window.google.maps;
};

export default function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const loadingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
    }
    return () => {
      loadingRef.current = false;
    };
  }, []);

  if (!isMounted || !apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // If already loaded, just render children
  if (isGoogleMapsLoaded() || isLoaded) {
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={() => {
        loadingRef.current = false;
        setIsLoaded(true);
      }}
      onError={(error) => {
        console.error('Error loading Google Maps:', error);
        loadingRef.current = false;
      }}
      loadingElement={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      }
    >
      {children}
    </LoadScript>
  );
}
