"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { TrendingUp, TrendingDown, Building, Users, Calendar, BarChart3, PieChart } from 'lucide-react';

export default function BrandAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // Get all brands for analytics
  const brands = useQuery(api.franchises.getAllFranchisers) || [];

  // Filter brands by industry
  const filteredBrands = selectedIndustry === 'all' 
    ? brands 
    : brands.filter((brand: { industry: string }) => brand.industry === selectedIndustry);

  // Calculate analytics
  const totalBrands = filteredBrands.length;
  const approvedBrands = filteredBrands.filter((brand: { status: string }) => brand.status === 'approved').length;
  const pendingBrands = filteredBrands.filter((brand: { status: string }) => brand.status === 'pending').length;
  const rejectedBrands = filteredBrands.filter((brand: { status: string }) => brand.status === 'rejected').length;

  // Industry distribution
  const industryStats = brands.reduce((acc: Record<string, number>, brand: { industry: string }) => {
    acc[brand.industry] = (acc[brand.industry] || 0) + 1;
    return acc;
  }, {});

  // Status distribution
  const statusStats = {
    approved: approvedBrands,
    pending: pendingBrands,
    rejected: rejectedBrands,
    draft: filteredBrands.filter((brand: { status: string }) => brand.status === 'draft').length,
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analytics and insights for brand performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Home Services">Home Services</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Brands</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalBrands}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{approvedBrands}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingBrands}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rejectedBrands}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">-5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / totalBrands) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(industryStats)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([industry, count]) => (
                <div key={industry} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{industry}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${((count as number) / totalBrands) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Brands */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Brand Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBrands
              .sort((a: { createdAt: number }, b: { createdAt: number }) => b.createdAt - a.createdAt)
              .slice(0, 10)
              .map((brand: { _id: string; name: string; industry: string; status: string; createdAt: number }) => (
              <div key={brand._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{brand.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{brand.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(brand.status)}>
                    {brand.status}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(brand.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
