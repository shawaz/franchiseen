"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building, Search, LocateFixed, X } from 'lucide-react';
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
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer';
import { Address } from 'gill';

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
  industry: string;
  category: string;
  description: string;
  website?: string;
  status: string;
  brandWalletAddress?: string;
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
        unoptimized
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
                Min Budget: ${(business.location.franchiseFee + (business.location.setupCost * business.location.minArea) + (business.location.workingCapital * business.location.minArea)).toLocaleString()}
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

// Helper function to add income records to the income table
const addToIncomeTable = (type: 'platform_fee' | 'setup_contract' | 'marketing' | 'subscription', amount: number, source: string, description: string, transactionHash?: string) => {
  try {
    const incomeRecord = {
      id: `income_${Date.now()}`,
      type,
      amount,
      description,
      source,
      timestamp: new Date().toISOString(),
      status: 'completed' as const,
      transactionHash
    };

    // Get existing income records
    const existingRecords = localStorage.getItem('company_income_records');
    const records = existingRecords ? JSON.parse(existingRecords) : [];
    
    // Add new record
    records.unshift(incomeRecord);
    
    // Save back to localStorage
    localStorage.setItem('company_income_records', JSON.stringify(records));
    
    console.log('✅ Added income record:', incomeRecord);
  } catch (error) {
    console.error('Error adding income record:', error);
  }
};

