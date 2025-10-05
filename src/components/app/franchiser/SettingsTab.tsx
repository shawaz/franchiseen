"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useMasterData } from '@/hooks/useMasterData';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useConvexImageUrls } from '@/hooks/useConvexImageUrl';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Plus, UploadCloud, X } from 'lucide-react';

// Reserved words that cannot be used as brand URLs
const RESERVED_WORDS = [
  'account', 'admin', 'like', 'notify', 'create', 'register', 'company',
  'api', 'www', 'mail', 'ftp', 'blog', 'support', 'help', 'about',
  'contact', 'privacy', 'terms', 'legal', 'security', 'login', 'signup',
  'dashboard', 'profile', 'settings', 'billing', 'payment', 'checkout',
  'cart', 'shop', 'store', 'product', 'search', 'filter', 'sort',
  'home', 'index', 'main', 'app', 'mobile', 'desktop', 'web'
];

interface SettingsTabProps {
  franchiserId?: string;
  brandData?: {
    name: string;
    slug: string;
    description: string;
    industry: string;
    category: string;
    website?: string;
    logoUrl?: string;
    timingPerWeek: {
      is24Hours: boolean;
      days: string[];
      startTime: string;
      endTime: string;
    };
  };
  interiorImages?: string[];
  onUpdateBrand?: (updates: Partial<SettingsTabProps['brandData']>) => void;
  onUpdateInteriorImages?: (images: string[]) => void;
}

