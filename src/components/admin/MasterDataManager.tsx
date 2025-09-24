"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMasterData, useHierarchicalData } from '@/hooks/useMasterData';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

export default function MasterDataManager() {
  const { countries, industries, categories, productCategories, isLoading } = useMasterData();
  const { hierarchicalData } = useHierarchicalData();
  const seedAllData = useMutation(api.seedData.seedAllData);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      
      // Check if data already exists
      if (countries && countries.length > 0) {
        const confirmSeed = window.confirm('Data already exists. Do you want to seed again? This may create duplicates.');
        if (!confirmSeed) {
          setIsSeeding(false);
          return;
        }
      }
      
      const result = await seedAllData({});
      toast.success(`Seeded successfully: ${result.countries} countries, ${result.industries} industries, ${result.categories} categories, ${result.productCategories} product categories`);
    } catch (error) {
      console.error('Seeding error:', error);
      toast.error(`Failed to seed data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading master data...</p>
          <p className="text-xs text-stone-500 mt-2">If this takes too long, check your Convex connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Manager</h1>
          <p className="text-sm text-stone-600 mt-1">
            {countries?.length || 0} countries, {industries?.length || 0} industries, {categories?.length || 0} categories, {productCategories?.length || 0} product categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSeedData} 
            disabled={isSeeding}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
          {countries && countries.length > 0 && (
            <Button 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  // TODO: Implement clear data functionality
                  toast.info('Clear data functionality not implemented yet');
                }
              }}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Clear Data
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Product Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{countries?.length || 0}</div>
                <p className="text-xs text-stone-600">Active countries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Industries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{industries?.length || 0}</div>
                <p className="text-xs text-stone-600">Business industries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories?.length || 0}</div>
                <p className="text-xs text-stone-600">Business categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productCategories?.length || 0}</div>
                <p className="text-xs text-stone-600">Product subcategories</p>
              </CardContent>
            </Card>
          </div>

          {hierarchicalData && (
            <Card>
              <CardHeader>
                <CardTitle>Hierarchical Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hierarchicalData.map((industry) => (
                    <div key={industry._id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{industry.icon}</span>
                        <h3 className="font-semibold">{industry.name}</h3>
                        <Badge variant="secondary">{industry.categories?.length || 0} categories</Badge>
                      </div>
                      <div className="ml-6 space-y-2">
                        {industry.categories?.map((category) => (
                          <div key={category._id} className="border-l-2 border-stone-200 pl-4">
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span className="font-medium">{category.name}</span>
                              <Badge variant="outline">{category.productCategories?.length || 0} products</Badge>
                            </div>
                            {category.productCategories && category.productCategories.length > 0 && (
                              <div className="ml-4 mt-2 space-y-1">
                                {category.productCategories.map((productCategory) => (
                                  <div key={productCategory._id} className="flex items-center gap-2 text-sm text-stone-600">
                                    <span>{productCategory.icon}</span>
                                    <span>{productCategory.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Countries ({countries?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries?.map((country) => (
                  <div key={country._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <h3 className="font-semibold">{country.name}</h3>
                        <p className="text-sm text-stone-600">{country.code}</p>
                      </div>
                    </div>
                    <div className="text-xs text-stone-500">
                      <p>Currency: {country.currency}</p>
                      <p>Timezone: {country.timezone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industries ({industries?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries?.map((industry) => (
                  <div key={industry._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{industry.icon}</span>
                      <div>
                        <h3 className="font-semibold">{industry.name}</h3>
                        <p className="text-sm text-stone-600">{industry.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories ({categories?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category) => (
                  <div key={category._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-stone-600">{category.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories ({productCategories?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productCategories?.map((productCategory) => (
                  <div key={productCategory._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{productCategory.icon}</span>
                      <div>
                        <h3 className="font-semibold">{productCategory.name}</h3>
                        <p className="text-sm text-stone-600">{productCategory.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

