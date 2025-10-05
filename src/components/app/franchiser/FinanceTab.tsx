"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface FinanceTabProps {
  franchiserId?: string;
  initialData?: {
    minCarpetArea?: number;
    franchiseFee?: number;
    setupCostPerSqft?: number;
    workingCapitalPerSqft?: number;
    royaltyPercentage?: number;
    setupBy?: 'DESIGN_INTERIOR_BY_BRAND' | 'DESIGN_INTERIOR_BY_FRANCHISEEN' | 'DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN';
    estimatedMonthlyRevenue?: number;
  };
  onUpdateFinance?: (updates: Partial<FinanceTabProps['initialData']>) => void;
}

export default function FinanceTab({ 
  franchiserId, 
  initialData,
  onUpdateFinance 
}: FinanceTabProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    minCarpetArea: initialData?.minCarpetArea || '',
    franchiseFee: initialData?.franchiseFee || '',
    setupCostPerSqft: initialData?.setupCostPerSqft || '',
    workingCapitalPerSqft: initialData?.workingCapitalPerSqft || '',
    royaltyPercentage: initialData?.royaltyPercentage || '',
    setupBy: initialData?.setupBy || 'DESIGN_INTERIOR_BY_BRAND' as const,
    estimatedMonthlyRevenue: initialData?.estimatedMonthlyRevenue || '',
  });

  const updateFranchiser = useMutation(api.franchises.updateFranchiser);

  // Update form data when initialData changes
  // Only update database-saved fields, preserve user-entered calculation fields
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev, // Preserve all existing values
        // Only update fields that come from the database
        royaltyPercentage: initialData.royaltyPercentage || prev.royaltyPercentage,
        setupBy: initialData.setupBy || prev.setupBy,
        estimatedMonthlyRevenue: initialData.estimatedMonthlyRevenue || prev.estimatedMonthlyRevenue,
        // For calculation fields, only update if they're not already set by user
        minCarpetArea: prev.minCarpetArea || initialData.minCarpetArea || '',
        franchiseFee: prev.franchiseFee || initialData.franchiseFee || '',
        setupCostPerSqft: prev.setupCostPerSqft || initialData.setupCostPerSqft || '',
        workingCapitalPerSqft: prev.workingCapitalPerSqft || initialData.workingCapitalPerSqft || '',
      }));
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!franchiserId) {
      toast.error('Franchiser ID is required');
      return;
    }

    setLoading(true);
    try {
      // Prepare the data for submission - only include fields that belong to franchiser table
      const updateData = {
        royaltyPercentage: formData.royaltyPercentage ? Number(formData.royaltyPercentage) : undefined,
        setupBy: formData.setupBy,
        estimatedMonthlyRevenue: formData.estimatedMonthlyRevenue ? Number(formData.estimatedMonthlyRevenue) : undefined,
      };

      // Call the mutation to update the franchiser
      await updateFranchiser({
        id: franchiserId as Id<"franchiser">,
        ...updateData
      });

      // Call the callback if provided with all form data (including calculation fields)
      if (onUpdateFinance) {
        onUpdateFinance({
          ...formData,
          minCarpetArea: formData.minCarpetArea ? Number(formData.minCarpetArea) : undefined,
          franchiseFee: formData.franchiseFee ? Number(formData.franchiseFee) : undefined,
          setupCostPerSqft: formData.setupCostPerSqft ? Number(formData.setupCostPerSqft) : undefined,
          workingCapitalPerSqft: formData.workingCapitalPerSqft ? Number(formData.workingCapitalPerSqft) : undefined,
          royaltyPercentage: formData.royaltyPercentage ? Number(formData.royaltyPercentage) : undefined,
          estimatedMonthlyRevenue: formData.estimatedMonthlyRevenue ? Number(formData.estimatedMonthlyRevenue) : undefined,
        });
      }

      toast.success('Financial information updated successfully!');
      
    } catch (error) {
      console.error('Error updating financial information:', error);
      toast.error('Failed to update financial information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Information</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Update your franchise financial details and investment requirements
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Note: Only royalty percentage, setup type, and estimated monthly revenue are saved. Other fields are for calculation purposes.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Setup By and Monthly Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Monthly Revenue */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="estimatedMonthlyRevenue" className="text-xs font-medium">Est. Monthly Revenue *</Label>
            <span className="text-xs text-stone-500">
              {formData.estimatedMonthlyRevenue ? `$${Number(formData.estimatedMonthlyRevenue).toLocaleString()}` : '$0'}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
            <Input
              id="estimatedMonthlyRevenue"
              type="number"
              min="0"
              step="1000"
              value={formData.estimatedMonthlyRevenue || ''}
              onChange={(e) => handleInputChange('estimatedMonthlyRevenue', e.target.value)}
              className="pl-6 h-9 text-sm"
              placeholder="50,000"
            />
          </div>
          <p className="text-[10px] text-stone-400">
            Expected monthly recurring revenue
          </p>
        </div>

        {/* Minimum Carpet Area */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="minCarpetArea" className="text-xs font-medium">Min. Area *</Label>
            <span className="text-xs text-stone-500">
              {formData.minCarpetArea ? `${Number(formData.minCarpetArea).toLocaleString()} sq.ft` : '0'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Input
              id="minCarpetArea"
              type="number"
              min="100"
              step="50"
              value={formData.minCarpetArea || ''}
              onChange={(e) => handleInputChange('minCarpetArea', e.target.value)}
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== '') {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue < 100) {
                    handleInputChange('minCarpetArea', 100);
                  }
                }
              }}
              placeholder="500"
              className="h-9 text-sm"
            />
          </div>
          <p className="text-[10px] text-stone-400">Min. space required</p>
        </div>

        {/* Setup By */}
        <div className="space-y-1 lg:col-span-2">
          <Label htmlFor="setupBy" className="text-xs font-medium">Setup By *</Label>
          <Select
            value={formData.setupBy}
            onValueChange={(value: 'DESIGN_INTERIOR_BY_BRAND' | 'DESIGN_INTERIOR_BY_FRANCHISEEN' | 'DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN') => 
              handleInputChange('setupBy', value)
            }
          >
            <SelectTrigger className="h-9 text-sm w-full">
              <SelectValue placeholder="Select setup option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESIGN_INTERIOR_BY_BRAND">
                Design & Interior By Brand
              </SelectItem>
              <SelectItem value="DESIGN_INTERIOR_BY_FRANCHISEEN">
                Design & Interior By Franchiseen
              </SelectItem>
              <SelectItem value="DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN">
                Design By Brand & Interior By Franchiseen
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-stone-400">
            Who will handle design and interior setup
          </p>
        </div>
      </div>

      {/* Investment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Franchise Fee */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="franchiseFee" className="text-xs font-medium">Franchise Fee *</Label>
            <span className="text-xs text-stone-500">
              {formData.franchiseFee ? `$${Number(formData.franchiseFee).toLocaleString()}` : '$0'}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
            <Input
              id="franchiseFee"
              type="number"
              min="0"
              step="1000"
              value={formData.franchiseFee || ''}
              onChange={(e) => handleInputChange('franchiseFee', e.target.value)}
              className="pl-6 h-9 text-sm"
              placeholder="25,000"
            />
          </div>
          <p className="text-[10px] text-stone-400">One-time fee</p>
        </div>

        {/* Royalty Percentage */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="royaltyPercentage" className="text-xs font-medium">Royalty % *</Label>
                <span className="text-xs text-stone-500">
                  {formData.royaltyPercentage ? `${formData.royaltyPercentage}%` : '0%'}
                </span>
              </div>
              <div className="relative">
                <Input
                  id="royaltyPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.royaltyPercentage || ''}
                  onChange={(e) => handleInputChange('royaltyPercentage', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="5.0"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">%</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Monthly royalty of gross revenue
              </p>
            </div>

        {/* Setup Cost */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="setupCostPerSqft" className="text-xs font-medium">Setup Cost/ Area *</Label>
                <span className="text-xs text-stone-500">
                  {formData.setupCostPerSqft ? `$${formData.setupCostPerSqft}` : '$0'}/sq.ft
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <Input
                  id="setupCostPerSqft"
                  type="number"
                  min="0"
                  step="10"
                  value={formData.setupCostPerSqft || ''}
                  onChange={(e) => handleInputChange('setupCostPerSqft', e.target.value)}
                  className="pl-6 h-9 text-sm"
                  placeholder="150"
                />
              </div>
              <p className="text-[10px] text-stone-400">
                {formData.minCarpetArea && formData.setupCostPerSqft ? 
                  `Total: $${(Number(formData.minCarpetArea) * Number(formData.setupCostPerSqft)).toLocaleString()}` : 
                  'Per sq.ft, one-time'}
              </p>
            </div>

        {/* Working Capital */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="workingCapitalPerSqft" className="text-xs font-medium">Working Capital *</Label>
                <span className="text-xs text-stone-500">
                  {formData.workingCapitalPerSqft ? `$${formData.workingCapitalPerSqft}` : '$0'}/sq.ft
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <Input
                  id="workingCapitalPerSqft"
                  type="number"
                  min="0"
                  step="5"
                  value={formData.workingCapitalPerSqft || ''}
                  onChange={(e) => handleInputChange('workingCapitalPerSqft', e.target.value)}
                  className="pl-6 h-9 text-sm"
                  placeholder="100"
                />
              </div>
              <p className="text-[10px] text-stone-400">
                {formData.minCarpetArea && formData.workingCapitalPerSqft ? 
                  `1 Year: $${(Number(formData.minCarpetArea) * Number(formData.workingCapitalPerSqft)).toLocaleString()}` : 
                  'Per sq.ft, 1 year'}
              </p>
            </div>
      </div>

      {/* Total Investment Summary */}
      <Card className="border-stone-200 bg-stone-50/50 dark:bg-stone-900/10">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <svg className="w-5 h-5 mr-2 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Total Minimum Investment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-300">Franchise Fee</span>
              <span className="font-medium">
                ${(Number(formData.franchiseFee) || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-300">
                Setup Cost
                {formData.minCarpetArea && (
                  <span className="text-xs text-stone-500 block">
                    ({Number(formData.minCarpetArea).toLocaleString()} sq.ft × ${Number(formData.setupCostPerSqft) || 0}/sq.ft)
                  </span>
                )}
              </span>
              <span className="font-medium">
                ${(Number(formData.minCarpetArea) && Number(formData.setupCostPerSqft) ? Number(formData.minCarpetArea) * Number(formData.setupCostPerSqft) : 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-300">
                Working Capital (1 Year)
                {formData.minCarpetArea && (
                  <span className="text-xs text-stone-500 block">
                    ({Number(formData.minCarpetArea).toLocaleString()} sq.ft × ${Number(formData.workingCapitalPerSqft) || 0}/sq.ft)
                  </span>
                )}
              </span>
              <span className="font-medium">
                ${(Number(formData.minCarpetArea) && Number(formData.workingCapitalPerSqft) ? Number(formData.minCarpetArea) * Number(formData.workingCapitalPerSqft) : 0).toLocaleString()}
              </span>
            </div>
            
            <div className="border-t border-stone-200 dark:border-stone-700 pt-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Investment</span>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                  ${
                    (
                      (Number(formData.franchiseFee) || 0) +
                      (Number(formData.minCarpetArea) && Number(formData.setupCostPerSqft) ? Number(formData.minCarpetArea) * Number(formData.setupCostPerSqft) : 0) +
                      (Number(formData.minCarpetArea) && Number(formData.workingCapitalPerSqft) ? Number(formData.minCarpetArea) * Number(formData.workingCapitalPerSqft) : 0)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })
                  }
                </span>
              </div>
              
              {/* ROI Calculation */}
              {formData.estimatedMonthlyRevenue && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Estimated ROI</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {(() => {
                        const totalInvestment = (Number(formData.franchiseFee) || 0) +
                          (Number(formData.minCarpetArea) && Number(formData.setupCostPerSqft) ? Number(formData.minCarpetArea) * Number(formData.setupCostPerSqft) : 0) +
                          (Number(formData.minCarpetArea) && Number(formData.workingCapitalPerSqft) ? Number(formData.minCarpetArea) * Number(formData.workingCapitalPerSqft) : 0);
                        
                        const monthlyRevenue = Number(formData.estimatedMonthlyRevenue) || 0;
                        const annualRevenue = monthlyRevenue * 12;
                        
                        if (totalInvestment > 0) {
                          const roi = ((annualRevenue - totalInvestment) / totalInvestment) * 100;
                          return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
                        }
                        return '0%';
                      })()}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                    <div className="flex justify-between">
                      <span>Annual Revenue:</span>
                      <span>${((Number(formData.estimatedMonthlyRevenue) || 0) * 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payback Period:</span>
                      <span>
                        {(() => {
                          const totalInvestment = (Number(formData.franchiseFee) || 0) +
                            (Number(formData.minCarpetArea) && Number(formData.setupCostPerSqft) ? Number(formData.minCarpetArea) * Number(formData.setupCostPerSqft) : 0) +
                            (Number(formData.minCarpetArea) && Number(formData.workingCapitalPerSqft) ? Number(formData.minCarpetArea) * Number(formData.workingCapitalPerSqft) : 0);
                          
                          const monthlyRevenue = Number(formData.estimatedMonthlyRevenue) || 0;
                          
                          if (monthlyRevenue > 0) {
                            const months = totalInvestment / monthlyRevenue;
                            if (months < 12) {
                              return `${months.toFixed(1)} months`;
                            } else {
                              const years = months / 12;
                              return `${years.toFixed(1)} years`;
                            }
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-stone-500 mt-2">
                This is the estimated minimum investment required to open this franchise location.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