const FranchiseCreateInner: React.FC = () => {
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
  const [usdtPerSol, setUsdtPerSol] = useState(0); // Real-time exchange rate from CoinGecko
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

  // Solana hooks
  const { account, client } = useSolana();
  const signer = useWalletUiSigner();

  // Convex mutations
  const generateFranchiseSlug = useMutation(api.franchiseManagement.generateFranchiseSlug);
  const createFranchise = useMutation(api.franchiseManagement.createFranchise);
  const updateFranchiseStatus = useMutation(api.franchiseManagement.updateFranchiseStatus);
  const updateFranchiseStage = useMutation(api.franchiseManagement.updateFranchiseStage);
  const purchaseShares = useMutation(api.franchiseManagement.purchaseShares);
  const createInvoice = useMutation(api.franchiseManagement.createInvoice);
  const createProperty = useMutation(api.propertyManagement.createProperty);
  const updatePropertyStage = useMutation(api.propertyManagement.updatePropertyStage);

  // Get franchisers based on selected location
  const effectiveLocationInfo = manualLocationOverride || locationInfo;
  const { franchisers, isLoading: franchisersLoading } = useFranchisersByLocation({
    country: effectiveLocationInfo?.country,
    city: effectiveLocationInfo?.city,
    industry: selectedIndustry === 'Select Industry' ? undefined : selectedIndustry,
    enabled: !!effectiveLocationInfo?.country
  });

  // Debug franchiser data
  useEffect(() => {
    if (franchisers && franchisers.length > 0) {
      console.log('Franchisers loaded:', franchisers);
      franchisers.forEach((franchiser, index) => {
        console.log(`Franchiser ${index}:`, {
          name: franchiser.name,
          brandWalletAddress: franchiser.brandWalletAddress,
          hasBrandWallet: !!franchiser.brandWalletAddress
        });
      });
    }
  }, [franchisers]);

  // Fetch SOL/USDT price from CoinGecko
  const fetchSolanaPrice = useCallback(async () => {
    setPriceLoading(true);
    try {
      console.log('Fetching SOL price from CoinGecko...');
      
      // Use a more reliable endpoint with proper headers
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usdt', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CoinGecko API response:', data);
      
      if (data.solana && data.solana.usdt) {
        setUsdtPerSol(data.solana.usdt);
        setLastPriceUpdate(new Date());
        console.log('SOL/USDT price updated:', data.solana.usdt);
      } else {
        console.log('No SOL price data found in response');
        // Set a reasonable fallback price
        setUsdtPerSol(200);
        setLastPriceUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
      // Set a fallback price if API fails
      setUsdtPerSol(200); // Reasonable fallback
      setLastPriceUpdate(new Date());
    } finally {
      setPriceLoading(false);
    }
  }, []);

  // Initialize Google Maps services and fetch SOL price
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    } else {
      console.error('Google Maps API not loaded');
    }
    
    // Fetch SOL price on component mount
    fetchSolanaPrice();
    
    // Set a fallback price after 3 seconds if still loading
    const fallbackTimeout = setTimeout(() => {
      if (usdtPerSol === 0) {
        console.log('Setting fallback SOL price after timeout');
        setUsdtPerSol(150);
        setLastPriceUpdate(new Date());
      }
    }, 3000);
    
    // Set up auto-refresh for SOL price every 30 seconds
    const priceInterval = setInterval(() => {
      fetchSolanaPrice();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(priceInterval);
      clearTimeout(fallbackTimeout);
    };
  }, [fetchSolanaPrice, usdtPerSol]);


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
      selectedShares: 0,
      totalShares: 0,
      sharePrice: 0,
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
      
      setFormData(prev => ({
        ...prev,
        locationDetails: {
          ...prev.locationDetails,
          sqft: business.location.minArea.toString(),
          costPerArea: '0', // Will be calculated based on total investment
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
    
    // Debug logging to see what values we're getting from the database
    console.log('Database values from franchiserLocation:', {
      selectedArea,
      minArea,
      baseFranchiseFee,
      baseSetupCost,
      baseWorkingCapital,
      locationData: formData.selectedBusiness.location
    });
    
    // The base values are already per-sqft rates, not total costs
    const setupCostPerSqft = baseSetupCost; // Already per sqft
    const workingCapitalPerSqft = baseWorkingCapital; // Already per sqft
    
    // Franchise fee is fixed, setup cost and working capital scale with area
    const franchiseFee = baseFranchiseFee; // Fixed
    const setupCost = Math.round(setupCostPerSqft * selectedArea);
    const workingCapital = Math.round(workingCapitalPerSqft * selectedArea);
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
      const defaultSelectedShares = Math.ceil(totalShares * 0.02); // Set default to 2% of total shares
      
      setFormData(prev => ({
        ...prev,
        investment: {
          ...prev.investment,
          ...calculatedInvestment,
          totalShares,
          sharePrice,
          selectedShares: defaultSelectedShares // Set default selected shares to 2%
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
    const minShares = totalShares > 0 ? Math.ceil(totalShares * 0.02) : 0; // Changed from 0.05 to 0.02 (2%)
    setFormData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        selectedShares: totalShares > 0 ? Math.min(Math.max(selectedShares, minShares), totalShares) : selectedShares
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
        
        // Check if carpet area meets minimum requirement
        const carpetArea = parseFloat(sqft) || 0;
        const minArea = formData.selectedBusiness?.location.minArea || 0;
        const areaValid = carpetArea >= minArea;
        
        if (isOwned) {
          return !!basicFields && !!userNumber && !!userEmail && areaValid;
        } else {
          return !!basicFields && !!landlordNumber && !!landlordEmail && areaValid;
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
    
    // Debug logging to see what business data we're selecting
    console.log('Selecting business:', {
      businessName: business.name,
      locationData: business.location,
      minArea: business.location.minArea,
      setupCost: business.location.setupCost,
      workingCapital: business.location.workingCapital,
      franchiseFee: business.location.franchiseFee
    });
    
    setFormData(prev => ({
      ...prev,
      selectedBusiness: business,
      locationDetails: {
        ...prev.locationDetails,
        costPerArea: business.location.minArea?.toString() || '100',
        sqft: business.location.minArea ? business.location.minArea.toString() : prev.locationDetails.sqft
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
                      <div className="mt-1 text-xs">
                        <div className="text-stone-500">
                          Min: {formData.selectedBusiness.location.minArea} sq ft
                          {parseFloat(formData.locationDetails.sqft) > formData.selectedBusiness.location.minArea && (
                            <span className="text-green-600 ml-2">
                              (+{((parseFloat(formData.locationDetails.sqft) / formData.selectedBusiness.location.minArea - 1) * 100).toFixed(0)}% larger)
                            </span>
                          )}
                        </div>
                        {parseFloat(formData.locationDetails.sqft) < formData.selectedBusiness.location.minArea && (
                          <div className="text-red-600 mt-1">
                            Area must be at least {formData.selectedBusiness.location.minArea} sq ft
                          </div>
                        )}
                      </div>
                    )}
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
                            • Setup Cost (${formData.selectedBusiness?.location.setupCost || 0} per sqft × {formData.locationDetails.sqft || '0'} sqft)
                          </span>
                          <span>${formData.investment.setupCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600 dark:text-stone-400">
                            • Working Capital (${formData.selectedBusiness?.location.workingCapital || 0} per sqft × {formData.locationDetails.sqft || '0'} sqft)
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
                             Setup Cost (${formData.selectedBusiness?.location.setupCost || 0} per sqft × {formData.locationDetails.sqft || '0'} sqft)
                           </span>
                           <span className="font-medium">${formData.investment.setupCost.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-stone-600 dark:text-stone-400">
                             Working Capital (${formData.selectedBusiness?.location.workingCapital || 0} per sqft × {formData.locationDetails.sqft || '0'} sqft)
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
                          <p className="text-xs text-stone-600 dark:text-stone-300">Minimum 2% of total shares</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-stone-900 dark:text-blue-100">{formData.investment.selectedShares.toLocaleString()} Shares</p>
                          <p className="text-sm text-stone-600 dark:text-stone-300">
                            {formData.investment.totalShares > 0 ? ((formData.investment.selectedShares / formData.investment.totalShares) * 100).toFixed(1) : 0}% of total
                          </p>
                        </div>
                      </div>
                      
                      <Slider
                        value={[formData.investment.selectedShares]}
                        min={formData.investment.totalShares > 0 ? Math.ceil(formData.investment.totalShares * 0.02) : 0}
                        max={formData.investment.totalShares || 0}
                        step={1}
                        onValueChange={([value]) => updateInvestment(value)}
                        className="w-full mb-6"
                        disabled={formData.investment.totalShares === 0}
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
                            min={formData.investment.totalShares > 0 ? Math.ceil(formData.investment.totalShares * 0.02) : 0}
                            max={formData.investment.totalShares || 0}
                            className="w-full p-2 border"
                          />
                        </div>
                      </div>
                    </div>
                      </div>
                    </div>

                {/* Payment Summary */}
                <div className="bg-stone-50 dark:bg-stone-800 p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Payment Summary</h4>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">1 SOL = ${usdtPerSol > 0 ? usdtPerSol.toFixed(2) : 'Loading...'} USDT</span>
                            <button
                              onClick={fetchSolanaPrice}
                              disabled={priceLoading}
                              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
                            >
                              {priceLoading ? (
                                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                '🔄'
                              )}
                            </button>
                          </div>
                          {lastPriceUpdate && (
                            <span className="text-xs text-stone-400">
                              Updated {lastPriceUpdate.toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
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
                            ≈ {usdtPerSol > 0 ? (formData.investment.selectedShares * formData.investment.sharePrice * 1.02 / usdtPerSol).toFixed(4) : 'Loading...'} SOL
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
                onClick={async () => {
                  if (!formData.selectedBusiness || !selectedLocation) {
                    toast.error('Please complete all required fields');
                    return;
                  }

                  if (!account?.address) {
                    toast.error('Please connect your wallet first');
                    return;
                  }

                  // Check if signer is available and has the required methods
                  if (!signer || !('signAndSendTransactions' in signer)) {
                    const errorMsg = (signer as { error?: { message?: string } })?.error?.message || 'Wallet signer not available';
                    toast.error(`Wallet error: ${errorMsg}. Please try reconnecting your wallet.`);
                    return;
                  }

                  // Check if signer is a mock signer (indicates wallet connection issues)
                  if ((signer as { isMock?: boolean })?.isMock) {
                    toast.error('Wallet connection issue detected. Please reconnect your wallet.');
                    return;
                  }

                  setLoading(true);
                  
                  try {
                    // Calculate payment breakdown
                    const subtotalAmount = formData.investment.selectedShares * formData.investment.sharePrice;
                    const platformFeeAmount = subtotalAmount * 0.02; // 2% platform fee
                    const totalInvestmentAmount = subtotalAmount + platformFeeAmount;
                    
                    const subtotalInSOL = subtotalAmount / usdtPerSol;
                    const platformFeeInSOL = platformFeeAmount / usdtPerSol;
                    const totalAmountInSOL = totalInvestmentAmount / usdtPerSol;
                    
                    console.log('Payment breakdown:', {
                      subtotal: subtotalAmount,
                      platformFee: platformFeeAmount,
                      total: totalInvestmentAmount,
                      subtotalSOL: subtotalInSOL,
                      platformFeeSOL: platformFeeInSOL,
                      totalSOL: totalAmountInSOL
                    });
                    
                    // Use gill for share purchase transaction
                    const { createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners } = await import('gill');
                    const { getTransferSolInstruction } = await import('gill/programs');
                    
                    const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
                    console.log('Latest blockhash:', latestBlockhash);
                    
                    // Get destination addresses
                    const brandWalletAddress = formData.selectedBusiness.brandWalletAddress;
                    if (!brandWalletAddress) {
                      console.error('Brand wallet address not found in business data:', formData.selectedBusiness);
                      throw new Error('Brand wallet address not found. Please ensure the franchiser has a registered wallet.');
                    }
                    
                    // Company wallet address for platform fees
                    const companyWalletAddress = '3M4FinDzudgSTLXPP1TAoB4yE2Y2jrKXQ4rZwbfizNpm';
                    
                    console.log('Transferring to:', {
                      brandWallet: brandWalletAddress,
                      companyWallet: companyWalletAddress,
                      subtotalSOL: subtotalInSOL,
                      platformFeeSOL: platformFeeInSOL
                    });
                    
                    // For now, use single transfer to brand wallet (fallback approach)
                    // TODO: Implement proper split transfer once we understand the gill library better
                    const transaction = createTransaction({
                      feePayer: signer,
                      version: 0,
                      latestBlockhash,
                      instructions: [
                        // Transfer total amount to brand wallet for now
                        getTransferSolInstruction({
                          amount: Math.round(totalAmountInSOL * 1000000000), // Convert to lamports
                          destination: brandWalletAddress as Address,
                          source: signer,
                        }),
                      ],
                    });

                    console.log('Transaction created, signing and sending...');
                    let transferSignature: string;
                    try {
                      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
                      transferSignature = getBase58Decoder().decode(signatureBytes);
                      console.log('Transfer signature:', transferSignature);

                      if (!transferSignature) {
                        throw new Error('Failed to purchase shares');
                      }

                      // Store platform fee transaction for company wallet tracking (will be updated after franchise creation)
                      const platformFeeTransaction = {
                        amount: platformFeeAmount,
                        from: formData.selectedBusiness.name,
                        timestamp: new Date().toISOString(),
                        description: `Platform fee from ${formData.selectedBusiness.name} franchise creation`,
                        transactionHash: transferSignature,
                        franchiseId: 'pending' // Will be updated after franchise creation
                      };
                      
                      const platformFeeKey = `platform_fee_${Date.now()}_pending`;
                      localStorage.setItem(platformFeeKey, JSON.stringify(platformFeeTransaction));
                      console.log('✅ Stored platform fee transaction in FranchiseCreate:', {
                        key: platformFeeKey,
                        transaction: platformFeeTransaction,
                        platformFeeAmount: platformFeeAmount
                      });

                      // Also add to income table
                      addToIncomeTable('platform_fee', platformFeeAmount, formData.selectedBusiness.name, `Platform fee from ${formData.selectedBusiness.name} franchise creation`, transferSignature);
                    } catch (error) {
                      if (error instanceof Error && error.message.includes('User rejected')) {
                        toast.error('Transaction cancelled by user');
                        return; // Exit early if user cancelled
                      }
                      throw error; // Re-throw other errors
                    }

                    // Only create franchise after successful payment
                    // Generate franchise slug
                    const franchiseSlug = await generateFranchiseSlug({
                      franchiserSlug: formData.selectedBusiness.slug
                    });

                    // Create franchise record with auto-approval and funding stage
                    const franchiseId = await createFranchise({
                      franchiserId: formData.selectedBusiness._id as Id<"franchiser">,
                      franchiseeId: account.address, // Use connected wallet address
                      locationId: formData.selectedBusiness.location._id as Id<"franchiserLocations">,
                      franchiseSlug,
                      businessName: `${formData.selectedBusiness.name} - ${formData.locationDetails.buildingName}`,
                      address: selectedLocation.address,
                      location: {
                        area: '',
                        city: 'Dubai', // Default city
                        state: 'Dubai', // Default state
                        country: 'UAE', // Default country
                        pincode: '',
                        coordinates: {
                          lat: selectedLocation.lat,
                          lng: selectedLocation.lng,
                        },
                      },
                      buildingName: formData.locationDetails.buildingName,
                      doorNumber: formData.locationDetails.doorNumber,
                      sqft: parseInt(formData.locationDetails.sqft),
                      isOwned: formData.locationDetails.isOwned,
                      landlordContact: formData.locationDetails.isOwned ? undefined : {
                        name: 'Landlord',
                        phone: formData.locationDetails.landlordNumber,
                        email: formData.locationDetails.landlordEmail,
                      },
                      franchiseeContact: {
                        name: 'Franchisee',
                        phone: formData.locationDetails.userNumber,
                        email: formData.locationDetails.userEmail,
                      },
                      investment: {
                        totalInvestment: formData.investment.totalInvestment,
                        totalInvested: 0, // Start with 0, will be updated by purchaseShares
                        sharesIssued: formData.investment.totalShares,
                        sharesPurchased: 0, // Start with 0, will be updated by purchaseShares
                        sharePrice: formData.investment.sharePrice,
                        franchiseFee: formData.investment.franchiseFee,
                        setupCost: formData.investment.setupCost,
                        workingCapital: formData.investment.workingCapital,
                        minimumInvestment: Math.ceil(formData.investment.totalShares * 0.02 * formData.investment.sharePrice), // 2% of total investment
                      },
                    });

                    // Update platform fee transaction with actual franchise ID
                    const platformFeeKey = `platform_fee_${Date.now()}_pending`;
                    const existingPlatformFee = localStorage.getItem(platformFeeKey);
                    if (existingPlatformFee) {
                      const platformFeeData = JSON.parse(existingPlatformFee);
                      platformFeeData.franchiseId = franchiseId;
                      platformFeeData.description = `Platform fee from ${formData.selectedBusiness.name} franchise creation (${franchiseSlug})`;
                      localStorage.setItem(platformFeeKey, JSON.stringify(platformFeeData));
                      console.log('Updated platform fee transaction with franchise ID:', platformFeeData);
                    }

                    // Store initial fundraising data (will be updated by purchaseShares)
                    const initialFundraisingData = {
                        totalInvestment: formData.investment.totalInvestment,
                        invested: 0, // Start with 0, will be updated by purchaseShares
                        totalShares: formData.investment.totalShares,
                        sharesIssued: 0, // Start with 0, will be updated by purchaseShares
                        sharesRemaining: formData.investment.totalShares,
                        pricePerShare: formData.investment.sharePrice,
                        franchiseFee: formData.investment.franchiseFee,
                        setupCost: formData.investment.setupCost,
                        workingCapital: formData.investment.workingCapital,
                        progressPercentage: 0, // Start with 0, will be updated by purchaseShares
                        stage: 'funding'
                    };
                    
                    // Clear any existing localStorage data for this franchise to prevent conflicts
                    localStorage.removeItem(`franchise_fundraising_${franchiseId}`);
                    
                    // Store the correct fundraising data
                    localStorage.setItem(`franchise_fundraising_${franchiseId}`, JSON.stringify(initialFundraisingData));
                    console.log('Stored initial fundraising data for franchise:', franchiseId, initialFundraisingData);

                    // Auto-approve the franchise and set to approved status
                    await updateFranchiseStatus({
                      franchiseId: franchiseId as Id<"franchises">,
                      status: 'approved',
                    });

                    // Set the franchise stage to funding
                    await updateFranchiseStage({
                      franchiseId: franchiseId as Id<"franchises">,
                      stage: 'funding',
                    });

                    // Create property record for admin management
                    const propertyId = await createProperty({
                      address: selectedLocation.address,
                      coordinates: {
                        lat: selectedLocation.lat,
                        lng: selectedLocation.lng,
                      },
                      buildingName: formData.locationDetails.buildingName,
                      doorNumber: formData.locationDetails.doorNumber,
                      sqft: parseInt(formData.locationDetails.sqft),
                      costPerSqft: parseFloat(formData.locationDetails.costPerArea) || 0,
                      propertyType: 'commercial', // Default to commercial
                      amenities: [], // Can be added later by admin
                      images: [], // Can be added later by admin
                      landlordContact: formData.locationDetails.isOwned ? {
                        name: formData.locationDetails.userNumber,
                        phone: formData.locationDetails.userNumber,
                        email: formData.locationDetails.userEmail,
                      } : {
                        name: 'Landlord',
                        phone: formData.locationDetails.landlordNumber,
                        email: formData.locationDetails.landlordEmail,
                      },
                      priority: 'medium',
                    });

                    // Update property stage to "rented" since franchise is auto-approved
                    await updatePropertyStage({
                      propertyId,
                      stage: 'rented',
                      franchiseId: franchiseId as Id<"franchises">,
                      franchiserId: formData.selectedBusiness._id as Id<"franchiser">,
                      notes: 'Property auto-approved for franchise creation - now in funding stage',
                      updatedBy: 'system-auto-approval',
                    });

                    // Update PDA with shares purchased
                    const { updatePDASharesIssued } = await import('@/lib/franchisePDA');
                    updatePDASharesIssued(franchiseId as string, formData.investment.selectedShares, subtotalAmount);

                    // Purchase shares - use subtotal amount (without platform fee) for consistency
                    await purchaseShares({
                      franchiseId: franchiseId as Id<"franchises">,
                      investorId: account.address,
                      sharesPurchased: formData.investment.selectedShares,
                      sharePrice: formData.investment.sharePrice,
                      totalAmount: subtotalAmount, // Use subtotal without platform fee
                      transactionHash: transferSignature,
                    });

                    // Create invoice
                    await createInvoice({
                      franchiseId: franchiseId as Id<"franchises">,
                      investorId: account.address,
                      invoiceNumber: `INV-${Date.now()}`,
                      amount: formData.investment.selectedShares * formData.investment.sharePrice * 1.02, // Including 2% service fee
                      currency: 'USD',
                      description: `Franchise investment for ${formData.selectedBusiness.name}`,
                      items: [
                        {
                          description: `Franchise shares (${formData.investment.selectedShares} shares)`,
                          quantity: formData.investment.selectedShares,
                          unitPrice: formData.investment.sharePrice,
                          total: formData.investment.selectedShares * formData.investment.sharePrice,
                        },
                        {
                          description: 'Service fee (2%)',
                          quantity: 1,
                          unitPrice: formData.investment.selectedShares * formData.investment.sharePrice * 0.02,
                          total: formData.investment.selectedShares * formData.investment.sharePrice * 0.02,
                        }
                      ],
                      dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
                    });

                    toast.success(`Franchise created! ${totalAmountInSOL.toFixed(4)} SOL transferred to ${formData.selectedBusiness.name} brand wallet.`);
                    // Navigate to franchise account page
                    router.push(`/${formData.selectedBusiness.slug}/${franchiseSlug}`);
                    
                  } catch (error) {
                    console.error('Error creating franchise:', error);
                    toast.error('Failed to create franchise. Please try again.');
                  } finally {
                    setLoading(false);
                  }
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

const FranchiseCreate: React.FC = () => {
  return (

      <GoogleMapsLoader>
        <FranchiseCreateInner />
      </GoogleMapsLoader>
  );
};

export default FranchiseCreate;
