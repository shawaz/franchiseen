"use client";

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Define form schema
const formSchema = z.object({
  brandInfo: z.object({
    brandName: z.string().min(2, 'Brand name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    industry: z.string().min(1, 'Industry is required'),
    category: z.string().min(1, 'Category is required'),
    website: z.string().url('Please enter a valid URL').or(z.literal('')),
    logo: z.any().optional(),
    socialMedia: z.object({
      facebook: z.string().url('Please enter a valid URL').or(z.literal('')),
      instagram: z.string().url('Please enter a valid URL').or(z.literal('')),
      linkedin: z.string().url('Please enter a valid URL').or(z.literal('')),
      twitter: z.string().url('Please enter a valid URL').or(z.literal('')),
    }),
  }),
  finance: z.object({
    franchiseFee: z.coerce.number().min(0, 'Must be a positive number'),
    minSqft: z.coerce.number().min(0, 'Must be a positive number'),
    setupCostPerSqft: z.coerce.number().min(0, 'Must be a positive number'),
    workingCapitalPerSqft: z.coerce.number().min(0, 'Must be a positive number'),
    annualReturnsPercentage: z.coerce.number().min(0, 'Must be a positive number'),
    showMonthly: z.boolean().default(false),
  }),
  location: z.object({
    countries: z.array(z.string()).min(1, 'At least one country is required'),
  }),
  showcase: z.object({
    images: z.array(z.any()).optional(),
    products: z.array(z.object({
      id: z.string(),
      name: z.string().min(1, 'Product name is required'),
      description: z.string().min(1, 'Product description is required'),
      cost: z.coerce.number().min(0, 'Cost must be positive'),
      margin: z.coerce.number().min(0, 'Margin must be positive'),
      price: z.coerce.number().min(0, 'Price must be positive'),
    })),
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Dummy data for dropdowns
const industries = [
  'Food & Beverage',
  'Retail',
  'Health & Fitness',
  'Education',
  'Beauty & Personal Care',
  'Home Services',
  'Automotive',
  'Other',
];

const categories = [
  'Quick Service Restaurant',
  'Casual Dining',
  'Coffee Shop',
  'Retail Store',
  'Service Business',
  'Home Based',
  'Mobile Business',
];

const countriesList = [
  { id: 'us', name: 'United States' },
  { id: 'ca', name: 'Canada' },
  { id: 'uk', name: 'United Kingdom' },
  { id: 'au', name: 'Australia' },
  { id: 'in', name: 'India' },
];

export function SettingsTab() {
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showcaseImageInputRef = useRef<HTMLInputElement>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        products: [
          {
            id: '1',
            name: '',
            description: '',
            cost: 0,
            margin: 0,
            price: 0,
          },
        ],
      },
    },
  });

  const watchFinance = watch('finance');
  const watchLocation = watch('location');
  const watchShowcase = watch('showcase');

  // Calculate derived values
  const calculateTotalInvestment = (): number => {
    const { franchiseFee, minSqft, setupCostPerSqft, workingCapitalPerSqft } = watchFinance;
    return (
      (franchiseFee || 0) +
      (minSqft || 0) * (setupCostPerSqft || 0) +
      (minSqft || 0) * (workingCapitalPerSqft || 0)
    );
  };

  const calculateAnnualReturns = (): number => {
    return (calculateTotalInvestment() * (watchFinance.annualReturnsPercentage || 0)) / 100;
  };

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    toast.success('Settings saved successfully!');
  };

  // Handle country selection
  const handleCountryChange = (countryId: string) => {
    const newCountries = selectedCountries.includes(countryId)
      ? selectedCountries.filter((id) => id !== countryId)
      : [...selectedCountries, countryId];
    
    setSelectedCountries(newCountries);
    setValue('location.countries', newCountries, { shouldValidate: true });
  };

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      setValue('brandInfo.logo', file, { shouldValidate: true });
    }
  };

  // Handle showcase images upload
  const handleShowcaseImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageUrls = files.map((file) => URL.createObjectURL(file));
      setShowcaseImages((prev) => [...prev, ...imageUrls]);

      const currentImages = watchShowcase.images || [];
      setValue('showcase.images', [...currentImages, ...files], { shouldValidate: true });
    }
  };

  // Remove showcase image
  const removeShowcaseImage = (index: number) => {
    const newImages = [...showcaseImages];
    newImages.splice(index, 1);
    setShowcaseImages(newImages);

    const currentFiles = watchShowcase.images || [];
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    setValue('showcase.images', updatedFiles, { shouldValidate: true });
  };

  const totalInvestment = calculateTotalInvestment();
  const annualReturns = calculateAnnualReturns();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>Update your brand details and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Controller
                  name="brandInfo.brandName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="brandName"
                      placeholder="Enter brand name"
                      {...field}
                      className={errors.brandInfo?.brandName ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.brandInfo?.brandName && (
                  <p className="text-sm text-red-500">{errors.brandInfo.brandName.message}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Controller
                  name="brandInfo.industry"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="industry"
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.brandInfo?.industry && (
                  <p className="text-sm text-red-500">{errors.brandInfo.industry.message}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Controller
                  name="brandInfo.website"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      {...field}
                      className={errors.brandInfo?.website ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.brandInfo?.website && (
                  <p className="text-sm text-red-500">{errors.brandInfo.website.message}</p>
                )}
              </div>

              {/* Franchise Fee */}
              <div className="space-y-2">
                <Label htmlFor="franchiseFee">Franchise Fee ($)</Label>
                <Controller
                  name="finance.franchiseFee"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="franchiseFee"
                      type="number"
                      placeholder="10000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={errors.finance?.franchiseFee ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.finance?.franchiseFee && (
                  <p className="text-sm text-red-500">{errors.finance.franchiseFee.message}</p>
                )}
              </div>

              {/* Minimum Square Footage */}
              <div className="space-y-2">
                <Label htmlFor="minSqft">Minimum Square Footage</Label>
                <Controller
                  name="finance.minSqft"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="minSqft"
                      type="number"
                      placeholder="1000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={errors.finance?.minSqft ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.finance?.minSqft && (
                  <p className="text-sm text-red-500">{errors.finance.minSqft.message}</p>
                )}
              </div>

              {/* Setup Cost per Sq Ft */}
              <div className="space-y-2">
                <Label htmlFor="setupCostPerSqft">Setup Cost per Sq Ft ($)</Label>
                <Controller
                  name="finance.setupCostPerSqft"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="setupCostPerSqft"
                      type="number"
                      placeholder="150"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={errors.finance?.setupCostPerSqft ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.finance?.setupCostPerSqft && (
                  <p className="text-sm text-red-500">{errors.finance.setupCostPerSqft.message}</p>
                )}
              </div>

              {/* Total Investment */}
              <div className="space-y-2">
                <Label>Estimated Total Investment</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-2xl font-bold">${totalInvestment.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Includes franchise fee and setup costs
                  </p>
                </div>
              </div>

              {/* Annual Returns */}
              <div className="space-y-2">
                <Label>Estimated Annual Returns</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-2xl font-bold">${annualReturns.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Based on {watchFinance.annualReturnsPercentage || 0}% of total investment
                  </p>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center space-x-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Brand logo preview"
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">Logo</span>
                    </div>
                  )}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Logo
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Showcase Images */}
              <div className="space-y-2 md:col-span-2">
                <Label>Showcase Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {showcaseImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Showcase ${index + 1}`}
                        className="h-32 w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeShowcaseImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div
                    className="border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors h-32"
                    onClick={() => showcaseImageInputRef.current?.click()}
                  >
                    <div className="text-center p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto text-muted-foreground mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="text-sm text-muted-foreground">Add Image</p>
                    </div>
                    <input
                      type="file"
                      ref={showcaseImageInputRef}
                      onChange={handleShowcaseImages}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Countries */}
              <div className="space-y-2 md:col-span-2">
                <Label>Available Countries</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
                  {countriesList.map((country) => (
                    <div key={country.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`country-${country.id}`}
                        checked={selectedCountries.includes(country.id)}
                        onChange={() => handleCountryChange(country.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`country-${country.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {country.name}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.location?.countries && (
                  <p className="text-sm text-red-500">{errors.location.countries.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Brand Description</Label>
                <Controller
                  name="brandInfo.description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder="Tell us about your brand..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  )}
                />
                {errors.brandInfo?.description && (
                  <p className="text-sm text-red-500">{errors.brandInfo.description.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
