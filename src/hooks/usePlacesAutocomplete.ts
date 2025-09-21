import { useEffect, useRef, useState } from 'react';

interface UsePlacesAutocompleteProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPlaceSelected: (place: string) => void;
  countryCode?: string; // ISO 3166-1 Alpha-2 country code (e.g., 'US', 'GB', 'IN')
}

export const usePlacesAutocomplete = ({
  inputRef, 
  onPlaceSelected,
  countryCode
}: UsePlacesAutocompleteProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  // Initialize Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error('Error loading Google Maps API');
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      if (listenerRef.current) {
        listenerRef.current.remove();
      }
    };
  }, []);

  // Initialize Autocomplete
  useEffect(() => {
    if (scriptLoaded && inputRef.current) {
      // Clear previous autocomplete instance if it exists
      if (autocompleteRef.current) {
        if (listenerRef.current) {
          window.google.maps.event.removeListener(listenerRef.current);
        }
        autocompleteRef.current = null;
      }

      // Configure autocomplete options
      const options: google.maps.places.AutocompleteOptions = {
        types: ['(cities)'],
        fields: ['formatted_address', 'geometry', 'name'],
      };

      // Add country restriction if countryCode is provided
      if (countryCode) {
        options.componentRestrictions = { country: countryCode };
      } else {
        options.componentRestrictions = undefined;
      }

      // Create new autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      // Set up place changed listener
      listenerRef.current = window.google.maps.event.addListener(
        autocompleteRef.current,
        'place_changed',
        () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            onPlaceSelected(place.formatted_address);
          }
        }
      );
    }
  }, [scriptLoaded, onPlaceSelected, countryCode, inputRef]);

  return { scriptLoaded };
};
