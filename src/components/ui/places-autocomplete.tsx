"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: {
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }) => void;
  placeholder?: string;
  types?: string;
  componentRestrictions?: {
    country?: string;
  };
  className?: string;
}

function PlacesAutocompleteInner({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a place...",
  types = "country",
  componentRestrictions,
  className = "",
}: PlacesAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { predictions, loading, error } = useGooglePlaces({
    input: value,
    types,
    componentRestrictions,
  });

  // Debug logging for production issues
  useEffect(() => {
    if (error && !error.includes('ZERO_RESULTS')) {
      console.error('PlacesAutocomplete error:', error);
    }
    if (value.length > 2 && predictions.length === 0 && !loading) {
      console.warn('No predictions found for:', value);
    }
  }, [error, predictions.length, loading, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handlePlaceSelect = (prediction: {
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }) => {
    onChange(prediction.description);
    onPlaceSelect(prediction);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handlePlaceSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click events to fire
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleFocus = () => {
    if (predictions.length > 0) {
      setIsOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (predictions.length > 0 || loading) && (
        <div
          ref={listRef}
          className="absolute z-[9999] w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-stone-500">
              Loading...
            </div>
          )}
          
          {error && (
            <div className="px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}
          
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 ${
                index === selectedIndex ? 'bg-stone-100 dark:bg-stone-700' : ''
              }`}
              onClick={() => handlePlaceSelect(prediction)}
            >
              <div className="font-medium">
                {prediction.structured_formatting.main_text}
              </div>
              <div className="text-stone-500 text-xs">
                {prediction.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlacesAutocomplete(props: PlacesAutocompleteProps) {
  return (
    <GoogleMapsLoader>
      <PlacesAutocompleteInner {...props} />
    </GoogleMapsLoader>
  );
}
