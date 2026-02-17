"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface FranchiseCardProps {
  franchise: Doc<"franchiser"> & {
    investmentRange?: { min: number; max: number };
    locations?: Doc<"franchiserLocations">[];
  };
}

export function FranchiseCard({ franchise }: FranchiseCardProps) {
  const imageUrl = useQuery(api.files.getFileUrl, { 
    storageId: franchise.logoUrl as Id<"_storage"> 
  }) ?? franchise.logoUrl; // Fallback if logoUrl is a string/URL (though schema says id)

  // Format currency (assuming AED for now as per user request context)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden border-border/50">
      <Link href={`/marketplace/${franchise._id}`} className="flex-1">
        <div className="relative h-48 w-full bg-muted/50 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={imageUrl as string} 
                    alt={franchise.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
                />
            ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                    <Building className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm">No Image</span>
                </div>
            )}
            <Badge className="absolute top-2 right-2" variant={franchise.status === 'approved' ? 'default' : 'secondary'}>
                {franchise.status}
            </Badge>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
                <Badge variant="outline" className="mb-2 text-xs font-normal">{franchise.category}</Badge>
                <CardTitle className="text-xl font-bold">{franchise.name}</CardTitle>
            </div>
          </div>
          <CardDescription className="line-clamp-2 mt-1">
            {franchise.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 pb-2 flex-grow">
            {franchise.investmentRange && (
                <div className="flex items-center text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-2 text-primary" />
                    <span>
                        {formatCurrency(franchise.investmentRange.min)} - {formatCurrency(franchise.investmentRange.max)}
                    </span>
                </div>
            )}
            
            <div className="flex items-center text-sm text-muted-foreground">
                <Building className="w-4 h-4 mr-2" />
                <span>{franchise.industry}</span>
            </div>
        </CardContent>
      </Link>
      
      <CardFooter className="pt-2 border-t bg-muted/10">
        <Link href={`/marketplace/${franchise._id}`} className="w-full">
            <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
