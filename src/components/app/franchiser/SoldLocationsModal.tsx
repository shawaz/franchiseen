"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, X, Search, LocateFixed } from 'lucide-react';
import { toast } from 'sonner';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';
import MapComponent from '@/components/app/franchise/MapComponent';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface SoldLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  country: string;
  franchiseFee: number;
  minArea: number;
  soldAt: number;
}

interface SoldLocationsModalProps {
  soldLocations: SoldLocation[];
  onAddSoldLocation: (location: Omit<SoldLocation, 'id' | 'soldAt'>) => void;
  onRemoveSoldLocation: (id: string) => void;
}

export function SoldLocationsModal({
  soldLocations,
  onAddSoldLocation,
  onRemoveSoldLocation
}: SoldLocationsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [clickedMarker, setClickedMarker] = useState<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    status: 'sold' | 'available';
    isManual: boolean;
  } | null>(null);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all franchises to show as sold locations
  const allFranchises = useQuery(api.franchiseManagement.getFranchises, { limit: 1000 });

  // Initialize Google Maps services
  useEffect(() => {
    const initializeGoogleMapsServices = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        console.log('Google Maps services initialized successfully');
      } else {
        console.log('Google Maps API not ready yet, retrying in 500ms...');
        setTimeout(initializeGoogleMapsServices, 500);
      }
    };

    initializeGoogleMapsServices();
  }, []);

  // Handle input change for search
  const handleInputChange = useCallback((value: string) => {
    setMapSearchQuery(value);
    
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((placeId: string, description: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        { placeId },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const location = {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
              address: description,
            };
            
            setMapCenter({ lat: location.lat, lng: location.lng });
            setSelectedLocation(location);
            setMapSearchQuery(description);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }
  }, []);

  // Handle location selection from map
  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setMapSearchQuery(location.address);
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCenter = { lat: latitude, lng: longitude };
        
        setMapCenter(newCenter);
        setGettingLocation(false);
        
        // Reverse geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: newCenter }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === 'OK' && results && results[0]) {
              handleLocationSelect({
                lat: latitude,
                lng: longitude,
                address: results[0].formatted_address
              });
            }
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your current location');
        setGettingLocation(false);
      }
    );
  };

  // Mark location as sold
  const markLocationAsSold = () => {
    if (!selectedLocation) {
      toast.error('Please select a location first');
      return;
    }

    const newSoldLocation = {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: selectedLocation.address,
      country: 'United Arab Emirates', // Default for now
      franchiseFee: 25000,
      minArea: 500,
    };

    onAddSoldLocation(newSoldLocation);
    setSelectedLocation(null);
    setMapSearchQuery('');
    toast.success(`Location marked as sold: ${selectedLocation.address}`);
  };

  // Handle marker click
  const handleMarkerClick = (marker: {
    id: string;
    position: { lat: number; lng: number };
    title: string;
    status: 'sold' | 'available';
    isManual: boolean;
  }) => {
    setClickedMarker({
      id: marker.id,
      position: marker.position,
      title: marker.title,
      status: marker.status,
      isManual: marker.isManual || false,
    });
    setSelectedLocation(null); // Clear selected location when clicking marker
  };

  // Get map markers for all sold locations (from franchises + manual)
  const getMapMarkers = () => {
    const franchiseMarkers = (allFranchises || [])
      .filter(franchise => {
        const location = franchise as { location?: { coordinates?: { lat: number; lng: number } } };
        return location.location?.coordinates?.lat && location.location?.coordinates?.lng;
      })
      .map(franchise => {
        const location = franchise as { location?: { coordinates?: { lat: number; lng: number } } };
        const coords = location.location!.coordinates!;
        return {
          id: franchise._id,
          position: { lat: coords.lat, lng: coords.lng },
          title: `${franchise.businessName} - Sold`,
          status: 'sold' as const,
          statusInfo: { color: 'text-red-600', bg: 'bg-red-100', text: 'Sold' },
          franchiseFee: franchise.investment?.franchiseFee || 0,
          minArea: 500,
          isManual: false,
          onClick: () => handleMarkerClick({
            id: franchise._id,
            position: { lat: coords.lat, lng: coords.lng },
            title: `${franchise.businessName} - Sold`,
            status: 'sold',
            isManual: false,
          }),
        };
      });

    const manualMarkers = soldLocations.map(soldLocation => ({
      id: soldLocation.id,
      position: { lat: soldLocation.lat, lng: soldLocation.lng },
      title: `${soldLocation.country} - Sold`,
      status: 'sold' as const,
      statusInfo: { color: 'text-red-600', bg: 'bg-red-100', text: 'Sold' },
      franchiseFee: soldLocation.franchiseFee,
      minArea: soldLocation.minArea,
      isManual: true,
      onClick: () => handleMarkerClick({
        id: soldLocation.id,
        position: { lat: soldLocation.lat, lng: soldLocation.lng },
        title: `${soldLocation.country} - Sold`,
        status: 'sold',
        isManual: true,
      }),
    }));

    return [...franchiseMarkers, ...manualMarkers];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
          <MapPin className="h-4 w-4 mr-2" />
          Sold Locations ({getMapMarkers().length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sold Locations Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Add Location */}
          <div className="flex gap-2">
            <div className="relative flex-1" ref={inputRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-500" />
              <Input
                ref={inputRef}
                placeholder="Search for a location..."
                value={mapSearchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="w-full pl-10 pr-10 py-2 border focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
              {mapSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMapSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg">
                  <ul className="py-1 max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.place_id}
                        className="px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 cursor-pointer"
                        onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
                      >
                        {suggestion.structured_formatting.main_text} 
                        <span className="text-stone-500">
                          {suggestion.structured_formatting.secondary_text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="shrink-0"
            >
              {gettingLocation ? (
                <div className="h-4 w-4 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
            </Button>
          </div>


          {/* Map */}
          <div className="w-full h-[500px] bg-stone-100 dark:bg-stone-800 overflow-hidden rounded-lg">
            <GoogleMapsLoader
              loadingFallback={
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-yellow-500"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-yellow-500 opacity-20"></div>
                  </div>
                  <span className="mt-4 text-sm text-stone-600 dark:text-stone-400 font-medium">Loading interactive map...</span>
                </div>
              }
              errorFallback={(error) => (
                <div className="flex items-center justify-center h-full text-red-500">
                  Error loading map: {error.message}
                </div>
              )}
            >
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialCenter={mapCenter}
                selectedLocation={selectedLocation}
                markers={getMapMarkers()}
                zoom={12}
              />
            </GoogleMapsLoader>
          </div>

          {/* Selected Marker Info */}
          {clickedMarker && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Selected Marker</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{clickedMarker.title}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-500">
                    Status: {clickedMarker.status} • Type: {clickedMarker.isManual ? 'Manual' : 'Franchise'}
                  </p>
                </div>
                <Button
                  onClick={() => setClickedMarker(null)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {/* Location Sold Button - for new locations */}
            <Button
              onClick={markLocationAsSold}
              disabled={!selectedLocation}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Location Sold
            </Button>

            {/* Marker Action Buttons - for clicked markers */}
            {clickedMarker && (
              <>
                <Button
                  onClick={() => {
                    if (clickedMarker.isManual) {
                      onRemoveSoldLocation(clickedMarker.id);
                    }
                    setClickedMarker(null);
                    toast.success('Location marked as available');
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Location Available
                </Button>
                <Button
                  onClick={() => setClickedMarker(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
