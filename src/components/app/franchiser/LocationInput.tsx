import React, { useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';

// List of common countries with their ISO codes
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  // Add more countries as needed
];

interface LocationInputProps {
  value: string[];
  onChange: (locations: string[]) => void;
  placeholder?: string;
  className?: string;
  countryCode?: string; // ISO 3166-1 Alpha-2 country code (e.g., 'US', 'GB', 'IN')
  onCountryChange?: (countryCode: string) => void; // Callback when country changes
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Search for a location',
  className = '',
  countryCode,
  onCountryChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the usePlacesAutocomplete hook
  const { scriptLoaded } = usePlacesAutocomplete({
    inputRef,
    onPlaceSelected: (place: string) => {
      if (!value.includes(place)) {
        onChange([...value, place]);
      }
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    countryCode
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current?.value.trim()) {
      e.preventDefault();
      const newLocation = inputRef.current.value.trim();
      if (!value.includes(newLocation)) {
        onChange([...value, newLocation]);
      }
      inputRef.current.value = '';
    }
  };

  const removeLocation = (locationToRemove: string) => {
    onChange(value.filter(loc => loc !== locationToRemove));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Select
          value={countryCode || undefined}
          onValueChange={(value) => onCountryChange?.(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={!scriptLoaded}
        />
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((location, index) => (
            <div
              key={`${location}-${index}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {location}
              <button
                type="button"
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-800 dark:bg-blue-700 dark:text-blue-200"
                onClick={() => removeLocation(location)}
                aria-label={`Remove ${location}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
