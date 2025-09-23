"use client";

import { GoogleMap, Marker } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, MapPinIcon } from 'lucide-react';

interface MapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialCenter?: { lat: number; lng: number };
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

const MapComponent = ({
  onLocationSelect,
  initialCenter = { lat: 25.2048, lng: 55.2708 },
  selectedLocation,
}: MapComponentProps) => {
  const [isSelecting, setSelecting] = useState(true);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapError] = useState<string | null>(null);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Initialize with selected location if provided
  useEffect(() => {
    if (selectedLocation) {
      setSelecting(false);
      setMapCenter(selectedLocation);
    }
  }, [selectedLocation]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    mapRef.current = map;
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && isSelecting) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // Update the temporary location
      setMapCenter({ lat, lng });
      
      // Reverse geocode to get the address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setTempLocation({
            lat,
            lng,
            address: results[0].formatted_address
          });
        }
      });
    }
  };
  
  const handleDragEnd = useCallback(() => {
    if (mapRef.current && isSelecting) {
      const center = mapRef.current.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const newLocation = {
              lat,
              lng,
              address: results[0].formatted_address
            };
            setTempLocation(newLocation);
          }
        });
      }
    }
  }, [isSelecting]);
  
  const handleSelectLocation = useCallback(() => {
    if (tempLocation) {
      onLocationSelect(tempLocation);
      setSelecting(false);
      setTempLocation(null);
    }
  }, [tempLocation, onLocationSelect]);
  
  const handleChangeLocation = useCallback(() => {
    setSelecting(true);
    setTempLocation(null);
    
    // Reset to the selected location if available
    if (selectedLocation) {
      setMapCenter(selectedLocation);
    }
  }, [selectedLocation]);

  // Ensure window.google is available
  if (typeof window === 'undefined' || !window.google) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 p-4">
          <div className="text-center">
            <p className="font-medium">Error loading map</p>
            <p className="text-sm">{mapError}</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={15}
            onLoad={onMapLoad}
            onClick={isSelecting ? handleMapClick : undefined}
            onDragEnd={isSelecting ? handleDragEnd : undefined}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              gestureHandling: isSelecting ? 'auto' : 'none',
              draggable: isSelecting,
              zoomControl: isSelecting,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
              ],
            }}
          >
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={{
                  url: '/map-marker.svg',
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 40),
                }}
              />
            )}
          </GoogleMap>

          {/* Centered map pin - only show when selecting */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <MapPinIcon className={`w-10 h-10 ${isSelecting ? 'text-red-500' : 'text-gray-400'} drop-shadow-lg transition-colors duration-200`} />
            {isSelecting && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-red-500"></div>
            )}
          </div>

          {/* Select location button - only show when in selection mode */}
          {isSelecting && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <Button 
                onClick={handleSelectLocation}
                disabled={!tempLocation}
                className={`${
                  tempLocation 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                } text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-colors`}
              >
                <MapPin className="w-4 h-4" />
                {tempLocation ? 'Continue with this location' : 'Please select a location on the map'}
              </Button>
            </div>
          )}
          
          {/* Selected location card - show after selection */}
          {!isSelecting && selectedLocation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Selected Location</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {selectedLocation.address}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleChangeLocation}
                    className="text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
