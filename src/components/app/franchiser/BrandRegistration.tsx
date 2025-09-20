"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X, MapPin, Globe, DollarSign, Home, Image as ImageIcon, Package, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

// Define form schemas for each section
const brandInfoSchema = z.object({
  logo: z.any(),
  brandName: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  industry: z.string().min(1, 'Industry is required'),
  category: z.string().min(1, 'Category is required'),
  website: z.string().url('Please enter a valid URL').or(z.literal('')),
  socialMedia: z.object({
    facebook: z.string().url('Please enter a valid URL').or(z.literal('')),
    instagram: z.string().url('Please enter a valid URL').or(z.literal('')),
    linkedin: z.string().url('Please enter a valid URL').or(z.literal('')),
    twitter: z.string().url('Please enter a valid URL').or(z.literal('')),
  }),
});

const financeSchema = z.object({
  franchiseFee: z.number().min(0, 'Must be a positive number'),
  minSqft: z.number().min(0, 'Must be a positive number'),
  setupCostPerSqft: z.number().min(0, 'Must be a positive number'),
  workingCapitalPerSqft: z.number().min(0, 'Must be a positive number'),
  annualReturnsPercentage: z.number().min(0, 'Must be a positive number'),
  showMonthly: z.boolean(),
});

const locationSchema = z.object({
  countries: z.array(z.object({
    id: z.string(),
    name: z.string(),
    registrationCertificate: z.any().optional(),
    isNationwide: z.boolean(),
    cities: z.array(z.string()),
    customFranchiseFee: z.number().optional(),
    customSetupCost: z.number().optional(),
    customWorkingCapital: z.number().optional(),
  })),
});

const showcaseSchema = z.object({
  images: z.array(z.any()),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    cost: z.number(),
    margin: z.number(),
    price: z.number(),
    image: z.any().optional(),
  })),
});

// Combine all schemas
export const formSchema = z.object({
  brandInfo: brandInfoSchema,
  finance: financeSchema,
  location: locationSchema,
  showcase: showcaseSchema,
});

export type FormValues = z.infer<typeof formSchema>;

export interface BrandRegistrationProps {
  onSubmit: (data: FormValues) => void;
  defaultValues?: Partial<FormValues>;
}

