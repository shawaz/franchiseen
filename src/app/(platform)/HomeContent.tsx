"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FranchiseCardWithData from "@/components/app/franchise/FranchiseCardWithData";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFranchises, useFranchisersByStatus, useFranchisesWithStages } from "@/hooks/useFranchises";

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fund");
  const [searchQuery, setSearchQuery] = useState("");

  // Get franchise data from Convex
  const allFranchises = useFranchises();
  const approvedFranchises = useFranchisersByStatus("approved");
  const franchisesWithStages = useFranchisesWithStages();

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "fund" | "launch" | "invest" | null;
    if (tab && ["fund", "launch", "invest"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);


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
    if (allFranchises === undefined || approvedFranchises === undefined || franchisesWithStages === undefined) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }


    // Filter franchises by stage based on active tab
    let currentFranchises = franchisesWithStages || [];
    
    if (activeTab === "fund") {
      currentFranchises = currentFranchises.filter(f => f.stage === "funding");
    } else if (activeTab === "launch") {
      currentFranchises = currentFranchises.filter(f => f.stage === "launching");
    } else if (activeTab === "live") {
      currentFranchises = currentFranchises.filter(f => f.stage === "ongoing" || f.stage === "closed");
    }

    // Filter franchises based on search query
    const filteredFranchises = searchQuery 
      ? currentFranchises.filter((franchise) => {
          const query = searchQuery.toLowerCase();
          return (
            franchise.franchiseSlug?.toLowerCase().includes(query) ||
            franchise.franchiser?.name?.toLowerCase().includes(query) ||
            franchise.franchiser?.industry?.toLowerCase().includes(query) ||
            franchise.franchiser?.category?.toLowerCase().includes(query) ||
            franchise.address?.toLowerCase().includes(query)
          );
        })
      : currentFranchises;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFranchises.length > 0 ? (
          filteredFranchises.map((franchise) => (
            <FranchiseCardWithData
              key={franchise._id.toString()}
              franchise={{
                _id: franchise._id,
                title: franchise.franchiseSlug,
                industry: franchise.franchiser?.industry || "Unknown Industry",
                category: franchise.franchiser?.category || "Unknown Category",
                logo: franchise.franchiser?.logoUrl || "",
                images: franchise.franchiser?.interiorImages || [],
                price: franchise.investment?.sharePrice || 1,
                squareFeet: franchise.sqft || 1200,
                returnRate: 8.5,
                stage: franchise.stage,
                type: activeTab as "fund" | "launch" | "live",
                fundingGoal: franchise.investment?.totalInvestment || 500000,
                fundingProgress: 0,
                investorsCount: 0,
                franchiser: franchise.franchiser || undefined,
                investment: franchise.investment || undefined,
              }}
              activeTab={activeTab as "fund" | "launch" | "live"}
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
