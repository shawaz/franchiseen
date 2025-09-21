"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, ArrowLeft, ArrowRight, Globe, Plus, Trash2, MapPin, Check, ChevronDown, CheckCircle, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Common product categories
const PRODUCT_CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Sides',
  'Salads',
  'Sandwiches',
  'Pizzas',
  'Burgers',
  'Pasta',
  'Rice Dishes',
  'Soups',
  'Breakfast',
  'Lunch Specials',
  'Dinner Specials',
  'Kids Menu',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Specials',
  'Seasonal',
  'Happy Hour',
  'Cocktails',
  'Wine',
  'Beer',
  'Dessert Wines',
  'Non-Alcoholic Drinks',
  'Coffee & Tea',
  'Smoothies',
  'Shakes'
].sort();

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
  shortDescription: string;
  website: string;
  socialMedia: {
    instagram: string;
    telegram: string;
    linkedin: string;
    facebook: string;
  };
  logoFile: File | null;
  logoPreview: string | null;
  // Financial Information
  minCarpetArea: number | '';
  franchiseFee: number | '';
  setupCostPerSqft: number | '';
  workingCapitalPerSqft: number | '';
  // Locations
  locations: Location[];
};

interface Country {
  code: string;
  name: string;
  cities: string[];
}

interface Industry {
  id: string;
  name: string;
  categories: string[];
}

// Sample countries data - you can replace this with an API call
const countries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
  },
  {
    code: 'CA',
    name: 'Canada',
    cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool']
  },
  {
    code: 'AU',
    name: 'Australia',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']
  },
  {
    code: 'IN',
    name: 'India',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
  },
  {
    code: 'AE',
    name: 'UAE',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif']
  }
];

const industries: Industry[] = [
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    categories: ['Quick Service Restaurant', 'Cafe', 'Fine Dining', 'Food Truck', 'Bakery', 'Dessert', 'Beverage']
  },
  {
    id: 'retail',
    name: 'Retail',
    categories: ['Apparel', 'Electronics', 'Beauty', 'Home Goods', 'Specialty']
  },
  {
    id: 'health-beauty',
    name: 'Health & Beauty',
    categories: ['Hair Salon', 'Nail Salon', 'Spa', 'Fitness', 'Wellness']
  },
  {
    id: 'services',
    name: 'Services',
    categories: ['Education', 'Cleaning', 'Maintenance', 'Consulting', 'Other Services']
  }
];

