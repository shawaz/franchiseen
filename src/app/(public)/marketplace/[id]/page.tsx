"use client";

import React, { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Globe, CheckCircle, Info, DollarSign, Building } from "lucide-react";
import { ApplicationModal } from "@/components/marketplace/ApplicationModal";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FranchiseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const franchiseId = unwrappedParams.id as Id<"franchiser">;
  
  const franchise = useQuery(api.franchises.getFranchiserById, { id: franchiseId });
  const locations = useQuery(api.franchises.getFranchiserLocations, { franchiserId: franchiseId });
  const products = useQuery(api.franchises.getFranchiserProducts, { franchiserId: franchiseId });
  
  const logoUrl = useQuery(api.files.getFileUrl, franchise?.logoUrl ? { storageId: franchise.logoUrl } : "skip");
  
  // Fetch interior images if any
  const interiorImageIds = franchise?.interiorImages || [];
  const interiorImages = useQuery(api.files.getFileUrls, { storageIds: interiorImageIds as Id<"_storage">[] });

  if (franchise === undefined) {
    return (
        <div className="container py-20 space-y-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-40 w-full" />
        </div>
    );
  }

  if (franchise === null) {
      return (
          <div className="container py-20 text-center">
              <h1 className="text-2xl font-bold">Franchise not found</h1>
              <Link href="/marketplace">
                <Button variant="link">Back to Marketplace</Button>
              </Link>
          </div>
      );
  }

  // Calculate investment ranges from locations (optional, user for display)
  let minInvestment = 0;
  if (locations && locations.length > 0) {
      minInvestment = Math.min(...locations.map(l => l.franchiseFee + l.setupCost + l.workingCapital));
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header / Banner */}
      <div className="bg-muted w-full h-64 md:h-80 relative overflow-hidden">
        {interiorImages && interiorImages[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
                src={interiorImages[0]!} 
                alt="Interior" 
                className="w-full h-full object-cover opacity-70" 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Building className="w-20 h-20 opacity-20" />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 container flex items-end justify-between">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt={franchise.name} className="w-full h-full object-contain" />
                    ) : (
                        <Building className="w-12 h-12 text-muted-foreground" />
                    )}
                </div>
                <div className="mb-2">
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground">{franchise.name}</h1>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{franchise.industry}</Badge>
                        <Badge variant="outline">{franchise.category}</Badge>
                    </div>
                </div>
            </div>
            
            <div className="hidden md:block">
                <ApplicationModal 
                    franchiseId={franchise._id} 
                    franchiseName={franchise.name} 
                />
            </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4">About the Brand</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {franchise.description}
                    </p>
                </section>

                <Tabs defaultValue="locations" className="w-full">
                    <TabsList>
                        <TabsTrigger value="locations">Locations & Costs</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="locations" className="mt-6 space-y-4">
                        <h3 className="text-xl font-semibold mb-2">Available Locations</h3>
                        {locations && locations.length > 0 ? (
                            <div className="grid gap-4">
                                {locations.map(loc => (
                                    <Card key={loc._id}>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex justify-between">
                                                <span>{loc.city}, {loc.country}</span>
                                                <Badge>{loc.status}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Franchise Fee</p>
                                                <p className="font-semibold">{formatCurrency(loc.franchiseFee)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Setup Cost</p>
                                                <p className="font-semibold">{formatCurrency(loc.setupCost)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Capital</p>
                                                <p className="font-semibold">{formatCurrency(loc.workingCapital)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Total Est.</p>
                                                <p className="font-bold text-primary">{formatCurrency(loc.franchiseFee + loc.setupCost + loc.workingCapital)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No specific location details available yet.</p>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="products" className="mt-6">
                         <h3 className="text-xl font-semibold mb-4">Key Products</h3>
                         {products && products.length > 0 ? (
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                 {products.map(product => (
                                     <Card key={product._id} className="overflow-hidden">
                                         <div className="h-32 bg-muted flex items-center justify-center">
                                             <span className="text-xs text-muted-foreground">No Image</span>
                                         </div>
                                         <CardContent className="p-3">
                                             <p className="font-semibold truncate">{product.name}</p>
                                             <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                         </CardContent>
                                     </Card>
                                 ))}
                             </div>
                         ) : (
                             <p className="text-muted-foreground">No product details available.</p>
                         )}
                    </TabsContent>
                    
                    <TabsContent value="gallery" className="mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            {interiorImages?.map((url, i) => (
                                url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img key={i} src={url} alt={`Interior ${i}`} className="w-full h-48 object-cover rounded-lg" />
                                )
                            ))}
                            {(!interiorImages || interiorImages.length === 0) && (
                                <p className="text-muted-foreground">No gallery images available.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Investment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Min. Investment</span>
                            <span className="font-bold text-lg">{formatCurrency(minInvestment)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground flex items-center"><Info className="w-4 h-4 mr-2" /> Royalty Fee</span>
                            <span className="font-medium">{franchise.royaltyPercentage ?? 0}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground flex items-center"><Globe className="w-4 h-4 mr-2" /> Website</span>
                            <a href={franchise.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline max-w-[150px] truncate">
                                {franchise.website || 'N/A'}
                            </a>
                        </div>
                        
                        <div className="pt-4">
                            <ApplicationModal 
                                franchiseId={franchise._id} 
                                franchiseName={franchise.name} 
                            />
                            <p className="text-xs text-center text-muted-foreground mt-3">
                                No payment required at this stage.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
