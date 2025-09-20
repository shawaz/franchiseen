"use client";

import React, { useState } from "react";
import { Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "../../ui/card";

type Franchise = {
  id: string;
  name: string;
  industry: string;
  category: string;
  location: string;
  building: string;
  status: 'Active' | 'Funding' | 'Launching' | 'Closed';
  investment: number;
  shares: number;
  sharePrice: number;
  monthlyEarnings: number;
  progress: number;
};

// Dummy franchise data - 5 in each status category
const dummyFranchises: Franchise[] = [
    // Active Franchises
    {
      id: 'a1',
      name: 'Burger Palace',
      industry: 'Food & Beverage',
      category: 'Fast Food',
      location: '123 Main St, New York, NY',
      building: 'Empire State Mall',
      status: 'Active',
      investment: 250000,
      shares: 5000,
      sharePrice: 50,
      monthlyEarnings: 2500,
      progress: 95
    },
    {
      id: 'a2',
      name: 'Tech Haven',
      industry: 'Electronics',
      category: 'Retail',
      location: '456 Tech Blvd, San Francisco, CA',
      building: 'Silicon Plaza',
      status: 'Active',
      investment: 320000,
      shares: 6400,
      sharePrice: 50,
      monthlyEarnings: 3200,
      progress: 88
    },
    {
      id: 'a3',
      name: 'Urban Fitness',
      industry: 'Health & Wellness',
      category: 'Gym',
      location: '789 Fitness Ave, Chicago, IL',
      building: 'Downtown Athletic Club',
      status: 'Active',
      investment: 425000,
      shares: 8500,
      sharePrice: 50,
      monthlyEarnings: 4250,
      progress: 100
    },
    {
      id: 'a4',
      name: 'Cafe Mocha',
      industry: 'Food & Beverage',
      category: 'Cafe',
      location: '101 Coffee Lane, Seattle, WA',
      building: 'Pike Place Market',
      status: 'Active',
      investment: 180000,
      shares: 3600,
      sharePrice: 50,
      monthlyEarnings: 1800,
      progress: 92
    },
    {
      id: 'a5',
      name: 'Pet Paradise',
      industry: 'Pet Care',
      category: 'Pet Store',
      location: '202 Animal Ave, Austin, TX',
      building: 'Downtown Plaza',
      status: 'Active',
      investment: 210000,
      shares: 4200,
      sharePrice: 50,
      monthlyEarnings: 2100,
      progress: 100
    },
    
    // Funding Franchises
    {
      id: 'f1',
      name: 'Green Grocer',
      industry: 'Retail',
      category: 'Grocery',
      location: '303 Organic Way, Portland, OR',
      building: 'Eco Center',
      status: 'Funding',
      investment: 150000,
      shares: 3000,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 45
    },
    {
      id: 'f2',
      name: 'Tech Startup Hub',
      industry: 'Technology',
      category: 'Co-working',
      location: '404 Innovation Dr, Boston, MA',
      building: 'Tech Tower',
      status: 'Funding',
      investment: 275000,
      shares: 5500,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 32
    },
    {
      id: 'f3',
      name: 'Yoga Studio',
      industry: 'Health & Wellness',
      category: 'Yoga',
      location: '505 Peace Ln, Santa Monica, CA',
      building: 'Beachfront Center',
      status: 'Funding',
      investment: 190000,
      shares: 3800,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 28
    },
    {
      id: 'f4',
      name: 'Bike Shop',
      industry: 'Retail',
      category: 'Bicycles',
      location: '606 Gear St, Denver, CO',
      building: 'Mountain View Mall',
      status: 'Funding',
      investment: 220000,
      shares: 4400,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 15
    },
    {
      id: 'f5',
      name: 'Tutoring Center',
      industry: 'Education',
      category: 'Tutoring',
      location: '707 School St, Cambridge, MA',
      building: 'Little Tokyo Plaza',
      status: 'Launching',
      investment: 300000,
      shares: 6000,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 75
    },
    {
      id: 'l2',
      name: 'Game Zone',
      industry: 'Entertainment',
      category: 'Gaming',
      location: '909 Pixel St, Las Vegas, NV',
      building: 'Stadium District',
      status: 'Launching',
      investment: 350000,
      shares: 7000,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 88
    },
    {
      id: 'l3',
      name: 'Beauty Bar',
      industry: 'Beauty',
      category: 'Salon',
      location: '1010 Glamour Ave, Miami, FL',
      building: 'Ocean Drive',
      status: 'Launching',
      investment: 225000,
      shares: 4500,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 65
    },
    {
      id: 'l4',
      name: 'Tech Repair',
      industry: 'Technology',
      category: 'Repair',
      location: '1111 Circuit Ln, Houston, TX',
      building: 'Tech Center',
      status: 'Launching',
      investment: 180000,
      shares: 3600,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 72
    },
    {
      id: 'l5',
      name: 'Juice Bar',
      industry: 'Food & Beverage',
      category: 'Juice Bar',
      location: '1212 Health St, San Diego, CA',
      building: 'Beachfront Promenade',
      status: 'Launching',
      investment: 195000,
      shares: 3900,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 82
    },
    
    // Closed Franchises
    {
      id: 'c1',
      name: 'Book Nook',
      industry: 'Retail',
      category: 'Bookstore',
      location: '1313 Novel Way, Boston, MA',
      building: 'Harvard Square',
      status: 'Closed',
      investment: 180000,
      shares: 3600,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 100
    },
    {
      id: 'c2',
      name: 'Vinyl Records',
      industry: 'Entertainment',
      category: 'Music',
      location: '1414 Groove St, Nashville, TN',
      building: 'Music Row',
      status: 'Closed',
      investment: 220000,
      shares: 4400,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 100
    },
    {
      id: 'c3',
      name: 'Art Supplies',
      industry: 'Retail',
      category: 'Art',
      location: '1515 Canvas Ave, Santa Fe, NM',
      building: 'Arts District',
      status: 'Closed',
      investment: 195000,
      shares: 3900,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 100
    },
    {
      id: 'c4',
      name: 'Outdoor Gear',
      industry: 'Retail',
      category: 'Outdoor',
      location: '1616 Trail Dr, Denver, CO',
      building: 'Mountain Mall',
      status: 'Closed',
      investment: 275000,
      shares: 5500,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 100
    },
    {
      id: 'c5',
      name: 'Vintage Clothing',
      industry: 'Fashion',
      category: 'Clothing',
      location: '1717 Retro Ln, Austin, TX',
      building: 'South Congress',
      status: 'Closed',
      investment: 160000,
      shares: 3200,
      sharePrice: 50,
      monthlyEarnings: 0,
      progress: 100
    }
  ];

  const FranchiseList = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Franchise['status']>('Active');
    const statusTabs: Franchise['status'][] = ['Active', 'Launching', 'Funding', 'Closed'];
  
    // Filter franchises based on active tab
    const filteredFranchises = dummyFranchises.filter(
      (franchise) => franchise.status === activeTab
    );
  
    // Map status to badge classes
    const getStatusBadge = (status: Franchise['status']) => {
      switch (status) {
        case 'Funding':
          return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-500';
        case 'Launching':
          return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-500';
        case 'Active':
          return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-500';
        case 'Closed':
          return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-500';
        default:
          return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      }
    };
  
    return (
      <Card className="p-0 my-6">
        <div className="flex flex-col px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex gap-2 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="hidden md:flex items-center ml-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                Filter
              </button>
            </div>
          </div>
        </div>

        {filteredFranchises.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No franchises found in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFranchises.map((franchise) => (
              <div
                key={franchise.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                onClick={() => router.push(`/franchise/${franchise.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Store className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {franchise.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {franchise.industry} • {franchise.category}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {franchise.building}, {franchise.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Investment: ${franchise.investment.toLocaleString()}</span>
                        <span>Shares: {franchise.shares.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className={`h-2.5 rounded-full ${
                            franchise.status === 'Active' ? 'bg-green-500' :
                            franchise.status === 'Funding' ? 'bg-yellow-500' :
                            franchise.status === 'Launching' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${franchise.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Progress</span>
                        <span>{franchise.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(franchise.status)}`}>
                      {franchise.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

export default FranchiseList;