const BrandRegister: React.FC = () => {
  const router = useRouter();
  
  // Get country names for multi-select
  const countryOptions = countries.map(country => ({
    value: country.name,
    label: country.name
  }));

  const [formData, setFormData] = useState<FormData>({
    brandName: '',
    brandUrl: '',
    industry: '',
    category: '',
    shortDescription: '',
    website: '',
    socialMedia: {
      instagram: '',
      telegram: '',
      linkedin: '',
      facebook: ''
    },
    logoFile: null,
    logoPreview: null,
    // Financial Information
    minCarpetArea: '',
    franchiseFee: '',
    setupCostPerSqft: '',
    workingCapitalPerSqft: '',
    // Locations
    locations: []
  });
  
  // State for the new location being added (temporary state for the form)
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<{
    country: string[];
    registrationFile: File | null;
    registrationPreview: string | null;
    availableNationwide: boolean;
    selectedCities: string[];
    customFinance: boolean;
    finance: LocationFinance;
  }>({
    country: [],
    registrationFile: null,
    registrationPreview: null,
    availableNationwide: true,
    selectedCities: [],
    customFinance: false,
    finance: {
      minCarpetArea: formData.minCarpetArea,
      franchiseFee: formData.franchiseFee,
      setupCostPerSqft: formData.setupCostPerSqft,
      workingCapitalPerSqft: formData.workingCapitalPerSqft
    }
  });
  
  // State for file upload drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [interiorPhotos, setInteriorPhotos] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  
  // State for products
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    cost: string;
    margin: string;
    price: string;
    photo?: {
      file: File;
      preview: string;
    };
  }>>([
    { id: '1', name: '', category: 'none', description: '', cost: '', margin: '', price: '' },
    { id: '2', name: '', category: 'none', description: '', cost: '', margin: '', price: '' }
  ]);
  
  // Toggle country selection
  const toggleCountry = (countryName: string): void => {
    setFormData(prev => {
      const selectedCountries = prev.locations[0]?.country ? [prev.locations[0].country] : [];
      const newSelectedCountries = selectedCountries.includes(countryName)
        ? selectedCountries.filter(c => c !== countryName)
        : [...selectedCountries, countryName];

      const updatedLocations = [...prev.locations];
      if (updatedLocations.length > 0) {
        updatedLocations[0] = {
          ...updatedLocations[0],
          country: newSelectedCountries[0] || '',
          selectedCities: [] // Reset cities when country changes
        };
      }

      return {
        ...prev,
        locations: updatedLocations
      };
    });
  };
  
  // Toggle city selection
  const toggleCity = (city: string): void => {
    setFormData(prev => {
      const selectedCities = prev.locations[0]?.selectedCities || [];
      const newSelectedCities = selectedCities.includes(city)
        ? selectedCities.filter(c => c !== city)
        : [...selectedCities, city];

      const updatedLocations = [...prev.locations];
      if (updatedLocations.length > 0) {
        updatedLocations[0] = {
          ...updatedLocations[0],
          selectedCities: newSelectedCities
        };
      }

      return {
        ...prev,
        locations: updatedLocations
      };
    });
  };
  
  // Toggle nationwide availability
  const toggleNationwide = (checked: boolean) => {
    setNewLocation(prev => ({
      ...prev,
      availableNationwide: checked,
      // Clear selected cities when enabling nationwide
      selectedCities: checked ? [] : prev.selectedCities
    }));
  };
  
  // Toggle custom finance
  const toggleCustomFinance = (checked: boolean) => {
    setNewLocation(prev => ({
      ...prev,
      customFinance: checked,
      // Reset to form data values when disabling custom finance
      finance: checked ? prev.finance : {
        minCarpetArea: formData.minCarpetArea,
        franchiseFee: formData.franchiseFee,
        setupCostPerSqft: formData.setupCostPerSqft,
        workingCapitalPerSqft: formData.workingCapitalPerSqft
      }
    }));
  };
  
  // Handle interior photos upload
  const handleInteriorFiles = (files: File[]) => {
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
    
    const newPhotos = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setInteriorPhotos(prev => {
      const updated = [...prev, ...newPhotos];
      // Limit to 10 photos max
      return updated.slice(0, 10);
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      interiorPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, [interiorPhotos]);

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
        price: ''
      }
    ]);
  };

  // Remove a product
  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Update product field
  const updateProduct = (id: string, field: string, value: string) => {
    setProducts(prev =>
      prev.map(product => {
        if (product.id === id) {
          const updated = { ...product, [field]: value };
          
          // Calculate price if cost or margin changes
          if ((field === 'cost' || field === 'margin') && updated.cost && updated.margin) {
            const cost = parseFloat(updated.cost);
            const margin = parseFloat(updated.margin) / 100;
            if (!isNaN(cost) && !isNaN(margin)) {
              updated.price = (cost + (cost * margin)).toFixed(2);
            }
          }
          
          return updated;
        }
        return product;
      })
    );
  };

  // Handle product photo upload
  const handleProductPhoto = (productId: string, file: File) => {
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
    
    setProducts(prev =>
      prev.map(product => {
        if (product.id === productId) {
          // Clean up previous photo if exists
          if (product.photo) {
            URL.revokeObjectURL(product.photo.preview);
          }
          
          return {
            ...product,
            photo: {
              file,
              preview: URL.createObjectURL(file)
            }
          };
        }
        return product;
      })
    );
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      interiorPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
      
      // Clean up product photos
      products.forEach(product => {
        if (product.photo) {
          URL.revokeObjectURL(product.photo.preview);
        }
      });
    };
  }, [interiorPhotos, products]);

  // Remove an interior photo
  const removeInteriorPhoto = (id: string) => {
    setInteriorPhotos(prev => {
      const photoToRemove = prev.find(photo => photo.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(photo => photo.id !== id);
    });
  };

  // Handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('application/pdf')) {
      setNewLocation(prev => ({
        ...prev,
        registrationFile: file,
        registrationPreview: URL.createObjectURL(file)
      }));
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('application/pdf')) {
      setNewLocation(prev => ({
        ...prev,
        registrationFile: file,
        registrationPreview: URL.createObjectURL(file)
      }));
    }
  };
  
  // Remove registration file
  const removeRegistrationFile = () => {
    if (newLocation.registrationPreview) {
      URL.revokeObjectURL(newLocation.registrationPreview);
    }
    setNewLocation(prev => ({
      ...prev,
      registrationFile: null,
      registrationPreview: null
    }));
  };
  
  // Add new location
  const addLocation = () => {
    if (newLocation.country.length === 0) {
      toast.error('Please select at least one country');
      return;
    }
    
    if (!newLocation.availableNationwide && newLocation.selectedCities.length === 0) {
      toast.error('Please select at least one city or enable "Available Nationwide"');
      return;
    }
    
    // Create a location for each selected country
    const newLocations = newLocation.country.map(countryName => {
      const country = countries.find(c => c.name === countryName);
      return {
        id: `${countryName}-${Date.now()}`,
        country: countryName,
        registrationFile: newLocation.registrationFile,
        registrationPreview: newLocation.registrationPreview,
        availableNationwide: newLocation.availableNationwide,
        selectedCities: country && !newLocation.availableNationwide 
          ? country.cities.filter(city => newLocation.selectedCities.includes(city))
          : [],
        customFinance: newLocation.customFinance,
        finance: { ...newLocation.finance }
      };
    });
    
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, ...newLocations]
    }));
    
    // Reset the form
    setNewLocation({
      country: [],
      registrationFile: null,
      registrationPreview: null,
      availableNationwide: true,
      selectedCities: [],
      customFinance: false,
      finance: {
        minCarpetArea: formData.minCarpetArea,
        franchiseFee: formData.franchiseFee,
        setupCostPerSqft: formData.setupCostPerSqft,
        workingCapitalPerSqft: formData.workingCapitalPerSqft
      }
    });
    
    setSelectedCountries([]);
    setIsAddingLocation(false);
    toast.success('Location(s) added successfully');
  };
  
  // Remove location
  const removeLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId)
    }));
  };
  
  // Handle location finance change
  const handleLocationFinanceChange = (locationIndex: number, field: keyof LocationFinance, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    setFormData(prev => {
      const updatedLocations = [...prev.locations];
      updatedLocations[locationIndex] = {
        ...updatedLocations[locationIndex],
        finance: {
          ...updatedLocations[locationIndex].finance,
          [field]: numValue
        }
      };
      return {
        ...prev,
        locations: updatedLocations
      };
    });
  };
  
  // Toggle location custom finance
  const toggleLocationCustomFinance = (locationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === locationId 
          ? { 
              ...loc, 
              customFinance: checked,
              // Reset to form data values when disabling custom finance
              finance: checked ? loc.finance : {
                minCarpetArea: formData.minCarpetArea,
                franchiseFee: formData.franchiseFee,
                setupCostPerSqft: formData.setupCostPerSqft,
                workingCapitalPerSqft: formData.workingCapitalPerSqft
              }
            } 
          : loc
      )
    }));
  };
  
  // Calculate total investment for a location
  const calculateTotalInvestment = (finance: LocationFinance) => {
    const minArea = Number(finance.minCarpetArea) || 0;
    const franchiseFee = Number(finance.franchiseFee) || 0;
    const setupCost = minArea * (Number(finance.setupCostPerSqft) || 0);
    const workingCapital = minArea * (Number(finance.workingCapitalPerSqft) || 0);
    return franchiseFee + setupCost + workingCapital;
  };
  
  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  // Handle registration file upload
  const handleRegistrationUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PDF or image file (JPEG, PNG)'
      });
      return;
    }

    // Create preview URL for images
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    setFormData(prev => ({
      ...prev,
      registrationFile: file,
      registrationPreview: previewUrl
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate URL slug from brand name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Update brand URL when brand name changes
  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      brandName: name,
      brandUrl: generateSlug(name)
    }));
  };

  // Handle file upload
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
      logoPreview: null
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const formDataWithCountries = {
        ...formData,
        locations: selectedCountries.map(country => ({
          country,
          // Add other fields from your form as needed
        }))
      };
  
      // Your existing submission logic
      console.log('Submitting:', formDataWithCountries);
      // await yourApiCall(formDataWithCountries);
      
      toast.success('Brand registered successfully!');
      router.push('/franchise/success');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to register brand. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available categories based on selected industry
  const availableCategories = useMemo(() => {
    const industryObj = industries.find(i => i.id === formData.industry);
    return industryObj ? industryObj.categories : [];
  }, [formData.industry]);

  // Format website URL to ensure it has https://
  const formatWebsiteUrl = (url: string): string => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const nextStep = (): void => {
    if (currentStep === 3 && selectedCountries.length === 0) {
        toast.error('Please select at least one country');
        return;
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

  return (

        <Card className="w-full max-w-4xl mx-auto my-12 py-6">
        <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Register Brand</h2>
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step 
                      ? 'bg-yellow-600 dark:bg-yellow-800 text-white' 
                      : 'bg-stone-200 dark:bg-stone-800 dark:text-stone-200 text-stone-600'
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
        <div className="mb-6 min-h-[400px] overflow-y-auto s">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Brand Logo *</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24  border border-dashed  dark:border-stone-600 flex items-center justify-center overflow-hidden">
                  {formData.logoPreview ? (
                    <>
                      <img
                        src={formData.logoPreview || ''}
                        alt="Logo preview"
                        className="h-12 w-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-1 right-1 bg-red-500 text-white  p-1 hover:bg-red-600 transition-colors"
                        aria-label="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
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
                <span className="inline-flex items-center px-3  border border-r-0  text-stone-500 sm:text-sm">
                  franchiseen.com/
                </span>
                <Input
                  id="brandUrl"
                  value={formData.brandUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandUrl: generateSlug(e.target.value) }))}
                  className="flex-1 min-w-0 block w-full px-3 py-2 sm:text-sm"
                  placeholder="your-brand-name"
                  required
                />
              </div>
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
            

            {/* Industry, Category and Website */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Industry - takes 5 columns on medium screens and up */}
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
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category - takes 5 columns on medium screens and up */}
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
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Website - takes 2 columns on medium screens and up */}
              <div className="space-y-2 md:col-span-6">
                <Label htmlFor="website">Website</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 text-stone-500 text-sm">
                    https://
                  </span>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website.replace(/^https?:\/\//, '')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      website: formatWebsiteUrl(e.target.value)
                    }))}
                    className="flex-1 min-w-0 w-full px-3 py-2 text-sm border-l-0"
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
              
              
            </div>

            

            

            {/* Social Media */}
            <div>
              <Label className="block mb-2">Social Media</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                

                <div className="space-y-1">
                  <div className="flex  ">
                    <span className="inline-flex items-center px-3  border border-r-0  text-stone-500 sm:text-sm">
                    telegram/@
                    </span>
                    <Input
                      id="telegram"
                      value={formData.socialMedia.telegram.replace(/^@/, '')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          telegram: e.target.value
                        }
                      }))}
                      className="flex-1 min-w-0 block w-full px-3 py-2 sm:text-sm"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex  ">
                    <span className="inline-flex items-center px-3 border border-r-0  text-stone-500 sm:text-sm">
                      instagram/@
                    </span>
                    <Input
                      id="instagram"
                      value={formData.socialMedia.instagram.replace(/^@/, '')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          instagram: e.target.value
                        }
                      }))}
                      className="flex-1 min-w-0 block w-full px-3 py-2 sm:text-sm"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  
                  <div className="flex  ">
                    <span className="inline-flex items-center px-3  border border-r-0  text-stone-500 sm:text-sm">
                      linkedin.com/in/
                    </span>
                    <Input
                      id="linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          linkedin: e.target.value
                        }
                      }))}
                      className="flex-1 min-w-0 block w-full px-3 py-2 sm:text-sm"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex  ">
                    <span className="inline-flex items-center px-3 border border-r-0  text-stone-500 sm:text-sm">
                      facebook.com/
                    </span>
                    <Input
                      id="facebook"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          facebook: e.target.value
                        }
                      }))}
                      className="flex-1 min-w-0 block w-full px-3 py-2 sm:text-sm"
                      placeholder="username"
                    />
                  </div>
                </div>
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
                          const value = e.target.value ? Math.max(100, parseInt(e.target.value)) : '';
                          setFormData(prev => ({
                            ...prev,
                            minCarpetArea: value as number | ''
                          }));
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

            {/* Country Multi-select */}
            <div className="space-y-2">
                <Label htmlFor="countries">Select Countries *</Label>
                <div className="relative">
                    <Input
                    type="text"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && countryInput.trim()) {
                        e.preventDefault();
                        const country = countryInput.trim();
                        if (!selectedCountries.includes(country)) {
                            setSelectedCountries([...selectedCountries, country]);
                        }
                        setCountryInput('');
                        }
                    }}
                    placeholder="Type a country name and press Enter"
                    className="pr-10"
                    />
                    {countryInput && (
                    <button
                        onClick={() => setCountryInput('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    )}
                </div>

                {/* Selected Countries List */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCountries.map((country) => (
                    <Badge
                        key={country}
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        {country}
                        <button
                        onClick={() => {
                            setSelectedCountries(
                            selectedCountries.filter((c) => c !== country)
                            );
                        }}
                        className="ml-1 text-stone-400 hover:text-stone-600"
                        >
                        <X className="h-3 w-3" />
                        </button>
                    </Badge>
                    ))}
                </div>
            </div>

            {/* Country Cards */}
            <div className="">
            {selectedCountries.map((country) => (
                <Card key={country} className="relative py-5">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                    <div>
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
            <Label htmlFor="countries">Business Registration Certificate *</Label>

                <div 
                  className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-8 text-center cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    // Handle file drop
                    const files = Array.from(e.dataTransfer.files);
                    handleInteriorFiles(files);
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
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleInteriorFiles(files);
                    }}
                  />
                </div>
                    {/* Country Multi-select */}
            <div className="space-y-2">
            <div className="flex justify-between items-center border-t pt-4 pb-4">
            <Label htmlFor="countries">Select City *</Label>

                        <div className="flex items-center space-x-2">
                            <Label htmlFor="airplane-mode">Available Nationwide</Label>
                            <Switch id="airplane-mode" />
                        </div>
                    </div>
                <div className="relative">
                    <Input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && cityInput.trim()) {
                        e.preventDefault();
                        const city = cityInput.trim();
                        if (!selectedCities.includes(city)) {
                            setSelectedCities([...selectedCities, city]);
                        }
                        setCityInput('');
                        }
                    }}
                    placeholder="Type a city name and press Enter"
                    className="pr-10"
                    />
                    {cityInput && (
                    <button
                        onClick={() => setCityInput('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    )}
                </div>

                {/* Selected City List */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCities.map((city) => (
                    <Badge
                        key={city}
                        variant="secondary"
                        className="flex dark:hover:text-stone-400 hover:text-stone-600 dark:bg-stone-700 items-center gap-1"
                    >
                        {city}
                        <button
                        onClick={() => {
                            setSelectedCities(
                            selectedCities.filter((c) => c !== city)
                            );
                        }}
                        className="ml-1 text-stone-400 dark:text-stone-400 hover:text-stone-600"
                        >
                        <X className="h-3 w-3" />
                        </button>
                    </Badge>
                    ))}
                </div>
            </div>
                    <div className="flex justify-between items-center border-t pt-4">
                        <Label htmlFor="airplane-mode">Min Total Investment for 500 sqft *</Label>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="airplane-mode">Update Finance</Label>
                            <Switch id="airplane-mode" />
                        </div>
                    </div>
                    <h2 className="font-bold border-b pb-4">$50,000</h2>

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
                            const value = e.target.value ? Math.max(100, parseInt(e.target.value)) : '';
                            setFormData(prev => ({
                                ...prev,
                                minCarpetArea: value as number | ''
                            }));
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
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    // Handle file drop
                    const files = Array.from(e.dataTransfer.files);
                    handleInteriorFiles(files);
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
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleInteriorFiles(files);
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {interiorPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.preview}
                          alt="Interior preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button 
                          type="button"
                          onClick={() => removeInteriorPhoto(photo.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
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
                          <div className="w-full md:w-1/3 bg-stone-100 dark:bg-stone-800 p-4 flex items-center justify-center">
                            <div className="relative w-full h-48 md:h-full flex items-center justify-center">
                              {product.photo ? (
                                <>
                                  <img
                                    src={product.photo.preview}
                                    alt="Product preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      URL.revokeObjectURL(product.photo!.preview);
                                      updateProduct(product.id, 'photo', undefined as any);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <div className="text-center">
                                  <UploadCloud className="w-10 h-10 mx-auto text-stone-400 mb-2" />
                                  <p className="text-sm text-stone-600 dark:text-stone-400">
                                    <span className="text-yellow-600 font-medium">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-stone-500 mt-1">
                                    PNG, JPG, JPEG (max. 5MB)
                                  </p>
                                </div>
                              )}
                              <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleProductPhoto(product.id, file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Right Section - Product Details */}
                          <div className="w-full md:w-2/3 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium">Product #{index + 1}</h4>
                                <p className="text-sm text-stone-500">
                                  {product.name || 'Add product details'}
                                  {product.category !== 'none' && ` • ${product.category}`}
                                </p>
                              </div>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to remove this product?')) {
                                    if (product.photo) {
                                      URL.revokeObjectURL(product.photo.preview);
                                    }
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
                                        <div className="  px-2">
                                          {PRODUCT_CATEGORIES.map((category) => (
                                            <div key={category} className="col-span-1">
                                              <SelectItem value={category} className="text-sm truncate">
                                                {category}
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
                onClick={() => {
                  setLoading(true);
                  // Simulate payment processing
                  setTimeout(() => {
                    setLoading(false);
                    toast.success('Brand registered successfully!');
                    // Navigate to franchise account page
                    router.push('/franchise/account');
                  }, 1000);
                }}
                className="bg-green-600 hover:bg-green-700"
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

export default BrandRegister;
