"use client";

import React, { useCallback, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar
} from 'lucide-react';

interface Property {
  id: string;
  status: "pending" | "approved" | "rejected" | "blocked" | "funded" | "available";
  buildingName: string;
  doorNumber: string;
  city: string;
  country: string;
  carpetArea: number;
  rate: number;
  propertyType: "commercial" | "residential" | "mixed";
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  franchiseId?: string;
  franchiseName?: string;
  fundingProgress: number;
  totalInvestment: number;
  raisedAmount: number;
  isFullyFunded: boolean;
  blockAgreementExpiry?: string;
  uploadedBy: string;
  uploadedDate: string;
  landlordContact: {
    name: string;
    phone: string;
    email: string;
  };
  images: string[];
  amenities: string[];
}

interface PropertyMapComponentProps {
  properties: Property[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

const libraries: ("places")[] = ["places"];

const PropertyMapComponent: React.FC<PropertyMapComponentProps> = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [_, setMap] = React.useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#fbbf24"; // yellow
      case "approved":
        return "#10b981"; // green
      case "rejected":
        return "#ef4444"; // red
      case "blocked":
        return "#f97316"; // orange
      case "funded":
        return "#3b82f6"; // blue
      case "available":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "blocked":
        return <Building2 className="h-4 w-4 text-orange-500" />;
      case "funded":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "available":
        return <MapPin className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "blocked":
        return <Badge className="bg-orange-100 text-orange-800">Blocked</Badge>;
      case "funded":
        return <Badge className="bg-blue-100 text-blue-800">Funded</Badge>;
      case "available":
        return <Badge className="bg-gray-100 text-gray-800">Available</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const markers = useMemo(() => {
    return properties.map((property) => ({
      id: property.id,
      position: property.coordinates,
      property: property,
    }));
  }, [properties]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => setSelectedProperty(marker.property)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: getStatusColor(marker.property.status),
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        ))}

        {selectedProperty && (
          <InfoWindow
            position={selectedProperty.coordinates}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <Card className="w-80">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedProperty.buildingName}</h3>
                      <p className="text-sm text-muted-foreground">Door #{selectedProperty.doorNumber}</p>
                      <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedProperty.status)}
                      {getStatusBadge(selectedProperty.status)}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Area</p>
                      <p className="font-medium">{selectedProperty.carpetArea.toLocaleString()} sq ft</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate</p>
                      <p className="font-medium">${selectedProperty.rate}/sq ft</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{selectedProperty.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedProperty.city}, {selectedProperty.country}</p>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  {selectedProperty.franchiseId && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span>{selectedProperty.fundingProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedProperty.isFullyFunded ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${selectedProperty.fundingProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${selectedProperty.raisedAmount.toLocaleString()} raised</span>
                        <span>${selectedProperty.totalInvestment.toLocaleString()} total</span>
                      </div>
                    </div>
                  )}

                  {/* Franchise Info */}
                  {selectedProperty.franchiseName && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Franchise</p>
                      <p className="font-medium">{selectedProperty.franchiseName}</p>
                    </div>
                  )}

                  {/* Block Agreement Info */}
                  {selectedProperty.blockAgreementExpiry && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Block Agreement Expires</p>
                          <p className="font-medium text-orange-600">
                            {new Date(selectedProperty.blockAgreementExpiry).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {selectedProperty.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {selectedProperty.status === "approved" && !selectedProperty.isFullyFunded && (
                      <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700">
                        <Building2 className="h-4 w-4 mr-1" />
                        Block Agreement
                      </Button>
                    )}
                    {selectedProperty.status === "approved" && selectedProperty.isFullyFunded && (
                      <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Upload Agreement
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMapComponent;
