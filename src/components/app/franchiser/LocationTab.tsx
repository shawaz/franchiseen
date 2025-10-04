"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MapPin, 
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';
import MapComponent from '@/components/app/franchise/MapComponent';

// Country code mapping for Google Places API
const COUNTRY_CODE_MAP: Record<string, string> = {
  'United Arab Emirates': 'AE',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Ireland': 'IE',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Turkey': 'TR',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'Slovakia': 'SK',
  'Lithuania': 'LT',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Cyprus': 'CY',
  'Japan': 'JP',
  'South Korea': 'KR',
  'China': 'CN',
  'India': 'IN',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Thailand': 'TH',
  'Philippines': 'PH',
  'Indonesia': 'ID',
  'Vietnam': 'VN',
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Mexico': 'MX',
  'South Africa': 'ZA',
  'Egypt': 'EG',
  'Morocco': 'MA',
  'Tunisia': 'TN',
  'Algeria': 'DZ',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Ghana': 'GH',
  'Israel': 'IL',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Kuwait': 'KW',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Iraq': 'IQ',
  'Iran': 'IR',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Sri Lanka': 'LK',
  'Nepal': 'NP',
  'Bhutan': 'BT',
  'Maldives': 'MV',
  'Afghanistan': 'AF',
  'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ',
  'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ',
  'Turkmenistan': 'TM',
  'Mongolia': 'MN',
  'Russia': 'RU',
  'Ukraine': 'UA',
  'Belarus': 'BY',
  'Moldova': 'MD',
  'Georgia': 'GE',
  'Armenia': 'AM',
  'Azerbaijan': 'AZ',
  'New Zealand': 'NZ',
  'Fiji': 'FJ',
  'Papua New Guinea': 'PG',
  'Solomon Islands': 'SB',
  'Vanuatu': 'VU',
  'Samoa': 'WS',
  'Tonga': 'TO',
  'Kiribati': 'KI',
  'Tuvalu': 'TV',
  'Nauru': 'NR',
  'Palau': 'PW',
  'Marshall Islands': 'MH',
  'Micronesia': 'FM',
  'Cook Islands': 'CK',
  'Niue': 'NU',
  'Tokelau': 'TK',
  'Pitcairn Islands': 'PN',
  'Norfolk Island': 'NF',
  'Christmas Island': 'CX',
  'Cocos Islands': 'CC',
  'Heard Island': 'HM',
  'Macquarie Island': 'AU',
  'Bouvet Island': 'BV',
  'South Georgia': 'GS',
  'South Sandwich Islands': 'GS',
  'French Southern Territories': 'TF',
  'Antarctica': 'AQ',
  'Arctic': 'AQ',
  'Greenland': 'GL',
  'Faroe Islands': 'FO',
  'Iceland': 'IS',
  'Svalbard': 'SJ',
  'Jan Mayen': 'SJ',
  'Peter I Island': 'AQ',
  'Queen Maud Land': 'AQ',
  'Ross Dependency': 'AQ',
  'Australian Antarctic Territory': 'AQ',
  'Adélie Land': 'AQ',
  'Chilean Antarctic Territory': 'AQ',
  'Argentine Antarctica': 'AQ',
  'Norwegian Antarctic Territory': 'AQ',
  'Unclaimed Antarctic Territory': 'AQ'
};

