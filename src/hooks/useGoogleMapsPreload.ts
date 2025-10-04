import { useEffect, useState } from 'react';

// Global state to track if Google Maps is preloaded
let isPreloaded = false;
let preloadPromise: Promise<void> | null = null;

export function useGoogleMapsPreload() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already preloaded, set loaded state immediately
    if (isPreloaded && window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // If already loading, wait for the existing promise
    if (preloadPromise) {
      setIsLoading(true);
      preloadPromise.then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      });
      return;
    }

    // Start preloading
    setIsLoading(true);
    preloadPromise = preloadGoogleMaps();
    
    preloadPromise.then(() => {
      isPreloaded = true;
      setIsLoaded(true);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to preload Google Maps:', error);
      setIsLoading(false);
    });
  }, []);

  return { isLoaded, isLoading };
}

async function preloadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up callback
    (window as Window & { initGoogleMaps?: () => void }).initGoogleMaps = () => {
      resolve();
    };

    // Handle errors
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };

    // Add to document
    document.head.appendChild(script);
  });
}
