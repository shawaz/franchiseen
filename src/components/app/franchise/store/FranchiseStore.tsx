"use client";

import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Building2, MapPin, Search } from 'lucide-react';
import { 
  DollarSign, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink, 
  CheckCircle, 
  ArrowDownRight, 
  CreditCard, 
  Settings, 
  Box, 
  Users, 
  Star, 
  Store, 
  Heart, 
  MapPin as MapPinIcon, 
  Share2, 
  Utensils, 
  Phone, 
  Mail, 
  Globe, 
} from 'lucide-react';
import Image from 'next/image';
import FranchisePOSWallet from '../FranchisePOSWallet';
import  ReviewsTab  from './tabs/ReviewsTab';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Franchisee {
  id: string;
  fullName: string;
  walletId: string;
  avatar: string;
  totalShares: number;
  totalInvested: number;
  isOfferActive: boolean;
  joinDate: string;
}

interface BudgetItem {
  id: string;
  category: string;
  type: 'one-time' | 'recurring';
  planned: number;
  actual: number;
  status: 'on-track' | 'over-budget' | 'under-budget' | 'not-started';
}

interface ReserveFund {
  total: number;
  current: number;
  isLocked: boolean;
  projectStatus: 'funding' | 'launch' | 'operational' | 'closed';
  lastUpdated: string;
}

interface MonthlyRevenue {
  month: string;
  estimated: number;
  actual: number;
  status: 'on-track' | 'below-target' | 'above-target';
}

