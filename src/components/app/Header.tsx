"use client";

import { Search, Menu, X, Filter, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ThemeSwitcher } from "../default/theme-switcher";
import { AuthHeader } from "../auth/AuthHeader";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConvexImageUrl } from "@/hooks/useConvexImageUrl";
import { Id } from "../../../convex/_generated/dataModel";

// Type for franchise data
interface FranchiseData {
  _id: string;
  franchiseSlug: string;
  address: string;
  franchiser: {
    _id: string;
    name: string;
    logoUrl?: Id<"_storage">;
    industry: string;
    category: string;
  };
}

// Component for search suggestion item
const SearchSuggestionItem = ({ franchise, onClick }: { franchise: FranchiseData; onClick: () => void }) => {
  const logoUrl = useConvexImageUrl(franchise.franchiser?.logoUrl);
  
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-secondary focus:bg-secondary focus:outline-none border-b border-stone-100 dark:border-stone-700 last:border-b-0"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-stone-100 dark:bg-stone-700 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={franchise.franchiser?.name || 'Franchise'}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-xs font-bold text-stone-600 dark:text-stone-300">${(franchise.franchiseSlug || franchise.franchiser?.name || 'F')[0].toUpperCase()}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
              {(franchise.franchiseSlug || franchise.franchiser?.name || 'F')[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {franchise.franchiseSlug || franchise.franchiser?.name || 'Unknown'}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
            {franchise.franchiser?.industry || 'Unknown Industry'} • {franchise.franchiser?.category || 'Unknown Category'}
          </p>
        </div>
      </div>
    </button>
  );
};

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchMode, setIsMobileSearchMode] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<FranchiseData[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000000]);
  const [isCityComboboxOpen, setIsCityComboboxOpen] = useState(false);
  const [isStateComboboxOpen, setIsStateComboboxOpen] = useState(false);
  const [isCountryComboboxOpen, setIsCountryComboboxOpen] = useState(false);

  // Get franchise data for search suggestions with resolved names
  const franchisesWithStages = useQuery(api.franchiseManagement.getFranchisesForSearch, { limit: 50 });
  
  // Extract unique cities, states, and countries from franchise data
  const { cities, states, countries } = React.useMemo(() => {
    if (!franchisesWithStages) return { cities: [], states: [], countries: [] };
    
    const citiesSet = new Set<string>();
    const statesSet = new Set<string>();
    const countriesSet = new Set<string>();
    
    franchisesWithStages.forEach((franchise: FranchiseData) => {
      // Use the new location structure if available, fallback to address parsing
      if ('location' in franchise && franchise.location) {
        const { city, state, country } = franchise.location as { city?: string; state?: string; country?: string };
        
        if (city) citiesSet.add(city);
        if (state) statesSet.add(state);
        if (country) countriesSet.add(country);
      } else if (franchise.address) {
        // Fallback to address parsing for existing data
        const addressParts = franchise.address.split(',').map((part: string) => part.trim());
        
        if (addressParts.length >= 3) {
          // Format: "City, State, Country"
          const city = addressParts[0];
          const state = addressParts[1];
          const country = addressParts[2];
          
          citiesSet.add(city);
          statesSet.add(state);
          countriesSet.add(country);
        } else if (addressParts.length === 2) {
          // Format: "City, Country"
          const city = addressParts[0];
          const country = addressParts[1];
          
          citiesSet.add(city);
          countriesSet.add(country);
        } else if (addressParts.length === 1) {
          // Single location (could be city, state, or country)
          const location = addressParts[0];
          citiesSet.add(location);
        }
      }
    });
    
    return {
      cities: Array.from(citiesSet).sort(),
      states: Array.from(statesSet).sort(),
      countries: Array.from(countriesSet).sort()
    };
  }, [franchisesWithStages]);


  // Get unique industries and categories for filter options
  const uniqueIndustries = Array.from(new Set(
    franchisesWithStages?.map((f: FranchiseData) => f.franchiser?.industry).filter((industry): industry is string => Boolean(industry)) || []
  ));
  const uniqueCategories = Array.from(new Set(
    franchisesWithStages?.map((f: FranchiseData) => f.franchiser?.category).filter((category): category is string => Boolean(category)) || []
  ));


  // Update active tab and search query based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    
    
    if (search) {
      setSearchQuery(search);
    }
  }, [pathname]);

  // Clear all filters when navigating to home page
  useEffect(() => {
    if (pathname === "/") {
      setSelectedStages([]);
      setSelectedIndustries([]);
      setSelectedCategories([]);
      setSelectedCities([]);
      setSelectedStates([]);
      setSelectedCountries([]);
      setBudgetRange([0, 1000000]);
    }
  }, [pathname]);

  // Generate search suggestions based on search query with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && franchisesWithStages) {
        const query = searchQuery.toLowerCase();
        const suggestions = franchisesWithStages
          .filter((franchise) => {
            return (
              franchise.franchiseSlug?.toLowerCase().includes(query) ||
              franchise.franchiser?.name?.toLowerCase().includes(query) ||
              franchise.franchiser?.industry?.toLowerCase().includes(query) ||
              franchise.franchiser?.category?.toLowerCase().includes(query) ||
              franchise.address?.toLowerCase().includes(query)
            );
          })
          .slice(0, 5); // Limit to 5 suggestions
        
        setSearchSuggestions(suggestions);
        setIsSearchDropdownOpen(suggestions.length > 0);
      } else {
        setSearchSuggestions([]);
        setIsSearchDropdownOpen(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, franchisesWithStages]);


  // Balance fetching removed - now handled by auth system

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Header - searchQuery:', searchQuery);
    if (searchQuery.trim()) {
      const searchUrl = `/?search=${encodeURIComponent(searchQuery.trim())}`;
      console.log('Header - navigating to:', searchUrl);
      // Navigate to home page with search query
      router.push(searchUrl);
    }
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchMode(!isMobileSearchMode);
    if (!isMobileSearchMode) {
      setSearchQuery("");
    }
  };


  const handleSuggestionSelect = (franchise: FranchiseData) => {
    setSearchQuery(franchise.franchiseSlug || franchise.franchiser?.name || '');
    setIsSearchDropdownOpen(false);
    // Navigate to search results
    router.push(`/?search=${encodeURIComponent(franchise.franchiseSlug || franchise.franchiser?.name || '')}`);
  };



  const handleCityToggle = (city: string) => {
    if (!city) return;
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleStateToggle = (state: string) => {
    if (!state) return;
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleCountryToggle = (country: string) => {
    if (!country) return;
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleBudgetChange = (newRange: [number, number]) => {
    setBudgetRange(newRange);
  };

  const handleCitySelect = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities(prev => [...prev, city]);
    }
    setIsCityComboboxOpen(false);
  };

  const handleStateSelect = (state: string) => {
    if (!selectedStates.includes(state)) {
      setSelectedStates(prev => [...prev, state]);
    }
    setIsStateComboboxOpen(false);
  };

  const handleCountrySelect = (country: string) => {
    if (!selectedCountries.includes(country)) {
      setSelectedCountries(prev => [...prev, country]);
    }
    setIsCountryComboboxOpen(false);
  };

  const handleStageSelect = (stage: string) => {
    if (stage === "all") {
      setSelectedStages([]);
    } else {
      setSelectedStages([stage]);
    }
  };

  const handleIndustrySelect = (industry: string) => {
    if (industry === "all") {
      setSelectedIndustries([]);
    } else {
      setSelectedIndustries([industry]);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (category === "all") {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([category]);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStages.length > 0) params.set('stages', selectedStages.join(','));
    if (selectedIndustries.length > 0) params.set('industries', selectedIndustries.join(','));
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedCities.length > 0) params.set('cities', selectedCities.join(','));
    if (selectedStates.length > 0) params.set('states', selectedStates.join(','));
    if (selectedCountries.length > 0) params.set('countries', selectedCountries.join(','));
    if (budgetRange[0] > 0 || budgetRange[1] < 1000000) {
      params.set('budget_min', budgetRange[0].toString());
      params.set('budget_max', budgetRange[1].toString());
    }
    
    router.push(`/?${params.toString()}`);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSelectedStages([]);
    setSelectedIndustries([]);
    setSelectedCategories([]);
    setSelectedCities([]);
    setSelectedStates([]);
    setSelectedCountries([]);
    setBudgetRange([0, 1000000]);
    router.push(`/?search=${searchQuery ? encodeURIComponent(searchQuery) : ''}`);
    setIsFilterModalOpen(false);
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="fixed w-full bg-white dark:bg-stone-800/50 backdrop-blur border-b border-stone-200 dark:border-stone-700 z-50 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isMobileSearchMode ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative search-container">
              <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={handleSearchChange}
                  onFocus={() => searchSuggestions.length > 0 && setIsSearchDropdownOpen(true)}
                className="w-full py-2 px-4 border-2 border-stone-200 dark:border-stone-600 outline-none text-base bg-white dark:bg-stone-700"
                autoFocus
              />
              <button
                  type="button"
                onClick={handleMobileSearchToggle}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
              </form>
              
              {/* Mobile Search Suggestions Dropdown */}
              {isSearchDropdownOpen && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((franchise, index) => (
                    <SearchSuggestionItem
                      key={index}
                      franchise={franchise}
                      onClick={() => handleSuggestionSelect(franchise)}
                    />
                  ))}
                </div>
              )}
            </div>
            {pathname === "/" && (
              <button 
                className="relative p-2 border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 rounded-md"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="h-5 w-5" />
                {(selectedStages.length > 0 || selectedIndustries.length > 0 || selectedCategories.length > 0) && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {selectedStages.length + selectedIndustries.length + selectedCategories.length}
                  </span>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center"
              onClick={() => {
                // Clear all filters when clicking logo
                setSelectedStages([]);
                setSelectedIndustries([]);
                setSelectedCategories([]);
                setSelectedCities([]);
                setSelectedStates([]);
                setSelectedCountries([]);
                setBudgetRange([0, 1000000]);
                setSearchQuery("");
              }}
            >
              <Image
                src="/logo.svg"
                alt="logo"
                width={28}
                height={28}
                className="z-0"
              />
              <span className="text-xl ml-4 font-bold">FRANCHISEEN</span>
            </Link>
            </div>


            {/* Center Search and Filter - Desktop */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
                {/* Desktop Search with Suggestions */}
                <div className="relative search-container">
                  <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchSuggestions.length > 0 && setIsSearchDropdownOpen(true)}
                        className="w-80 pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                  </form>
                  
                  {/* Search Suggestions Dropdown */}
                  {isSearchDropdownOpen && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((franchise, index) => (
                        <SearchSuggestionItem
                          key={index}
                          franchise={franchise}
                          onClick={() => handleSuggestionSelect(franchise)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Filter Modal Trigger - Only show on home page */}
                {pathname === "/" && (
                  <button 
                    className="relative p-2 border border-input bg-background rounded-md hover:bg-secondary"
                    onClick={() => setIsFilterModalOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                    {(selectedStages.length > 0 || selectedIndustries.length > 0 || selectedCategories.length > 0) && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {selectedStages.length + selectedIndustries.length + selectedCategories.length}
                      </span>
                    )}
                  </button>
                )}
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Toggle */}
              <button
                className="p-2 rounded-full md:hidden"
                onClick={handleMobileSearchToggle}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <ThemeSwitcher />
                <AuthHeader />
              </div>

              {/* Mobile Menu Toggle */}
              <button className="p-2 rounded-full md:hidden">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
    
    {/* Responsive Filter Modal */}
    <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Franchises
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Find the perfect franchise opportunity for you
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {/* First Row: Stage, Industry, Category Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage Filter Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stage</Label>
                <Select value={selectedStages[0] || "all"} onValueChange={handleStageSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="funding">Funding</SelectItem>
                    <SelectItem value="launching">Launching</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry Filter Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Industry</Label>
                <Select value={selectedIndustries[0] || "all"} onValueChange={handleIndustrySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {uniqueIndustries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={selectedCategories[0] || "all"} onValueChange={handleCategorySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row: Location Comboboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City Combobox */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Popover open={isCityComboboxOpen} onOpenChange={setIsCityComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCityComboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedCities.length > 0 
                        ? `${selectedCities.length} cit${selectedCities.length > 1 ? 'ies' : 'y'} selected`
                        : "Select cities..."
                      }
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search cities..." />
                      <CommandList>
                        <CommandEmpty>No cities found.</CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={() => handleCitySelect(city)}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={selectedCities.includes(city)}
                                onChange={() => {}}
                              />
                              <span className="font-medium">🏙️ {city}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected Cities */}
                {selectedCities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCities.map((city) => (
                      <div key={city} className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        <span>{city}</span>
                        <button
                          onClick={() => handleCityToggle(city)}
                          className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* State Combobox */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                <Popover open={isStateComboboxOpen} onOpenChange={setIsStateComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isStateComboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedStates.length > 0 
                        ? `${selectedStates.length} state${selectedStates.length > 1 ? 's' : ''} selected`
                        : "Select states..."
                      }
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search states..." />
                      <CommandList>
                        <CommandEmpty>No states found.</CommandEmpty>
                        <CommandGroup>
                          {states.map((state) => (
                            <CommandItem
                              key={state}
                              value={state}
                              onSelect={() => handleStateSelect(state)}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={selectedStates.includes(state)}
                                onChange={() => {}}
                              />
                              <span className="font-medium">🏛️ {state}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected States */}
                {selectedStates.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedStates.map((state) => (
                      <div key={state} className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                        <span>{state}</span>
                        <button
                          onClick={() => handleStateToggle(state)}
                          className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Country Combobox */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                <Popover open={isCountryComboboxOpen} onOpenChange={setIsCountryComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCountryComboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedCountries.length > 0 
                        ? `${selectedCountries.length} countr${selectedCountries.length > 1 ? 'ies' : 'y'} selected`
                        : "Select countries..."
                      }
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
                      <CommandList>
                        <CommandEmpty>No countries found.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country) => (
                            <CommandItem
                              key={country}
                              value={country}
                              onSelect={() => handleCountrySelect(country)}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={selectedCountries.includes(country)}
                                onChange={() => {}}
                              />
                              <span className="font-medium">🌍 {country}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected Countries */}
                {selectedCountries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCountries.map((country) => (
                      <div key={country} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                        <span>{country}</span>
                        <button
                          onClick={() => handleCountryToggle(country)}
                          className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Third Row: Investment Budget - Single Row */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Investment Budget</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1 px-3">
                  <Slider
                    value={budgetRange}
                    onValueChange={handleBudgetChange}
                    max={1000000}
                    min={0}
                    step={10000}
                    className="w-full"
                  />
                </div>
                <div className="text-sm font-medium min-w-[120px] text-center">
                  ${budgetRange[0].toLocaleString()} - ${budgetRange[1].toLocaleString()}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Active Filters</Label>
              <div className="space-y-2 text-sm">
                {selectedStages.length > 0 && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <span className="font-medium">Stages:</span> {selectedStages.join(', ')}
                  </div>
                )}
                {selectedIndustries.length > 0 && (
                  <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                    <span className="font-medium">Industries:</span> {selectedIndustries.join(', ')}
                  </div>
                )}
                {selectedCategories.length > 0 && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded">
                    <span className="font-medium">Categories:</span> {selectedCategories.join(', ')}
                  </div>
                )}
                {selectedCities.length > 0 && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <span className="font-medium">Cities:</span> {selectedCities.join(', ')}
                  </div>
                )}
                {selectedStates.length > 0 && (
                  <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                    <span className="font-medium">States:</span> {selectedStates.join(', ')}
                  </div>
                )}
                {selectedCountries.length > 0 && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded">
                    <span className="font-medium">Countries:</span> {selectedCountries.join(', ')}
                  </div>
                )}
                {(budgetRange[0] > 0 || budgetRange[1] < 1000000) && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <span className="font-medium">Budget:</span> ${budgetRange[0].toLocaleString()} - ${budgetRange[1].toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
            Clear All Filters
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setIsFilterModalOpen(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={applyFilters} className="flex-1 sm:flex-none">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    </>
  );
}

export default Header;