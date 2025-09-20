"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Store,
  MapPin,
  DollarSign,
  Building,
  Star,
  Search,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Image from "next/image";

// Google Maps types
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Sample franchise brands
const franchiseBrands = [
  {
    id: "mcdonalds" as const,
    name: "McDonald's",
    description: "World's leading fast food franchise",
    logo: "/logo/logo-2.svg",
    category: "Fast Food",
    rating: 4.5,
    outlets: 500,
    costPerArea: 2,
    minInvestment: 1000,
    maxInvestment: 5000,
    icon: Store,
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  {
    id: "subway" as const,
    name: "Subway",
    description: "Healthy sandwich franchise opportunity",
    logo: "/logo/logo-2.svg",
    category: "Fast Food",
    rating: 4.3,
    outlets: 300,
    costPerArea: 1.5,
    minInvestment: 800,
    maxInvestment: 3000,
    icon: Store,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    id: "starbucks" as const,
    name: "Starbucks",
    description: "Premium coffee franchise with global recognition",
    logo: "/logo/logo-2.svg",
    category: "Coffee",
    rating: 4.7,
    outlets: 200,
    costPerArea: 3,
    minInvestment: 1500,
    maxInvestment: 6000,
    icon: Store,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "kfc" as const,
    name: "KFC",
    description: "Famous fried chicken franchise",
    logo: "/logo/logo-2.svg",
    category: "Fast Food",
    rating: 4.4,
    outlets: 400,
    costPerArea: 2.2,
    minInvestment: 1200,
    maxInvestment: 4500,
    icon: Store,
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  {
    id: "pizza_hut" as const,
    name: "Pizza Hut",
    description: "Leading pizza franchise with diverse menu",
    logo: "/logo/logo-2.svg",
    category: "Pizza",
    rating: 4.2,
    outlets: 250,
    costPerArea: 1.8,
    minInvestment: 900,
    maxInvestment: 3500,
    icon: Store,
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "custom" as const,
    name: "Other Brand",
    description: "Choose a different franchise brand",
    logo: "/logo/logo-2.svg",
    category: "Other",
    rating: 0,
    outlets: 0,
    costPerArea: 1,
    minInvestment: 500,
    maxInvestment: 2000,
    icon: Building,
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
];



interface FranchiseData {
  selectedBrand?: typeof franchiseBrands[0];
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  locationDetails?: {
    doorNumber: string;
    buildingName: string;
    owned: boolean;
    carpetArea: number;
    contactNumber?: string;
    email?: string;
  };
  investmentDetails?: {
    selectedShares: number;
    totalAmount: number;
  };
}

export default function CreateFranchisePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedShares, setSelectedShares] = useState(5);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [formData, setFormData] = useState<FranchiseData>({
    selectedBrand: undefined,
    location: undefined,
    locationDetails: {
      doorNumber: "",
      buildingName: "",
      owned: true,
      carpetArea: 0,
    },
    investmentDetails: {
      selectedShares: 0,
      totalAmount: 0,
    },
  });

  // Categories for filtering
  const categories = ["All", "Fast Food", "Coffee", "Pizza", "Other"];

  // Filter brands based on search and category
  const filteredBrands = franchiseBrands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBrandSelect = (brand: typeof franchiseBrands[0]) => {
    setFormData((prev) => ({
      ...prev,
      selectedBrand: brand,
    }));
  };

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        console.log('Google Maps already loaded, initializing...');
        initializeMap();
        return;
      }

      console.log('Loading Google Maps script...');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error('Google Maps API key is not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        initializeMap();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) {
        console.error('Map initialization failed: mapRef or google not available');
        return;
      }

      try {
        // DIFC coordinates (Dubai International Financial Centre)
        const difcLocation = { lat: 25.2048, lng: 55.2708 };

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: difcLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);
        console.log('Google Maps initialized successfully');

        // Add existing franchise locations with custom mappin icon
      const existingLocations = [
        { lat: 25.2048, lng: 55.2708, name: "Sharif - DIFC" },
        { lat: 25.1972, lng: 55.2744, name: "Sharif - Downtown" },
        { lat: 25.2084, lng: 55.2719, name: "Sharif - Business Bay" },
      ];

      existingLocations.forEach(location => {
        new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          title: location.name,
          icon: {
            url: '/mappin.svg',
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
      });

      // Add click listener to map
      mapInstance.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Remove existing marker
        if (marker) {
          marker.setMap(null);
        }

        // Add new marker with select_location icon
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          title: 'Selected Location',
          icon: {
            url: '/select_location.png',
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          }
        });

        setMarker(newMarker);

        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            setFormData(prev => ({
              ...prev,
              location: {
                address: results[0].formatted_address,
                coordinates: { lat, lng }
              }
            }));
          }
        });
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstance.setCenter(userLocation);
          },
          () => {
            // If geolocation fails, keep DIFC as default
            console.log("Geolocation failed, using DIFC as default location");
          }
        );
      }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    if (step === 2) {
      loadGoogleMaps();
    }
  }, [step, marker]);

  // Handle map search
  const handleMapSearch = () => {
    if (!map || !window.google || !mapSearchQuery.trim()) return;

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      query: mapSearchQuery,
      fields: ['name', 'geometry', 'formatted_address'],
    };

    service.textSearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0];
        const location = place.geometry.location;

        map.setCenter(location);
        map.setZoom(15);

        // Remove existing marker
        if (marker) {
          marker.setMap(null);
        }

        // Add new marker with select_location icon
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: place.name,
          icon: {
            url: '/select_location.png',
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          }
        });

        setMarker(newMarker);

        setFormData(prev => ({
          ...prev,
          location: {
            address: place.formatted_address,
            coordinates: { lat: location.lat(), lng: location.lng() }
          }
        }));
      }
    });
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);

          // Remove existing marker
          if (marker) {
            marker.setMap(null);
          }

          // Add new marker with select_location icon
          const newMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: 'Your Location',
            icon: {
              url: '/select_location.png',
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40)
            }
          });

          setMarker(newMarker);

          // Reverse geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              setFormData(prev => ({
                ...prev,
                location: {
                  address: results[0].formatted_address,
                  coordinates: { lat, lng }
                }
              }));
            }
          });
        }
      },
      () => {
        toast.error("Unable to retrieve your location.");
      }
    );
  };



  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Here you would typically save the franchise data to your backend
      console.log("Franchise data:", formData);

      toast.success(`${formData.selectedBrand?.name} franchise application submitted successfully!`);

      // Redirect to franchise dashboard or success page
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating franchise:", error);
      toast.error("Failed to submit franchise application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark:bg-stone-800/50 bg-white text-foreground my-6 dark:text-foreground border">
      <header className="flex flex-col md:flex-row md:h-16 shrink-0 items-start md:items-center gap-4 md:gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between p-4 md:pr-6 border-b">
        <div className="flex items-center gap-2 w-full md:w-3/4">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Create New Franchise</h1>
        </div>
         {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center md:justify-end w-full md:w-auto  p-6"
        >
          {[
            { num: 1, label: "Brand" },
            { num: 2, label: "Location" },
            { num: 3, label: "Payment" }
          ].map((stepInfo, index) => (
            <div key={stepInfo.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm text-white font-medium ${
                    step >= stepInfo.num
                      ? "bg-neutral-700 text-primary-foreground"
                      : "bg-neutral-300 "
                  }`}
                >
                  {stepInfo.num}
                </div>
                {/* <span className="text-xs text-muted-foreground mt-1 hidden md:block">{stepInfo.label}</span> */}
              </div>
              {index < 2 && (
                <div
                  className={`w-8 md:w-16 h-0.5 mx-1 md:mx-2 ${
                    step > stepInfo.num ? "bg-neutral-700" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>
       
      </header>
      <div className="p-4 md:p-6 border-b  ">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className=""
        >
         
              {/* Step 1: Brand Selection */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Select Your Brand
                    </h2>
                    <p className="text-muted-foreground">
                      Choose the franchise brand you want to partner with
                    </p>
                  </div> */}

                  {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search brands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border text-foreground"
                    />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                        <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-foreground border border-border hover:bg-muted'
                        }`}
                        >
                        {category}
                        </button>
                    ))}
                    </div>
                </div>


                  {/* Brand List */}
                  <div className="space-y-3">
                    {filteredBrands.map((brand) => (
                      <motion.div
                        key={brand.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          handleBrandSelect(brand);
                          setStep(2); // Auto-advance to next step
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.selectedBrand?.id === brand.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          {/* Brand Logo */}
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={brand.logo}
                              alt={brand.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>

                          {/* Brand Info */}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-0">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground text-base md:text-lg mb-1">
                                  {brand.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {brand.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-current" />
                                    <span>{brand.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                                    <span>{brand.outlets} outlets</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                                    <span>${brand.costPerArea}/sq ft</span>
                                  </div>
                                </div>
                              </div>

                              {/* Category Badge */}
                              <div className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium self-start md:self-center">
                                {brand.category}
                              </div>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          {formData.selectedBrand?.id === brand.id && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredBrands.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No brands found matching your search.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Confirm Location */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >

                    {/* Selected Location and Property Details - Two Columns */}
                  <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-6 ">
                    {/* Right Column - Property Details Form */}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Door No & Building Name</label>
                        <Input
                            value={formData.locationDetails?.doorNumber || ""}
                            onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                locationDetails: {
                                ...prev.locationDetails!,
                                doorNumber: e.target.value,
                                owned: prev.locationDetails?.owned ?? true,
                                buildingName: prev.locationDetails?.buildingName || "",
                                carpetArea: prev.locationDetails?.carpetArea || 0
                                },
                            }))
                            }
                            placeholder="C707 New Place"
                            className="bg-background border-border"
                        />
                        </div>
                        <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Carpet Area</label>
                        <Input
                            type="number"
                            value={formData.locationDetails?.carpetArea || ""}
                            onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                locationDetails: {
                                ...prev.locationDetails!,
                                carpetArea: Number(e.target.value),
                                owned: prev.locationDetails?.owned ?? true,
                                doorNumber: prev.locationDetails?.doorNumber || "",
                                buildingName: prev.locationDetails?.buildingName || ""
                                },
                            }))
                            }
                            placeholder="500"
                            className="bg-background border-border"
                        />
                        </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">LandLord Contact Number</label>
                        <Input
                        value={formData.locationDetails?.contactNumber || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                            ...prev,
                            locationDetails: { ...prev.locationDetails!, contactNumber: e.target.value },
                            }))
                        }
                        placeholder="+91 9876543210"
                        className="bg-background border-border"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">LandLord Email ID</label>
                        <Input
                        type="email"
                        value={formData.locationDetails?.email || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                            ...prev,
                            locationDetails: { ...prev.locationDetails!, email: e.target.value },
                            }))
                        }
                        placeholder="contact@example.com"
                        className="bg-background border-border"
                        />
                    </div>

                    </div>
                    {/* Left Column - Selected Location */}
                    <div>
                      {formData.location && (
                        <div >
                          <p className="text-sm text-muted-foreground">Selected Location: {formData.location.address}</p>
                          {/* Door Number & Carpet Area */}
                       
                        </div>
                      )}
                      
                    </div>

                    


                        
                        
                      </div>
                  </div>

                  {/* Map Container with Controls */}
                  <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
                    <div className="relative h-[300px] md:h-[500px] bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20">
                      {/* Map Search Bar - Inside Map */}
                      <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 z-10">
                        <div className="flex flex-col md:flex-row gap-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Search for a location..."
                              value={mapSearchQuery}
                              onChange={(e) => setMapSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()}
                              className="pl-10 bg-background/90 backdrop-blur-sm border-border text-foreground shadow-sm text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-background/90 backdrop-blur-sm flex-1 md:flex-none"
                              onClick={handleMapSearch}
                            >
                              Search
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-background/90 backdrop-blur-sm"
                              onClick={getCurrentLocation}
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Zoom Controls - Inside Map */}
                      <div className="absolute top-20 right-4 z-10 flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm"
                          onClick={() => map && map.setZoom(map.getZoom() + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-10 h-10 p-0 bg-background/90 backdrop-blur-sm"
                          onClick={() => map && map.setZoom(map.getZoom() - 1)}
                        >
                          -
                        </Button>
                      </div>
                      {/* Map Legend - Inside Map */}
                      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 z-10">
                        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-border">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-xs md:text-sm text-foreground">
                                Click on the map to select a location
                              </span>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 text-xs">
                              <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                                <span className="text-muted-foreground">Existing</span>
                              </div>
                              <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
                                <span className="text-muted-foreground">Selected</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Google Maps Container */}
                      <div
                        ref={mapRef}
                        className="w-full h-full"
                        style={{ minHeight: '300px' }}
                      />

                      {/* Fixed Center Location Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                          <Image
                            src="/select_location.png"
                            alt="Select Location"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                            style={{
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                              transform: 'translate(-50%, -100%)'
                            }}
                          />
                        </div>
                      </div>

                      {/* Loading State */}
                      {!map && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                          <div className="text-center">
                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                            <p className="text-muted-foreground">Loading Google Maps...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  


                </motion.div>
              )}

              {/* Step 3: Make Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >

                  {/* Investment Selection - Mobile Optimized */}
                  {formData.selectedBrand && formData.locationDetails?.carpetArea && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 md:p-6 border border-blue-200 dark:border-blue-800">
                      <div className="text-center mb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Select Your Investment</h3>
                        <p className="text-sm text-muted-foreground">Choose how much you want to invest in this franchise</p>
                      </div>

                      {/* Investment Amount Display - Mobile First */}
                      <div className="bg-white dark:bg-stone-800 rounded-lg p-4 mb-6 text-center border shadow-sm">
                        <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                          ₹{(selectedShares * 5.75 * 83 * 1.2).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedShares} shares ({Math.round((selectedShares / Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75)) * 100)}% ownership)
                        </div>
                      </div>

                      {/* Slider Section */}
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <label className="text-sm font-medium text-foreground">
                            Drag to select investment level
                          </label>
                          <div className="flex flex-col md:flex-row gap-2 text-xs text-muted-foreground">
                            <span>Min: {Math.ceil(Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75) * 0.05)} shares</span>
                            <span>Max: {Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75)} shares</span>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-stone-800 rounded-lg p-4 border shadow-sm">
                          <Slider
                            value={[selectedShares]}
                            onValueChange={(value) => setSelectedShares(value[0])}
                            min={Math.ceil(Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75) * 0.05)}
                            max={Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75)}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Input Fields - Mobile Responsive */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Percentage</label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={Math.round((selectedShares / Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75)) * 100)}
                                onChange={(e) => {
                                  const percentage = Number(e.target.value);
                                  const totalShares = Math.floor((formData.locationDetails!.carpetArea * formData.selectedBrand!.costPerArea) / 5.75);
                                  const newShares = Math.round((percentage / 100) * totalShares);
                                  const min = Math.ceil(totalShares * 0.05);
                                  const max = totalShares;
                                  if (newShares >= min && newShares <= max && percentage >= 5 && percentage <= 100) {
                                    setSelectedShares(newShares);
                                  }
                                }}
                                min="5"
                                max="100"
                                className="text-center pr-8 text-base md:text-lg font-semibold bg-white dark:bg-stone-800"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Total Shares</label>
                            <Input
                              type="number"
                              value={selectedShares}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                const min = Math.ceil(Math.floor((formData.locationDetails!.carpetArea * formData.selectedBrand!.costPerArea) / 5.75) * 0.05);
                                const max = Math.floor((formData.locationDetails!.carpetArea * formData.selectedBrand!.costPerArea) / 5.75);
                                if (value >= min && value <= max) {
                                  setSelectedShares(value);
                                }
                              }}
                              min={Math.ceil(Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75) * 0.05)}
                              max={Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75)}
                              className="text-center text-base md:text-lg font-semibold bg-white dark:bg-stone-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Cards - Mobile Optimized */}
                  {formData.selectedBrand && formData.locationDetails?.carpetArea && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">


                      {/* Brand & Location Details */}
                        <div className="bg-white dark:bg-stone-800 rounded-lg p-4 md:p-6 border shadow-sm">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Franchise Details
                          </h3>

                          {/* Brand Info */}
                          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={formData.selectedBrand.logo}
                                alt={formData.selectedBrand.name}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-base md:text-lg mb-1">
                                {formData.selectedBrand.name}
                              </h4>
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                {formData.selectedBrand.description}
                              </p>
                            </div>
                          </div>

                          {/* Location Details */}
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs uppercase tracking-wide">Address</span>
                              <p className="text-foreground font-medium mt-1">{formData.location?.address}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-muted-foreground text-xs uppercase tracking-wide">Door Number</span>
                                <p className="text-foreground font-medium mt-1">{formData.locationDetails?.doorNumber || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs uppercase tracking-wide">Area</span>
                                <p className="text-foreground font-medium mt-1">{formData.locationDetails?.carpetArea} sq ft</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Investment Breakdown */}
                        <div className="bg-white dark:bg-stone-800 rounded-lg p-4 md:p-6 border shadow-sm">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Investment Breakdown
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">Total Investment</span>
                              <span className="font-semibold text-foreground">${(formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">Total Shares Available</span>
                              <span className="font-semibold text-foreground">{Math.floor((formData.locationDetails.carpetArea * formData.selectedBrand.costPerArea) / 5.75)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">Price per Share</span>
                              <span className="font-semibold text-foreground">$5.75</span>
                            </div>
                            <div className="border-t border-border pt-3 mt-3">
                              <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground text-sm">Your Shares</span>
                                <span className="font-bold text-primary text-lg">{selectedShares}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground text-sm">Your Investment</span>
                                <span className="font-bold text-primary text-lg">${(selectedShares * 5.75).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* Payment Summary - Enhanced */}
                      <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 md:p-6 border border-green-200 dark:border-green-800 shadow-sm">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          Payment Summary
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">Selected Shares</span>
                              <span className="font-medium">{selectedShares}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">Share Value</span>
                              <span className="font-medium">₹{(selectedShares * 5.75 * 83).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">Service Fee (15%)</span>
                              <span className="font-medium">₹{(selectedShares * 5.75 * 83 * 0.15).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-sm">GST (5%)</span>
                              <span className="font-medium">₹{(selectedShares * 5.75 * 83 * 0.05).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-stone-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">Total Amount</span>
                              <span className="font-bold text-xl md:text-2xl text-green-600">₹{(selectedShares * 5.75 * 83 * 1.2).toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 text-center">
                              All fees included
                            </div>
                          </div>

                          {/* Payment Method Preview */}
                          <div className="pt-4 border-t border-green-200 dark:border-green-800">
                            <div className="text-xs text-muted-foreground mb-2">Payment Method</div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                CARD
                              </div>
                              <span className="text-foreground">Secure payment via Razorpay</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
        </motion.div>
      </div>
      
      <div className="w-full  flex md:flex-row justify-between gap-2 md:gap-4 mt-4 p-6 border md:mt-0">
          {step === 1 && (
            <Button variant="outline" onClick={() => router.back()} className="w-auto">
              Cancel Application
            </Button>
          )}
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} className="w-auto">
              Previous
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={() => setStep(3)}
              className="bg-yellow-600 text-white hover:bg-yellow-700 w-auto"
            >
              Confirm Location
            </Button>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)} className="w-auto">
                Previous
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-yellow-600 text-white hover:bg-yellow-700 w-auto"
              >
                Make Payment
              </Button>
            </>
          )}


        </div>
    </div>
  );
}