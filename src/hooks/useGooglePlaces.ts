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
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions);
            } else {
              setError('Failed to fetch places');
              setPredictions([]);
            }
            setLoading(false);
          }
        );
      } catch {
        setError('Error fetching places');
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [input, types, componentRestrictions]);

  return { predictions, loading, error };
}
