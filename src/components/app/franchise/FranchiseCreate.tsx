"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building, Search, LocateFixed, X } from 'lucide-react';
import { LoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';

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
  slug?: string;
  logoUrl?: string;
  walletAddress?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
  costPerArea?: number;
  currency?: string;
  min_area?: number;
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
  };
}

const dummyBusinesses: Business[] = [
  {
    _id: '1',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-1.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '2',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-2.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '3',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-3.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '4',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-4.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '5',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-5.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '6',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-6.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '7',
    name: 'Burger King',
    slug: 'burger-king',
    logoUrl: '/logo/logo-7.svg',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '8',
    name: 'Starbucks',
    slug: 'starbucks',
    logoUrl: '/logo/logo-8.svg',
    walletAddress: 'DummyWalletAddress456',
    industry: { name: 'Coffee' },
    category: { name: 'Cafe' },
    costPerArea: 150,
    currency: 'USD',
    min_area: 300
  }
];

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
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 }); // Default to Dubai coordinates
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [conflictingLocation] = useState<boolean>(false);
  const usdtPerSol = 100; // Dummy exchange rate

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
        
        // Update form with selected place details
        // setValue('location', {
        //   address: place.formatted_address || '',
        //   lat: place.geometry.location.lat(),
        //   lng: place.geometry.location.lng()
        // });
        // setValue('locationDetails.buildingName', place.name || '');
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
  
  // Extract unique industries from businesses
  const industries = ['All', ...Array.from(new Set(dummyBusinesses
    .map(b => b.industry?.name)
    .filter((name): name is string => !!name)
  ))];
  
  // Dummy function to simulate loading
  const simulateLoading = (ms: number = 1000) => {
    setLoading(true);
    return new Promise(resolve => setTimeout(() => {
      setLoading(false);
      resolve(true);
    }, ms));
  };
  
  const selectedCurrency = 'usd';

  const formatCurrencyAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
      sharePrice: 1.00
    }
  });

  const filteredBusinesses = dummyBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || business.industry?.name === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const calculateTotalInvestment = () => {
    const area = parseFloat(formData.locationDetails.sqft) || 0;
    const costPerArea = parseFloat(formData.locationDetails.costPerArea) || 0;
    return area * costPerArea;
  };

  const calculateInvestmentBreakdown = () => {
    const totalInvestment = calculateTotalInvestment();
    const franchiseFee = totalInvestment * 0.15; // 15% of total investment
    const setupCost = totalInvestment * 0.25;    // 25% of total investment
    const workingCapital = totalInvestment * 0.60; // 60% of total investment
    
    return {
      total: totalInvestment,
      franchiseFee,
      setupCost,
      workingCapital,
      formatted: {
        total: formatCurrencyAmount(totalInvestment),
        franchiseFee: formatCurrencyAmount(franchiseFee),
        setupCost: formatCurrencyAmount(setupCost),
        workingCapital: formatCurrencyAmount(workingCapital)
      }
    };
  };

  const calculateTotalShares = () => {
    const totalInvestment = calculateTotalInvestment();
    return Math.floor(totalInvestment) || 1000; // Default to 1000 if calculation fails
  };


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
    const totalShares = calculateTotalShares();
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
        return formData.selectedBusiness !== null;
      case 2:
        return formData.location !== null && !conflictingLocation;
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
    if (currentStep === 2 && !selectedLocation) {
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
        costPerArea: business.costPerArea?.toString() || '100',
        sqft: business.min_area ? business.min_area.toString() : prev.locationDetails.sqft
      },
      investment: {
        ...prev.investment,
        totalShares: business.costPerArea ? Math.floor(business.costPerArea * (parseInt(prev.locationDetails.sqft) || 0)) : 1000
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

      <Card className="w-full max-w-4xl mx-auto my-12 py-6">
        <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Franchise</h2>
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10  flex items-center justify-center ${
                    currentStep >= step 
                      ? 'bg-yellow-600 dark:bg-yellow-700 text-white' 
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
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
              <div className="mb-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 gap-2">
                    <div className="relative flex-1 items-center">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-500" />
                      <Input
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border focus-visible:ring-2 focus-visible:ring-yellow-500"
                      />
                    </div>
                    <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                      {industries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => setSelectedIndustry(industry)}
                          className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedIndustry === industry
                              ? 'bg-stone-700 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                          }`}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 -mr-2">
                {filteredBusinesses.map((business) => (
                  <div 
                    key={business._id}
                    className={`p-4 border cursor-pointer transition-colors ${
                      formData.selectedBusiness?._id === business._id 
                        ? 'border-stone-500 bg-stone-50 dark:border-stone-700 dark:bg-stone-700' 
                        : 'hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                    onClick={() => selectBusiness(business)}
                  >
                    <div className="flex items-center">
                      {business.logoUrl ? (
                        <div className="w-18 h-18 flex  items-center justify-center mr-4">
                          <Image 
                            src={business.logoUrl} 
                            alt={business.name}
                            width={100}
                            height={100}
                          />
                        </div>
                      ) : (
                        <div className="w-18 h-18 flex items-center justify-center mr-4">
                          <Building className="h-6 w-6 text-stone-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 justify-between w-full">
                        <div>
                          <h4 className="font-medium">{business.name}</h4>
                          <p className="text-sm text-stone-600 mt-2">
                            {business.industry?.name} • {business.category?.name}
                          </p>

                        </div>
                        <div >
                          <p className="text-sm font-medium">
                            ${business.costPerArea} / sq ft
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
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
                      className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {mapSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setMapSearchQuery('');
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        <ul className="py-1 max-h-60 overflow-auto">
                          {suggestions.map((suggestion) => (
                            <li
                              key={suggestion.place_id}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
                            >
                              {suggestion.structured_formatting.main_text} 
                              <span className="text-gray-500">
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
              </div>
              <div className="w-full h-96 bg-stone-100 dark:bg-stone-800 mt-4 overflow-hidden">
                <GoogleMapsLoader>
                  <MapComponent
                    onLocationSelect={handleLocationSelect}
                    initialCenter={mapCenter}
                    selectedLocation={selectedLocation}
                  />
                </GoogleMapsLoader>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                <div>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Carpet Area (sq ft)
                    </label>
                    <Input
                      type="number"
                      value={formData.locationDetails.sqft}
                      onChange={(e) => updateLocationDetails('sqft', e.target.value)}
                      className="w-full p-2 border "
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Cost per sq ft ({selectedCurrency.toUpperCase()})
                    </label>
                    <Input
                      type="number"
                      value={formData.locationDetails.costPerArea}
                      onChange={(e) => updateLocationDetails('costPerArea', e.target.value)}
                      className="w-full p-2 border "
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                {/* Investment Breakdown */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Investment Breakdown</h4>
                  <div className="bg-yellow-50 dark:bg-stone-700 p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Carpet Area</span>
                        <span className="text-sm font-medium">
                          {formData.locationDetails.sqft || '0'} sq ft × {formData.locationDetails.costPerArea || '0'} {selectedCurrency.toUpperCase()}
                        </span>
                      </div>
                      <div className="border-t border-yellow-100 dark:border-stone-600 pt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-stone-600 dark:text-stone-400">Total Investment</span>
                          <span className="text-yellow-700 dark:text-yellow-400">{calculateInvestmentBreakdown().formatted.total}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">• Franchise Fee (15%)</span>
                          <span>{calculateInvestmentBreakdown().formatted.franchiseFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">• Setup Cost (25%)</span>
                          <span>{calculateInvestmentBreakdown().formatted.setupCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">• Working Capital (60%)</span>
                          <span>{calculateInvestmentBreakdown().formatted.workingCapital}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-3 border-t border-yellow-100 dark:border-stone-600">
                        <div className="flex justify-between font-medium">
                          <span className="text-stone-600 dark:text-stone-400">Total Investment</span>
                          <span className="text-yellow-700 dark:text-yellow-400">{calculateInvestmentBreakdown().formatted.total}</span>
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
              <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Property Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-500">Building</p>
                      <p>{formData.locationDetails.buildingName}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">Area</p>
                      <p>{formData.locationDetails.sqft} sq ft</p>
                    </div>
                    <div>
                      <p className="text-stone-500">Cost per sq ft</p>
                      <p>${formData.locationDetails.costPerArea}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">Total Investment</p>
                      <p className="font-medium">${calculateTotalInvestment().toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">

                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium">Your Investment</p>
                          <p className="text-xs text-stone-500">Minimum 5% of total shares</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formData.investment.selectedShares.toLocaleString()} Shares</p>
                          <p className="text-sm text-stone-500">
                            {((formData.investment.selectedShares / calculateTotalShares()) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      
                      <Slider
                        value={[formData.investment.selectedShares]}
                        min={Math.ceil(calculateTotalShares() * 0.05)}
                        max={calculateTotalShares()}
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
                            className="w-full p-2 border  bg-stone-50"
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
                            min={Math.ceil(calculateTotalShares() * 0.05)}
                            max={calculateTotalShares()}
                            className="w-full p-2 border "
                          />
                        </div>
                        
                      </div>
                    </div>

                    <div className="bg-stone-100 dark:bg-stone-900 p-4">
                      <h4 className="font-medium mb-2">Payment Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-stone-600">Shares</span>
                          <span className="text-sm">{formData.investment.selectedShares.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-stone-600">Price per Share</span>
                          <span className="text-sm">1.00 USDT</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-600">Service Fee (2%)</span>
                          <span className="text-sm">
                            {(formData.investment.selectedShares * formData.investment.sharePrice * 0.02).toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="pt-2 border-t mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>{(formData.investment.selectedShares * formData.investment.sharePrice * 1.02).toFixed(2)} USDT</span>
                          </div>
                          <div className="text-xs text-stone-500 text-right">
                            ≈ {(formData.investment.selectedShares * formData.investment.sharePrice * 1.02 / usdtPerSol).toFixed(4)} SOL
                          </div>
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
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="mr-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
          </div>
          <div>
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || loading}
                className="bg-yellow-600 hover:bg-yellow-700"
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
                className="bg-green-600 hover:bg-green-700"
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
