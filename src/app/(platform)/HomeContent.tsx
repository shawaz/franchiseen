"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FranchiseCardWithData from "@/components/app/franchise/FranchiseCardWithData";
import { useFranchises, useFranchisersByStatus, useFranchisesWithStages } from "@/hooks/useFranchises";

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Get franchise data from Convex
  const allFranchises = useFranchises();
  const approvedFranchises = useFranchisersByStatus("approved");
  const franchisesWithStages = useFranchisesWithStages();

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "fund" | "launch" | "live" | "all" | null;
    if (tab && ["fund", "launch", "live", "all"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update search query based on URL parameter
  useEffect(() => {
    const search = searchParams?.get("search");
    console.log('HomeContent - searchParams:', searchParams?.toString());
    console.log('HomeContent - search param:', search);
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  // Update filter parameters based on URL parameters
  useEffect(() => {
    const stages = searchParams?.get("stages");
    const industries = searchParams?.get("industries");
    const categories = searchParams?.get("categories");
    const cities = searchParams?.get("cities");
    const states = searchParams?.get("states");
    const countries = searchParams?.get("countries");
    
    console.log('HomeContent - filter params:', { stages, industries, categories, cities, states, countries });
    
    if (stages) {
      setSelectedStages(stages.split(','));
    } else {
      setSelectedStages([]);
    }
    
    if (industries) {
      setSelectedIndustries(industries.split(','));
    } else {
      setSelectedIndustries([]);
    }
    
    if (categories) {
      setSelectedCategories(categories.split(','));
    } else {
      setSelectedCategories([]);
    }
    
    if (cities) {
      setSelectedCities(cities.split(','));
    } else {
      setSelectedCities([]);
    }
    
    if (states) {
      setSelectedStates(states.split(','));
    } else {
      setSelectedStates([]);
    }
    
    if (countries) {
      setSelectedCountries(countries.split(','));
    } else {
      setSelectedCountries([]);
    }
  }, [searchParams]);


  // No need for tab filters - they're now in the header

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


    // Start with all franchises and filter out pending/approval stage franchises
    let currentFranchises = (franchisesWithStages || []).filter(f => 
      f.status !== 'pending' // Exclude franchises in approval stage
    );
    
    console.log('HomeContent - Total franchises:', currentFranchises.length);
    console.log('HomeContent - Franchise stages:', currentFranchises.map(f => f.stage));
    console.log('HomeContent - Active tab:', activeTab);
    console.log('HomeContent - Selected stages:', selectedStages);
    
    // Apply stage filter from URL parameters (if any)
    if (selectedStages.length > 0) {
      console.log('HomeContent - Applying stage filter from URL:', selectedStages);
      currentFranchises = currentFranchises.filter(f => selectedStages.includes(f.stage));
    } else {
      // Fallback to active tab filtering if no stage filter from URL
      console.log('HomeContent - Applying tab filter:', activeTab);
    if (activeTab === "fund") {
      currentFranchises = currentFranchises.filter(f => f.stage === "funding");
    } else if (activeTab === "launch") {
      currentFranchises = currentFranchises.filter(f => f.stage === "launching");
    } else if (activeTab === "live") {
      currentFranchises = currentFranchises.filter(f => f.stage === "ongoing" || f.stage === "closed");
      } else if (activeTab === "all") {
        // Show all franchises - no filtering
        console.log('HomeContent - Showing all franchises');
      }
      // If no specific tab filter, show all franchises
    }
    
    console.log('HomeContent - After stage filtering:', currentFranchises.length);

    // Apply industry filter
    if (selectedIndustries.length > 0) {
      currentFranchises = currentFranchises.filter(f => 
        f.franchiser?.industry && selectedIndustries.includes(f.franchiser.industry)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      currentFranchises = currentFranchises.filter(f => 
        f.franchiser?.category && selectedCategories.includes(f.franchiser.category)
      );
    }

    // Apply location filters
    if (selectedCities.length > 0) {
      currentFranchises = currentFranchises.filter(f => {
        if (f.location?.city) {
          return selectedCities.includes(f.location.city);
        } else if (f.address) {
          // Fallback to address parsing for existing data
          const addressParts = f.address.split(',').map(part => part.trim());
          return addressParts.length > 0 && selectedCities.includes(addressParts[0]);
        }
        return false;
      });
    }

    if (selectedStates.length > 0) {
      currentFranchises = currentFranchises.filter(f => {
        if (f.location?.city) {
          return selectedStates.includes(f.location.city);
        } else if (f.address) {
          // Fallback to address parsing for existing data
          const addressParts = f.address.split(',').map(part => part.trim());
          return addressParts.length > 1 && selectedStates.includes(addressParts[1]);
        }
        return false;
      });
    }

    if (selectedCountries.length > 0) {
      currentFranchises = currentFranchises.filter(f => {
        if (f.location?.country) {
          return selectedCountries.includes(f.location.country);
        } else if (f.address) {
          // Fallback to address parsing for existing data
          const addressParts = f.address.split(',').map(part => part.trim());
          return addressParts.length > 2 && selectedCountries.includes(addressParts[2]);
        }
        return false;
      });
    }

    // Filter franchises based on search query and status
    const filteredFranchises = (searchQuery 
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
      : currentFranchises
    ).filter(franchise => {
      // Hide pending and rejected franchises from home page
      return franchise.status !== 'pending' && franchise.status !== 'rejected';
    });

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
                type: activeTab === "all" ? "fund" : activeTab as "fund" | "launch" | "live",
                fundingGoal: franchise.investment?.totalInvestment || 500000,
                fundingProgress: 0,
                investorsCount: 0,
                location: franchise.address || "Address not available", // Add address field
                buildingName: franchise.buildingName, // Add building name
                doorNumber: franchise.doorNumber, // Add door number
                franchiser: franchise.franchiser || undefined,
                investment: franchise.investment || undefined,
              }}
              activeTab={activeTab === "all" ? "fund" : activeTab as "fund" | "launch" | "live"}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No Franchise found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || selectedStages.length > 0 || selectedIndustries.length > 0 || selectedCategories.length > 0 || selectedCities.length > 0 || selectedStates.length > 0 || selectedCountries.length > 0
                ? "Try adjusting your search or filters"
                : "Try adjusting your filters or check back later"}
            </p>
            {(selectedStages.length > 0 || selectedIndustries.length > 0 || selectedCategories.length > 0 || selectedCities.length > 0 || selectedStates.length > 0 || selectedCountries.length > 0) && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Active filters:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {selectedStages.length > 0 && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                      Stages: {selectedStages.join(', ')}
                    </span>
                  )}
                  {selectedIndustries.length > 0 && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                      Industries: {selectedIndustries.join(', ')}
                    </span>
                  )}
                  {selectedCategories.length > 0 && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                      Categories: {selectedCategories.join(', ')}
                    </span>
                  )}
                  {selectedCities.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                      Cities: {selectedCities.join(', ')}
                    </span>
                  )}
                  {selectedStates.length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">
                      States: {selectedStates.join(', ')}
                    </span>
                  )}
                  {selectedCountries.length > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                      Countries: {selectedCountries.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto py-6 pt-20 md:pt-6">
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