interface Location {
  _id: string;
  country: string;
  city?: string;
  isNationwide: boolean;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
  minArea: number;
  isFinance?: boolean;
  licenseFile?: File | null;
  licensePreview?: string | null;
  cities?: string[];
  cityInput?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationData {
  isNationwide: boolean;
  cities: string[];
  cityInput: string;
  minArea: number;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
  isFinance?: boolean;
  licenseFile: File | null;
  licensePreview: string | null;
  status: 'available' | 'sold' | 'not_available';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationTabProps {
  locations: Location[];
  onUpdateLocation?: (locationId: string, updates: Partial<Location>) => void;
  onDeleteLocation?: (locationId: string) => void;
  onAddLocation?: (location: Omit<Location, '_id'>) => void;
}

export function LocationTab({ 
  locations
}: LocationTabProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<Record<string, LocationData>>({});
  const [showMapView, setShowMapView] = useState(false);
  const [mapCenter] = useState({ lat: 25.2048, lng: 55.2708 }); // Default to Dubai
  const [mapZoom, setMapZoom] = useState(12);

  // Helper function to get country code
  const getCountryCode = (countryName: string): string | undefined => {
    return COUNTRY_CODE_MAP[countryName];
  };

  // Helper function to normalize country names
  const normalizeCountryName = (countryName: string): string => {
    const countryAliases: Record<string, string> = {
      'UAE': 'United Arab Emirates',
      'USA': 'United States',
      'United States of America': 'United States',
      'America': 'United States',
      'UK': 'United Kingdom',
      'Great Britain': 'United Kingdom',
      'Britain': 'United Kingdom',
      'Emirates': 'United Arab Emirates',
    };
    
    return countryAliases[countryName] || countryName;
  };

  // Helper function to check if country is already selected
  const isCountryAlreadySelected = (countryName: string): boolean => {
    const normalizedName = normalizeCountryName(countryName);
    return selectedCountries.some(country => 
      normalizeCountryName(country) === normalizedName
    );
  };

  // Handle license file upload for a country
  const handleLicenseUpload = (country: string, file: File) => {
    // Check file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file for the license');
      return;
    }

    // Check file size (max 10MB for PDFs)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    // Create new file with brand URL as filename reference
    const fileExtension = file.name.split('.').pop();
    const newFileName = `brand-license-${country.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
    const renamedFile = new File([file], newFileName, { type: file.type });

    // Create preview URL for PDF
    const previewUrl = URL.createObjectURL(file);

    setLocationData(prev => ({
      ...prev,
      [country]: {
        ...prev[country],
        licenseFile: renamedFile,
        licensePreview: previewUrl,
      }
    }));
  };

  // Remove license file for a country
  const removeLicenseFile = (country: string) => {
    setLocationData(prev => {
      const countryData = prev[country];
      if (countryData?.licensePreview) {
        URL.revokeObjectURL(countryData.licensePreview);
      }
      return {
        ...prev,
        [country]: {
          ...countryData,
          licenseFile: null,
          licensePreview: null,
        }
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status color and text
  const getStatusInfo = (status: 'available' | 'sold' | 'not_available') => {
    switch (status) {
      case 'available':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Available' };
      case 'sold':
        return { color: 'text-red-600', bg: 'bg-red-100', text: 'Sold' };
      case 'not_available':
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Not Available' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };




  // Get map markers for all locations
  const getMapMarkers = () => {
    return selectedCountries.map(country => {
      const data = locationData[country];
      if (!data?.coordinates) return null;
      
      const statusInfo = getStatusInfo(data.status);
      
      return {
        id: country,
        position: data.coordinates,
        title: country,
        status: data.status,
        statusInfo,
        franchiseFee: data.franchiseFee,
        minArea: data.minArea,
      };
    }).filter((marker): marker is NonNullable<typeof marker> => marker !== null);
  };

  // Initialize selected countries from existing locations
  useEffect(() => {
    if (locations && locations.length > 0) {
      const countries = locations.map(loc => loc.country);
      setSelectedCountries(countries);
      
      // Initialize location data for existing locations
      const initialLocationData: Record<string, LocationData> = {};
      locations.forEach(location => {
        initialLocationData[location.country] = {
          isNationwide: location.isNationwide,
          cities: location.cities || [],
          cityInput: '',
          minArea: location.minArea,
          franchiseFee: location.franchiseFee,
          setupCost: location.setupCost,
          workingCapital: location.workingCapital,
          isFinance: location.isFinance,
          licenseFile: null,
          licensePreview: null,
          status: 'available',
          coordinates: location.coordinates || { lat: 25.2048, lng: 55.2708 },
        };
      });
      setLocationData(initialLocationData);
    }
  }, [locations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Locations</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Manage franchise locations and their requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowMapView(!showMapView)}
            variant={showMapView ? "default" : "outline"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {showMapView ? 'List View' : 'Map View'}
          </Button>
          <Button
            onClick={() => {
              // Add a new country to the list
              const newCountry = 'United States'; // Default country
              if (!isCountryAlreadySelected(newCountry)) {
                setSelectedCountries([...selectedCountries, newCountry]);
                setLocationData(prev => ({
                  ...prev,
                  [newCountry]: {
                    isNationwide: true,
                    cities: [],
                    cityInput: '',
                    minArea: 500,
                    franchiseFee: 25000,
                    setupCost: 150,
                    workingCapital: 100,
                    isFinance: false,
                    licenseFile: null,
                    licensePreview: null,
                    status: 'available',
                    coordinates: { lat: 25.2048, lng: 55.2708 },
                  }
                }));
              }
            }}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>
      </div>

      {/* Map View */}
      {showMapView && (
        <div className="space-y-4">

          {/* Map with Zoom Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-stone-900 dark:text-stone-100">Interactive Map</h4>
              <div className="flex gap-2">
                <Button
                  onClick={() => setMapZoom(prev => Math.min(prev + 2, 20))}
                  size="sm"
                  variant="outline"
                >
                  Zoom In
                </Button>
                <Button
                  onClick={() => setMapZoom(prev => Math.max(prev - 2, 1))}
                  size="sm"
                  variant="outline"
                >
                  Zoom Out
                </Button>
                <Button
                  onClick={() => setMapZoom(12)}
                  size="sm"
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="w-full h-[500px] bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden">
              <GoogleMapsLoader
                loadingFallback={
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-yellow-500"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-yellow-500 opacity-20"></div>
                    </div>
                    <span className="mt-4 text-sm text-stone-600 dark:text-stone-400 font-medium">Loading map...</span>
                  </div>
                }
                errorFallback={(error) => (
                  <div className="flex items-center justify-center h-full text-red-500">
                    Error loading map: {error.message}
                  </div>
                )}
              >
                <MapComponent
                  onLocationSelect={() => {}}
                  initialCenter={mapCenter}
                  selectedLocation={null}
                  markers={getMapMarkers()}
                  zoom={mapZoom}
                />
              </GoogleMapsLoader>
            </div>
          </div>

        </div>
      )}


      {/* Country Multi-select with Google Places */}
      {!showMapView && (
        <div className="space-y-2">
          <Label htmlFor="countries">Select Countries *</Label>
          <div className="relative">
            {/* Manual country selection as backup */}
            <div className="my-4">
              <div className="flex flex-wrap gap-2">
                {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'United Arab Emirates', 'India', 'Singapore', 'Japan'].map((country) => (
                  <Button
                    key={country}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isCountryAlreadySelected(country)) {
                        setSelectedCountries([...selectedCountries, country]);
                        setLocationData(prev => ({
                          ...prev,
                          [country]: {
                            isNationwide: true,
                            cities: [],
                            cityInput: '',
                            minArea: 500,
                            franchiseFee: 25000,
                            setupCost: 150,
                            workingCapital: 100,
                            isFinance: false,
                            licenseFile: null,
                            licensePreview: null,
                            status: 'available',
                            coordinates: { lat: 25.2048, lng: 55.2708 },
                          }
                        }));
                      }
                    }}
                    disabled={isCountryAlreadySelected(country)}
                    className="text-xs"
                  >
                    {country}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Country Cards */}
      {!showMapView && (
        <div className="space-y-4">
          {selectedCountries.map((country) => {
            const countryData = locationData[country];
            const statusInfo = getStatusInfo(countryData?.status || 'available');
            
            return (
              <Card key={country} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="p-0 flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{country}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${statusInfo.bg} ${statusInfo.color} text-xs`}>
                            {statusInfo.text}
                          </Badge>
                          <span className="text-sm text-stone-500">
                            {formatCurrency(countryData?.franchiseFee || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCountries(
                            selectedCountries.filter((c) => c !== country)
                          );
                          // Clean up location data
                          const countryData = locationData[country];
                          if (countryData?.licensePreview) {
                            URL.revokeObjectURL(countryData.licensePreview);
                          }
                          setLocationData(prev => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { [country]: _, ...rest } = prev;
                            return rest;
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
            <CardContent className="space-y-4 border-t pt-4">
              {/* License File Upload */}
              <div className="space-y-2">
                <Label htmlFor={`license-${country}`}>License Document (PDF) *</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border border-dashed dark:border-stone-600 flex items-center justify-center overflow-hidden">
                    {locationData[country]?.licensePreview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center mb-1">
                            PDF
                          </div>
                          <span className="text-xs text-stone-600">License</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLicenseFile(country)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 hover:bg-red-600 transition-colors z-10"
                          aria-label="Remove license"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-stone-400 mb-1" />
                        <span className="text-xs text-stone-500">PDF</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id={`license-${country}`}
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleLicenseUpload(country, file);
                        }
                      }}
                    />
                    <Label
                      htmlFor={`license-${country}`}
                      className="inline-flex items-center px-4 py-2 border text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {locationData[country]?.licenseFile ? 'Change License' : 'Upload License'}
                    </Label>
                    <p className="mt-1 text-xs text-stone-500">
                      PDF file, max 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Country Multi-select */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="countries">Select City *</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`available-nationwide-${country}`}>Available Nationwide</Label>
                    <Switch 
                      id={`available-nationwide-${country}`}
                      checked={locationData[country]?.isNationwide ?? true} 
                      onCheckedChange={(checked) => {
                        setLocationData(prev => ({
                          ...prev,
                          [country]: {
                            ...prev[country],
                            isNationwide: checked
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
                
                {!locationData[country]?.isNationwide && (
                  <>
                    {selectedCountries.length === 0 ? (
                      <div className="w-full p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        Please select a country first to search for cities
                      </div>
                    ) : (
                      <GoogleMapsLoader>
                        <PlacesAutocomplete
                          value={locationData[country]?.cityInput || ''}
                          onChange={(value) => {
                            setLocationData(prev => ({
                              ...prev,
                              [country]: {
                                ...prev[country],
                                cityInput: value
                              }
                            }));
                          }}
                          onPlaceSelect={(place) => {
                            const city = place.structured_formatting.main_text;
                            
                            if (!locationData[country]?.cities.includes(city)) {
                              setLocationData(prev => ({
                                ...prev,
                                [country]: {
                                  ...prev[country],
                                  cities: [...(prev[country]?.cities || []), city],
                                  cityInput: ''
                                }
                              }));
                            }
                          }}
                          placeholder={`Search for a city in ${country}...`}
                          types="(cities)"
                          componentRestrictions={getCountryCode(country) ? { 
                            country: getCountryCode(country) 
                          } : undefined}
                          className="w-full"
                        />
                      </GoogleMapsLoader>
                    )}

                    {/* Selected City List */}
                    {locationData[country]?.cities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {locationData[country].cities.map((city) => (
                          <Badge
                            key={city}
                            variant="secondary"
                            className="flex dark:hover:text-stone-400 hover:text-stone-600 dark:bg-stone-700 items-center gap-1"
                          >
                            {city}
                            <button
                              onClick={() => {
                                setLocationData(prev => ({
                                  ...prev,
                                  [country]: {
                                    ...prev[country],
                                    cities: prev[country].cities.filter((c) => c !== city)
                                  }
                                }));
                              }}
                              className="ml-1 text-stone-400 dark:text-stone-400 hover:text-stone-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <Label htmlFor="airplane-mode">Min Total Investment *</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="airplane-mode">Update Investment</Label>
                  <Switch id="airplane-mode" 
                    checked={locationData[country]?.isFinance || false}
                    onCheckedChange={(checked) => {
                      setLocationData(prev => ({
                        ...prev,
                        [country]: {
                          ...prev[country],
                          isFinance: checked
                        }
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <h2 className="font-bold">{locationData[country]?.minArea || 500} sq.ft</h2>
                <h2 className="font-bold">${locationData[country]?.franchiseFee || 50000}</h2>
              </div>
             
              {locationData[country]?.isFinance && (
                <div className="mt-4 border-t pt-4">
                  {/* Single Row Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Minimum Carpet Area */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="minCarpetArea" className="text-xs font-medium">Min. Area *</Label>
                        <span className="text-xs text-stone-500">
                          {locationData[country]?.minArea ? `${locationData[country].minArea.toLocaleString()} sq.ft` : '0'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          id="minCarpetArea"
                          type="number"
                          min="100"
                          step="50"
                          value={locationData[country]?.minArea || ''}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue === '') {
                              setLocationData(prev => ({
                                ...prev,
                                [country]: {
                                  ...prev[country],
                                  minArea: 0
                                }
                              }));
                            } else {
                              const numValue = parseInt(inputValue);
                              if (!isNaN(numValue)) {
                                setLocationData(prev => ({
                                  ...prev,
                                  [country]: {
                                    ...prev[country],
                                    minArea: numValue
                                  }
                                }));
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue !== '') {
                              const numValue = parseInt(inputValue);
                              if (!isNaN(numValue) && numValue < 100) {
                                setLocationData(prev => ({
                                  ...prev,
                                  [country]: {
                                    ...prev[country],
                                    minArea: 100
                                  }
                                }));
                              }
                            }
                          }}
                          placeholder="500"
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-stone-400">Min. space required</p>
                    </div>

                    {/* Franchise Fee */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="franchiseFee" className="text-xs font-medium">Franchise Fee *</Label>
                        <span className="text-xs text-stone-500">
                          {locationData[country]?.franchiseFee ? `$${locationData[country].franchiseFee.toLocaleString()}` : '$0'}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                        <Input
                          id="franchiseFee"
                          type="number"
                          min="0"
                          step="1000"
                          value={locationData[country]?.franchiseFee || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Math.max(0, parseFloat(e.target.value)) : '';
                            setLocationData(prev => ({
                              ...prev,
                              [country]: {
                                ...prev[country],
                                franchiseFee: value as number
                              }
                            }));
                          }}
                          className="pl-6 h-9 text-sm"
                          placeholder="25,000"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-stone-400">One-time fee</p>
                    </div>

                    {/* Setup Cost */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="setupCostPerSqft" className="text-xs font-medium">Setup Cost *</Label>
                        <span className="text-xs text-stone-500">
                          {locationData[country]?.setupCost ? `$${locationData[country].setupCost}` : '$0'}/sq.ft
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                        <Input
                          id="setupCostPerSqft"
                          type="number"
                          min="0"
                          step="10"
                          value={locationData[country]?.setupCost || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Math.max(0, parseFloat(e.target.value)) : '';
                            setLocationData(prev => ({
                              ...prev,
                              [country]: {
                                ...prev[country],
                                setupCost: value as number
                              }
                            }));
                          }}
                          className="pl-6 h-9 text-sm"
                          placeholder="150"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {locationData[country]?.minArea && locationData[country]?.setupCost ? 
                          `Total: $${(locationData[country].minArea * locationData[country].setupCost).toLocaleString()}` : 
                          'Per sq.ft, one-time'}
                      </p>
                    </div>

                    {/* Working Capital */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="workingCapitalPerSqft" className="text-xs font-medium">Working Capital *</Label>
                        <span className="text-xs text-stone-500">
                          {locationData[country]?.workingCapital ? `$${locationData[country].workingCapital}` : '$0'}/sq.ft
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                        <Input
                          id="workingCapitalPerSqft"
                          type="number"
                          min="0"
                          step="5"
                          value={locationData[country]?.workingCapital || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Math.max(0, parseFloat(e.target.value)) : '';
                            setLocationData(prev => ({
                              ...prev,
                              [country]: {
                                ...prev[country],
                                workingCapital: value as number
                              }
                            }));
                          }}
                          className="pl-6 h-9 text-sm"
                          placeholder="100"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {locationData[country]?.minArea && locationData[country]?.workingCapital ? 
                          `1 Year: $${(locationData[country].minArea * locationData[country].workingCapital).toLocaleString()}` : 
                          'Per sq.ft, 1 year'}
                      </p>
                    </div>
                  </div>

                  {/* Total Investment Summary */}
                  <div className="mt-8 p-6 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
                    <h4 className="font-semibold text-lg mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Total Minimum Investment
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-stone-600 dark:text-stone-300">Franchise Fee</span>
                        <span className="font-medium">
                          ${(locationData[country]?.franchiseFee || 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-stone-600 dark:text-stone-300">
                          Setup Cost
                          {locationData[country]?.minArea && (
                            <span className="text-xs text-stone-500 block">
                              ({locationData[country].minArea.toLocaleString()} sq.ft × ${locationData[country]?.setupCost || 0}/sq.ft)
                            </span>
                          )}
                        </span>
                        <span className="font-medium">
                          ${(locationData[country]?.minArea && locationData[country]?.setupCost ? locationData[country].minArea * locationData[country].setupCost : 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-stone-600 dark:text-stone-300">
                          Working Capital (1 Year)
                          {locationData[country]?.minArea && (
                            <span className="text-xs text-stone-500 block">
                              ({locationData[country].minArea.toLocaleString()} sq.ft × ${locationData[country]?.workingCapital || 0}/sq.ft)
                            </span>
                          )}
                        </span>
                        <span className="font-medium">
                          ${(locationData[country]?.minArea && locationData[country]?.workingCapital ? locationData[country].minArea * locationData[country].workingCapital : 0).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="border-t border-stone-200 dark:border-stone-700 pt-3 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Investment</span>
                          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                            ${
                              (
                                (locationData[country]?.franchiseFee || 0) +
                                (locationData[country]?.minArea && locationData[country]?.setupCost ? locationData[country].minArea * locationData[country].setupCost : 0) +
                                (locationData[country]?.minArea && locationData[country]?.workingCapital ? locationData[country].minArea * locationData[country].workingCapital : 0)
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              })
                            }
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-2">
                          This is the estimated minimum investment required to open this franchise location.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {selectedCountries.length === 0 && !showMapView && (
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400 mb-2">
              No locations added yet
            </h3>
            <p className="text-stone-500 dark:text-stone-500 mb-4">
              Add your first franchise location to get started
            </p>
            <Button
              onClick={() => {
                const newCountry = 'United States';
                setSelectedCountries([newCountry]);
                setLocationData(prev => ({
                  ...prev,
                  [newCountry]: {
                    isNationwide: true,
                    cities: [],
                    cityInput: '',
                    minArea: 500,
                    franchiseFee: 25000,
                    setupCost: 150,
                    workingCapital: 100,
                    isFinance: false,
                    licenseFile: null,
                    licensePreview: null,
                    status: 'available',
                    coordinates: { lat: 25.2048, lng: 55.2708 },
                  }
                }));
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map View Empty State */}
      {selectedCountries.length === 0 && showMapView && (
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400 mb-2">
              No locations to display on map
            </h3>
            <p className="text-stone-500 dark:text-stone-500 mb-4">
              Add locations to see them on the map
            </p>
            <Button
              onClick={() => {
                const newCountry = 'United States';
                setSelectedCountries([newCountry]);
                setLocationData(prev => ({
                  ...prev,
                  [newCountry]: {
                    isNationwide: true,
                    cities: [],
                    cityInput: '',
                    minArea: 500,
                    franchiseFee: 25000,
                    setupCost: 150,
                    workingCapital: 100,
                    isFinance: false,
                    licenseFile: null,
                    licensePreview: null,
                    status: 'available',
                    coordinates: { lat: 25.2048, lng: 55.2708 },
                  }
                }));
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
