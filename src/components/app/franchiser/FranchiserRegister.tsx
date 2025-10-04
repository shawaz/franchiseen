"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, ArrowLeft, ArrowRight, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { useCreateFranchiserWithDetails } from '@/hooks/useFranchises';
import { useFileUpload } from '@/hooks/useFileUpload';
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import { useMasterData } from '@/hooks/useMasterData';
import { useAuth } from '@/contexts/AuthContext';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';

// Reserved words that cannot be used as brand URLs
const RESERVED_WORDS = [
  'account', 'admin', 'like', 'notify', 'create', 'register', 'company',
  'api', 'www', 'mail', 'ftp', 'blog', 'support', 'help', 'about',
  'contact', 'privacy', 'terms', 'legal', 'security', 'login', 'signup',
  'dashboard', 'profile', 'settings', 'billing', 'payment', 'checkout',
  'cart', 'shop', 'store', 'product', 'search', 'filter', 'sort',
  'home', 'index', 'main', 'app', 'mobile', 'desktop', 'web'
];

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

// Define types for our data
type LocationFinance = {
  minCarpetArea: number | '';
  franchiseFee: number | '';
  setupCostPerSqft: number | '';
  workingCapitalPerSqft: number | '';
};

type Location = {
  id: string;
  country: string;
  registrationFile: File | null;
  registrationPreview: string | null;
  availableNationwide: boolean;
  selectedCities: string[];
  customFinance: boolean;
  finance: LocationFinance;
};

type FormData = {
  brandName: string;
  brandUrl: string;
  industry: string;
  category: string;
  franchiseType: 'FOCO' | 'FOFO' | 'BOTH';
  shortDescription: string;
  website: string;
  timingPerWeek: {
    is24Hours: boolean;
    days: string[];
    startTime: string;
    endTime: string;
  };
  logoFile: File | null;
  logoPreview: string | null;
  // Financial Information
  minCarpetArea: number | '';
  franchiseFee: number | '';
  setupCostPerSqft: number | '';
  workingCapitalPerSqft: number | '';
  royaltyPercentage: number | '';
  marketingPercentage: number | '';
  // Locations
  locations: Location[];
};


// Industries and categories will be loaded from Convex database