export default function FranchiseStore() {
  const [activeTab, setActiveTab] = useState<'products' | 'franchisee' | 'finances' | 'stock' | 'income' | 'expense' | 'salaries' | 'tax' | 'earnings' | 'payouts' | 'transactions' | 'reviews' | 'franchise' | 'settings'>('franchise');
  const [franchise, setFranchise] = useState({
    name: "Hubcv - 01",
    brandLogo: "/logo/logo-4.svg", // Update with your logo path
    location: {
      area: "Downtown",
      city: "New York",
      country: "USA"
    }
  });
  
  // Shares slider state
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const totalShares = 10000; // Example total shares available
  const sharePrice = 1; // $1 per share
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBuySharesOpen, setIsBuySharesOpen] = useState(false);
  const platformFeePercentage = 5; // 5% platform fee
  const solToUsdRate = 150; // Current SOL to USD rate (example)
  
  // Finance related state
  const [reserveFund, setReserveFund] = useState<ReserveFund>({
    total: 100000, // $100,000 total investment
    current: 75000, // $75,000 currently in reserve
    isLocked: false,
    projectStatus: 'operational',
    lastUpdated: new Date().toISOString(),
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: '1',
      category: 'Franchisee Fee',
      type: 'one-time',
      planned: 20000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '2',
      category: 'Setup Cost',
      type: 'one-time',
      planned: 30000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '3',
      category: 'Working Capital',
      type: 'one-time',
      planned: 10000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '4',
      category: 'Salaries',
      type: 'recurring',
      planned: 10000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '5',
      category: 'Rent',
      type: 'recurring',
      planned: 5000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '6',
      category: 'Maintenance',
      type: 'recurring',
      planned: 2000,
      actual: 0,
      status: 'not-started'
    },
  ]);

  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([
    { month: 'Jan 2024', estimated: 50000, actual: 0, status: 'below-target' },
    { month: 'Feb 2024', estimated: 52000, actual: 0, status: 'below-target' },
    { month: 'Mar 2024', estimated: 54000, actual: 0, status: 'below-target' },
    { month: 'Apr 2024', estimated: 56000, actual: 0, status: 'below-target' },
    { month: 'May 2024', estimated: 58000, actual: 0, status: 'below-target' },
    { month: 'Jun 2024', estimated: 60000, actual: 0, status: 'below-target' },
  ]);

  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Burger',
      description: 'Juicy beef patty with fresh vegetables and special sauce',
      price: 12.99,
      image: '/products/product-1.jpg',
      category: 'Burgers'
    },
    {
      id: '2',
      name: 'Cheese Pizza',
      description: 'Classic cheese pizza with mozzarella and tomato sauce',
      price: 14.99,
      image: '/products/product-2.jpg',
      category: 'Pizza'
    },
    {
      id: '3',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 9.99,
      image: '/products/product-3.jpg',
      category: 'Salads'
    },
    {
      id: '4',
      name: 'Chocolate Brownie',
      description: 'Warm chocolate brownie with vanilla ice cream',
      price: 6.99,
      image: '/products/product-4.jpg',
      category: 'Desserts'
    },
    {
      id: '5',
      name: 'Premium Burger',
      description: 'Juicy beef patty with fresh vegetables and special sauce',
      price: 12.99,
      image: '/products/product-5.jpg',
      category: 'Burgers'
    },
    {
      id: '6',
      name: 'Cheese Pizza',
      description: 'Classic cheese pizza with mozzarella and tomato sauce',
      price: 14.99,
      image: '/products/product-6.jpg',
      category: 'Pizza'
    },
    {
      id: '7',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 9.99,
      image: '/products/product-7.jpg',
      category: 'Salads'
    },
    {
      id: '8',
      name: 'Chocolate Brownie',
      description: 'Warm chocolate brownie with vanilla ice cream',
      price: 6.99,
      image: '/products/product-8.jpg',
      category: 'Desserts'
    },
  ];

 

  const tabs = [
    { id: 'franchise', label: 'Franchise', icon: Store },
    { id: 'franchisee', label: 'Franchisee', icon: Users },
    { id: 'finances', label: 'Finances', icon: CreditCard },
    { id: 'products', label: 'Products', icon: Box },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  // Store tab component
  const FranchiseTab = () => {
    const franchise = {
      name: "Gourmet Burger Kitchen",
      description: "GBK is a premium burger restaurant chain that serves gourmet burgers made with high-quality ingredients. Our menu features a variety of creative burger options, delicious sides, and handcrafted milkshakes in a modern and vibrant setting.",
      location: "123 Food Street, Downtown, Dubai, UAE",
      openingHours: [
        { day: 'Monday - Friday', hours: '11:00 AM - 11:00 PM' },
        { day: 'Saturday - Sunday', hours: '10:00 AM - 12:00 AM' },
      ],
      contact: {
        phone: '+971 4 123 4567',
        email: 'dubai@gbk.ae',
        website: 'www.gbk.ae'
      },
      images: [
        '/franchise/retail-1.png',
        '/franchise/retail-2.png',
        '/franchise/retail-3.png',
      ]
    };

    return (
      <div className="space-y-6">
        {/* Store Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{franchise.name}</h2>
            <div className="flex items-center mt-1 text-sm text-stone-600 dark:text-stone-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{franchise.location}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Store Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative h-[600px] w-full  overflow-hidden">
              <Image
                src={franchise.images[0]}
                alt="Store front"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-full w-full  overflow-hidden">
              <Image
                src={franchise.images[1]}
                alt="Store interior"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-full w-full  overflow-hidden">
              <Image
                src={franchise.images[2]}
                alt="Store food"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <Card className="py-6">
              <CardHeader   >
                <CardTitle className="text-lg">About Us</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-stone-700 dark:text-stone-300">
                  { franchise.description}
                </p>
              </CardContent>
            </Card>

        {/* Store Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Description */}
          <div className=" space-y-6">
            
            <Card className="py-6">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-stone-200 dark:bg-stone-800  flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-stone-400" />
                  <span className="ml-2 text-stone-500">Map view coming soon</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
         
            <Card className="py-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Address</h4>
                  <p className="text-stone-800 dark:text-stone-200">{franchise.location}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Opening Hours</h4>
                  <div className="space-y-1">
                    {franchise.openingHours.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-stone-600 dark:text-stone-300">{item.day}</span>
                        <span className="font-medium">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-stone-500" />
                      <a href={`tel:${franchise.contact.phone}`} className="hover:underline">
                        {franchise.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-stone-500" />
                      <a href={`mailto:${franchise.contact.email}`} className="hover:underline">
                        {franchise.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-stone-500" />
                      <a 
                        href={`https://${franchise.contact.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {franchise.contact.website}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          
          </div>
        </div>
      </div>
    );
  };

  // Sample review data
  const reviews = [
    {
      id: '1',
      userName: 'Alex Johnson',
      userAvatar: '/avatar/avatar-m-1.png',
      rating: 5,
      date: '2024-09-15',
      comment: 'Amazing experience! The food was delicious and the service was excellent. Will definitely come back again.',
      images: ['/products/product-1.jpg', '/products/product-2.jpg'],
      verified: true
    },
    {
      id: '2',
      userName: 'Sarah Williams',
      userAvatar: '/avatar/avatar-f-2.png',
      rating: 4,
      date: '2024-09-10',
      comment: 'Great food and atmosphere, but the service was a bit slow. Otherwise, a wonderful experience!',
      verified: true
    },
    {
      id: '3',
      userName: 'Michael Brown',
      userAvatar: '/avatar/avatar-m-2.png',
      rating: 5,
      date: '2024-09-05',
      comment: 'Best burger I\'ve ever had! The ingredients were fresh and the flavors were amazing. Highly recommend!',
      images: ['/products/product-3.jpg'],
      verified: false
    },
    {
      id: '4',
      userName: 'Emily Davis',
      userAvatar: '/avatar/avatar-f-3.png',
      rating: 3,
      date: '2024-08-28',
      comment: 'Food was good but a bit overpriced. The ambiance was nice though.',
      verified: true
    },
    {
      id: '5',
      userName: 'David Wilson',
      userAvatar: '/avatar/avatar-m-3.png',
      rating: 5,
      date: '2024-08-20',
      comment: 'Exceptional service and the food was cooked to perfection. The staff went above and beyond to make our anniversary special.',
      images: ['/products/product-4.jpg', '/products/product-5.jpg', '/products/product-6.jpg'],
      verified: true
    }
  ];

  // Calculate average rating and rating distribution
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating as keyof typeof acc]++;
    return acc;
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  // Sample franchisee data - this would typically come from your backend
  const franchisees: Franchisee[] = [
    {
      id: '1',
      fullName: 'John Doe',
      walletId: 'HjZ5j...8Xy9z',
      avatar: '/avatar/avatar-m-1.png',
      totalShares: 15000,
      totalInvested: 15000,
      isOfferActive: true,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      walletId: 'AbC12...XyZ34',
      avatar: '/avatar/avatar-f-1.png',
      totalShares: 10000,
      totalInvested: 10000,
      isOfferActive: false,
      joinDate: '2024-02-20',
    },
    {
      id: '3',
      fullName: 'Mike Johnson',
      walletId: 'XyZ78...PqR90',
      avatar: '/avatar/avatar-m-2.png',
      totalShares: 5000,
      totalInvested: 5000,
      isOfferActive: true,
      joinDate: '2024-03-05',
    },
  ];

  // Funding data - this would typically come from your backend
  const fundingData = {
    totalInvestment: 100000, // $100,000
    invested: 75000,        // $75,000
    totalShares: 100000,    // 100,000 shares at $1 each
    sharesRemaining: 25000, // 25,000 shares remaining
    pricePerShare: 1        // $1 per share
  };

  // Function to handle buying shares
  const handleBuyShares = (amount: number) => {
    // In a real app, this would connect to a wallet and process the transaction
    alert(`Buying ${amount} shares at $${fundingData.pricePerShare} per share`);
    // Add your transaction logic here
  };

  // Reserve Fund Card Component
  const ReserveFundCard = () => {
    const progress = (reserveFund.current / reserveFund.total) * 100;
    
    const getStatusColor = () => {
      if (reserveFund.projectStatus === 'funding') return 'bg-blue-500';
      if (reserveFund.projectStatus === 'launch') return 'bg-purple-500';
      if (reserveFund.projectStatus === 'operational') return 'bg-green-500';
      return 'bg-red-500';
    };

    const getStatusText = () => {
      return reserveFund.projectStatus.charAt(0).toUpperCase() + reserveFund.projectStatus.slice(1);
    };

    return (
      <Card className="p-6 mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Reserve Fund</h2>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} text-white`}>
              {getStatusText()}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Current Balance</span>
              <span className="font-medium">${reserveFund.current.toLocaleString()}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-stone-500">
              <span>${reserveFund.current.toLocaleString()}</span>
              <span>Target: ${reserveFund.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-stone-500">Funds Locked</p>
              <p className="font-medium">{reserveFund.isLocked ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-stone-500">Last Updated</p>
              <p className="font-medium">{new Date(reserveFund.lastUpdated).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Monthly Revenue Table Component
  const MonthlyRevenueTable = () => {
    return (
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Monthly Recurring Revenue</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-stone-500 border-b">
                <th className="pb-3 font-medium">Month</th>
                <th className="pb-3 font-medium text-right">Estimated</th>
                <th className="pb-3 font-medium text-right">Actual</th>
                <th className="pb-3 font-medium text-right">Variance</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyRevenue.map((revenue) => {
                const variance = revenue.actual - revenue.estimated;
                const variancePercent = revenue.estimated > 0 
                  ? (Math.abs(variance) / revenue.estimated) * 100 
                  : 0;
                
                return (
                  <tr key={revenue.month} className="hover:bg-stone-50">
                    <td className="py-3">
                      <div className="font-medium">{revenue.month}</div>
                    </td>
                    <td className="text-right font-medium">
                      ${revenue.estimated.toLocaleString()}
                    </td>
                    <td className="text-right font-medium">
                      ${revenue.actual.toLocaleString()}
                    </td>
                    <td className={`text-right font-medium ${
                      variance >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                      {revenue.estimated > 0 && (
                        <span className="text-xs ml-1">
                          ({variance >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        revenue.status === 'on-track'
                          ? 'bg-green-100 text-green-800'
                          : revenue.status === 'above-target'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {revenue.status === 'on-track' 
                          ? 'On Track' 
                          : revenue.status === 'above-target'
                            ? 'Above Target'
                            : 'Below Target'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Budget Table Component
  const BudgetTable = () => {
    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Planned</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Variance</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {budgetItems.map((item) => {
                const variance = item.actual - item.planned;
                const variancePercent = (Math.abs(variance) / item.planned) * 100;
                
                return (
                  <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium">{item.category}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                      {item.type === 'one-time' ? 'One-time' : 'Recurring'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                      ${item.planned.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                      ${item.actual.toLocaleString()}
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-right font-medium ${
                      variance >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'on-track' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : item.status === 'over-budget'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : item.status === 'under-budget'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {item.status === 'on-track' 
                          ? 'On Track' 
                          : item.status === 'over-budget' 
                            ? 'Over Budget' 
                            : item.status === 'under-budget'
                              ? 'Under Budget'
                              : 'Not Started'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 py-12">
      <FranchisePOSWallet />
      
      {/* Funding Component */}
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">FUNDRAISING</h2>
            </div>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => setIsBuySharesOpen(true)}
            >
              Buy Shares
            </Button>
          </div>
          {/* Progress Bar */}
            <div className="h-2 mt-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${(fundingData.invested / fundingData.totalInvestment) * 100}%` }}
              ></div>
            </div>

          <div className="flex justify-between mt-1">
            <div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Total Investment: </div>
              <div className="text-lg font-semibold"> {fundingData.totalInvestment.toLocaleString()} AED</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-stone-600 dark:text-stone-400">Investment Remaining: </div>
              <div className="text-lg font-semibold"> {fundingData.invested.toLocaleString()} AED</div>
            </div>
          </div>
          <div className="flex justify-between mt-0">
            <div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Total Shares: </div>
              <div className="text-lg font-semibold"> {fundingData.totalShares.toLocaleString()} shares</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-stone-600 dark:text-stone-400">Shares Remaining: </div>
              <div className="text-lg font-semibold"> {fundingData.sharesRemaining.toLocaleString()} shares</div>
            </div>
          </div>
          
        </div>
      </Card>
      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Finances</h2>
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 ">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-stone-500 dark:text-stone-400">Est. Monthly:</span>
              <span className="font-semibold text-green-600">
                ${monthlyRevenue[0]?.estimated.toLocaleString()}
              </span>
            </div>
          </div>
          
          
          <BudgetTable />
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 dark:bg-stone-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Estimated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Payout</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Reserve Fund</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {monthlyRevenue.map((revenue) => {
                    const variance = revenue.actual - revenue.estimated;
                    const variancePercent = revenue.estimated > 0 
                      ? (Math.abs(variance) / revenue.estimated) * 100 
                      : 0;
                    
                    return (
                      <tr key={revenue.month} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-medium">{revenue.month}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                          ${revenue.estimated.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                          ${revenue.actual.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-blue-600">
                          ${(revenue.actual * 0.7).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-purple-600">
                          ${(revenue.actual * 0.3).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            revenue.status === 'on-track'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : revenue.status === 'above-target'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {revenue.status === 'on-track' 
                              ? 'On Track' 
                              : revenue.status === 'above-target'
                                ? 'Above Target'
                                : 'Below Target'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'franchisee' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Franchisee</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search franchisee..."
                  className="w-64 rounded-md border border-stone-200 py-2 pl-10 pr-4 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>
            </div>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 dark:bg-stone-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Franchisee</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Wallet ID</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Shares</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Invested</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {franchisees.map((franchisee) => (
                    <tr key={franchisee.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              src={franchisee.avatar}
                              alt={franchisee.fullName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-stone-900 dark:text-white">{franchisee.fullName}</div>
                            <div className="text-xs text-stone-500">Joined {franchisee.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500 font-mono">
                        {franchisee.walletId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {franchisee.totalShares.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {franchisee.totalInvested.toLocaleString()} AED
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          {/* Current User - Show Toggle */}
                          {franchisee.id === '1' ? (
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-stone-500">Me</span>
                              <button
                                onClick={() => {
                                  const newFranchisees = franchisees.map(f => 
                                    f.id === franchisee.id 
                                      ? { ...f, isOfferActive: !f.isOfferActive } 
                                      : f
                                  );
                                  // In a real app, you would update the backend here
                                  console.log('Updated franchisees:', newFranchisees);
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 ${
                                  franchisee.isOfferActive ? 'bg-stone-600' : 'bg-stone-200'
                                }`}
                                role="switch"
                                aria-checked={franchisee.isOfferActive}
                              >
                                <span className="sr-only">Toggle offer</span>
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    franchisee.isOfferActive ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          ) : franchisee.isOfferActive ? (
                            // Other users with offers active - Show Offer button
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-stone-500 text-stone-600 hover:bg-stone-50 hover:text-stone-700"
                            >
                              Make Offer
                            </Button>
                          ) : (
                            // Other users with offers inactive - Show disabled button
                            <span className="text-xs text-stone-400">Not Accepting</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'franchise' && <FranchiseTab />}
      
      {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Categories and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex space-x-2 overflow-x-auto pb-1">
                <button 
                  onClick={() => setSelectedCategory('All Items')}
                  className={`px-4 py-2  text-sm font-medium transition-colors ${
                    selectedCategory === 'All Items'
                      ? 'bg-neutral-500 dark:bg-neutral-800 text-white hover:bg-neutral-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
                  }`}
                >
                  All Items
                </button>
                {Array.from(new Set(products.map(p => p.category))).map(category => (
                  <button 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2  text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-neutral-500 dark:bg-neutral-800 text-white hover:bg-neutral-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 text-sm h-9"
                  />
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products
                  .filter(product => 
                    (selectedCategory === 'All Items' || product.category === selectedCategory) &&
                    (searchQuery === '' || 
                      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      product.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-stone-200">
                    <div className="relative h-48 bg-stone-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {/* <div className="absolute top-2 right-2 bg-white/90  p-1.5 shadow-sm">
                        <Heart className="h-4 w-4 text-stone-500" />
                      </div> */}
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-lg text-stone-800 dark:text-white">{product.name}</h3>
                        <p className="text-sm text-stone-600 line-clamp-2 mt-1 dark:text-stone-400">
                          {product.description}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-stone-600 font-bold text-lg">${product.price.toFixed(2)}</span>
                        {/* <button
                          // onClick={() => addToCart(product)}
                          className="bg-stone-500 hover:bg-stone-600 text-white py-2 px-4  font-medium transition-colors"
                          disabled
                        >
                          Coming Soon
                        </button> */}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}


        
          {activeTab === 'reviews' && (
            <ReviewsTab 
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={reviews.length}
              ratingDistribution={ratingDistribution}
            />
          )}
        </div>
      </Card>

     
      {/* Buy Shares Modal */}
      <Dialog open={isBuySharesOpen} onOpenChange={setIsBuySharesOpen}>
        <DialogTrigger asChild>
          <div className="hidden"></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] dark:bg-stone-900">
          {/* <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Store className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Buy Franchise Shares</DialogTitle>
                <p className="text-sm text-stone-500 dark:text-stone-400">Become a part of {franchise.name}</p>
              </div>
            </div>
          </DialogHeader> */}
          
          {/* Franchise Details */}
          <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            
            <div className="flex items-start space-x-4">
              {/* Brand Logo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-white dark:bg-stone-700 flex items-center justify-center overflow-hidden border border-stone-200 dark:border-stone-700">
                  <Image 
                    src={franchise.brandLogo} 
                    alt={`${franchise.name} logo`} 
                    width={64}
                    height={64}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-logo.svg';
                    }}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-lg">{franchise.name}</h4>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-stone-500 dark:text-stone-400">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>
                      {franchise.location.area}, {franchise.location.city}, {franchise.location.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="shares">Select Number of Shares</Label>
                <span className="text-sm font-medium">{sharesToBuy} shares</span>
              </div>
              <Button variant="outline" className="w-full">
                <Slider
                  value={[sharesToBuy]}
                  onValueChange={(value) => setSharesToBuy(value[0])}
                  min={1}
                  max={1000}
                  step={1}
                  className=""
                />

              </Button>
              
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setSharesToBuy(prev => Math.max(1, prev - 1))}
                  disabled={sharesToBuy <= 1}
                >
                  -
                </Button>
                <Input
                  id="shares"
                  type="number"
                  min="1"
                  max={totalShares}
                  value={sharesToBuy}
                  onChange={(e) => setSharesToBuy(Math.min(totalShares, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSharesToBuy(prev => Math.min(totalShares, prev + 1))}
                  disabled={sharesToBuy >= totalShares}
                >
                  +
                </Button>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Min: 1</span>
                <span>Max: {totalShares}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Price Breakdown</Label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{sharesToBuy} shares × ${sharePrice.toFixed(2)}</span>
                  <span>${(sharesToBuy * sharePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-2 mt-2">
                  <span>Platform fee ({platformFeePercentage}%)</span>
                  <span>${((sharesToBuy * sharePrice * platformFeePercentage) / 100).toFixed(2)}</span>
                </div>
                {/* <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(sharesToBuy * sharePrice * (1 + platformFeePercentage / 100)).toFixed(2)}</span>
                </div> */}
              </div>
            </div>
          </div>
          {/* Total Cost in SOL */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-300">Total Solana</p>
                
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  ≈ {((sharesToBuy * sharePrice * (1 + platformFeePercentage / 100)) / solToUsdRate).toFixed(4)} SOL
                </p>
              </div>
              <p className="text-2xl font-bold">
                  ${(sharesToBuy * sharePrice * (1 + platformFeePercentage / 100)).toFixed(2)} USD
                </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => setIsBuySharesOpen(false)}>Cancel</Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => {
                const totalCost = sharesToBuy * sharePrice * (1 + platformFeePercentage / 100);
                console.log(`Purchasing ${sharesToBuy} shares for $${totalCost.toFixed(2)} (${(totalCost / solToUsdRate).toFixed(4)} SOL)`);
                setIsBuySharesOpen(false);
              }}
            >
              Buy Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}