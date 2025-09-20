"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FranchiseCard from "@/components/app/franchise/FranchiseCardOne";
import BusinessCard from "@/components/app/franchiser/BusinessCard";
import { Search, MapPin, TrendingUp, DollarSign } from "lucide-react";

// Skeleton loader component
const GridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    ))}
  </div>
);

// Types
interface Franchise {
  _id: string;
  title: string;
  location: string;
  price: number;
  images?: string[];
  rating?: number;
  returnRate?: number;
  type?: "fund" | "launch" | "live";
  businessSlug?: string;
  description?: string;
}

interface Business {
  _id: string;
  name: string;
  logoUrl?: string;
  slug?: string;
  industry?: string;
  category?: string;
  costPerArea?: number;
  min_area?: number;
}

export default function LikedPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <GridSkeleton />
        </div>
      }
    >
      <LikedContent />
    </Suspense>
  );
}

function LikedContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'franchises';
  // State
  const [activeTab, setActiveTab] = useState<"franchise" | "brand">("franchise");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "franchise" | "brand" | null;
    if (tab && ["franchise", "brand"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API calls
        // const franchisesData = await fetch('/api/franchises/liked').then(res => res.json());
        // const businessesData = await fetch('/api/businesses').then(res => res.json());
        
        // Mock data
        const mockFranchises: Franchise[] = [
          {
            _id: "1",
            title: "Downtown Cafe",
            location: "Downtown, Dubai",
            price: 15000,
            images: ["/images/1.svg"],
            rating: 4.5,
            returnRate: 8.5,
            type: "fund",
            description: "Popular cafe in downtown area"
          },
          // Add more mock franchises as needed
        ];

        const mockBusinesses: Business[] = [
          {
            _id: "b1",
            name: "Cafe Chain",
            logoUrl: "/logo/logo-2.svg",
            slug: "cafe-chain",
            industry: "Food & Beverage",
            category: "Cafe",
            costPerArea: 15000
          },
          // Add more mock businesses as needed
        ];

        setFranchises(mockFranchises);
        setBusinesses(mockBusinesses);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter franchises based on search query
  const getFilteredFranchises = (franchisesToFilter: Franchise[]) => {
    if (!searchQuery) return franchisesToFilter;
    const query = searchQuery.toLowerCase();
    return franchisesToFilter.filter(
      (franchise) =>
        franchise.title.toLowerCase().includes(query) ||
        franchise.location.toLowerCase().includes(query) ||
        (franchise.description?.toLowerCase() || "").includes(query)
    );
  };

  // Get unique businesses from franchises
  const getUniqueBusinesses = (franchises: Franchise[]) => {
    const businessMap = new Map<string, Business>();
    
    franchises.forEach(franchise => {
      if (franchise.businessSlug && !businessMap.has(franchise.businessSlug)) {
        const business = businesses.find(b => b.slug === franchise.businessSlug) || {
          _id: franchise._id,
          name: franchise.title,
          logoUrl: "/logo/logo-2.svg",
          industry: "Business",
          category: "Franchise",
          costPerArea: franchise.price,
          min_area: franchise.price / 1000 // Just an example calculation
        };
        businessMap.set(franchise.businessSlug, business);
      }
    });
    
    return Array.from(businessMap.values());
  };

  // Render search and filters
  const renderSearchFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border">
      <div className="flex justify-center">
        <div className="inline-flex bg-secondary w-full p-1 gap-1">
          {["franchise", "brand"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "franchise" | "brand")}
              className={`px-9 py-2 text-sm uppercase font-bold cursor-pointer w-full transition-colors ${
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
      
      <div className="flex-1 relative">
        <MapPin
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          placeholder="Search location"
          className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 relative">
        <TrendingUp
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <select className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md">
          <option value="">Return Rate</option>
          <option value="0-5">Up to 5%</option>
          <option value="5-10">5% - 10%</option>
          <option value="10+">10%+</option>
        </select>
      </div>

      <div className="flex-1 relative">
        <DollarSign
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <select className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md">
          <option value="">Min Investment</option>
          <option value="0-5000">Up to AED 5,000</option>
          <option value="5000-10000">AED 5,000 - 10,000</option>
          <option value="10000+">AED 10,000+</option>
        </select>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    if (isLoading) {
      return <GridSkeleton count={6} />;
    }

    if (activeTab === "brand") {
      const uniqueBusinesses = getUniqueBusinesses(franchises);
      const filteredBusinesses = searchQuery
        ? uniqueBusinesses.filter(business =>
            business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.industry?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : uniqueBusinesses;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((business) => (
              <BusinessCard
                key={business._id}
                business={{
                  id: business._id,
                  name: business.name,
                  logo_url: business.logoUrl || "/logo/logo-2.svg",
                  industry: business.industry || "Business",
                  category: business.category || "Franchise",
                  costPerArea: business.costPerArea || 0,
                  min_area: business.min_area || 0
                }}
              />
            ))
          ) : (
            <div className="text-center py-12 col-span-full">
              <h3 className="text-lg font-medium">No brands found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "Try a different search term" : "No brands available"}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Franchise tab
    const filteredFranchises = getFilteredFranchises(franchises);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
        {filteredFranchises.length > 0 ? (
          filteredFranchises.map((franchise) => (
            <FranchiseCard
              key={franchise._id}
              franchise={{
                id: franchise._id,
                brand: {
                  id: franchise.businessSlug || '',
                  name: franchise.title,
                  logo: franchise.images?.[0] || '/placeholder-franchise.jpg',
                  industry: '',
                  category: ''
                },
                location: {
                  area: franchise.location.split(',')[0]?.trim() || '',
                  city: franchise.location.split(',')[1]?.trim() || '',
                  country: franchise.location.split(',')[2]?.trim() || 'UAE'
                },
                wallet: {
                  balance: 0,
                  currency: 'AED'
                },
                investment: {
                  total: franchise.price || 0,
                  raised: 0,
                  shares: 0,
                  sharePrice: 0
                },
                status: 'active'
              }}
              returnRate={franchise.returnRate}
              type={franchise.type}
            />
          ))
        ) : (
          <div className="text-center py-12 col-span-full">
            <h3 className="text-lg font-medium">No franchises found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery ? "Try a different search term" : "No franchises available"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-6">
      {renderSearchFilters()}
      {renderContent()}
    </div>
  );
}