"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building, Search, LocateFixed, X } from 'lucide-react';
import { LoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';
import { useFranchisersByLocation } from '@/hooks/useFranchisersByLocation';
import { extractLocationInfo, normalizeCountryName, normalizeCityName } from '@/lib/locationUtils';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { Id } from '../../../../convex/_generated/dataModel';
// import { useQuery } from "convex/react";
// import { api } from "../../../../../convex/_generated/api";

// Dynamically import the MapComponent with SSR disabled
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  )}
);

interface Business {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  walletAddress: string;
  industry: string;
  category: string;
  description: string;
  website?: string;
  status: string;
  location: {
    _id: string;
    franchiserId: string;
    country: string;
    isNationwide: boolean;
    city?: string;
    minArea: number;
    franchiseFee: number;
    setupCost: number;
    workingCapital: number;
    status: string;
  };
}

interface FormData {
  selectedBusiness: Business | null;
  location: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  locationDetails: {
    franchiseSlug: string;
    buildingName: string;
    doorNumber: string;
    sqft: string;
    costPerArea: string;
    isOwned: boolean;
    landlordNumber: string;
    landlordEmail: string;
    userNumber: string;
    userEmail: string;
  };
  investment: {
    selectedShares: number;
    totalShares: number;
    sharePrice: number;
    franchiseFee: number;
    setupCost: number;
    workingCapital: number;
    totalInvestment: number;
  };
}

// Franchiser Logo Component
const FranchiserLogo: React.FC<{
  business: Business;
  size?: 'sm' | 'md' | 'lg';
}> = ({ business, size = 'md' }) => {
  const logoUrl = useConvexImageUrl(business.logoUrl as Id<"_storage"> | undefined);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return logoUrl ? (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <Image
        src={logoUrl}
        alt={business.name}
        width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        className="object-contain"
      />
    </div>
  ) : (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-stone-200 dark:bg-stone-700 rounded`}>
      <Building className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'} text-stone-400`} />
    </div>
  );
};

