"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { Building, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function BrandComparePage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState<'overview' | 'financial' | 'performance'>('overview');

  // Helper function to validate URLs
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Get all brands
  const brands = useQuery(api.franchises.getAllFranchisers) || [];

  const handleBrandSelect = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    } else if (selectedBrands.length < 4) {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const selectedBrandData = brands.filter((brand: { _id: string }) => selectedBrands.includes(brand._id));

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
          <h1 className="text-3xl font-bold">Brand Comparison</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compare up to 4 brands side by side
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={compareMode} onValueChange={(value: 'overview' | 'financial' | 'performance') => setCompareMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Brand Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Brands to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand: { _id: string; name: string; industry: string; status: string; logoUrl?: string }) => (
              <div
                key={brand._id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedBrands.includes(brand._id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleBrandSelect(brand._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {brand.logoUrl && brand.logoUrl.trim() !== "" && isValidUrl(brand.logoUrl) ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{brand.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{brand.industry}</p>
                    <Badge className={getStatusColor(brand.status)}>
                      {brand.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedBrands.length}/4 brands
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedBrands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {selectedBrandData.map((brand: { _id: string; name: string; logoUrl?: string }) => (
                      <TableHead key={brand._id} className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {brand.logoUrl && brand.logoUrl.trim() !== "" && isValidUrl(brand.logoUrl) ? (
                              <Image
                                src={brand.logoUrl}
                                alt={brand.name}
                                width={32}
                                height={32}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <Building className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{brand.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    {selectedBrandData.map((brand: { _id: string; status: string; industry: string; category: string; website?: string; createdAt: number; updatedAt: number }) => (
                      <TableCell key={brand._id} className="text-center">
                        <Badge className={getStatusColor(brand.status)}>
                          {brand.status}
                        </Badge>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Industry</TableCell>
                    {selectedBrandData.map((brand: { _id: string; status: string; industry: string; category: string; website?: string; createdAt: number; updatedAt: number }) => (
                      <TableCell key={brand._id} className="text-center">
                        {brand.industry}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Category</TableCell>
                    {selectedBrandData.map((brand: { _id: string; status: string; industry: string; category: string; website?: string; createdAt: number; updatedAt: number }) => (
                      <TableCell key={brand._id} className="text-center">
                        {brand.category}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Website</TableCell>
                    {selectedBrandData.map((brand: { _id: string; status: string; industry: string; category: string; website?: string; createdAt: number; updatedAt: number }) => (
                      <TableCell key={brand._id} className="text-center">
                        {brand.website ? (
                          <a 
                            href={brand.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Visit
                          </a>
                        ) : (
                          <span className="text-gray-400">No website</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created</TableCell>
                    {selectedBrandData.map((brand: { _id: string; status: string; industry: string; category: string; website?: string; createdAt: number; updatedAt: number }) => (
                      <TableCell key={brand._id} className="text-center">
                        {formatDate(brand.createdAt)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Last Updated</TableCell>
                    {selectedBrandData.map((brand: { _id: string; status: string; industry: string; category: string; website?: string; createdAt: number; updatedAt: number }) => (
                      <TableCell key={brand._id} className="text-center">
                        {formatDate(brand.updatedAt)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison Cards */}
      {selectedBrands.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {selectedBrandData.map((brand: { _id: string; name: string; description: string; industry: string; category: string; website?: string; status: string; createdAt: number; updatedAt: number; logoUrl?: string }) => (
            <Card key={brand._id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {brand.logoUrl && brand.logoUrl.trim() !== "" && isValidUrl(brand.logoUrl) ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                    <Badge className={getStatusColor(brand.status)}>
                      {brand.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {brand.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Industry</h4>
                    <p className="text-sm">{brand.industry}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Category</h4>
                    <p className="text-sm">{brand.category}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Website</h4>
                  {brand.website ? (
                    <a 
                      href={brand.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {brand.website}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">No website</p>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span>{formatDate(brand.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Updated</span>
                    <span>{formatDate(brand.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedBrands.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Select Brands to Compare
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Choose up to 4 brands from the list above to see a detailed comparison of their features, performance, and metrics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
