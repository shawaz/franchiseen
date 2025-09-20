"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FranchiseCard from "@/components/app/franchise/FranchiseCard";
import Header from "@/components/app/Header";
import {
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Home as HomeIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample franchise data
const fundingFranchises: Franchise[] = [
  {
    _id: "funding-1",
    logo: "/logo/logo-4.svg",
    title: "Codelude",
    location: "Downtown, Dubai, UAE",
    price: 15000,
    images: ["/franchise/retail-1.png"],
    rating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    availableFrom: "2023-06-01",
    type: "fund",
    returnRate: 8.5,
    investorsCount: 42,
    fundingGoal: 500000,
    fundingProgress: 250000,
    minimumInvestment: 15000,
  },
  {
    _id: "funding-2",
    logo: "/logo/logo-4.svg",
    title: "Hubcv",
    location: "Downtown, Dubai, UAE",
    price: 15000,
    images: ["/franchise/retail-2.png"],
    rating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    availableFrom: "2023-06-01",
    type: "fund",
    returnRate: 8.5,
    investorsCount: 42,
    fundingGoal: 500000,
    fundingProgress: 250000,
    minimumInvestment: 15000,
  },
  {
    _id: "funding-3",
    logo: "/logo/logo-4.svg",
    title: "Roborns",
    location: "Downtown, Dubai, UAE",
    price: 35000,
    images: ["/franchise/retail-3.png"],
    rating: 4.9,
    bedrooms: 4,
    bathrooms: 4,
    squareFeet: 3200,
    availableFrom: "2023-05-15",
    type: "fund",
    returnRate: 9.2,
    investorsCount: 56,
    fundingGoal: 750000,
    fundingProgress: 480000,
    minimumInvestment: 35000,
  },
  {
    _id: "funding-4",
    logo: "/logo/logo-4.svg",
    title: "Dietized",
    location: "Business Bay, Dubai, UAE",
    price: 8500,
    images: ["/franchise/retail-4.png"],
    rating: 4.5,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 800,
    availableFrom: "2023-06-10",
    type: "fund",
    returnRate: 7.8,
    investorsCount: 32,
    fundingGoal: 300000,
    fundingProgress: 180000,
    minimumInvestment: 8500,
  },
  {
    _id: "funding-5",
    logo: "/logo/logo-4.svg",
    title: "Daanah",
    location: "Arabian Ranches, Dubai, UAE",
    price: 22000,
    images: ["/franchise/retail-5.png"],
    rating: 4.7,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2400,
    availableFrom: "2023-05-20",
    type: "fund",
    returnRate: 8.1,
    investorsCount: 48,
    fundingGoal: 600000,
    fundingProgress: 360000,
    minimumInvestment: 22000,
  },
  {
    _id: "funding-6",
    logo: "/logo/logo-4.svg",
    title: "Chefless",
    location: "Marina, Dubai, UAE",
    price: 15000,
    images: ["/franchise/retail-6.png"],
    rating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    availableFrom: "2023-06-01",
    type: "fund",
    returnRate: 8.5,
    investorsCount: 42,
    fundingGoal: 500000,
    fundingProgress: 250000,
    minimumInvestment: 15000,
  },
  {
    _id: "funding-7",
    logo: "/logo/logo-4.svg",
    title: "Dietized",
    location: "Business Bay, Dubai, UAE",
    price: 8500,
    images: ["/franchise/retail-7.png"],
    rating: 4.5,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 800,
    availableFrom: "2023-06-10",
    type: "fund",
    returnRate: 7.8,
    investorsCount: 32,
    fundingGoal: 300000,
    fundingProgress: 180000,
    minimumInvestment: 8500,
  },
  {
    _id: "funding-8",
    logo: "/logo/logo-4.svg",
    title: "Citymilana",
    location: "Downtown, Dubai, UAE",
    price: 15000,
    images: ["/franchise/retail-8.png"],
    rating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    availableFrom: "2023-06-01",
    type: "fund",
    returnRate: 8.5,
    investorsCount: 42,
    fundingGoal: 500000,
    fundingProgress: 250000,
    minimumInvestment: 15000,
  },
 
 
];

const launchingFranchises: Franchise[] = [
  {
    _id: "launching-1",
    logo: "/logo/logo-4.svg",
    title: "Luxury Penthouse Franchise",
    location: "DIFC",
    price: 520000,
    images: ["/franchise/retail-1.png"],
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    type: "launch",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    launchProgress: 65,
  },
  {
    _id: "launching-2",
    logo: "/logo/logo-4.svg",
    title: "Waterfront Villa Franchise",
    location: "Emirates Hills",
    price: 1250000,
    images: ["/franchise/retail-2.png"],
    rating: 4.8,
    bedrooms: 5,
    bathrooms: 6,
    squareFeet: 7800,
    yearBuilt: 2021,
    type: "launch",
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    launchProgress: 45,
  },
  {
    _id: "launching-3",
    logo: "/logo/logo-4.svg",
    title: "Modern Apartment Franchise",
    location: "Jumeirah Beach Residences",
    price: 280000,
    images: ["/franchise/retail-3.png"],
    rating: 4.6,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1600,
    yearBuilt: 2023,
    type: "launch",
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    launchProgress: 30,
  },
  {
    _id: "launching-4",
    logo: "/logo/logo-4.svg",
    title: "Golf Course Mansion Franchise",
    location: "Emirates Golf Club",
    price: 890000,
    images: ["/franchise/retail-4.png"],
    rating: 4.9,
    bedrooms: 6,
    bathrooms: 7,
    squareFeet: 9200,
    yearBuilt: 2020,
    type: "launch",
    startDate: "2023-12-01",
    endDate: "2024-05-31",
    launchProgress: 80,
  },
  {
    _id: "launching-5",
    logo: "/logo/logo-4.svg",
    title: "Luxury Penthouse Franchise",
    location: "DIFC",
    price: 520000,
    images: ["/franchise/retail-5.png"],
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    type: "launch",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    launchProgress: 65,
  },
  {
    _id: "launching-6",
    logo: "/logo/logo-4.svg",
    title: "Luxury Penthouse Franchise",
    location: "DIFC",
    price: 520000,
    images: ["/franchise/retail-6.png"],
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    type: "launch",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    launchProgress: 65,
  },
  {
    _id: "launching-7",
    logo: "/logo/logo-4.svg",
    title: "Luxury Penthouse Franchise",
    location: "DIFC",
    price: 520000,
    images: ["/franchise/retail-7.png"],
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    type: "launch",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    launchProgress: 65,
  },
  {
    _id: "launching-8",
    logo: "/logo/logo-4.svg",
    title: "Luxury Penthouse Franchise",
    location: "DIFC",
    price: 520000,
    images: ["/franchise/retail-8.png"],
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    type: "launch",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    launchProgress: 65,
  },
];

const outletsFranchises: Franchise[] = [
  {
    _id: "outlets-1",
    logo: "/logo/logo-4.svg",
    title: "Luxury Hotel Suites Franchise",
    location: "Downtown Dubai",
    price: 100000,
    images: ["/franchise/retail-1.png"],
    rating: 4.7,
    projectedAnnualYield: 12.5,
    type: "live",
    currentBalance: 150000,
    totalBudget: 300000,
    activeOutlets: 3,
  },
  {
    _id: "outlets-2",
    logo: "/logo/logo-4.svg",
    title: "Beachfront Resort Villas Franchise",
    location: "Palm Jumeirah",
    price: 150000,
    images: ["/franchise/retail-2.png"],
    rating: 4.8,
    type: "live",
    currentBalance: 480000,
    totalBudget: 750000,
    activeOutlets: 5,
    projectedAnnualYield: 11.5,
  },
  {
    _id: "outlets-3",
    logo: "/logo/logo-4.svg",
    title: "Business Bay Office Tower Franchise",
    location: "Business Bay",
    price: 200000,
    images: ["/franchise/retail-3.png"],
    rating: 4.6,
    type: "live",
    currentBalance: 650000,
    totalBudget: 1000000,
    activeOutlets: 7,
    projectedAnnualYield: 10.2,
  },
  {
    _id: "outlets-4",
    logo: "/logo/logo-4.svg",
    title: "Luxury Residential Tower Franchise",
    location: "Dubai Marina",
    price: 120000,
    images: ["/franchise/retail-4.png"],
    rating: 4.9,
    type: "live",
    currentBalance: 520000,
    totalBudget: 800000,
    activeOutlets: 6,
    projectedAnnualYield: 10.8,
  },
  {
    _id: "outlets-5",
    logo: "/logo/logo-4.svg",
    title: "Luxury Hotel Suites Franchise",
    location: "Bluewaters Island",
    price: 150000,
    images: ["/franchise/retail-5.png"],
    rating: 4.9,
    type: "live",
    currentBalance: 150000,
    totalBudget: 300000,
    activeOutlets: 3,
    projectedAnnualYield: 8.5,
  },
  {
    _id: "outlets-6",
    logo: "/logo/logo-4.svg",
    title: "Luxury Hotel Suites Franchise",
    location: "Bluewaters Island",
    price: 150000,
    images: ["/franchise/retail-6.png"],
    rating: 4.9,
    type: "live",
    currentBalance: 150000,
    totalBudget: 300000,
    activeOutlets: 3,
    projectedAnnualYield: 8.5,
  },
  {
    _id: "outlets-7",
    logo: "/logo/logo-4.svg",
    title: "Luxury Hotel Suites Franchise",
    location: "Bluewaters Island",
    price: 150000,
    images: ["/franchise/retail-7.png"],
    rating: 4.9,
    type: "live",
    currentBalance: 150000,
    totalBudget: 300000,
    activeOutlets: 3,
    projectedAnnualYield: 8.5,
  },
  {
    _id: "outlets-8",
    logo: "/logo/logo-4.svg",
    title: "Luxury Hotel Suites Franchise",
    location: "Bluewaters Island",
    price: 150000,
    images: ["/franchise/retail-8.png"],
    rating: 4.9,
    type: "live",
    currentBalance: 150000,
    totalBudget: 300000,
    activeOutlets: 3,
    projectedAnnualYield: 8.5,
  },
];

interface Franchise {
  _id: string;
  logo: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: string | number;
  squareFeet?: number;
  description?: string;
  type: "fund" | "launch" | "live";
  // funding specific properties
  availableFrom?: string;
  returnRate?: string | number;
  investorsCount?: number;
  fundingGoal?: number;
  fundingProgress?: number;
  minimumInvestment?: number;
  // launching specific properties
  yearBuilt?: number;
  startDate?: string;
  endDate?: string;
  launchProgress?: number;
  // outlets specific properties
  currentBalance?: number;
  totalBudget?: number;
  activeOutlets?: number;
  projectedAnnualYield?: number;
}

export default function Home() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fund");
  const [searchQuery, setSearchQuery] = useState("");

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "fund" | "launch" | "invest" | null;
    if (tab && ["fund", "launch", "invest"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Filter franchises based on search query
  const getFilteredProperties = (franchisesToFilter: Franchise[]) => {
    if (!searchQuery) return franchisesToFilter;
    const query = searchQuery.toLowerCase();
    return franchisesToFilter.filter(
      (franchise) =>
        franchise.title.toLowerCase().includes(query) ||
        franchise.location.toLowerCase().includes(query) ||
        (franchise.description?.toLowerCase() || "").includes(query),
    );
  };

  // Render search and filters for each tab
  const renderSearchFilters = () => {
    return (
      <div className="mb-6 sticky top-16 bg-white dark:bg-stone-800/50 backdrop-blur z-10">
        
        <div className="flex flex-col md:flex-row gap-4 p-2 border border-border justify-between">
        <div className="flex justify-center">
          <div className="inline-flex bg-secondary p-1 gap-1">
            {["fund", "launch", "live"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm uppercase font-bold cursor-pointer transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary-foreground/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center gap-4">
        <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Brand"
              className="w-full pl-10 pr-4 py-1.5  border border-input bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>


         
          <Button variant="outline" className="px-6 mr-2">
            Filter
          </Button>

        </div>
          
        </div>
      </div>
    );
  };

  // Render property listings based on active tab
  const renderTabContent = () => {
    // Show loading state if data is still loading
    const isLoading =
      (activeTab === "fund" && fundingFranchises === undefined) ||
      (activeTab === "launch" && launchingFranchises === undefined) ||
      (activeTab === "live" && outletsFranchises === undefined);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Determine which franchises to display based on active tab
    let currentProperties: Franchise[] = [];
    switch (activeTab) {
      case "fund":
        currentProperties = fundingFranchises;
        break;
      case "launch":
        currentProperties = launchingFranchises;
        break;
      case "live":
        currentProperties = outletsFranchises;
        break;
    }

    const filteredProperties = getFilteredProperties(currentProperties);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((franchise) => (
            <FranchiseCard
              key={franchise._id.toString()}
              id={franchise._id.toString()}
              type={activeTab as "fund" | "launch" | "live"}
              logo={franchise.logo}
              title={franchise.title}
              location={franchise.location || "Dubai, UAE"}
              price={franchise.price}
              image={
                franchise.images && franchise.images.length > 0
                  ? franchise.images[0]
                  : ""
              }
              rating={franchise.rating || 4.5}
              bedrooms={franchise.bedrooms}
              bathrooms={franchise.bathrooms}
              size={franchise.squareFeet}
              returnRate={franchise.returnRate || 8}
              investorsCount={franchise.investorsCount || 42}
              fundingGoal={franchise.fundingGoal || 500000}
              fundingProgress={franchise.fundingProgress || 250000}
              startDate={franchise.startDate}
              endDate={franchise.endDate}
              launchProgress={franchise.launchProgress}
              currentBalance={franchise.currentBalance}
              totalBudget={franchise.totalBudget}
              activeOutlets={franchise.activeOutlets}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No Franchise found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
        

      <main className="min-h-screen py-6">
        <div className="container mx-auto py-6">
          {/* Search Filters */}
          {renderSearchFilters()}

          {/* Tab Content */}
          <div>{renderTabContent()}</div>
        </div>
      </main>
    </>
  );
}