const FranchiserRegister: React.FC = () => {
  const router = useRouter();
  // const { account } = useWalletUi(); // Commented out as not used
  const { userProfile } = useAuth();
  const createFranchiserWithDetails = useCreateFranchiserWithDetails();
  const { uploadFile, uploadMultipleFiles } = useFileUpload();
  
  // Load master data from Convex
  const { industries, categories, productCategories, isLoading: masterDataLoading } = useMasterData();
  // const { hierarchicalData } = useHierarchicalData(); // Commented out as it's not used

  // Removed real-time URL availability checking for simplicity

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

  // Validation helper functions
  const validateWebsite = (website: string): boolean => {
    try {
      // Add protocol if missing
      const url = website.startsWith('http') ? website : `https://${website}`;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate brand URL
  const validateBrandUrl = (url: string): { isValid: boolean; error?: string } => {
    if (!url) {
      return { isValid: false, error: 'Brand URL is required' };
    }

    // Check for invalid characters
    if (!/^[a-z0-9-]+$/.test(url)) {
      return { isValid: false, error: 'Only lowercase letters, numbers, and hyphens are allowed' };
    }

    // Check if it starts or ends with hyphen
    if (url.startsWith('-') || url.endsWith('-')) {
      return { isValid: false, error: 'URL cannot start or end with a hyphen' };
    }

    // Check for consecutive hyphens
    if (url.includes('--')) {
      return { isValid: false, error: 'URL cannot contain consecutive hyphens' };
    }

    // Check minimum length
    if (url.length < 3) {
      return { isValid: false, error: 'URL must be at least 3 characters long' };
    }

    // Check maximum length
    if (url.length > 50) {
      return { isValid: false, error: 'URL must be less than 50 characters' };
    }

    // Check against reserved words
    if (RESERVED_WORDS.includes(url.toLowerCase())) {
      return { isValid: false, error: 'This URL is reserved and cannot be used' };
    }

    return { isValid: true };
  };

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<{
    website?: string;
    brandUrl?: string;
  }>({});

  // Simplified URL validation state
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    brandName: '',
    brandUrl: '',
    industry: '',
    category: '',
    franchiseType: 'FOCO',
    shortDescription: '',
    website: '',
    timingPerWeek: {
      is24Hours: false,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00'
    },
    logoFile: null,
    logoPreview: null,
    // Financial Information
    minCarpetArea: '',
    franchiseFee: '',
    setupCostPerSqft: '',
    workingCapitalPerSqft: '',
    royaltyPercentage: '',
    marketingPercentage: '',
    // Locations
    locations: []
  });

  // Get names for selected industry and category (commented out as not currently used)
  // const selectedIndustry = useIndustryById(formData.industry as Id<"industries"> | undefined);
  // const selectedCategory = useCategoryById(formData.category as Id<"categories"> | undefined);

  // Helper function to get product category name by ID
  const getProductCategoryName = (categoryId: string) => {
    if (!categoryId || categoryId === 'none') return 'None';
    const category = productCategories?.find(cat => cat._id === categoryId);
    return category?.name || categoryId;
  };
  
  // State for the new location being added (temporary state for the form)
  // const [isFinance, setIsFinance] = useState<boolean>(false); // Commented out as it's not used
  // const [countryInput, setCountryInput] = useState(''); // Commented out as not used
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  
  // State for location-specific data
  const [locationData, setLocationData] = useState<Record<string, {
    isNationwide: boolean;
    cities: string[];
    cityInput: string;
    minArea: number;
    franchiseFee: number;
    setupCost: number;
    workingCapital: number;
    isFinance: boolean;
    licenseFile: File | null;
    licensePreview: string | null;
  }>>({});
  
  // State for file upload drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [interiorPhotos, setInteriorPhotos] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  
  // State for products
  type Product = {
    id: string;
    name: string;
    category: string;
    description: string;
    cost: string;
    margin: string;
    price: string;
    photo: {
      file: File | null;
      preview: string;
    } | null;
  };

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '', category: 'none', description: '', cost: '', margin: '', price: '', photo: null },
    { id: '2', name: '', category: 'none', description: '', cost: '', margin: '', price: '', photo: null }
  ]);
  
  // Handle interior photos upload
  const handleInteriorFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, PNG are allowed.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });
    
    const newPhotos = await Promise.all(validFiles.map(async (file, index) => {
      // Create new file with brand URL as filename reference
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${formData.brandUrl || 'brand'}-interior-${index + 1}.${fileExtension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      // Create preview URL using FileReader as base64 (more reliable)
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(file);
      });
      
      console.log('Created preview URL using FileReader:', {
        originalFile: file,
        renamedFile: renamedFile,
        previewUrl: previewUrl.substring(0, 50) + '...',
        fileType: file.type,
        fileSize: file.size,
        isDataUrl: previewUrl.startsWith('data:')
      });
      
      return {
        id: Math.random().toString(36).substring(7),
        file: renamedFile,
        preview: previewUrl
      };
    }));
    
    setInteriorPhotos(prev => {
      const updated = [...prev, ...newPhotos];
      // Limit to 10 photos max
      console.log('Interior photos updated:', updated);
      return updated.slice(0, 10);
    });
  };

  // Clean up when component unmounts (data URLs don't need explicit cleanup)
  useEffect(() => {
    return () => {
      // Data URLs are automatically garbage collected, no cleanup needed
      console.log('Component unmounting, cleaning up interior photos');
    };
  }, []);

  // Remove interior photo
  const removeInteriorPhoto = (id: string) => {
    setInteriorPhotos(prev => {
      return prev.filter(photo => photo.id !== id);
    });
  };

  // Add a new product
  const addProduct = () => {
    setProducts(prev => [
      ...prev,
      { 
        id: Math.random().toString(36).substring(7),
        name: '',
        category: 'none',
        description: '',
        cost: '',
        margin: '',
        price: '',
        photo: null
      }
    ]);
  };

  // Remove a product
  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Update product field
  const updateProduct = (id: string, field: string, value: string | number | { file: File | null; preview: string } | null) => {
    setProducts(prev =>
      prev.map(product => {
        if (product.id === id) {
          if (field === 'photo' && value === undefined) {
            // Handle photo removal
            return { ...product, photo: null };
          }
          
          // Calculate price when cost or margin changes
          if (field === 'cost' || field === 'margin') {
            const updatedProduct = { ...product, [field]: value };
            const cost = field === 'cost' ? parseFloat(value as string) || 0 : parseFloat(product.cost) || 0;
            const margin = field === 'margin' ? parseFloat(value as string) || 0 : parseFloat(product.margin) || 0;
            const price = cost + (cost * margin / 100);
            return { ...updatedProduct, price: price.toFixed(2) };
          }
          
          // Handle other field updates
          return { ...product, [field]: value };
        }
        return product;
      })
    );
  };

  // Handle product photo upload
  const handleProductPhoto = async (productId: string, file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Only JPG, PNG are allowed.`);
      return;
    }
    
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is 5MB.`);
      return;
    }
    
    // Create preview URL using FileReader as base64 (consistent with interior photos)
    const previewUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
    
    setProducts(prev =>
      prev.map(product => {
        if (product.id === productId) {
          // Create new file with brand URL as filename reference, product name, and category
          const fileExtension = file.name.split('.').pop();
          const productName = product.name ? product.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'product';
          const productCategory = product.category && product.category !== 'none' ? product.category.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'uncategorized';
          const newFileName = `${formData.brandUrl || 'brand'}-${productName}-${productCategory}-${productId}.${fileExtension}`;
          const renamedFile = new File([file], newFileName, { type: file.type });
          
          return {
            ...product,
            photo: {
              file: renamedFile,
              preview: previewUrl
            }
          };
        }
        return product;
      })
    );
  };

  // Update interior photos when brand URL changes
  useEffect(() => {
    if (formData.brandUrl && interiorPhotos.length > 0) {
      setInteriorPhotos(prev => 
        prev.map((photo, index) => {
          const fileExtension = photo.file.name.split('.').pop();
          const newFileName = `${formData.brandUrl}-interior-${index + 1}.${fileExtension}`;
          const renamedFile = new File([photo.file], newFileName, { type: photo.file.type });
          
          return {
            ...photo,
            file: renamedFile
          };
        })
      );
    }
  }, [formData.brandUrl, interiorPhotos.length]);

  // Update product photos when brand URL changes
  useEffect(() => {
    if (formData.brandUrl && products.length > 0) {
      setProducts(prev => 
        prev.map(product => {
          if (product.photo && product.photo.file) {
            const fileExtension = product.photo.file.name.split('.').pop();
            const productName = product.name ? product.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'product';
            const productCategory = product.category && product.category !== 'none' ? product.category.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'uncategorized';
            const newFileName = `${formData.brandUrl}-${productName}-${productCategory}-${product.id}.${fileExtension}`;
            const renamedFile = new File([product.photo.file], newFileName, { type: product.photo.file.type });
            
            return {
              ...product,
              photo: {
                ...product.photo,
                file: renamedFile
              }
            };
          }
          return product;
        })
      );
    }
  }, [formData.brandUrl, products.length]);

  // Clean up when component unmounts (data URLs don't need explicit cleanup)
  useEffect(() => {
    return () => {
      // Data URLs are automatically garbage collected, no cleanup needed
      console.log('Component unmounting, cleaning up photos');
    };
  }, []);


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
    const newFileName = `${formData.brandUrl || 'brand'}-license-${country.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
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

  // Generate URL slug from brand name
  const generateSlugFromBrandName = (brandName: string): string => {
    return brandName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Simple URL validation on change
  useEffect(() => {
    if (!formData.brandUrl) {
      setUrlValidationError(null);
      setValidationErrors(prev => ({ ...prev, brandUrl: undefined }));
      return;
    }

    // Validate URL format
    const validation = validateBrandUrl(formData.brandUrl);
    if (!validation.isValid) {
      setUrlValidationError(validation.error || 'Invalid URL format');
      setValidationErrors(prev => ({ ...prev, brandUrl: validation.error }));
    } else {
      setUrlValidationError(null);
      setValidationErrors(prev => ({ ...prev, brandUrl: undefined }));
    }
  }, [formData.brandUrl]);

  // Update brand URL when brand name changes
  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.value;
    const brandUrl = generateSlugFromBrandName(name);
    
    setFormData(prev => ({
      ...prev,
      brandName: name,
      brandUrl: brandUrl
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      logoFile: file,
      logoPreview: previewUrl
    }));
  };


  // Remove logo
  const removeLogo = (): void => {
    if (formData.logoPreview) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    setFormData(prev => ({
      ...prev,
      logoFile: null,
      logoPreview: null,
      brandUrl: '' // Clear brandUrl when logo is removed
    }));
  };

  // Get available categories based on selected industry
  const availableCategories = useMemo(() => {
    if (!categories || !formData.industry) return [];
    return categories.filter(cat => cat.industryId === formData.industry);
  }, [categories, formData.industry]);

  // Get available product categories based on selected category
  const availableProductCategories = useMemo(() => {
    if (!productCategories || !formData.category) return [];
    return productCategories.filter(pc => pc.categoryId === formData.category);
  }, [productCategories, formData.category]);

  // Format website URL to ensure it has https://
  const formatWebsiteUrl = (url: string): string => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Function to upload files to Convex storage
  const uploadFileToConvex = async (file: File): Promise<string> => {
    try {
      return await uploadFile(file);
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file");
    }
  };

  // Function to generate brand wallet and get owner info
  const generateWalletForBrand = async () => {
    try {
      // Check if user is authenticated
      if (!userProfile) {
        throw new Error('Please sign in to register a brand');
      }

      // Generate a simple wallet address for the brand (for operations)
      // We'll use a simple hash of the user ID + brand name for consistency
      const brandWalletAddress = `brand_${userProfile._id}_${formData.brandUrl}`;
      
      // Use the authenticated user's ID as the brand owner
      const ownerUserId = userProfile._id;
      
      return {
        ownerUserId, // User's ID (who owns/manages the brand)
        brandWalletAddress, // Simple brand identifier
      };
    } catch (error) {
      console.error('Error generating brand wallet:', error);
      throw new Error('Failed to generate brand wallet');
    }
  };

  // Function to prepare form data for submission
  const prepareFormData = async () => {
    // Generate brand wallet automatically
    const brandWallet = await generateWalletForBrand();
    
    // Upload logo with brand URL as filename
    const logoStorageId = formData.logoFile ? await uploadFileToConvex(formData.logoFile) : undefined;
    
    // Upload interior images with brand URL as filename
    const interiorImageStorageIds = await uploadMultipleFiles(
      interiorPhotos.map(photo => photo.file)
    );
    
    // Upload product images
    const productsWithImages = await Promise.all(
      products.map(async (product) => ({
        name: product.name,
        description: product.description,
        cost: parseFloat(product.cost) || 0,
        price: parseFloat(product.price) || 0,
        images: product.photo && product.photo.file ? [await uploadFileToConvex(product.photo.file)] : [],
        category: product.category === 'none' ? '' : product.category,
        status: 'active' as const,
      }))
    );

    // Upload license files
    const licenseStorageIds = await Promise.all(
      selectedCountries.map(async (country) => {
        const countryData = locationData[country];
        if (countryData?.licenseFile) {
          return await uploadFileToConvex(countryData.licenseFile);
        }
        return null;
      })
    );

    // Prepare locations data - create unique location for each country
    const locationsData = selectedCountries.map((country, index) => {
      const countryData = locationData[country] || {
        isNationwide: true,
        cities: [],
        minArea: formData.minCarpetArea || 500,
        franchiseFee: formData.franchiseFee || 25000,
        setupCost: formData.setupCostPerSqft || 150,
        workingCapital: formData.workingCapitalPerSqft || 100,
      };
      
      return {
        country,
        isNationwide: countryData.isNationwide,
        city: countryData.isNationwide ? undefined : countryData.cities.join(', '),
        registrationCertificate: licenseStorageIds[index] || `cert-${country.toLowerCase()}-${Date.now()}-${index}`,
        minArea: countryData.minArea,
        franchiseFee: countryData.franchiseFee,
        setupCost: countryData.setupCost,
        workingCapital: countryData.workingCapital,
        status: 'active' as const,
      };
    });

    return {
      franchiser: {
        ownerUserId: brandWallet.ownerUserId, // User's ID (brand owner)
        brandWalletAddress: brandWallet.brandWalletAddress, // Simple brand identifier
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logoUrl: logoStorageId as any, // Cast to match Convex ID type
        name: formData.brandName,
        slug: formData.brandUrl,
        description: formData.shortDescription,
        industry: formData.industry,
        category: formData.category,
        website: formData.website || undefined,
        interiorImages: interiorImageStorageIds,
        status: 'pending' as const,
      },
      locations: locationsData,
      products: productsWithImages,
    };
  };

  const nextStep = (): void => {
    // Validate step 1 - Basic Information
    if (currentStep === 1) {
      if (!formData.brandName || !formData.brandUrl || !formData.shortDescription || 
          !formData.industry || !formData.category || !formData.franchiseType || !formData.logoFile || 
          (!formData.timingPerWeek.is24Hours && formData.timingPerWeek.days.length === 0)) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate brand URL
      const urlValidation = validateBrandUrl(formData.brandUrl);
      if (!urlValidation.isValid) {
        toast.error(urlValidation.error || 'Invalid brand URL');
        return;
      }

      // Validate website format (if provided)
      if (formData.website && !validateWebsite(formData.website)) {
        toast.error('Please enter a valid website URL');
        return;
      }
    }
    
    // Validate step 2 - Financial Information
    if (currentStep === 2) {
      if (!formData.minCarpetArea || !formData.franchiseFee || 
          !formData.setupCostPerSqft || !formData.workingCapitalPerSqft ||
          !formData.royaltyPercentage || !formData.marketingPercentage) {
        toast.error('Please fill in all financial information including royalty and marketing percentages');
        return;
      }
    }
    
    // Validate step 3 - Locations
    if (currentStep === 3) {
      if (selectedCountries.length === 0) {
        toast.error('Please select at least one country');
        return;
      }
      
      // Check if all countries have license files
      const missingLicenses = selectedCountries.filter(country => !locationData[country]?.licenseFile);
      if (missingLicenses.length > 0) {
        toast.error(`Please upload license documents for: ${missingLicenses.join(', ')}`);
        return;
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Show loading state while master data is being fetched
  if (masterDataLoading) {
  return (
      <Card className="w-full max-w-4xl mx-auto my-12 py-6">
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-stone-600">Loading form data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
        <Card className="w-full max-w-4xl mx-auto my-12 py-6">
        <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Register Brand</h2>
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 flex items-center justify-center ${
                    currentStep >= step 
                      ? 'bg-yellow-600 dark:bg-yellow-800 text-white' 
                      : 'bg-stone-200 dark:bg-stone-800 dark:text-stone-200 text-stone-600'
                  }`}
                >
                  {step}
                </div>
                {/* <div className="text-xs mt-1 text-center">
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Financial'}
                  {step === 3 && 'Locations'}
                  {step === 4 && 'Products'}
                </div> */}
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
        <div className="mb-6 min-h-[400px] overflow-y-auto s">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Brand Logo *</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 border border-dashed  dark:border-stone-600 flex items-center justify-center overflow-hidden">
                  {formData.logoPreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={formData.logoPreview}
                        alt="Logo preview"
                        fill
                        sizes="96px"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 hover:bg-red-600 transition-colors z-10"
                        aria-label="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-stone-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Label
                    htmlFor="logo"
                    className="inline-flex items-center px-4 py-2 border    text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 dark:border-stone-600 hover:focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Label>
                  <p className="mt-1 text-xs text-stone-500">Square image, max 5MB</p>
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={handleBrandNameChange}
                placeholder="Enter your brand name"
                required
              />
            </div>

            {/* Brand URL */}
            <div className="space-y-2">
              <Label htmlFor="brandUrl">Brand URL *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 text-stone-500 sm:text-sm">
                  franchiseen.com/
                </span>
                <Input
                  id="brandUrl"
                  value={formData.brandUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandUrl: e.target.value }))}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 sm:text-sm bg-stone-50 dark:bg-stone-800 ${
                    validationErrors.brandUrl 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                  placeholder="brand-url"
                  required
                />
              </div>
              {/* Simple Error Message */}
              {urlValidationError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {urlValidationError}
                </p>
              )}
              {/* URL Format Help */}
              {!formData.brandUrl && (
                <p className="text-xs text-stone-500">
                  Only lowercase letters, numbers, and hyphens. Cannot start or end with hyphen.
                </p>
              )}
            </div>

            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <span className="text-sm text-stone-500">
                  {formData.shortDescription.length}/200
                </span>
              </div>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setFormData(prev => ({ ...prev, shortDescription: e.target.value }));
                  }
                }}
                placeholder="Briefly describe your brand"
                rows={3}
                maxLength={200}
                required
              />
            </div>
            

            {/* Industry, Category, Franchise Type and Website */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Industry - takes 3 columns on medium screens and up */}
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value, category: '' }))}
                  required
                >
                  <SelectTrigger id="industry" className="w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries?.map((industry) => (
                      <SelectItem key={industry._id} value={industry._id}>
                        {industry.icon && <span className="mr-2">{industry.icon}</span>}
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category - takes 3 columns on medium screens and up */}
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={!formData.industry}
                  required
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder={formData.industry ? 'Select category' : 'Select industry first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Franchise Type - takes 3 columns on medium screens and up */}
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="franchiseType">Franchise Type *</Label>
                <Select
                  value={formData.franchiseType}
                  onValueChange={(value: 'FOCO' | 'FOFO' | 'BOTH') => setFormData(prev => ({ ...prev, franchiseType: value }))}
                  required
                >
                  <SelectTrigger id="franchiseType" className="w-full">
                    <SelectValue placeholder="Select franchise type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOCO">FOCO (Franchise Owned, Company Operated)</SelectItem>
                    <SelectItem value="FOFO">FOFO (Franchise Owned, Franchise Operated)</SelectItem>
                    <SelectItem value="BOTH">Both FOCO & FOFO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Website - takes 3 columns on medium screens and up */}
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="website">Website</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 text-stone-500 text-sm">
                    https://
                  </span>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website.replace(/^https?:\/\//, '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formattedUrl = formatWebsiteUrl(value);
                      setFormData(prev => ({
                      ...prev,
                        website: formattedUrl
                      }));
                      
                      // Real-time validation
                      if (value && !validateWebsite(formattedUrl)) {
                        setValidationErrors(prev => ({ ...prev, website: 'Please enter a valid website URL' }));
                      } else {
                        setValidationErrors(prev => ({ ...prev, website: undefined }));
                      }
                    }}
                    className={`flex-1 min-w-0 w-full px-3 py-2 text-sm border-l-0 ${validationErrors.website ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="yourwebsite.com"
                  />
                </div>
                {validationErrors.website && (
                  <p className="text-sm text-red-500">{validationErrors.website}</p>
                )}
                </div>
              </div>
              
              {/* Timing per Week */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                <Label htmlFor="timingPerWeek">Business Hours *</Label>
                
                {/* 24 Hours Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is24Hours"
                    checked={formData.timingPerWeek.is24Hours}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        timingPerWeek: {
                          ...prev.timingPerWeek,
                          is24Hours: checked,
                          days: checked ? [] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                        }
                      }));
                    }}
                  />
                  <Label htmlFor="is24Hours" className="text-sm font-medium">
                    Open 24 Hours
                  </Label>
            </div>

            

                </div>
                

                {!formData.timingPerWeek.is24Hours && (
                  <div className="space-y-4">
                    {/* Days Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Operating Days</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`day-${day}`}
                              checked={formData.timingPerWeek.days.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                        ...prev,
                                    timingPerWeek: {
                                      ...prev.timingPerWeek,
                                      days: [...prev.timingPerWeek.days, day]
                                    }
                                  }));
                                } else {
                                  setFormData(prev => ({
                        ...prev,
                                    timingPerWeek: {
                                      ...prev.timingPerWeek,
                                      days: prev.timingPerWeek.days.filter(d => d !== day)
                                    }
                                  }));
                                }
                              }}
                              className="rounded border-stone-300"
                            />
                            <Label htmlFor={`day-${day}`} className="text-xs">
                              {day.slice(0, 3)}
                            </Label>
                          </div>
                        ))}
                  </div>
                </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-sm font-medium">Opening Time</Label>
                    <Input
                          id="startTime"
                          type="time"
                          value={formData.timingPerWeek.startTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                            timingPerWeek: {
                              ...prev.timingPerWeek,
                              startTime: e.target.value
                        }
                      }))}
                          className="h-9"
                    />
                  </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-sm font-medium">Closing Time</Label>
                    <Input
                          id="endTime"
                          type="time"
                          value={formData.timingPerWeek.endTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                            timingPerWeek: {
                              ...prev.timingPerWeek,
                              endTime: e.target.value
                        }
                      }))}
                          className="h-9"
                    />
                  </div>
                </div>
              </div>
                )}

                {/* Display Summary */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {formData.timingPerWeek.is24Hours ? (
                      "Open 24 Hours, 7 Days a Week"
                    ) : (
                      formData.timingPerWeek.days.length > 0 ? (
                        `${formData.timingPerWeek.days.join(', ')}: ${formData.timingPerWeek.startTime} - ${formData.timingPerWeek.endTime}`
                      ) : (
                        "Please select operating days"
                      )
                    )}
                  </p>
            </div>
              </div>
              
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Financial Information</h3>
                <p className="text-stone-500 text-sm">
                  Provide the financial details required for your franchise opportunity. This information will help potential franchisees understand the investment required.
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Single Row Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Minimum Carpet Area */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="minCarpetArea" className="text-xs font-medium">Min. Area *</Label>
                      <span className="text-xs text-stone-500">
                        {formData.minCarpetArea ? `${formData.minCarpetArea.toLocaleString()} sq.ft` : '0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        id="minCarpetArea"
                        type="number"
                        min="100"
                        step="50"
                        value={formData.minCarpetArea || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                          setFormData(prev => ({
                            ...prev,
                              minCarpetArea: ''
                            }));
                          } else {
                            const numValue = parseInt(inputValue);
                            if (!isNaN(numValue)) {
                              setFormData(prev => ({
                                ...prev,
                                minCarpetArea: numValue
                              }));
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue !== '') {
                            const numValue = parseInt(inputValue);
                            if (!isNaN(numValue) && numValue < 100) {
                              setFormData(prev => ({
                                ...prev,
                                minCarpetArea: 100
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
                        {formData.franchiseFee ? `$${formData.franchiseFee.toLocaleString()}` : '$0'}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                      <Input
                        id="franchiseFee"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.franchiseFee || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Math.max(0, parseFloat(e.target.value)) : '';
                          setFormData(prev => ({
                            ...prev,
                            franchiseFee: value as number | ''
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
                        {formData.setupCostPerSqft ? `$${formData.setupCostPerSqft}` : '$0'}/sq.ft
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                      <Input
                        id="setupCostPerSqft"
                        type="number"
                        min="0"
                        step="10"
                        value={formData.setupCostPerSqft || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Math.max(0, parseFloat(e.target.value)) : '';
                          setFormData(prev => ({
                            ...prev,
                            setupCostPerSqft: value as number | ''
                          }));
                        }}
                        className="pl-6 h-9 text-sm"
                        placeholder="150"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {formData.minCarpetArea && formData.setupCostPerSqft ? 
                        `Total: $${(formData.minCarpetArea * formData.setupCostPerSqft).toLocaleString()}` : 
                        'Per sq.ft, one-time'}
                    </p>
                  </div>

                  {/* Working Capital */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="workingCapitalPerSqft" className="text-xs font-medium">Working Capital *</Label>
                      <span className="text-xs text-stone-500">
                        {formData.workingCapitalPerSqft ? `$${formData.workingCapitalPerSqft}` : '$0'}/sq.ft
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                      <Input
                        id="workingCapitalPerSqft"
                        type="number"
                        min="0"
                        step="5"
                        value={formData.workingCapitalPerSqft || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Math.max(0, parseFloat(e.target.value)) : '';
                          setFormData(prev => ({
                            ...prev,
                            workingCapitalPerSqft: value as number | ''
                          }));
                        }}
                        className="pl-6 h-9 text-sm"
                        placeholder="100"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {formData.minCarpetArea && formData.workingCapitalPerSqft ? 
                        `1 Year: $${(formData.minCarpetArea * formData.workingCapitalPerSqft).toLocaleString()}` : 
                        'Per sq.ft, 1 year'}
                    </p>
                  </div>
                </div>

                {/* Royalty and Marketing Percentage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Royalty Percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="royaltyPercentage" className="text-xs font-medium">Royalty % *</Label>
                      <span className="text-xs text-stone-500">
                        {formData.royaltyPercentage ? `${formData.royaltyPercentage}%` : '0%'}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="royaltyPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.royaltyPercentage || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Math.max(0, Math.min(100, parseFloat(e.target.value))) : '';
                          setFormData(prev => ({
                            ...prev,
                            royaltyPercentage: value as number | ''
                          }));
                        }}
                        className="h-9 text-sm"
                        placeholder="5.0"
                        required
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Monthly royalty percentage of gross revenue
                    </p>
                  </div>

                  {/* Marketing Percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="marketingPercentage" className="text-xs font-medium">Marketing % *</Label>
                      <span className="text-xs text-stone-500">
                        {formData.marketingPercentage ? `${formData.marketingPercentage}%` : '0%'}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="marketingPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.marketingPercentage || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Math.max(0, Math.min(100, parseFloat(e.target.value))) : '';
                          setFormData(prev => ({
                            ...prev,
                            marketingPercentage: value as number | ''
                          }));
                        }}
                        className="h-9 text-sm"
                        placeholder="2.0"
                        required
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Monthly marketing fee percentage of gross revenue
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
                        ${(formData.franchiseFee || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-300">
                        Setup Cost
                        {formData.minCarpetArea && (
                          <span className="text-xs text-stone-500 block">
                            ({formData.minCarpetArea.toLocaleString()} sq.ft × ${formData.setupCostPerSqft || 0}/sq.ft)
                          </span>
                        )}
                      </span>
                      <span className="font-medium">
                        ${(formData.minCarpetArea && formData.setupCostPerSqft ? formData.minCarpetArea * formData.setupCostPerSqft : 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-300">
                        Working Capital (1 Year)
                        {formData.minCarpetArea && (
                          <span className="text-xs text-stone-500 block">
                            ({formData.minCarpetArea.toLocaleString()} sq.ft × ${formData.workingCapitalPerSqft || 0}/sq.ft)
                          </span>
                        )}
                      </span>
                      <span className="font-medium">
                        ${(formData.minCarpetArea && formData.workingCapitalPerSqft ? formData.minCarpetArea * formData.workingCapitalPerSqft : 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="border-t border-stone-200 dark:border-stone-700 pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Investment</span>
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                          ${
                            (
                              (formData.franchiseFee || 0) +
                              (formData.minCarpetArea && formData.setupCostPerSqft ? formData.minCarpetArea * formData.setupCostPerSqft : 0) +
                              (formData.minCarpetArea && formData.workingCapitalPerSqft ? formData.minCarpetArea * formData.workingCapitalPerSqft : 0)
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
            </div>
          )}

        {currentStep === 3 && (
        <div className="space-y-6">

            {/* Country Multi-select with Google Places */}
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
                                  minArea: formData.minCarpetArea || 500,
                                  franchiseFee: formData.franchiseFee || 25000,
                                  setupCost: formData.setupCostPerSqft || 150,
                                  workingCapital: formData.workingCapitalPerSqft || 100,
                                  isFinance: false,
                                  licenseFile: null,
                                  licensePreview: null,
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

            {/* Country Cards */}
            <div className=" space-y-4">
            {selectedCountries.map((country) => (
                <Card key={country} className="relative">
                <CardHeader>
                    <div className="flex justify-between items-center">
                    <div className="p-0">
                        <CardTitle className="text-lg">{country}</CardTitle>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                        setSelectedCountries(
                            selectedCountries.filter((c) => c !== country)
                        );
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 border-t pt-4">

                  {/* License File Upload */}
                  <div className="space-y-2 ">
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
                                    {formData.brandUrl ? `File: ${formData.brandUrl}-license-${country.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf` : 'PDF file, max 10MB'}
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
                      <h2 className="font-bold ">{locationData[country]?.minArea || 500} sq.ft</h2>
                      <h2 className="font-bold ">${locationData[country]?.franchiseFee || 50000}</h2>
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
            ))}
            </div>
        </div>
        )}

          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Franchise Interiors Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Franchise Interiors</h3>
                <p className="text-stone-500 text-sm mb-4">
                  Upload high-quality photos of your franchise interiors. These will be displayed to potential franchisees.
                  (Minimum 3 photos, maximum 10)
                </p>
                
                <div 
                  className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-8 text-center cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                  onClick={() => document.getElementById('interior-photos')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    // Handle file drop
                    const files = Array.from(e.dataTransfer.files);
                    console.log('Files dropped:', files);
                    await handleInteriorFiles(files);
                  }}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className={`w-12 h-12 ${isDragging ? 'text-yellow-600' : 'text-stone-400'}`} />
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      <span className="font-medium text-yellow-600 hover:text-yellow-700">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-stone-500">
                      PNG, JPG, JPEG (max. 5MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="interior-photos"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      console.log('Files selected:', files);
                      await handleInteriorFiles(files);
                    }}
                  />
                </div>

                {/* Uploaded Photos Grid */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">
                    Uploaded Photos ({interiorPhotos.length}/10)
                    {interiorPhotos.length < 3 && (
                      <span className="text-red-500 text-xs font-normal ml-2">
                        Minimum 3 photos required
                      </span>
                    )}
                  </h4>
                  {formData.brandUrl && (
                    <p className="text-xs text-stone-500 mb-3">
                      Files will be named: <span className="font-mono">{formData.brandUrl}-interior-1.jpg</span>, <span className="font-mono">{formData.brandUrl}-interior-2.jpg</span>, etc.
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {interiorPhotos.map((photo) => {
                      console.log('Rendering interior photos:', interiorPhotos);
                      return (
                      <div key={photo.id} className="relative group">
                        <Image
                          src={photo.preview}
                          alt="Interior preview"
                          width={300}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image load error:', {
                              error: e,
                              src: photo.preview,
                              photo: photo,
                              currentTarget: e.currentTarget,
                              isValidUrl: photo.preview.startsWith('blob:')
                            });
                          }}
                          onLoad={() => console.log('Image loaded successfully:', photo.preview)}
                        />
                        <button 
                          type="button"
                          onClick={() => removeInteriorPhoto(photo.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      );
                    })}
                    
                    {interiorPhotos.length < 10 && (
                      <label 
                        htmlFor="interior-photos" 
                        className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                      >
                        <Plus className="w-8 h-8 text-stone-400 mb-1" />
                        <span className="text-xs text-stone-500">Add Photo</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="pt-8 border-t border-stone-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Products</h3>
                    <p className="text-stone-500 text-sm">
                      Add your products with details like name, description, cost, and price.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProduct}
                    disabled={products.length >= 20}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                  </Button>
                </div>

                {/* Product Card */}
                <div className="space-y-6">
                  {products.map((product, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Left Section - Product Photo */}
                          <div className="w-full md:w-1/3 p-4 flex flex-col items-center">
                            <div className="relative w-full aspect-square max-w-xs bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden">
                              {product.photo ? (
                                <>
                                  <Image
                                    src={product.photo.preview}
                                    alt="Product preview"
                                    width={300}
                                    height={300}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateProduct(product.id, 'photo', null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-12 h-12 text-stone-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 w-full">
                              <input
                                id={`product-photo-${product.id}`}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    await handleProductPhoto(product.id, file);
                                  }
                                }}
                              />
                               <p className="text-xs text-center text-stone-500 dark:text-stone-400">
                                PNG, JPG (max. 5MB)
                                {/* {formData.brandUrl && product.name && (
                                  <><br />File: <span className="font-mono text-xs">{formData.brandUrl}-{product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-{product.category && product.category !== 'none' ? product.category.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'uncategorized'}-{product.id}.jpg</span></>
                                )} */}
                              </p>
                              <label
                                htmlFor={`product-photo-${product.id}`}
                                className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-stone-300 dark:border-stone-600 text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 cursor-pointer transition-colors"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {product.photo ? 'Change Image' : 'Upload Image'}
                              </label>
                             
                            </div>
                          </div>
                          
                          {/* Right Section - Product Details */}
                          <div className="w-full md:w-2/3 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium">Product #{index + 1}</h4>
                                <p className="text-sm text-stone-500">
                                  {product.name || 'Add product details'}
                                  {product.category !== 'none' && ` • ${getProductCategoryName(product.category)}`}
                                </p>
                              </div>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to remove this product?')) {
                                    removeProduct(product.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`product-name-${index}`} className="text-sm font-medium">Product Name *</Label>
                                    <Input
                                      id={`product-name-${product.id}`}
                                      value={product.name}
                                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                      placeholder="e.g., Signature Burger"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="w-full">
                                    <Label htmlFor={`product-category-${index}`} className="text-sm font-medium">Category</Label>
                                    <Select
                                      value={product.category}
                                      onValueChange={(value) => updateProduct(product.id, 'category', value)}
                                    >
                                      <SelectTrigger className="mt-1 w-full">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[300px] overflow-y-auto">
                                        <div className="px-2 py-1">
                                          <SelectItem value="none" className="text-sm">None</SelectItem>
                                        </div>
                                        <div className="px-2">
                                          {availableProductCategories?.map((productCategory) => (
                                            <div key={productCategory._id} className="col-span-1">
                                              <SelectItem value={productCategory._id} className="text-sm truncate">
                                                {productCategory.icon && <span className="mr-2">{productCategory.icon}</span>}
                                                {productCategory.name}
                                              </SelectItem>
                                            </div>
                                          ))}
                                        </div>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor={`product-desc-${index}`} className="text-sm font-medium">Description</Label>
                                <Textarea
                                  id={`product-desc-${product.id}`}
                                  value={product.description}
                                  onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                                  placeholder="Brief description of the product"
                                  className="mt-1 h-20"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor={`cost-${product.id}`} className="text-sm font-medium">Cost *</Label>
                                  <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                                    <Input
                                      id={`cost-${product.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={product.cost}
                                      onChange={(e) => updateProduct(product.id, 'cost', e.target.value)}
                                      placeholder="0.00"
                                      className="pl-8"
                                      required
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`margin-${product.id}`} className="text-sm font-medium">Margin % *</Label>
                                  <div className="relative mt-1">
                                    <Input
                                      id={`margin-${product.id}`}
                                      type="number"
                                      min="0"
                                      max="1000"
                                      step="1"
                                      value={product.margin}
                                      onChange={(e) => updateProduct(product.id, 'margin', e.target.value)}
                                      placeholder="0"
                                      className="pr-12"
                                      required
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">%</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`price-${product.id}`} className="text-sm font-medium">Selling Price</Label>
                                  <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                                    <Input
                                      id={`price-${product.id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={product.price}
                                      placeholder="0.00"
                                      className="pl-8 bg-stone-50 dark:bg-stone-900"
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {loading ? 'Loading...' : 'Continue'} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    setLoading(true);
                    
                    // Validate required fields
                    if (!formData.brandName || !formData.brandUrl || !formData.shortDescription || 
                        !formData.industry || !formData.category || !formData.logoFile ||
                        (!formData.timingPerWeek.is24Hours && formData.timingPerWeek.days.length === 0)) {
                      toast.error('Please fill in all required fields including logo and timing');
                      setLoading(false);
                      return;
                    }

                    // Validate brand URL
                    const urlValidation = validateBrandUrl(formData.brandUrl);
                    if (!urlValidation.isValid) {
                      toast.error(urlValidation.error || 'Invalid brand URL');
                      setLoading(false);
                      return;
                    }

                    // Validate website format (if provided)
                    if (formData.website && !validateWebsite(formData.website)) {
                      toast.error('Please enter a valid website URL');
                      setLoading(false);
                      return;
                    }
                    
                    if (selectedCountries.length === 0) {
                      toast.error('Please select at least one country');
                      setLoading(false);
                      return;
                    }
                    
                    // Check if all countries have license files
                    const missingLicenses = selectedCountries.filter(country => !locationData[country]?.licenseFile);
                    if (missingLicenses.length > 0) {
                      toast.error(`Please upload license documents for: ${missingLicenses.join(', ')}`);
                      setLoading(false);
                      return;
                    }
                    
                    if (interiorPhotos.length < 3) {
                      toast.error('Please upload at least 3 interior photos');
                      setLoading(false);
                      return;
                    }
                    
                    // Prepare and submit form data
                    const submissionData = await prepareFormData();
                    
                    // Submit to Convex
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await createFranchiserWithDetails(submissionData as any);
                    
                    toast.success('Brand registered successfully!');
                    router.push(`/${formData.brandUrl}/account`);
                    
                  } catch (error) {
                    console.error('Error submitting form:', error);
                    toast.error('Failed to register brand. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm & Register'}
              </Button>
            )}
          </div>
        </div>
        </CardContent>
      </Card>
      
   
  );
};

export default FranchiserRegister;
