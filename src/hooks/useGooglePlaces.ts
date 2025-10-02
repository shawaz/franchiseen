import { useState, useEffect } from 'react';

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface UseGooglePlacesProps {
  input: string;
  types?: string;
  componentRestrictions?: {
    country?: string;
  };
}

export function useGooglePlaces({ input, types = 'country', componentRestrictions }: UseGooglePlacesProps) {
  const [predictions, setPredictions] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input || input.length < 2) {
      setPredictions([]);
      return;
    }

    // Check if Google Maps is available
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.places) {
      setError('Google Maps API not loaded');
      setLoading(false);
      return;
    }

    const searchPlaces = async () => {
      setLoading(true);
      setError(null);

      try {
        const service = new google.maps.places.AutocompleteService();
        
        service.getPlacePredictions(
          {
            input,
            types: [types],
            ...(componentRestrictions && componentRestrictions.country && { 
              componentRestrictions: { 
                country: componentRestrictions.country 
              } 
            }),
          },
          (predictions, status) => {
            console.log('Google Places API response:', { status, predictions: predictions?.length || 0 });
            
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions);
              setError(null);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              // ZERO_RESULTS is a normal response, not an error
              setPredictions([]);
              setError(null);
              console.log('No places found for the search query:', input);
            } else if (status === google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
              console.warn('Google Places API invalid request:', input);
              setError('Invalid search request');
              setPredictions([]);
            } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              console.error('Google Places API query limit exceeded');
              setError('Search limit exceeded. Please try again later.');
              setPredictions([]);
            } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
              console.error('Google Places API request denied');
              setError('Search request denied. Please check API configuration.');
              setPredictions([]);
            } else {
              // Handle other errors, but never set ZERO_RESULTS as an error
              if (status !== 'ZERO_RESULTS') {
                console.error('Google Places API error:', status);
                setError(`API Error: ${status}`);
              } else {
                console.log('ZERO_RESULTS detected, not setting as error');
                setError(null);
              }
              setPredictions([]);
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Google Places API exception:', err);
        setError(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [input, types, componentRestrictions]);

  return { predictions, loading, error };
}
