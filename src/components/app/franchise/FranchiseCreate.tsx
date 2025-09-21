"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

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
    logoUrl: '/logos/burger-king.png',
    walletAddress: 'DummyWalletAddress123',
    industry: { name: 'Fast Food' },
    category: { name: 'Burgers' },
    costPerArea: 100,
    currency: 'USD',
    min_area: 500
  },
  {
    _id: '2',
    name: 'Starbucks',
    slug: 'starbucks',
    logoUrl: '/logos/starbucks.png',
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [conflictingLocation] = useState<boolean>(false);
  const usdtPerSol = 100; // Dummy exchange rate
  
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

  const filteredBusinesses = dummyBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (

      <Card className="w-full max-w-4xl mx-auto my-12 py-6">
        <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Franchise</h2>
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step 
                      ? 'bg-yellow-600 dark:bg-yellow-700 text-white' 
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {step}
                </div>
                {/* <span className="text-sm mt-2">
                  {step === 1 ? 'Business' : 
                   step === 2 ? 'Location' : 
                   step === 3 ? 'Details' : 'Investment'}
                </span> */}
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
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-4">
                {filteredBusinesses.map((business) => (
                  <div 
                    key={business._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedBusiness?._id === business._id 
                        ? 'border-stone-500 bg-stone-50 dark:border-stone-700 dark:bg-stone-700' 
                        : 'hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                    onClick={() => selectBusiness(business)}
                  >
                    <div className="flex items-center">
                      {business.logoUrl ? (
                        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center mr-4">
                          <Image 
                            src={business.logoUrl} 
                            alt={business.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center mr-4">
                          <Building className="h-6 w-6 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{business.name}</h4>
                        <p className="text-sm text-stone-600">
                          {business.industry?.name} • {business.category?.name}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          ${business.costPerArea} / sq ft
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Search for a location..."
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    className="w-full pl-10 pr-4 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="w-full h-96 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-700 rounded-full flex items-center justify-center mb-2">
                    <MapPin className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-stone-700 dark:text-stone-400 font-medium">Location Selected</p>
                  <p className="text-sm text-stone-500 mt-1">{formData.location?.address || 'No location selected'}</p>
                </div>
              </div>
              {formData.location && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-stone-700 rounded-lg">
                  <p className="font-medium">Selected Location:</p>
                  <p className="text-sm text-stone-700 dark:text-stone-400">{formData.location.address}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                  </p>
                </div>
              )}
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
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span className="sr-only">Toggle property ownership</span>
                        <span
                          className={`${
                            !formData.locationDetails.isOwned ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
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
                          className="w-full p-2 border rounded"
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
                          className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                {/* Investment Breakdown */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Investment Breakdown</h4>
                  <div className="bg-yellow-50 dark:bg-stone-700 p-4 rounded-lg">
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
                            className="w-full p-2 border rounded bg-stone-50"
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
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        
                      </div>
                    </div>

                    <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-lg">
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
                    router.push('/franchise/franchise-1/account');
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

export default FranchiseCreate;
