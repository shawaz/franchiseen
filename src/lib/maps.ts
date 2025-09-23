/**
 * Google Maps Utilities
 * 
 * This file contains utility functions for working with Google Maps API.
 */

type GoogleMapsCallback = () => void;

// Extend the Window interface to include our callback
declare global {
  interface Window {
    googleMapsCallback?: GoogleMapsCallback;
  }
}

/**
 * Loads the Google Maps API script dynamically
 * @param apiKey - Google Maps API key
 * @param callback - Callback function to execute when the script is loaded
 */
export const loadGoogleMapsApi = (apiKey: string, callback: GoogleMapsCallback): void => {
  // If already loaded, execute callback immediately
  if (window.google?.maps) {
    callback();
    return;
  }

  // Use the standard callback name for simplicity
  const callbackName = 'googleMapsCallback';
  
  // Store the callback in a scoped variable
  let callbackExecuted = false;
  
  // Set up the global callback
  window[callbackName] = () => {
    if (callbackExecuted) return;
    callbackExecuted = true;
    callback();
    
    // Clean up
    try {
      delete window[callbackName];
    } catch (e) {
      // In some environments, delete might not work
      window[callbackName] = undefined as unknown as undefined;
    }
  };

  // Create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,drawing,visualization&callback=${callbackName}`;
  script.async = true;
  script.defer = true;
  
  // Error handling
  script.onerror = (error) => {
    console.error('Error loading Google Maps API:', error);
    
    // Clean up in case of error
    try {
      delete window[callbackName];
    } catch (e) {
      window[callbackName] = undefined as unknown as undefined;
    }
    
    // Reject the promise if we were using one
    if (typeof callback === 'function') {
      try {
        callback();
      } catch (e) {
        console.error('Error in Google Maps callback:', e);
      }
    }
  };

  // Add script to document
  document.head.appendChild(script);
};

/**
 * Checks if Google Maps API is loaded
 */
export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         window.google !== undefined && 
         window.google.maps !== undefined && 
         window.google.maps.Map !== undefined;
};

/**
 * Geocodes an address to get latitude and longitude
 * @param address - The address to geocode
 * @returns Promise with geocoding results
 */
export const geocodeAddress = (address: string): Promise<google.maps.GeocoderResult[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(new Error(`Geocode was not successful: ${status}`));
      }
    });
  });
};

/**
 * Reverse geocodes coordinates to get an address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with reverse geocoding results
 */
export const reverseGeocode = (lat: number, lng: number): Promise<google.maps.GeocoderResult[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(new Error(`Reverse geocode was not successful: ${status}`));
      }
    });
  });
};