export function BrandRegistration({ onSubmit, defaultValues }: BrandRegistrationProps) {
  const [activeTab, setActiveTab] = useState('brand-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [countryInput, setCountryInput] = useState('');
  const [cityInputs, setCityInputs] = useState<Record<string, string>>({});
  const [productInputs, setProductInputs] = useState<Record<string, { name: string; description: string; cost: string; margin: string }>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImageRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const showcaseImageRef = useRef<HTMLInputElement>(null);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    register, 
    setValue, 
    watch, 
    trigger 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      brandInfo: {
        brandName: '',
        slug: '',
        description: '',
        industry: '',
        category: '',
        website: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          linkedin: '',
          twitter: '',
        },
      },
      finance: {
        franchiseFee: 0,
        minSqft: 0,
        setupCostPerSqft: 0,
        workingCapitalPerSqft: 0,
        annualReturnsPercentage: 0,
        showMonthly: false,
      },
      location: {
        countries: [],
      },
      showcase: {
        images: [],
        products: [],
      },
    },
  });

  const brandInfo = watch('brandInfo');
  const finance = watch('finance');
  const location = watch('location');
  const showcase = watch('showcase');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('brandInfo.logo', file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCountry = () => {
    if (!countryInput.trim()) return;
    
    const newCountry = {
      id: Date.now().toString(),
      name: countryInput,
      isNationwide: false,
      cities: [],
    };
    
    setValue('location.countries', [...(location?.countries || []), newCountry]);
    setCountryInput('');
    setCityInputs(prev => ({ ...prev, [newCountry.id]: '' }));
  };

  const handleAddCity = (countryId: string) => {
    const city = cityInputs[countryId]?.trim();
    if (!city) return;
    
    const countryIndex = location.countries.findIndex(c => c.id === countryId);
    if (countryIndex === -1) return;
    
    const updatedCountries = [...location.countries];
    updatedCountries[countryIndex] = {
      ...updatedCountries[countryIndex],
      cities: [...(updatedCountries[countryIndex].cities || []), city]
    };
    
    setValue('location.countries', updatedCountries);
    setCityInputs(prev => ({ ...prev, [countryId]: '' }));
  };

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now().toString(),
      name: '',
      description: '',
      cost: 0,
      margin: 0,
      price: 0,
    };
    
    setValue('showcase.products', [...(showcase?.products || []), newProduct]);
    setProductInputs(prev => ({
      ...prev,
      [newProduct.id]: { name: '', description: '', cost: '0', margin: '0' }
    }));
  };

  const handleProductImageChange = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const updatedProducts = showcase.products.map(p => 
      p.id === productId ? { ...p, image: file } : p
    );
    
    setValue('showcase.products', updatedProducts);
    setImagePreviews(prev => ({
      ...prev,
      [productId]: URL.createObjectURL(file)
    }));
  };

  const handleShowcaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setValue('showcase.images', [...(showcase?.images || []), ...files]);
  };

  const onSubmitHandler = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="brand-info">Brand Info</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>

        {/* Brand Info Tab */}
        <TabsContent value="brand-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>Enter your brand details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={logoPreview || ''} alt={brandInfo?.brandName} />
                    <AvatarFallback>BR</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
                {/* {errors.brandInfo?.logo && (
                  <p className="text-sm text-red-500">{errors.brandInfo.logo.message}</p>
                )} */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="Enter brand name"
                    {...register('brandInfo.brandName')}
                  />
                  {errors.brandInfo?.brandName && (
                    <p className="text-sm text-red-500">{errors.brandInfo.brandName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Brand URL Slug</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      franchiseen.vercel.app/
                    </span>
                    <Input
                      id="slug"
                      className="rounded-l-none"
                      placeholder="your-brand-name"
                      {...register('brandInfo.slug')}
                    />
                  </div>
                  {errors.brandInfo?.slug && (
                    <p className="text-sm text-red-500">{errors.brandInfo.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brand Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your brand..."
                  className="min-h-[120px]"
                  {...register('brandInfo.description')}
                />
                {errors.brandInfo?.description && (
                  <p className="text-sm text-red-500">{errors.brandInfo.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    onValueChange={(value) => setValue('brandInfo.industry', value)}
                    value={brandInfo?.industry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="health">Health & Beauty</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="services">Business Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.brandInfo?.industry && (
                    <p className="text-sm text-red-500">{errors.brandInfo.industry.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue('brandInfo.category', value)}
                    value={brandInfo?.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="franchisor">Franchisor</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.brandInfo?.category && (
                    <p className="text-sm text-red-500">{errors.brandInfo.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourbrand.com"
                  {...register('brandInfo.website')}
                />
                {errors.brandInfo?.website && (
                  <p className="text-sm text-red-500">{errors.brandInfo.website.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Social Media (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-5 h-5 flex items-center justify-center">f</span>
                      <Input
                        placeholder="Facebook URL"
                        {...register('brandInfo.socialMedia.facebook')}
                      />
                    </div>
                    {errors.brandInfo?.socialMedia?.facebook && (
                      <p className="text-sm text-red-500">
                        {errors.brandInfo.socialMedia.facebook.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-5 h-5 flex items-center justify-center">ig</span>
                      <Input
                        placeholder="Instagram URL"
                        {...register('brandInfo.socialMedia.instagram')}
                      />
                    </div>
                    {errors.brandInfo?.socialMedia?.instagram && (
                      <p className="text-sm text-red-500">
                        {errors.brandInfo.socialMedia.instagram.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-5 h-5 flex items-center justify-center">in</span>
                      <Input
                        placeholder="LinkedIn URL"
                        {...register('brandInfo.socialMedia.linkedin')}
                      />
                    </div>
                    {errors.brandInfo?.socialMedia?.linkedin && (
                      <p className="text-sm text-red-500">
                        {errors.brandInfo.socialMedia.linkedin.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-5 h-5 flex items-center justify-center">X</span>
                      <Input
                        placeholder="Twitter (X) URL"
                        {...register('brandInfo.socialMedia.twitter')}
                      />
                    </div>
                    {errors.brandInfo?.socialMedia?.twitter && (
                      <p className="text-sm text-red-500">
                        {errors.brandInfo.socialMedia.twitter.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="button" 
                onClick={() => setActiveTab('finance')}
              >
                Next: Finance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Set up your financial requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="franchiseFee">Franchise Fee (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="franchiseFee"
                      type="number"
                      className="pl-8"
                      {...register('finance.franchiseFee', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.finance?.franchiseFee && (
                    <p className="text-sm text-red-500">{errors.finance.franchiseFee.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minSqft">Minimum Space Required (sqft)</Label>
                  <Input
                    id="minSqft"
                    type="number"
                    {...register('finance.minSqft', { valueAsNumber: true })}
                  />
                  {errors.finance?.minSqft && (
                    <p className="text-sm text-red-500">{errors.finance.minSqft.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setupCostPerSqft">Setup Cost per sqft (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="setupCostPerSqft"
                      type="number"
                      className="pl-8"
                      {...register('finance.setupCostPerSqft', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.finance?.setupCostPerSqft && (
                    <p className="text-sm text-red-500">{errors.finance.setupCostPerSqft.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingCapitalPerSqft">Working Capital per sqft (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="workingCapitalPerSqft"
                      type="number"
                      className="pl-8"
                      {...register('finance.workingCapitalPerSqft', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.finance?.workingCapitalPerSqft && (
                    <p className="text-sm text-red-500">{errors.finance.workingCapitalPerSqft.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualReturnsPercentage">Expected Annual Returns (%)</Label>
                  <Input
                    id="annualReturnsPercentage"
                    type="number"
                    {...register('finance.annualReturnsPercentage', { valueAsNumber: true })}
                  />
                  {errors.finance?.annualReturnsPercentage && (
                    <p className="text-sm text-red-500">{errors.finance.annualReturnsPercentage.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between space-x-2 pt-6">
                  <Label htmlFor="showMonthly" className="flex-1">
                    Show monthly payment options
                  </Label>
                  <Controller
                    name="finance.showMonthly"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="showMonthly"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('brand-info')}
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab('location')}
              >
                Next: Location
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Availability</CardTitle>
              <CardDescription>Specify where your franchise is available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a country"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCountry())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddCountry}
                    disabled={!countryInput.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Country
                  </Button>
                </div>

                <div className="space-y-4">
                  {location?.countries?.map((country) => (
                    <div key={country.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">{country.name}</h4>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setValue(
                              'location.countries', 
                              location.countries.filter(c => c.id !== country.id)
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>

                      <div className="pl-7 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Controller
                            name={`location.countries.${location.countries.findIndex(c => c.id === country.id)}.isNationwide`}
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`nationwide-${country.id}`}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <Label htmlFor={`nationwide-${country.id}`} className="font-normal">
                                  Available nationwide
                                </Label>
                              </div>
                            )}
                          />
                        </div>

                        {!country.isNationwide && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a city"
                                value={cityInputs[country.id] || ''}
                                onChange={(e) => 
                                  setCityInputs(prev => ({
                                    ...prev,
                                    [country.id]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => 
                                  e.key === 'Enter' && 
                                  (e.preventDefault(), handleAddCity(country.id))
                                }
                              />
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => handleAddCity(country.id)}
                                disabled={!cityInputs[country.id]?.trim()}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add City
                              </Button>
                            </div>

                            {country.cities && country.cities.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {country.cities.map((city, idx) => (
                                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                    {city}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const countryIndex = location.countries.findIndex(c => c.id === country.id);
                                        if (countryIndex === -1) return;
                                        
                                        const updatedCountries = [...location.countries];
                                        updatedCountries[countryIndex] = {
                                          ...updatedCountries[countryIndex],
                                          cities: updatedCountries[countryIndex].cities.filter((_, i) => i !== idx)
                                        };
                                        
                                        setValue('location.countries', updatedCountries);
                                      }}
                                      className="ml-1"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-2">
                          <Label>Registration Certificate (Optional)</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'application/pdf,image/*';
                                input.onchange = (e: Event) => {
                                  const target = e.target as HTMLInputElement;
                                  const file = target.files?.[0];
                                  if (!file) return;
                                  
                                  const countryIndex = location.countries.findIndex(c => c.id === country.id);
                                  if (countryIndex === -1) return;
                                  
                                  const updatedCountries = [...location.countries];
                                  updatedCountries[countryIndex] = {
                                    ...updatedCountries[countryIndex],
                                    registrationCertificate: file
                                  };
                                  
                                  setValue('location.countries', updatedCountries);
                                };
                                input.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Certificate
                            </Button>
                            {country.registrationCertificate && (
                              <span className="text-sm text-muted-foreground">
                                {country.registrationCertificate.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-normal text-muted-foreground">Custom Franchise Fee (USD)</Label>
                            <Input
                              type="number"
                              placeholder="Same as default"
                              {...register(`location.countries.${location.countries.findIndex(c => c.id === country.id)}.customFranchiseFee`, { valueAsNumber: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-normal text-muted-foreground">Custom Setup Cost (USD)</Label>
                            <Input
                              type="number"
                              placeholder="Same as default"
                              {...register(`location.countries.${location.countries.findIndex(c => c.id === country.id)}.customSetupCost`, { valueAsNumber: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-normal text-muted-foreground">Custom Working Capital (USD)</Label>
                            <Input
                              type="number"
                              placeholder="Same as default"
                              {...register(`location.countries.${location.countries.findIndex(c => c.id === country.id)}.customWorkingCapital`, { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('finance')}
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab('showcase')}
              >
                Next: Showcase
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Showcase Tab */}
        <TabsContent value="showcase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Showcase</CardTitle>
              <CardDescription>Showcase your brand with images and products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Brand Images</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload high-quality images that represent your brand (max 10 images)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {showcase?.images?.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Brand image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newImages = [...showcase.images];
                            newImages.splice(index, 1);
                            setValue('showcase.images', newImages);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    {(!showcase?.images || showcase.images.length < 10) && (
                      <div 
                        className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => showcaseImageRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={showcaseImageRef}
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleShowcaseImageChange}
                        />
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="text-sm">Add Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label>Products</Label>
                      <p className="text-sm text-muted-foreground">
                        Add your products or services
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddProduct}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {showcase?.products?.map((product, index) => (
                      <div key={product.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Product #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setValue(
                                'showcase.products', 
                                showcase.products.filter(p => p.id !== product.id)
                              );
                              
                              // Clean up preview if exists
                              if (imagePreviews[product.id]) {
                                URL.revokeObjectURL(imagePreviews[product.id]);
                                const newPreviews = { ...imagePreviews };
                                delete newPreviews[product.id];
                                setImagePreviews(newPreviews);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Product Image</Label>
                              <div 
                                className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => productImageRefs.current[product.id]?.click()}
                              >
                                <Input
                                  type="file"
                                  // ref={el => productImageRefs.current[product.id] = el}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleProductImageChange(product.id, e)}
                                />
                                {imagePreviews[product.id] ? (
                                  <img 
                                    src={imagePreviews[product.id]} 
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <>
                                    <ImageIcon className="h-6 w-6 mb-1" />
                                    <span className="text-sm">Upload Image</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`product-name-${product.id}`}>Product Name</Label>
                              <Input
                                id={`product-name-${product.id}`}
                                placeholder="Enter product name"
                                value={productInputs[product.id]?.name || ''}
                                onChange={(e) => {
                                  const newInputs = { ...productInputs };
                                  if (!newInputs[product.id]) {
                                    newInputs[product.id] = { name: '', description: '', cost: '0', margin: '0' };
                                  }
                                  newInputs[product.id].name = e.target.value;
                                  setProductInputs(newInputs);
                                  
                                  const updatedProducts = [...showcase.products];
                                  updatedProducts[index] = {
                                    ...updatedProducts[index],
                                    name: e.target.value
                                  };
                                  setValue('showcase.products', updatedProducts);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`product-desc-${product.id}`}>Description</Label>
                              <Textarea
                                id={`product-desc-${product.id}`}
                                placeholder="Enter product description"
                                className="min-h-[80px]"
                                value={productInputs[product.id]?.description || ''}
                                onChange={(e) => {
                                  const newInputs = { ...productInputs };
                                  if (!newInputs[product.id]) {
                                    newInputs[product.id] = { name: '', description: '', cost: '0', margin: '0' };
                                  }
                                  newInputs[product.id].description = e.target.value;
                                  setProductInputs(newInputs);
                                  
                                  const updatedProducts = [...showcase.products];
                                  updatedProducts[index] = {
                                    ...updatedProducts[index],
                                    description: e.target.value
                                  };
                                  setValue('showcase.products', updatedProducts);
                                }}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`product-cost-${product.id}`}>Cost (USD)</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                  <Input
                                    id={`product-cost-${product.id}`}
                                    type="number"
                                    className="pl-8"
                                    value={productInputs[product.id]?.cost || '0'}
                                    onChange={(e) => {
                                      const newInputs = { ...productInputs };
                                      if (!newInputs[product.id]) {
                                        newInputs[product.id] = { name: '', description: '', cost: '0', margin: '0' };
                                      }
                                      newInputs[product.id].cost = e.target.value;
                                      setProductInputs(newInputs);
                                      
                                      const cost = parseFloat(e.target.value) || 0;
                                      const margin = parseFloat(newInputs[product.id]?.margin || '0');
                                      const price = cost * (1 + margin / 100);
                                      
                                      const updatedProducts = [...showcase.products];
                                      updatedProducts[index] = {
                                        ...updatedProducts[index],
                                        cost,
                                        price
                                      };
                                      setValue('showcase.products', updatedProducts);
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`product-margin-${product.id}`}>Margin (%)</Label>
                                <div className="relative">
                                  <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                  <Input
                                    id={`product-margin-${product.id}`}
                                    type="number"
                                    className="pr-8"
                                    value={productInputs[product.id]?.margin || '0'}
                                    onChange={(e) => {
                                      const newInputs = { ...productInputs };
                                      if (!newInputs[product.id]) {
                                        newInputs[product.id] = { name: '', description: '', cost: '0', margin: '0' };
                                      }
                                      newInputs[product.id].margin = e.target.value;
                                      setProductInputs(newInputs);
                                      
                                      const cost = parseFloat(newInputs[product.id]?.cost || '0');
                                      const margin = parseFloat(e.target.value) || 0;
                                      const price = cost * (1 + margin / 100);
                                      
                                      const updatedProducts = [...showcase.products];
                                      updatedProducts[index] = {
                                        ...updatedProducts[index],
                                        margin,
                                        price
                                      };
                                      setValue('showcase.products', updatedProducts);
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Price (USD)</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                  <Input
                                    className="pl-8 bg-muted/50"
                                    value={product.price?.toFixed(2) || '0.00'}
                                    readOnly
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('location')}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Brand Registration'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
