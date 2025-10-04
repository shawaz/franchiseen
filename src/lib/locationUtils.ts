// Utility functions for location management

export interface SoldLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  country: string;
  franchiseFee: number;
  minArea: number;
  soldAt: number;
}

// Calculate distance between two points in kilometers using Haversine formula
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Check if a location is within 1km of any sold location
export const isWithinSoldRadius = (lat: number, lng: number, soldLocations: SoldLocation[]): boolean => {
  return soldLocations.some(soldLocation => 
    calculateDistance(lat, lng, soldLocation.lat, soldLocation.lng) < 1
  );
};

// Extract country from address
export const extractCountryFromAddress = (address: string): string => {
  if (address.toLowerCase().includes('dubai') || 
      address.toLowerCase().includes('united arab emirates') ||
      address.toLowerCase().includes('uae')) {
    return 'United Arab Emirates';
  }
  
  // Add more country detection logic as needed
  const addressLower = address.toLowerCase();
  
  // Check for other countries
  const countryMappings = [
    { keywords: ['united states', 'usa', 'us'], name: 'United States' },
    { keywords: ['united kingdom', 'uk', 'britain'], name: 'United Kingdom' },
    { keywords: ['canada'], name: 'Canada' },
    { keywords: ['australia'], name: 'Australia' },
    { keywords: ['germany'], name: 'Germany' },
    { keywords: ['france'], name: 'France' },
    { keywords: ['india'], name: 'India' },
    { keywords: ['singapore'], name: 'Singapore' },
    { keywords: ['japan'], name: 'Japan' },
  ];
  
  for (const mapping of countryMappings) {
    if (mapping.keywords.some(keyword => addressLower.includes(keyword))) {
      return mapping.name;
    }
  }
  
  return 'Unknown Country';
};

// Extract location info from address string
export const extractLocationInfo = (address: string): { country: string; city?: string } => {
  const addressLower = address.toLowerCase();
  
  // Extract country
  let country = 'Unknown Country';
  if (addressLower.includes('dubai') || 
      addressLower.includes('united arab emirates') ||
      addressLower.includes('uae')) {
    country = 'United Arab Emirates';
  } else {
    const countryMappings = [
      { keywords: ['united states', 'usa', 'us'], name: 'United States' },
      { keywords: ['united kingdom', 'uk', 'britain'], name: 'United Kingdom' },
      { keywords: ['canada'], name: 'Canada' },
      { keywords: ['australia'], name: 'Australia' },
      { keywords: ['germany'], name: 'Germany' },
      { keywords: ['france'], name: 'France' },
      { keywords: ['india'], name: 'India' },
      { keywords: ['singapore'], name: 'Singapore' },
      { keywords: ['japan'], name: 'Japan' },
    ];
    
    for (const mapping of countryMappings) {
      if (mapping.keywords.some(keyword => addressLower.includes(keyword))) {
        country = mapping.name;
        break;
      }
    }
  }
  
  // Extract city (basic implementation)
  let city: string | undefined;
  const cityPatterns = [
    /dubai/i,
    /abu dhabi/i,
    /sharjah/i,
    /new york/i,
    /london/i,
    /toronto/i,
    /sydney/i,
    /berlin/i,
    /paris/i,
    /mumbai/i,
    /singapore/i,
    /tokyo/i,
  ];
  
  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      city = match[0];
      break;
    }
  }
  
  return { country, city };
};

// Normalize country name to standard format
export const normalizeCountryName = (country: string): string => {
  const countryMappings: Record<string, string> = {
    'usa': 'United States',
    'us': 'United States',
    'united states of america': 'United States',
    'uk': 'United Kingdom',
    'britain': 'United Kingdom',
    'great britain': 'United Kingdom',
    'uae': 'United Arab Emirates',
    'united arab emirates': 'United Arab Emirates',
    'emirates': 'United Arab Emirates',
  };
  
  const normalized = countryMappings[country.toLowerCase()];
  return normalized || country;
};

// Normalize city name to standard format
export const normalizeCityName = (city: string): string => {
  const cityMappings: Record<string, string> = {
    'nyc': 'New York',
    'ny': 'New York',
    'new york city': 'New York',
    'la': 'Los Angeles',
    'los angeles': 'Los Angeles',
    'sf': 'San Francisco',
    'san francisco': 'San Francisco',
    'london': 'London',
    'toronto': 'Toronto',
    'sydney': 'Sydney',
    'berlin': 'Berlin',
    'paris': 'Paris',
    'mumbai': 'Mumbai',
    'bombay': 'Mumbai',
    'singapore': 'Singapore',
    'tokyo': 'Tokyo',
    'dubai': 'Dubai',
    'abu dhabi': 'Abu Dhabi',
    'sharjah': 'Sharjah',
  };
  
  const normalized = cityMappings[city.toLowerCase()];
  return normalized || city;
};

// Validate location selection (check if within sold radius)
export const validateLocationSelection = (
  lat: number, 
  lng: number, 
  soldLocations: SoldLocation[]
): { isValid: boolean; message?: string } => {
  if (isWithinSoldRadius(lat, lng, soldLocations)) {
    return {
      isValid: false,
      message: 'This location is within 1km of an existing sold location. Please select a different location.'
    };
  }
  
  return { isValid: true };
};