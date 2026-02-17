"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { FranchiseCard } from "@/components/marketplace/FranchiseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  // Use the searchMarketplace query
  const franchises = useQuery(api.franchises.searchMarketplace, {
    searchTerm: searchTerm || undefined,
    country: selectedCountry === "all" ? undefined : selectedCountry,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-muted/30 py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Find Your Perfect Franchise
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Explore hundreds of franchise opportunities. Apply directly to brand owners and start your business journey.
            </p>
            
            {/* Search Bar */}
            <div className="w-full max-w-2xl mt-8 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  className="pl-10 h-12 text-lg shadow-sm" 
                  placeholder="Search by brand, industry, or keywords..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="KSA">Saudi Arabia</SelectItem>
                        <SelectItem value="Qatar">Qatar</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
                Showing {franchises ? franchises.length : 0} results
            </div>
        </div>

        {franchises === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl" />
                ))}
            </div>
        ) : franchises.length === 0 ? (
            <div className="text-center py-20">
                <h3 className="text-xl font-semibold">No franchises found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search criteria.</p>
                <Button 
                    variant="link" 
                    onClick={() => {
                        setSearchTerm("");
                        setSelectedCountry(undefined);
                        setSelectedCategory(undefined);
                    }}
                >
                    Clear all filters
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {franchises.map((franchise) => (
                    <FranchiseCard key={franchise._id} franchise={franchise} />
                ))}
            </div>
        )}
      </section>
    </div>
  );
}
