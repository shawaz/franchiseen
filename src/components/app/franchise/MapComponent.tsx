"use client";

import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, MapPinIcon } from 'lucide-react';
import { reverseGeocode } from '@/lib/maps';

interface MapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialCenter?: { lat: number; lng: number };
  selectedLocation?: { lat: number; lng: number; address: string } | null;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    status: 'available' | 'sold' | 'not_available';
    statusInfo: { color: string; bg: string; text: string };
    franchiseFee: number;
    minArea: number;
    onClick?: () => void;
  }>;
  zoom?: number;
  onMarkerClick?: (markerId: string) => void;
  activeInfoWindowId?: string | null;
  onRemoveSoldLocation?: (locationId: string) => void;
}

const MapComponent = ({
  onLocationSelect,
  initialCenter = { lat: 25.2048, lng: 55.2708 },
  selectedLocation,
  markers = [],
  zoom = 12,
  onMarkerClick,
  activeInfoWindowId,
  onRemoveSoldLocation,
}: MapComponentProps) => {
  const [isSelecting, setSelecting] = useState(true);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapError, setMapError] = useState<string | null>(null);
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
    
    // Set up minimal map options for better performance
    map.setOptions({
      gestureHandling: 'auto',
      disableDefaultUI: true, // Disable all default UI for better performance
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    });
  }, []);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng && isSelecting) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // Update the temporary location
      setMapCenter({ lat, lng });
      setMapError(null);
      
      try {
        // Reverse geocode to get the address
        const results = await reverseGeocode(lat, lng);
        if (results && results[0]) {
          setTempLocation({
            lat,
            lng,
            address: results[0].formatted_address
          });
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setMapError('Could not find address for this location. Please try another location.');
      }
    }
  };
  
  const handleDragEnd = useCallback(async () => {
    if (mapRef.current && isSelecting) {
      const center = mapRef.current.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        
        try {
          const results = await reverseGeocode(lat, lng);
          if (results && results[0]) {
            const newLocation = {
              lat,
              lng,
              address: results[0].formatted_address
            };
            setTempLocation(newLocation);
            setMapError(null);
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setMapError('Could not find address for this location. Please try another location.');
        }
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
            zoom={zoom}
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
              // Optimized styles for better performance
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
                {
                  featureType: 'transit',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
                {
                  featureType: 'road',
                  elementType: 'labels',
                  stylers: [{ visibility: 'simplified' }],
                },
              ],
              // Performance optimizations
              clickableIcons: false,
              keyboardShortcuts: false,
              scrollwheel: isSelecting,
              disableDoubleClickZoom: !isSelecting,
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

            {/* Location Markers */}
            {markers.map((marker) => {
              const getMarkerColor = (status: string) => {
                switch (status) {
                  case 'available': return '#10B981'; // Green
                  case 'sold': return '#EF4444'; // Red
                  case 'not_available': return '#6B7280'; // Gray
                  default: return '#6B7280';
                }
              };

              return (
                <div key={marker.id}>
                  <Marker
                    position={marker.position}
                    title={`${marker.title} - ${marker.statusInfo.text}`}
                    onClick={() => {
                      if (marker.onClick) {
                        marker.onClick();
                      } else if (onMarkerClick) {
                        onMarkerClick(marker.id);
                      }
                    }}
                    icon={{
                      url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="12" fill="${getMarkerColor(marker.status)}" stroke="white" stroke-width="3"/>
                          <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
                        </svg>
                      `),
                      scaledSize: new google.maps.Size(32, 32),
                    }}
                  />
                  {activeInfoWindowId === marker.id && (
                    <InfoWindow
                      position={marker.position}
                      onCloseClick={() => onMarkerClick && onMarkerClick(marker.id)}
                    >
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold text-gray-900 mb-2">{marker.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${marker.statusInfo.bg} ${marker.statusInfo.color}`}>{marker.statusInfo.text}</span></p>
                          <p><strong>Franchise Fee:</strong> ${marker.franchiseFee.toLocaleString()}</p>
                          <p><strong>Min Area:</strong> {marker.minArea} sq ft</p>
                        </div>
                        {marker.status === 'sold' && onRemoveSoldLocation && (
                          <div className="mt-3">
                            <Button
                              onClick={() => {
                                onRemoveSoldLocation(marker.id);
                              }}
                              size="sm"
                              variant="outline"
                              className="w-full text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Remove this sold location
                            </Button>
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </div>
              );
            })}
          </GoogleMap>

          {/* Centered map pin - only show when selecting */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <MapPinIcon className={`w-10 h-10 ${isSelecting ? 'text-yellow-800' : 'text-yellow-400/0'} drop-shadow-lg transition-colors duration-200`} />
            {isSelecting && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-yellow-500/0"></div>
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
