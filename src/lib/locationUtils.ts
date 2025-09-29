// Utility functions for location handling

export interface LocationInfo {
  country: string;
  city?: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Extract country and city from a Google Places address
 * Enhanced to better match database entries
 */
export const extractLocationInfo = (address: string): { country: string; city?: string } => {
  console.log("Extracting location from address:", address);
  
  const parts = address.split(',').map(part => part.trim());
  console.log("Address parts:", parts);
  
  // Country mapping for better matching
  const countryMappings: Record<string, string> = {
    'India': 'India',
    'IN': 'India',
    'United Arab Emirates': 'UAE',
    'UAE': 'UAE',
    'AE': 'UAE',
    'United States': 'US',
    'USA': 'US',
    'US': 'US',
    'United Kingdom': 'UK',
    'UK': 'UK',
    'GB': 'UK',
  };
  
  // Common city patterns in addresses
  const cityPatterns = [
    'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur',
    'Mangalore', 'Mangaluru', 'Mysore', 'Mysuru', 'Hubli', 'Dharwad', 'Belgaum', 'Belagavi',
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Liverpool'
  ];
  
  let country = 'Unknown';
  let city: string | undefined;
  
  // Look for country in the last few parts
  for (let i = parts.length - 1; i >= Math.max(0, parts.length - 3); i--) {
    const part = parts[i];
    if (countryMappings[part]) {
      country = countryMappings[part];
      break;
    }
  }
  
  // If no country found in mappings, try to extract from the last part
  if (country === 'Unknown' && parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    // Check if the last part contains country names
    if (lastPart.toLowerCase().includes('india')) {
      country = 'India';
    } else if (lastPart.toLowerCase().includes('united arab emirates') || lastPart.toLowerCase().includes('uae')) {
      country = 'UAE';
    } else if (lastPart.toLowerCase().includes('united states') || lastPart.toLowerCase().includes('usa')) {
      country = 'US';
    } else {
      country = lastPart;
    }
  }
  
  // Look for city in all parts
  for (const part of parts) {
    const normalizedPart = part.replace(/\s+(City|Town|Village|District|Area|State|Province)$/i, '').trim();
    
    // Check if this part contains any known city
    for (const pattern of cityPatterns) {
      if (normalizedPart.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(normalizedPart.toLowerCase())) {
        city = pattern; // Use the standard city name
        break;
      }
    }
    
    if (city) break;
  }
  
  // If no city found with patterns, try to use the second to last part if it looks like a city
  if (!city && parts.length >= 2) {
    const secondLastPart = parts[parts.length - 2];
    if (secondLastPart && 
        !secondLastPart.match(/^\d+$/) && 
        !secondLastPart.match(/^\d+\s*[A-Za-z]+$/) &&
        !secondLastPart.includes('Street') &&
        !secondLastPart.includes('Road') &&
        !secondLastPart.includes('Avenue') &&
        !secondLastPart.includes('Lane')) {
      city = secondLastPart.replace(/\s+(City|Town|Village|District|Area|State|Province)$/i, '').trim();
    }
  }
  
  console.log("Extracted location info:", { country, city });
  return { country, city };
};

/**
 * Map country names to common variations for better matching
 */
export const normalizeCountryName = (country: string): string => {
  const countryMap: Record<string, string> = {
    'United States': 'US',
    'United States of America': 'US',
    'USA': 'US',
    'United Arab Emirates': 'UAE',
    'UAE': 'UAE',
    'AE': 'UAE',
    'United Kingdom': 'UK',
    'UK': 'UK',
    'GB': 'UK',
    'Great Britain': 'UK',
    'India': 'India',
    'IN': 'India',
    // Add more mappings as needed
  };
  
  return countryMap[country] || country;
};

/**
 * Map city names to common variations for better matching
 */
export const normalizeCityName = (city: string): string => {
  // City name mappings for better matching
  const cityMap: Record<string, string> = {
    'Bengaluru': 'Bangalore',
    'Mangaluru': 'Mangalore',
    'Mysuru': 'Mysore',
    'Belagavi': 'Belgaum',
    'Abu Dhabi': 'Abu Dhabi',
    'Ras Al Khaimah': 'Ras Al Khaimah',
    'Umm Al Quwain': 'Umm Al Quwain',
  };
  
  // Remove common suffixes and normalize
  const normalizedCity = city
    .replace(/\s+(City|Town|Village|District|Area)$/i, '')
    .trim();
  
  // Apply city mappings
  return cityMap[normalizedCity] || normalizedCity;
};