// Franchiser Card Component
  const FranchiserCard: React.FC<{
    business: Business;
    isSelected: boolean;
    onSelect: () => void;
  }> = ({ business, isSelected, onSelect }) => {
    return (
      <div
        className={`p-3 sm:p-4 border cursor-pointer transition-colors ${
          isSelected
            ? 'border-stone-500 bg-stone-50 dark:border-stone-700 dark:bg-stone-700'
            : 'hover:border-stone-300 dark:hover:border-stone-600'
        }`}
        onClick={onSelect}
      >
        {/* Mobile: Stack vertically, Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          {/* Logo section */}
          <div className="flex items-center mb-3 sm:mb-0 sm:mr-4">
            <FranchiserLogo business={business} size="md" />
          </div>
          
          {/* Content section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between w-full">
            <div className="flex-1">
              <h4 className="font-medium text-sm sm:text-base">{business.name}</h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {business.industry} • {business.category}
              </p>
              {/* {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-600 hover:text-stone-800 mt-1 inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Website
                </a>
              )} */}
            </div>
            
            {/* Investment info - responsive layout */}
            <div className="flex flex-col sm:flex-col sm:text-right mt-2 sm:mt-0">
              <p className="text-xs sm:text-sm font-medium">
                Min Budget: ${(business.location.franchiseFee + business.location.setupCost + business.location.workingCapital).toLocaleString()}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Min Area: {business.location.minArea} sq ft
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

const dummyUser = {
  _id: 'user123',
  email: 'user@example.com',
  phone: '+1234567890'
} as const;

const FranchiseCreate: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Select Industry');
  const [selectedCategory, setSelectedCategory] = useState<string>('Select Category');
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 }); // Default to Dubai coordinates
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [locationInfo, setLocationInfo] = useState<{ country: string; city?: string } | null>(null);
  const [manualLocationOverride] = useState<{ country: string; city?: string } | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const usdtPerSol = 100; // Dummy exchange rate

  // Get franchisers based on selected location
  const effectiveLocationInfo = manualLocationOverride || locationInfo;
  const { franchisers, isLoading: franchisersLoading } = useFranchisersByLocation({
    country: effectiveLocationInfo?.country,
    city: effectiveLocationInfo?.city,
    industry: selectedIndustry === 'Select Industry' ? undefined : selectedIndustry,
    enabled: !!effectiveLocationInfo?.country
  });

  // Initialize Google Maps services
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    } else {
      console.error('Google Maps API not loaded');
    }
  }, []);


  // Handle input changes and fetch predictions
  const handleInputChange = (value: string) => {
    setMapSearchQuery(value);
    
    if (value.length > 2) {
      autocompleteService.current?.getPlacePredictions(
        {
          input: value,
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (placeId: string, description: string) => {
    if (!placesService.current) return;
    
    setMapSearchQuery(description);
    setShowSuggestions(false);
    
    const request = {
      placeId,
      fields: ['geometry', 'name', 'formatted_address']
    };
    
    placesService.current.getDetails(request, (place, status) => {
      if (status === 'OK' && place?.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || description
        };
        
        setSelectedLocation(location);
        setMapCenter(location);
      }
    });
  };
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Extract unique industries from franchisers
  const industries = ['Select Industry', ...Array.from(new Set(franchisers
    .map(f => f.industry)
    .filter((name): name is string => !!name)
  ))];
  
  // Extract unique categories from franchisers
  const categories = ['Select Category', ...Array.from(new Set(franchisers
    .map(f => f.category)
    .filter((name): name is string => !!name)
  ))];
  
  console.log("Available industries:", industries);
  console.log("Available categories:", categories);
  
  // Dummy function to simulate loading
  const simulateLoading = (ms: number = 1000) => {
    setLoading(true);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve(true);
    }, ms));
  };
  


  const [formData, setFormData] = useState<FormData>({
    selectedBusiness: null,
    location: {
      address: '123 Main St, New York, NY 10001',
      lat: 40.7128,
      lng: -74.0060
    },
    locationDetails: {
      franchiseSlug: 'test-franchise-1',
      buildingName: 'Empire State Building',
      doorNumber: '350',
      sqft: '1500',
      costPerArea: '100',
      isOwned: true,
      landlordNumber: '+1234567890',
      landlordEmail: 'landlord@example.com',
      userNumber: dummyUser.phone,
      userEmail: dummyUser.email
    },
    investment: {
      selectedShares: 100,
      totalShares: 1000,
      sharePrice: 1.00,
      franchiseFee: 0,
      setupCost: 0,
      workingCapital: 0,
      totalInvestment: 0
    }
  });

  // Auto-populate form data when franchiser is selected
  useEffect(() => {
    if (formData.selectedBusiness) {
      const business = formData.selectedBusiness;
      const totalInvestment = business.location.franchiseFee + business.location.setupCost + business.location.workingCapital;
      const totalShares = Math.floor(totalInvestment) || 1000;
      const sharePrice = totalShares > 0 ? totalInvestment / totalShares : 1.0;
      
      setFormData(prev => ({
        ...prev,
        locationDetails: {
          ...prev.locationDetails,
          sqft: business.location.minArea.toString(),
          costPerArea: '0', // Will be calculated based on total investment
        },
        investment: {
          ...prev.investment,
          franchiseFee: business.location.franchiseFee,
          setupCost: business.location.setupCost,
          workingCapital: business.location.workingCapital,
          totalInvestment,
          totalShares,
          sharePrice
        }
      }));
    }
  }, [formData.selectedBusiness]);

  // Calculate investment based on carpet area
  const calculateInvestmentByArea = useCallback(() => {
    if (!formData.selectedBusiness) return { franchiseFee: 0, setupCost: 0, workingCapital: 0, totalInvestment: 0 };
    
    const selectedArea = parseFloat(formData.locationDetails.sqft) || 0;
    const minArea = formData.selectedBusiness.location.minArea;
    const baseFranchiseFee = formData.selectedBusiness.location.franchiseFee;
    const baseSetupCost = formData.selectedBusiness.location.setupCost;
    const baseWorkingCapital = formData.selectedBusiness.location.workingCapital;
    
    // Calculate ratio based on area (minimum 1.0 for min area)
    const areaRatio = Math.max(1.0, selectedArea / minArea);
    
    // Franchise fee is fixed, only setup cost and working capital scale with area
    const franchiseFee = baseFranchiseFee; // Fixed
    const setupCost = Math.round(baseSetupCost * areaRatio);
    const workingCapital = Math.round(baseWorkingCapital * areaRatio);
    const totalInvestment = franchiseFee + setupCost + workingCapital;
    
    return {
      franchiseFee,
      setupCost,
      workingCapital,
      totalInvestment
    };
  }, [formData.selectedBusiness, formData.locationDetails.sqft]);

  // Update investment when carpet area changes
  useEffect(() => {
    if (formData.selectedBusiness && formData.locationDetails.sqft) {
      const calculatedInvestment = calculateInvestmentByArea();
      const totalShares = Math.floor(calculatedInvestment.totalInvestment) || 1000;
      const sharePrice = totalShares > 0 ? calculatedInvestment.totalInvestment / totalShares : 1.0;
      
      setFormData(prev => ({
        ...prev,
        investment: {
          ...prev.investment,
          ...calculatedInvestment,
          totalShares,
          sharePrice
        }
      }));
    }
  }, [formData.locationDetails.sqft, formData.selectedBusiness, calculateInvestmentByArea]);

  const filteredBusinesses = franchisers.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'Select Industry' || business.industry === selectedIndustry;
    const matchesCategory = selectedCategory === 'Select Category' || business.category === selectedCategory;
    return matchesSearch && matchesIndustry && matchesCategory;
  });






  const updateLocationDetails = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updatedDetails = {
        ...prev.locationDetails,
        [field]: value
      };
      
      // Recalculate total shares when sqft or costPerArea changes
      if (field === 'sqft' || field === 'costPerArea') {
        const area = field === 'sqft' ? parseFloat(value as string) || 0 : parseFloat(prev.locationDetails.sqft) || 0;
        const cost = field === 'costPerArea' ? parseFloat(value as string) || 0 : parseFloat(prev.locationDetails.costPerArea) || 0;
        
        return {
          ...prev,
          locationDetails: updatedDetails,
          investment: {
            ...prev.investment,
            totalShares: Math.floor(area * cost) || 1000
          }
        };
      }
      
      return {
        ...prev,
        locationDetails: updatedDetails
      };
    });
  };

  const updateInvestment = (selectedShares: number) => {
    const totalShares = formData.investment.totalShares;
    setFormData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        selectedShares: Math.min(Math.max(selectedShares, Math.ceil(totalShares * 0.05)), totalShares)
      }
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedLocation !== null;
      case 2:
        return formData.selectedBusiness !== null;
      case 3:
        const { doorNumber, sqft, isOwned, landlordNumber, landlordEmail, userNumber, userEmail, franchiseSlug, buildingName } = formData.locationDetails;
        const basicFields = doorNumber && sqft && franchiseSlug && buildingName && formData.locationDetails.costPerArea;
        if (isOwned) {
          return !!basicFields && !!userNumber && !!userEmail;
        } else {
          return !!basicFields && !!landlordNumber && !!landlordEmail;
        }
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === 1 && !selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }
    
    if (currentStep < 4) {
      await simulateLoading(500);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = async () => {
    if (currentStep > 1) {
      await simulateLoading(300);
      setCurrentStep(prev => prev - 1);
    }
  };

  const selectBusiness = async (business: Business) => {
    await simulateLoading(300);
    setFormData(prev => ({
      ...prev,
      selectedBusiness: business,
      locationDetails: {
        ...prev.locationDetails,
        costPerArea: business.location.minArea?.toString() || '100',
        sqft: business.location.minArea ? business.location.minArea.toString() : prev.locationDetails.sqft
      },
      investment: {
        ...prev.investment,
        totalShares: business.location.minArea ? Math.floor(business.location.minArea * (parseInt(prev.locationDetails.sqft) || 0)) : 1000
      }
    }));
  };

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    setMapCenter({ lat: location.lat, lng: location.lng });
    setSelectedLocation({ 
      lat: location.lat, 
      lng: location.lng,
      address: location.address 
    });
    
    // Extract country and city from the address
    const extractedInfo = extractLocationInfo(location.address);
    const normalizedInfo = {
      country: normalizeCountryName(extractedInfo.country),
      city: extractedInfo.city ? normalizeCityName(extractedInfo.city) : undefined
    };
    setLocationInfo(normalizedInfo);
    
    setFormData(prev => ({
      ...prev,
      location: {
        address: location.address,
        lat: location.lat,
        lng: location.lng
      }
    }));
  }, []);

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
        
        // Define interface for geocoding result
        interface GeocodingResult {
          formatted_address: string;
          // Add other properties you need from the geocoding result
        }
        
        // Update form data with the current location
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newCenter }, (results: GeocodingResult[] | null, status: string) => {
          if (status === 'OK' && results && results[0]) {
            handleLocationSelect({
              lat: newCenter.lat,
              lng: newCenter.lng,
              address: results[0].formatted_address
            });
          }
          setGettingLocation(false);
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to retrieve your location');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (

      <Card className="w-full max-w-4xl mx-auto my-4 sm:my-12 py-4 sm:py-6">
        <CardContent>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Create Franchise</h2>
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {[
              { step: 1 },
              { step: 2 },
              { step: 3 },
              { step: 4 }
            ].map(({ step }) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base ${
                    currentStep >= step 
                      ? 'bg-yellow-600 dark:bg-yellow-700 text-white' 
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {step}
                </div>
                {/* <span className="text-xs mt-1 text-stone-600 dark:text-stone-400 hidden sm:block">{title}</span> */}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-4">
          <div className="h-1 bg-stone-200 dark:bg-stone-800 mt-4">
            <div 
              className="h-full bg-yellow-600 dark:bg-yellow-700 transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6 min-h-[400px]">
          {currentStep === 1 && (
            <div>

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

              <div className="w-full h-[500px] bg-stone-100 dark:bg-stone-800 mt-4 overflow-hidden">
                <GoogleMapsLoader>
                  <MapComponent
                    onLocationSelect={handleLocationSelect}
                    initialCenter={mapCenter}
                    selectedLocation={selectedLocation}
                  />
                </GoogleMapsLoader>
              </div>
              {/* {selectedLocation && (
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Selected Location:</strong> {selectedLocation.address}
                    </p>
                  </div>
                  {locationInfo && (
                    <div className="p-3 bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-800 rounded-md">
                      <p className="text-sm text-stone-700 dark:text-stone-300">
                        <strong>Extracted:</strong> {locationInfo.country}{locationInfo.city && `, ${locationInfo.city}`}
                      </p>
                      {locationInfo.country === 'Unknown' && (
                        <div className="mt-2">
                          <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                            Location parsing failed. Please manually select:
                          </p>
                          <div className="flex gap-2">
                            <select
                              value={manualLocationOverride?.country || ''}
                              onChange={(e) => setManualLocationOverride(prev => ({ 
                                country: e.target.value, 
                                city: prev?.city 
                              }))}
                              className="text-xs px-2 py-1 border rounded"
                            >
                              <option value="">Select Country</option>
                              <option value="India">India</option>
                              <option value="UAE">UAE</option>
                              <option value="US">US</option>
                              <option value="UK">UK</option>
                            </select>
                            <select
                              value={manualLocationOverride?.city || ''}
                              onChange={(e) => setManualLocationOverride(prev => ({ 
                                country: prev?.country || '', 
                                city: e.target.value 
                              }))}
                              className="text-xs px-2 py-1 border rounded"
                            >
                              <option value="">Select City (Optional)</option>
                              <option value="Bangalore">Bangalore</option>
                              <option value="Mangalore">Mangalore</option>
                              <option value="Dubai">Dubai</option>
                              <option value="Abu Dhabi">Abu Dhabi</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )} */}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="mb-4 mt-4">
                <div className="flex flex-col space-y-2">
                  {/* Mobile: Stack vertically, Desktop: Horizontal */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 gap-2">
                    <div className="relative w-full flex-1 items-center">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-500" />
                      <Input
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border focus-visible:ring-2 focus-visible:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 -mr-2">
                {franchisersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-stone-600 dark:text-stone-400">Loading franchisers...</p>
                  </div>
                ) : filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => (
                    <FranchiserCard 
                      key={business._id}
                      business={business}
                      isSelected={formData.selectedBusiness?._id === business._id}
                      onSelect={() => selectBusiness(business)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                    <p className="text-stone-600 dark:text-stone-400">
                      {searchQuery || selectedIndustry !== 'All' 
                        ? 'No franchisers found matching your search criteria' 
                        : 'No franchisers available in this location yet'
                      }
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-500 mt-2">
                      Try adjusting your search or selecting a different location
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="space-y-4">
              <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700">Property Ownership</span>
                    <div className="flex items-center">
                      <span className={`text-sm mr-2 ${
                        formData.locationDetails.isOwned ? 'text-stone-700' : 'text-stone-400'
                      }`}>
                        Owned
                      </span>
                      <Switch
                        checked={!formData.locationDetails.isOwned}
                        onCheckedChange={(checked) => updateLocationDetails('isOwned', !checked)}
                        className={`${
                          !formData.locationDetails.isOwned ? 'bg-yellow-600' : 'bg-stone-200'
                        } relative inline-flex h-6 w-11 items-center `}
                      >
                        <span className="sr-only">Toggle property ownership</span>
                        <span
                          className={`${
                            !formData.locationDetails.isOwned ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform  bg-white transition`}
                        />
                      </Switch>
                      <span className={`text-sm ml-2 ${
                        !formData.locationDetails.isOwned ? 'text-yellow-600' : 'text-stone-400'
                      }`}>
                        Rented
                      </span>
                    </div>
                  </div>
                  {!formData.locationDetails.isOwned && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                      <div >
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Landlord Phone Number
                        </label>
                        <Input
                          value={formData.locationDetails.landlordNumber}
                          onChange={(e) => updateLocationDetails('landlordNumber', e.target.value)}
                          className="w-full p-2 border "
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Landlord Email
                        </label>
                        <Input
                          type="email"
                          value={formData.locationDetails.landlordEmail}
                          onChange={(e) => updateLocationDetails('landlordEmail', e.target.value)}
                          className="w-full p-2 border "
                          placeholder="landlord@example.com"
                        />
                      </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Building Name
                  </label>
                  <Input
                    value={formData.locationDetails.buildingName}
                    onChange={(e) => updateLocationDetails('buildingName', e.target.value)}
                    className="w-full p-2 border "
                    placeholder="Building name"
                  />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Door Number
                    </label>
                    <Input
                      value={formData.locationDetails.doorNumber}
                      onChange={(e) => updateLocationDetails('doorNumber', e.target.value)}
                      className="w-full p-2 border "
                      placeholder="e.g., 101"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Carpet Area (sq ft)
                    </label>
                    <Input
                      type="number"
                      value={formData.locationDetails.sqft}
                      onChange={(e) => updateLocationDetails('sqft', e.target.value)}
                      className="w-full p-2 border "
                      placeholder="e.g., 1000"
                      min={formData.selectedBusiness?.location.minArea || 0}
                    />
                    {formData.selectedBusiness && (
                      <div className="mt-1 text-xs text-stone-500">
                        Min: {formData.selectedBusiness.location.minArea} sq ft
                        {parseFloat(formData.locationDetails.sqft) > formData.selectedBusiness.location.minArea && (
                          <span className="text-green-600 ml-2">
                            (+{((parseFloat(formData.locationDetails.sqft) / formData.selectedBusiness.location.minArea - 1) * 100).toFixed(0)}% larger)
                          </span>
                        )}
                  </div>
                    )}
                  </div>
                </div>

                {/* Investment Breakdown - Based on selected franchiser */}
                <div className="mt-6">
                  <div className="bg-yellow-50 dark:bg-stone-800 p-4 border border-stone-200 dark:border-stone-700">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Carpet Area</span>
                        <span className="text-sm font-medium">
                          {formData.locationDetails.sqft || '0'} sq ft 
                          {formData.selectedBusiness && parseFloat(formData.locationDetails.sqft) > formData.selectedBusiness.location.minArea && (
                            <span className="text-green-600 ml-1">
                              ({(parseFloat(formData.locationDetails.sqft) / formData.selectedBusiness.location.minArea).toFixed(2)}x min area)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="border-t border-yellow-100 dark:border-stone-600 pt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-stone-600 dark:text-stone-400">Total Investment Required</span>
                          <span className="text-yellow-700 dark:text-yellow-400">
                            ${formData.investment.totalInvestment.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">• Franchise Fee (One Time)</span>
                          <span>${formData.investment.franchiseFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">
                            • Setup Cost (Cost per sqft ${formData.selectedBusiness?.location.setupCost ? Math.round(formData.selectedBusiness.location.setupCost / formData.selectedBusiness.location.minArea) : 0})
                          </span>
                          <span>${formData.investment.setupCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">
                            • Working Capital (Cost per sqft ${formData.selectedBusiness?.location.workingCapital ? Math.round(formData.selectedBusiness.location.workingCapital / formData.selectedBusiness.location.minArea) : 0})
                          </span>
                          <span>${formData.investment.workingCapital.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-3 border-t border-yellow-100 dark:border-stone-600">
                        <div className="flex justify-between font-medium">
                          <span className="text-stone-600 dark:text-stone-400">Total Investment Required</span>
                          <span className="text-yellow-700 dark:text-yellow-400">
                            ${formData.investment.totalInvestment.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
               
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="space-y-6">
                {/* Selected Franchiser Information */}
                {formData.selectedBusiness && (
                  <div className="bg-stone-50 dark:bg-stone-800 p-4 border">
                    <div className="flex items-center mb-3">
                      <div className="mr-3">
                        <FranchiserLogo business={formData.selectedBusiness} size="md" />
                      </div>
                <div>
                        <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                          {formData.selectedBusiness.name}
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {formData.selectedBusiness.industry} • {formData.selectedBusiness.category}
                        </p>
                      </div>
                    </div>
                    {/* Property Information */}
                    <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Property Information</h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                          <p className="text-stone-500">Carpet Area</p>
                          <p className="font-medium">{formData.locationDetails.sqft} sq ft</p>
                    </div>
                    <div>
                          <p className="text-stone-500">Door Number</p>
                          <p className="font-medium">{formData.locationDetails.doorNumber}</p>
                    </div>
                        
                        <div className="col-span-2">
                          <p className="text-stone-500">Building</p>
                          <p className="font-medium">{formData.locationDetails.buildingName}</p>
                    </div>
                        <div className="col-span-4">
                          <p className="text-stone-500">Location</p>
                          <p className="font-medium">{selectedLocation?.address || 'Not selected'}</p>
                    </div>
                  </div>
                </div>
                    {/* Investment Breakdown */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Investment Breakdown</h4>

                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span className="text-stone-600 dark:text-stone-400">Franchise Fee (One Time)</span>
                           <span className="font-medium">${formData.investment.franchiseFee.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-stone-600 dark:text-stone-400">
                             Setup Cost (Cost per sqft ${formData.selectedBusiness?.location.setupCost ? Math.round(formData.selectedBusiness.location.setupCost / formData.selectedBusiness.location.minArea) : 0})
                           </span>
                           <span className="font-medium">${formData.investment.setupCost.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-stone-600 dark:text-stone-400">
                             Working Capital (Cost per sqft ${formData.selectedBusiness?.location.workingCapital ? Math.round(formData.selectedBusiness.location.workingCapital / formData.selectedBusiness.location.minArea) : 0})
                           </span>
                           <span className="font-medium">${formData.investment.workingCapital.toLocaleString()}</span>
                         </div>
                        <div className="py-4 mt-6 border-t border-yellow-200 dark:border-yellow-700">
                          <div className="flex justify-between font-semibold text-lg">
                            <span className="text-stone-900 dark:text-stone-100">Total Investment Required</span>
                            <span className="text-yellow-600 dark:text-yellow-400">${formData.investment.totalInvestment.toLocaleString()}</span>
                          </div>
                          {formData.selectedBusiness && parseFloat(formData.locationDetails.sqft) > formData.selectedBusiness.location.minArea && (
                            <div className="text-xs text-stone-500 mt-1">
                              Setup cost & working capital scaled by {(parseFloat(formData.locationDetails.sqft) / formData.selectedBusiness.location.minArea).toFixed(2)}x due to larger area
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Investment Section */}
                <div className="bg-stone-50 dark:bg-stone-800 p-4 border">
                  <h4 className="font-medium mb-2">Share Investment</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Your Investment</p>
                          <p className="text-xs text-stone-600 dark:text-stone-300">Minimum 5% of total shares</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-stone-900 dark:text-blue-100">{formData.investment.selectedShares.toLocaleString()} Shares</p>
                          <p className="text-sm text-stone-600 dark:text-stone-300">
                            {((formData.investment.selectedShares / formData.investment.totalShares) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      
                      <Slider
                        value={[formData.investment.selectedShares]}
                        min={Math.ceil(formData.investment.totalShares * 0.05)}
                        max={formData.investment.totalShares}
                        step={1}
                        onValueChange={([value]) => updateInvestment(value)}
                        className="w-full mb-6"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Share Price (USDT)
                          </label>
                          <Input
                            value={formData.investment.sharePrice.toFixed(2)}
                            disabled
                            className="w-full p-2 border bg-stone-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Number of Shares
                          </label>
                          <Input
                            type="number"
                            value={formData.investment.selectedShares}
                            onChange={(e) => updateInvestment(Number(e.target.value))}
                            min={Math.ceil(formData.investment.totalShares * 0.05)}
                            max={formData.investment.totalShares}
                            className="w-full p-2 border"
                          />
                        </div>
                      </div>
                    </div>
                      </div>
                    </div>

                {/* Payment Summary */}
                <div className="bg-stone-50 dark:bg-stone-800 p-4 border">
                      <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Shares Purchasing</span>
                        <span className="text-sm font-medium">{formData.investment.selectedShares.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Price per Share</span>
                        <span className="text-sm font-medium">{formData.investment.sharePrice.toFixed(2)} USDT</span>
                        </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Subtotal</span>
                        <span className="text-sm font-medium">{(formData.investment.selectedShares * formData.investment.sharePrice).toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Service Fee (2%)</span>
                        <span className="text-sm font-medium">
                            {(formData.investment.selectedShares * formData.investment.sharePrice * 0.02).toFixed(2)} USDT
                          </span>
                        </div>
                      <div className="pt-4 mt-4 border-t border-green-200 dark:border-green-700 mt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span className="text-green-900 dark:text-green-100">Total Payment</span>
                          <span className="text-green-600 dark:text-green-400">
                            {(formData.investment.selectedShares * formData.investment.sharePrice * 1.02).toFixed(2)} USDT
                          </span>
                          </div>
                        <div className="text-xs text-green-600 dark:text-green-400 text-right mt-1">
                            ≈ {(formData.investment.selectedShares * formData.investment.sharePrice * 1.02 / usdtPerSol).toFixed(4)} SOL
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between pt-4 border-t gap-4">
          <div>
            {currentStep > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="w-full sm:w-auto mr-0 sm:mr-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="w-full sm:w-auto">
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || loading}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700"
              >
                {loading ? 'Loading...' : 'Continue'} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setLoading(true);
                  // Simulate payment processing
                  setTimeout(() => {
                    setLoading(false);
                    toast.success('Franchise created successfully!');
                    // Navigate to franchise account page
                    router.push('/franchise/franchise-1');
                  }, 1000);
                }}
                disabled={!canProceed() || loading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            )}
          </div>
        </div>
        </CardContent>
      </Card>

  );
};

// Wrap the component with Google Maps LoadScript
const FranchiseCreateWithGoogleMaps: React.FC = () => {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return <div>Google Maps API key is not configured</div>;
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
    >
      <FranchiseCreate />
    </LoadScript>
  );
};

export default FranchiseCreateWithGoogleMaps;
