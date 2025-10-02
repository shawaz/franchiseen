"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
  image?: string;
  isHighlighted?: boolean;
  stats: {
    franchises: number;
    revenue: number;
    growth: number;
  };
}

export default function CountryPage() {
  // Mock data based on the image - replace with real data from your backend
  const countries: Country[] = [
    {
      id: "france",
      name: "France",
      code: "FR",
      stats: { franchises: 12, revenue: 2500000, growth: 8.5 }
    },
    {
      id: "uk",
      name: "UK",
      code: "GB",
      stats: { franchises: 18, revenue: 3200000, growth: 12.3 }
    },
    {
      id: "usa",
      name: "USA",
      code: "US",
      stats: { franchises: 45, revenue: 8500000, growth: 15.7 }
    },
    {
      id: "canada",
      name: "Canada",
      code: "CA",
      stats: { franchises: 8, revenue: 1800000, growth: 6.2 }
    },
    {
      id: "singapore",
      name: "Singapore",
      code: "SG",
      stats: { franchises: 5, revenue: 1200000, growth: 22.1 }
    },
    {
      id: "thailand",
      name: "Thailand",
      code: "TH",
      stats: { franchises: 7, revenue: 950000, growth: 18.4 }
    },
    {
      id: "china",
      name: "China",
      code: "CN",
      stats: { franchises: 25, revenue: 4200000, growth: 28.9 }
    },
    {
      id: "russia",
      name: "Russia",
      code: "RU",
      stats: { franchises: 3, revenue: 650000, growth: 4.1 }
    },
    {
      id: "egypt",
      name: "Egypt",
      code: "EG",
      stats: { franchises: 4, revenue: 780000, growth: 11.2 }
    },
    {
      id: "bahrain",
      name: "Bahrain",
      code: "BH",
      stats: { franchises: 2, revenue: 450000, growth: 16.8 }
    },
    {
      id: "qatar",
      name: "Qatar",
      code: "QA",
      stats: { franchises: 3, revenue: 680000, growth: 19.3 }
    },
    {
      id: "saudi-arabia",
      name: "Saudi Arabia",
      code: "SA",
      isHighlighted: true,
      stats: { franchises: 15, revenue: 3800000, growth: 25.6 }
    },
    {
      id: "india",
      name: "India",
      code: "IN",
      image: "/images/landmarks/taj-mahal.jpg",
      stats: { franchises: 22, revenue: 2800000, growth: 31.2 }
    },
    {
      id: "uae",
      name: "UAE",
      code: "AE",
      image: "/images/landmarks/burj-khalifa.jpg",
      stats: { franchises: 9, revenue: 2100000, growth: 27.4 }
    }
  ];

  const totalStats = countries.reduce((acc, country) => ({
    franchises: acc.franchises + country.stats.franchises,
    revenue: acc.revenue + country.stats.revenue,
    growth: acc.growth + country.stats.growth
  }), { franchises: 0, revenue: 0, growth: 0 });

  const averageGrowth = totalStats.growth / countries.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Country Operations</h1>
          <p className="text-muted-foreground">
            Manage franchise operations across different countries
          </p>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Franchises</p>
                <p className="text-2xl font-bold">{totalStats.franchises}</p>
                <p className="text-xs text-muted-foreground">Across {countries.length} countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">${totalStats.revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Annual revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Average Growth</p>
                <p className="text-2xl font-bold">{averageGrowth.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Year over year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {countries.map((country) => (
          <Link key={country.id} href={`/admin/operation/country/${country.id}`}>
            <Card 
              className={`h-32 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                country.isHighlighted 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
              }`}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {country.image ? (
                    <div className="relative w-full h-16 mb-2 rounded overflow-hidden">
                      <Image
                        src={country.image}
                        alt={country.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to flag or text if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-8 mb-2 bg-gray-600 rounded flex items-center justify-center text-xs font-bold">
                      {country.code}
                    </div>
                  )}
                  <h3 className="font-semibold text-sm">{country.name}</h3>
                </div>
                
                <div className="text-xs opacity-75 text-center">
                  <p>{country.stats.franchises} franchises</p>
                  <p>+{country.stats.growth}% growth</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {/* Add New Country Card */}
        <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
          <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
            <Plus className="h-8 w-8 mb-2 opacity-75" />
            <h3 className="font-semibold text-sm">New Country</h3>
            <p className="text-xs opacity-75 mt-1">Add new market</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Countries */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Countries</h3>
          <div className="space-y-3">
            {countries
              .sort((a, b) => b.stats.growth - a.stats.growth)
              .slice(0, 5)
              .map((country, index) => (
                <div key={country.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{country.name}</p>
                      <p className="text-sm text-muted-foreground">{country.stats.franchises} franchises</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{country.stats.growth}%</p>
                    <p className="text-sm text-muted-foreground">${country.stats.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}