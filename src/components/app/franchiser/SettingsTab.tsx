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

    </div>
  );
}
