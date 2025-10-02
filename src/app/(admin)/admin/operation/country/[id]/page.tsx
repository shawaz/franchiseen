"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Globe,
  Plus,
  Edit,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Franchise {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  status: "active" | "launching" | "closed";
  revenue: number;
  growth: number;
  establishedDate: string;
  owner: string;
}

interface CountryData {
  id: string;
  name: string;
  code: string;
  flag?: string;
  image?: string;
  capital: string;
  population: number;
  currency: string;
  timezone: string;
  stats: {
    franchises: number;
    revenue: number;
    growth: number;
    activeFranchises: number;
    launchingFranchises: number;
    closedFranchises: number;
  };
  franchises: Franchise[];
}

export default function CountryDetailPage() {
  const params = useParams();
  const countryId = params.id as string;

  // Mock data - replace with real data from your backend
  const countryData: CountryData = {
    id: countryId,
    name: getCountryName(countryId),
    code: getCountryCode(countryId),
    capital: getCapital(countryId),
    population: getPopulation(countryId),
    currency: getCurrency(countryId),
    timezone: getTimezone(countryId),
    image: getCountryImage(countryId),
    stats: {
      franchises: 15,
      revenue: 3800000,
      growth: 25.6,
      activeFranchises: 12,
      launchingFranchises: 2,
      closedFranchises: 1
    },
    franchises: [
      {
        id: "f1",
        name: "Downtown Branch",
        type: "Retail",
        location: "Main Street",
        city: "Riyadh",
        status: "active",
        revenue: 450000,
        growth: 18.5,
        establishedDate: "2023-01-15",
        owner: "Ahmed Al-Rashid"
      },
      {
        id: "f2",
        name: "Mall Location",
        type: "Food Court",
        location: "King Fahd Road",
        city: "Jeddah",
        status: "active",
        revenue: 320000,
        growth: 22.3,
        establishedDate: "2023-03-22",
        owner: "Sarah Al-Mansouri"
      },
      {
        id: "f3",
        name: "Airport Terminal",
        type: "Travel Retail",
        location: "King Khalid Airport",
        city: "Riyadh",
        status: "launching",
        revenue: 0,
        growth: 0,
        establishedDate: "2024-02-01",
        owner: "Mohammed Al-Zahrani"
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "launching":
        return <Badge className="bg-blue-100 text-blue-800">Launching</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/operation/country">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Countries
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{countryData.name}</h1>
            <p className="text-muted-foreground">
              Franchise operations in {countryData.name}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Country
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Franchise
          </Button>
        </div>
      </div>

      {/* Country Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Franchises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.stats.franchises}</div>
            <p className="text-xs text-muted-foreground">
              {countryData.stats.activeFranchises} active, {countryData.stats.launchingFranchises} launching
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${countryData.stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Annual revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{countryData.stats.growth}%</div>
            <p className="text-xs text-muted-foreground">
              Year over year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.population.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total population
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Country Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Country Information</CardTitle>
            <CardDescription>
              Basic information about {countryData.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Capital</p>
                <p className="text-sm text-muted-foreground">{countryData.capital}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">{countryData.currency}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Timezone</p>
                <p className="text-sm text-muted-foreground">{countryData.timezone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Country Code</p>
                <p className="text-sm text-muted-foreground">{countryData.code}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Key performance indicators for {countryData.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Franchises</span>
                <span className="text-sm font-bold text-green-600">{countryData.stats.activeFranchises}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Launching</span>
                <span className="text-sm font-bold text-blue-600">{countryData.stats.launchingFranchises}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Closed</span>
                <span className="text-sm font-bold text-red-600">{countryData.stats.closedFranchises}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Revenue per Franchise</span>
                  <span className="text-sm font-bold">
                    ${Math.round(countryData.stats.revenue / countryData.stats.franchises).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Franchises List */}
      <Card>
        <CardHeader>
          <CardTitle>Franchises in {countryData.name}</CardTitle>
          <CardDescription>
            Manage and monitor all franchises in this country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryData.franchises.map((franchise) => (
              <Card key={franchise.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{franchise.name}</h3>
                        {getStatusBadge(franchise.status)}
                        <Badge variant="outline">{franchise.type}</Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>{franchise.location}, {franchise.city}</p>
                        <p>Owner: {franchise.owner}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Revenue</p>
                          <p className="text-muted-foreground">${franchise.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Growth</p>
                          <p className="text-muted-foreground">+{franchise.growth}%</p>
                        </div>
                        <div>
                          <p className="font-medium">Established</p>
                          <p className="text-muted-foreground">{new Date(franchise.establishedDate).toLocaleDateString()}</p>
                        </div>
    <div>
                          <p className="font-medium">Status</p>
                          <p className="text-muted-foreground capitalize">{franchise.status}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions to get country-specific data
function getCountryName(id: string): string {
  const names: { [key: string]: string } = {
    'france': 'France',
    'uk': 'United Kingdom',
    'usa': 'United States',
    'canada': 'Canada',
    'singapore': 'Singapore',
    'thailand': 'Thailand',
    'china': 'China',
    'russia': 'Russia',
    'egypt': 'Egypt',
    'bahrain': 'Bahrain',
    'qatar': 'Qatar',
    'saudi-arabia': 'Saudi Arabia',
    'india': 'India',
    'uae': 'United Arab Emirates'
  };
  return names[id] || 'Unknown Country';
}

function getCountryCode(id: string): string {
  const codes: { [key: string]: string } = {
    'france': 'FR',
    'uk': 'GB',
    'usa': 'US',
    'canada': 'CA',
    'singapore': 'SG',
    'thailand': 'TH',
    'china': 'CN',
    'russia': 'RU',
    'egypt': 'EG',
    'bahrain': 'BH',
    'qatar': 'QA',
    'saudi-arabia': 'SA',
    'india': 'IN',
    'uae': 'AE'
  };
  return codes[id] || 'XX';
}

function getCapital(id: string): string {
  const capitals: { [key: string]: string } = {
    'france': 'Paris',
    'uk': 'London',
    'usa': 'Washington D.C.',
    'canada': 'Ottawa',
    'singapore': 'Singapore',
    'thailand': 'Bangkok',
    'china': 'Beijing',
    'russia': 'Moscow',
    'egypt': 'Cairo',
    'bahrain': 'Manama',
    'qatar': 'Doha',
    'saudi-arabia': 'Riyadh',
    'india': 'New Delhi',
    'uae': 'Abu Dhabi'
  };
  return capitals[id] || 'Unknown';
}

function getPopulation(id: string): number {
  const populations: { [key: string]: number } = {
    'france': 68000000,
    'uk': 67000000,
    'usa': 330000000,
    'canada': 38000000,
    'singapore': 5900000,
    'thailand': 70000000,
    'china': 1400000000,
    'russia': 146000000,
    'egypt': 102000000,
    'bahrain': 1700000,
    'qatar': 2900000,
    'saudi-arabia': 35000000,
    'india': 1380000000,
    'uae': 10000000
  };
  return populations[id] || 0;
}

function getCurrency(id: string): string {
  const currencies: { [key: string]: string } = {
    'france': 'Euro (EUR)',
    'uk': 'Pound Sterling (GBP)',
    'usa': 'US Dollar (USD)',
    'canada': 'Canadian Dollar (CAD)',
    'singapore': 'Singapore Dollar (SGD)',
    'thailand': 'Thai Baht (THB)',
    'china': 'Chinese Yuan (CNY)',
    'russia': 'Russian Ruble (RUB)',
    'egypt': 'Egyptian Pound (EGP)',
    'bahrain': 'Bahraini Dinar (BHD)',
    'qatar': 'Qatari Riyal (QAR)',
    'saudi-arabia': 'Saudi Riyal (SAR)',
    'india': 'Indian Rupee (INR)',
    'uae': 'UAE Dirham (AED)'
  };
  return currencies[id] || 'Unknown';
}

function getTimezone(id: string): string {
  const timezones: { [key: string]: string } = {
    'france': 'CET (UTC+1)',
    'uk': 'GMT (UTC+0)',
    'usa': 'EST/PST (UTC-5/-8)',
    'canada': 'EST/PST (UTC-5/-8)',
    'singapore': 'SGT (UTC+8)',
    'thailand': 'ICT (UTC+7)',
    'china': 'CST (UTC+8)',
    'russia': 'MSK (UTC+3)',
    'egypt': 'EET (UTC+2)',
    'bahrain': 'AST (UTC+3)',
    'qatar': 'AST (UTC+3)',
    'saudi-arabia': 'AST (UTC+3)',
    'india': 'IST (UTC+5:30)',
    'uae': 'GST (UTC+4)'
  };
  return timezones[id] || 'Unknown';
}

function getCountryImage(id: string): string | undefined {
  const images: { [key: string]: string } = {
    'india': '/images/landmarks/taj-mahal.jpg',
    'uae': '/images/landmarks/burj-khalifa.jpg'
  };
  return images[id];
}