export default function SettingsTab({ 
  franchiserId, 
  brandData, 
  interiorImages = [],
  onUpdateBrand
}: SettingsTabProps) {
  // SettingsTab component for brand management
  const { industries, categories, isLoading: masterDataLoading } = useMasterData();
  const { uploadFile } = useFileUpload();
  const updateFranchiser = useMutation(api.franchises.updateFranchiser);
  
  // State for loading
  const [isUpdating, setIsUpdating] = useState(false);

  // State for interior photos
  const [isDragging, setIsDragging] = useState(false);
  const [interiorPhotos, setInteriorPhotos] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [removedExistingPhotos, setRemovedExistingPhotos] = useState<Set<number>>(new Set());
  
  // Get existing interior image URLs using Convex hook
  const existingInteriorImageUrls = useConvexImageUrls((interiorImages as Id<"_storage">[]) || []);

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<{
    website?: string;
    brandUrl?: string;
  }>({});

  // Simplified URL validation state
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brandName: brandData?.name || '',
    brandUrl: brandData?.slug || '',
    industry: brandData?.industry || '',
    category: brandData?.category || '',
    shortDescription: brandData?.description || '',
    website: brandData?.website || '',
    timingPerWeek: brandData?.timingPerWeek || {
      is24Hours: false,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00'
    },
    logoFile: null as File | null,
    logoPreview: brandData?.logoUrl || null as string | null,
  });


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
    if (formData.logoPreview && formData.logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    setFormData(prev => ({
      ...prev,
      logoFile: null,
      logoPreview: brandData?.logoUrl || null
    }));
  };

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
      const newFileName = `${formData.brandName || 'brand'}-interior-${index + 1}.${fileExtension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      // Create preview URL using FileReader as base64
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
      
      return {
        id: Math.random().toString(36).substring(7),
        file: renamedFile,
        preview: previewUrl
      };
    }));
    
    setInteriorPhotos(prev => {
      const updated = [...prev, ...newPhotos];
      return updated.slice(0, 10); // Limit to 10 photos max
    });
  };

  // Remove interior photo
  const removeInteriorPhoto = (id: string) => {
    setInteriorPhotos(prev => {
      return prev.filter(photo => photo.id !== id);
    });
  };

  // Remove existing interior photo
  const removeExistingInteriorPhoto = (index: number) => {
    setRemovedExistingPhotos(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!franchiserId) {
      toast.error('Franchiser ID not found');
      return;
    }

    setIsUpdating(true);
    
    try {
      let logoStorageId = null;
      let interiorImageStorageIds: string[] = [];
      
      // Upload logo if there's a new file
      if (formData.logoFile) {
        logoStorageId = await uploadFile(formData.logoFile);
      }

      // Upload interior photos if there are new files
      if (interiorPhotos.length > 0) {
        const newImageStorageIds = await Promise.all(
          interiorPhotos.map(photo => uploadFile(photo.file))
        );
        interiorImageStorageIds = [...interiorImageStorageIds, ...newImageStorageIds];
      }

      // Keep existing photos that weren't removed
      if (interiorImages && interiorImages.length > 0) {
        const keptExistingImageIds = interiorImages.filter((_, index) => !removedExistingPhotos.has(index));
        interiorImageStorageIds = [...interiorImageStorageIds, ...keptExistingImageIds];
      }
      
      // Prepare update data
      const updateData: {
        id: Id<"franchiser">;
        name: string;
        description: string;
        industry: string;
        category: string;
        website?: string;
        logoStorageId?: string;
        logoUrl?: Id<"_storage">;
        interiorImages?: Id<"_storage">[];
      } = {
        id: franchiserId as Id<"franchiser">,
        name: formData.brandName,
        description: formData.shortDescription,
        industry: formData.industry,
        category: formData.category,
        website: formData.website || undefined,
      };
      
      // Add logo URL if uploaded
      if (logoStorageId) {
        updateData.logoUrl = logoStorageId as Id<"_storage">;
      }

      // Add interior images if uploaded
      if (interiorImageStorageIds.length > 0) {
        updateData.interiorImages = interiorImageStorageIds as Id<"_storage">[];
      }
      
      // Update franchiser
      await updateFranchiser(updateData);
      
      toast.success('Brand settings updated successfully!');
      
      // Call the onUpdateBrand callback if provided
      if (onUpdateBrand) {
        onUpdateBrand({
          name: formData.brandName,
          slug: formData.brandUrl,
          description: formData.shortDescription,
          industry: formData.industry,
          category: formData.category,
          website: formData.website,
          logoUrl: logoStorageId ? `storage:${logoStorageId}` : brandData?.logoUrl,
          timingPerWeek: formData.timingPerWeek,
        });
      }
      
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available categories based on selected industry
  const availableCategories = useMemo(() => {
    if (!categories || !formData.industry) return [];
    return categories.filter(cat => cat.industryId === formData.industry);
  }, [categories, formData.industry]);

  // Format website URL to ensure it has https://
  const formatWebsiteUrl = (url: string): string => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
  };

  // Show loading state while master data is being fetched
  if (masterDataLoading) {
    return (
      <Card className="w-full py-6">
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
    <Card className="w-full py-6">
      <CardContent>
        <div className="space-y-6">
          {/* Brand Settings Section */}
          <div className="space-y-6">

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Brand Logo *</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 border border-dashed dark:border-stone-600 flex items-center justify-center overflow-hidden">
                {formData.logoPreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={formData.logoPreview}
                      alt="Logo preview"
                      fill
                      sizes="96px"
                      unoptimized
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
                  className="inline-flex items-center px-4 py-2 border text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 dark:border-stone-600 hover:focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
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
                  {industries?.map((industry) => (
                    <SelectItem key={industry._id} value={industry._id}>
                      {industry.icon && <span className="mr-2">{industry.icon}</span>}
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
                    <SelectItem key={category._id} value={category._id}>
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
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

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          </div>

          {/* Interior Photos Section */}
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-semibold">Interior Photos</h3>
            <p className="text-stone-500 text-sm">
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
                const files = Array.from(e.dataTransfer.files);
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
                  await handleInteriorFiles(files);
                }}
              />
            </div>

            {/* Uploaded Photos Grid */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">
                Interior Photos ({(existingInteriorImageUrls?.filter((_, index) => !removedExistingPhotos.has(index)).length || 0) + interiorPhotos.length}/10)
                {((existingInteriorImageUrls?.filter((_, index) => !removedExistingPhotos.has(index)).length || 0) + interiorPhotos.length) < 3 && (
                  <span className="text-red-500 text-xs font-normal ml-2">
                    Minimum 3 photos required
                  </span>
                )}
              </h4>
              {(!existingInteriorImageUrls || existingInteriorImageUrls.length === 0) && interiorPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <UploadCloud className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400 mb-2">
                    No interior photos uploaded yet
                  </h3>
                  <p className="text-stone-500 mb-4">
                    Upload interior photos to showcase your franchise to potential franchisees
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Existing photos */}
                  {existingInteriorImageUrls?.map((imageUrl, index) => {
                    if (removedExistingPhotos.has(index)) return null;
                    return (
                      <div key={`existing-${index}`} className="relative group">
                        <Image
                          src={imageUrl || ''}
                          alt="Interior preview"
                          width={300}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button 
                          type="button"
                          onClick={() => removeExistingInteriorPhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* New photos */}
                  {interiorPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <Image
                        src={photo.preview}
                        alt="Interior preview"
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        onClick={() => removeInteriorPhoto(photo.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                  
                  {((existingInteriorImageUrls?.filter((_, index) => !removedExistingPhotos.has(index)).length || 0) + interiorPhotos.length) < 10 && (
                    <label 
                      htmlFor="interior-photos" 
                      className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                    >
                      <Plus className="w-8 h-8 text-stone-400 mb-1" />
                      <span className="text-xs text-stone-500">Add Photo</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
