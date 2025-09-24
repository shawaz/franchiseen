"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FranchiseCard from "@/components/app/franchise/FranchiseCard";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Franchise } from "./page";
import { useFranchises, useFranchisersByStatus } from "@/hooks/useFranchises";

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fund");
  const [searchQuery, setSearchQuery] = useState("");

  // Get franchise data from Convex
  const allFranchises = useFranchises();
  const approvedFranchises = useFranchisersByStatus("approved");

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
      <div className="mb-6 sticky top-15 bg-white dark:bg-stone-800/50 backdrop-blur z-10">
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
                className="w-full pl-10 pr-4 py-1.5 border border-input bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="px-6 mr-2">
              FILTER
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render property listings based on active tab
  const renderTabContent = () => {
    // Show loading state if data is still loading
    if (allFranchises === undefined || approvedFranchises === undefined) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Convert Convex data to Franchise format
    const convertToFranchise = (franchiser: any): Franchise => ({
      _id: franchiser._id,
      logo: franchiser.logoUrl,
      title: franchiser.name,
      location: "Dubai, UAE", // Default location, could be enhanced with location data
      price: 15000, // Default price, could be enhanced with pricing data
      images: franchiser.interiorImages,
      squareFeet: 1200, // Default size
      type: "fund" as const, // Default type
      description: franchiser.description,
      returnRate: 8.5,
      investorsCount: 42,
      fundingGoal: 500000,
      fundingProgress: 250000,
    });

    // Use approved franchises for all tabs for now
    const currentProperties = approvedFranchises.map(convertToFranchise);
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
    <div className="min-h-screen py-6">
      <div className="container mx-auto py-6">
        {/* Search Filters */}
        {renderSearchFilters()}

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}

export default function HomeContentWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
