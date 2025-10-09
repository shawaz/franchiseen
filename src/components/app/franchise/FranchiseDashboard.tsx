"use client";

import React from 'react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Card, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useConvexImageUrls } from '@/hooks/useConvexImageUrl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useMutation } from 'convex/react';
import { useAllProductCategories } from '@/hooks/useMasterData';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Receipt,
  Building2,
  CreditCard,
  Settings,
  Box,
  Library,
  Users,
  Plus,
  Package,
  FileImage,
  Upload,
  X,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import FranchiseWallet from './FranchiseWallet';


// Receipt Image Component
function ReceiptImage({ receiptId }: { receiptId: string }) {
  const [showImage, setShowImage] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const receiptUrl = useConvexImageUrl(receiptId as any);

  return (
    <>
      <button
        onClick={() => setShowImage(true)}
        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        title="View receipt"
      >
        <FileImage className="h-4 w-4" />
      </button>

      {showImage && receiptUrl && (
        <Dialog open={showImage} onOpenChange={setShowImage}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[600px]">
              <Image
                src={receiptUrl}
                alt="Receipt"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Payouts Tab Component
function PayoutsTab({ 
  franchiseId, 
  franchise, 
  payoutSummary, 
  recentPayouts,
  incomeData,
  expenseSummary
}: { 
  franchiseId?: string; 
  franchise?: { _id: string; franchiseSlug: string; franchiserId: string; stage: string; investmentId: string } | null;
  payoutSummary?: {
    totalPayouts: number;
    totalGrossRevenue: number;
    totalRoyalty: number;
    totalPlatformFee: number;
    totalToTokenHolders: number;
    totalToReserve: number;
    currentReserveBalance: number;
    currentReservePercentage: number;
  };
  recentPayouts?: Array<{
    _id: string;
    period: string;
    grossRevenue: number;
    royaltyAmount: number;
    platformFeeAmount: number;
    toTokenHolders: number;
    toReserve: number;
    distributionRule: string;
    status: string;
  }>;
  incomeData?: {
    totalIncome: number;
    incomeCount: number;
  };
  expenseSummary?: {
    totalExpenses: number;
    expenseCount: number;
  };
}) {
  // Auto-calculate from POS income and expenses
  const calculatedIncome = incomeData?.totalIncome || 0;
  const calculatedExpenses = expenseSummary?.totalExpenses || 0;
  const netRevenue = Math.max(0, calculatedIncome - calculatedExpenses);

  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAutoCalculation, setUseAutoCalculation] = useState(true);
  const processPayout = useMutation(api.payoutManagement.processFranchisePayout);
  
  // Get franchise wallet for reserve calculation
  const franchiseWallet = useQuery(
    api.franchiseManagement.getFranchiseWallet,
    franchiseId ? { franchiseId: franchiseId as Id<"franchises"> } : "skip"
  );
  
  // Get investment data for working capital target
  const investment = useQuery(
    api.franchiseManagement.getFranchiseFundraisingDataById,
    franchiseId ? { franchiseId: franchiseId as Id<"franchises"> } : "skip"
  );

  // Get franchise token data for total supply (token budget)
  const franchiseToken = useQuery(
    api.tokenManagement.getFranchiseToken,
    franchiseId ? { franchiseId: franchiseId as Id<"franchises"> } : "skip"
  );

  // Calculate total token budget (total supply value)
  const totalTokenBudget = franchiseToken 
    ? franchiseToken.totalSupply * franchiseToken.sharePrice 
    : investment?.totalInvestment || 0;
  
  // Calculate distribution preview
  const calculateDistributionPreview = () => {
    // Use auto-calculated values or manual input
    const revenueNum = useAutoCalculation ? calculatedIncome : (parseFloat(revenue) || 0);
    const expensesNum = useAutoCalculation ? calculatedExpenses : (parseFloat(expenses) || 0);
    const netRevenueCalc = Math.max(0, revenueNum - expensesNum);
    
    const royaltyPercent = 5; // Could get from franchiser
    const platformPercent = 2;
    
    const royalty = netRevenueCalc * (royaltyPercent / 100);
    const platformFee = netRevenueCalc * (platformPercent / 100);
    const afterFees = netRevenueCalc - royalty - platformFee;
    
    // Calculate reserve percentage
    const workingCapital = investment?.workingCapital || 25000;
    const currentReserve = franchiseWallet?.usdBalance || 0;
    const reservePercent = (currentReserve / workingCapital) * 100;
    
    // Determine distribution
    let toHoldersPercent = 100;
    let toReservePercent = 0;
    let rule = 'Full Reserve (≥ 75%)';
    
    if (reservePercent < 25) {
      toHoldersPercent = 25;
      toReservePercent = 75;
      rule = 'Critical Reserve (< 25%)';
    } else if (reservePercent < 50) {
      toHoldersPercent = 50;
      toReservePercent = 50;
      rule = 'Low Reserve (< 50%)';
    } else if (reservePercent < 75) {
      toHoldersPercent = 75;
      toReservePercent = 25;
      rule = 'Building Reserve (< 75%)';
    }
    
    const toHolders = afterFees * (toHoldersPercent / 100);
    const toReserve = afterFees * (toReservePercent / 100);
    
    return {
      grossRevenue: revenueNum,
      totalExpenses: expensesNum,
      netRevenue: netRevenueCalc,
      royalty,
      platformFee,
      afterFees,
      toHolders,
      toReserve,
      reservePercent,
      rule,
      newReserveBalance: currentReserve + toReserve
    };
  };
  
  const preview = calculateDistributionPreview();
  
  const handleProcessPayout = async () => {
    if (!franchiseId || !franchise?._id) {
      toast.error('Franchise not found');
      return;
    }
    
    const revenueNum = useAutoCalculation ? calculatedIncome : (parseFloat(revenue) || 0);
    const expensesNum = useAutoCalculation ? calculatedExpenses : (parseFloat(expenses) || 0);
    
    if (revenueNum <= 0) {
      toast.error('No revenue to process. Generate revenue from POS first.');
      return;
    }
    
    const netRevenueCalc = revenueNum - expensesNum;
    
    if (netRevenueCalc <= 0) {
      toast.error('Net revenue must be positive (Revenue must be greater than expenses)');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const result = await processPayout({
        franchiseId: franchise._id as Id<"franchises">,
        revenue: netRevenueCalc, // Use net revenue (after expenses)
        period: new Date().toISOString().split('T')[0],
        payoutType: 'daily'
      });
      
      toast.success(
        <div className="space-y-1">
          <p className="font-medium">Payout Processed Successfully! 🎉</p>
          <p className="text-sm">To Token Holders: ${result.toTokenHolders.toLocaleString()}</p>
          <p className="text-sm">To Reserve: ${result.toReserve.toLocaleString()}</p>
          <p className="text-sm">Royalty to Brand: ${result.royaltyAmount.toLocaleString()}</p>
          <p className="text-xs text-stone-500">{result.distributionRule}</p>
        </div>,
        { duration: 8000 }
      );
      
      // Clear inputs
      setRevenue('');
      setExpenses('');
    } catch (error) {
      console.error('Payout error:', error);
      toast.error(`Failed to process payout: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (franchise?.stage !== 'ongoing') {
    return (
      <div className="text-center py-12">
        <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Payouts Not Available</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Payouts are only available for operational franchises in &quot;ongoing&quot; stage.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Reserve Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Payout Distribution</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Process revenue distribution to token holders with smart reserve management
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${
          preview.reservePercent >= 75 ? 'bg-green-100 dark:bg-green-900/20' :
          preview.reservePercent >= 50 ? 'bg-blue-100 dark:bg-blue-900/20' :
          preview.reservePercent >= 25 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
          'bg-red-100 dark:bg-red-900/20'
        }`}>
          <p className="text-xs text-gray-600 dark:text-gray-400">Reserve Status</p>
          <p className={`text-lg font-bold ${
            preview.reservePercent >= 75 ? 'text-green-700 dark:text-green-400' :
            preview.reservePercent >= 50 ? 'text-blue-700 dark:text-blue-400' :
            preview.reservePercent >= 25 ? 'text-yellow-700 dark:text-yellow-400' :
            'text-red-700 dark:text-red-400'
          }`}>
            {preview.reservePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
              <p className="text-2xl font-bold text-green-600">
                ${payoutSummary?.totalGrossRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Token Budget</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalTokenBudget?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total Supply: {franchiseToken?.totalSupply?.toLocaleString() || '0'} tokens
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Royalty Paid</p>
              <p className="text-2xl font-bold text-purple-600">
                ${payoutSummary?.totalRoyalty?.toLocaleString() || '0'}
              </p>
            </div>
            <Building2 className="h-6 w-6 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Token Holders</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${payoutSummary?.totalToTokenHolders?.toLocaleString() || '0'}
              </p>
            </div>
            <Users className="h-6 w-6 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Distribution Rules */}
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">Distribution Rules</h4>
        </CardHeader>
        <div className="px-6 pb-6 space-y-2 text-sm">
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded">
            <span className="font-medium text-red-700 dark:text-red-400">Reserve &lt; 25% (Critical)</span>
            <span className="text-red-600 dark:text-red-400">25% holders / 75% reserve</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded">
            <span className="font-medium text-yellow-700 dark:text-yellow-400">Reserve &lt; 50% (Low)</span>
            <span className="text-yellow-600 dark:text-yellow-400">50% holders / 50% reserve</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded">
            <span className="font-medium text-blue-700 dark:text-blue-400">Reserve &lt; 75% (Building)</span>
            <span className="text-blue-600 dark:text-blue-400">75% holders / 25% reserve</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded">
            <span className="font-medium text-green-700 dark:text-green-400">Reserve = 100% (Full)</span>
            <span className="text-green-600 dark:text-green-400">100% holders / 0% reserve</span>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
            * Royalty (5%) and Platform Fee (2%) deducted from net revenue before distribution
          </p>
        </div>
      </Card>

      {/* Process Payout Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Process Payout</h4>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-calc" className="text-sm">Auto-calculate from POS</Label>
              <input
                id="auto-calc"
                type="checkbox"
                checked={useAutoCalculation}
                onChange={(e) => setUseAutoCalculation(e.target.checked)}
                className="rounded border-gray-300"
              />
            </div>
          </div>
        </CardHeader>
        <div className="px-6 pb-6 space-y-4">
          {useAutoCalculation ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Auto-Calculated from POS Data</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total Income (POS Sales)</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${calculatedIncome.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{incomeData?.incomeCount || 0} transactions</p>
                </div>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">${calculatedExpenses.toLocaleString()}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{expenseSummary?.expenseCount || 0} expenses</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">Net Revenue</p>
                <p className="text-3xl font-bold text-green-600">${netRevenue.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue">Total Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="Enter total revenue (e.g., 10000)"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <Label htmlFor="expenses">Total Expenses ($)</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="Enter total expenses (e.g., 3000)"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
            </div>
          )}
          
          {/* Live Preview */}
          {(useAutoCalculation || parseFloat(revenue) > 0 || parseFloat(expenses) > 0) && (
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg space-y-3">
              <h5 className="font-medium text-sm">Distribution Preview</h5>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Gross Revenue</p>
                  <p className="font-semibold text-lg">${preview.grossRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Expenses</p>
                  <p className="font-semibold text-lg text-red-600">-${preview.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Net Revenue</p>
                <p className="font-bold text-xl">${preview.netRevenue.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Royalty (5%)</span>
                  <span className="font-medium text-purple-600">-${preview.royalty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (2%)</span>
                  <span className="font-medium text-purple-600">-${preview.platformFee.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-gray-600 dark:text-gray-400 text-sm">After Fees</p>
                <p className="font-bold text-lg">${preview.afterFees.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Distribution Rule</p>
                    <p className="text-xs text-gray-500">{preview.rule}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    preview.reservePercent >= 75 ? 'bg-green-100 text-green-800' :
                    preview.reservePercent >= 50 ? 'bg-blue-100 text-blue-800' :
                    preview.reservePercent >= 25 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Reserve: {preview.reservePercent.toFixed(1)}%
                  </div>
                </div>
                
                <div className="flex justify-between text-sm p-2 bg-green-50 dark:bg-green-900/10 rounded">
                  <span className="font-medium text-green-700 dark:text-green-400">To Token Holders</span>
                  <span className="font-bold text-green-600">${preview.toHolders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-blue-50 dark:bg-blue-900/10 rounded">
                  <span className="font-medium text-blue-700 dark:text-blue-400">To Reserve Fund</span>
                  <span className="font-bold text-blue-600">${preview.toReserve.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Reserve Balance</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${preview.newReserveBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>Progress to Target</span>
                  <span>{((preview.newReserveBalance / (investment?.workingCapital || 25000)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleProcessPayout}
            disabled={isProcessing || preview.netRevenue <= 0}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isProcessing ? 'Processing Payout...' : 'Process Payout & Distribute Funds'}
          </Button>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded text-xs text-blue-700 dark:text-blue-400">
            <strong>💡 Tip:</strong> {useAutoCalculation 
              ? 'Payout is auto-calculated from your POS income and expenses. Add income via POS billing and expenses via the Expenses tab.'
              : 'Manual entry mode - switch to auto-calculate to use POS data automatically.'}
          </div>
        </div>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">Payout History</h4>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {recentPayouts && recentPayouts.length > 0 ? (
              recentPayouts.map((payout) => (
                <div key={payout._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium">{payout.period}</h5>
                      <p className="text-xs text-gray-500">{payout.distributionRule}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : payout.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="font-semibold">${payout.grossRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">To Holders</p>
                      <p className="font-semibold text-green-600">${payout.toTokenHolders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">To Reserve</p>
                      <p className="font-semibold text-blue-600">${payout.toReserve.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Royalty</p>
                      <p className="font-semibold text-purple-600">${payout.royaltyAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No payouts processed yet</p>
                <p className="text-sm">Enter revenue above to process your first payout</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function FranchiseDashboard() {
  const params = useParams();
  const franchiseSlug = params?.franchiseSlug as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'stock' | 'inventory' | 'team' | 'expenses' | 'payouts' | 'transactions' | 'settings'>('overview');
  
  // Product creation modal state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    cost: 0,
    price: 0,
    category: '',
    status: 'active' as const,
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unit: 'pieces',
  });

  // Expense modal state
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState<{
    category: string;
    amount: number;
    description: string;
    expenseDate: string;
    paymentMethod: 'cash' | 'card' | 'wallet' | 'transfer';
  }>({
    category: '',
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingExpense, setIsUploadingExpense] = useState(false);

  // Get franchise by slug to get the actual ID
  const franchise = useQuery(api.franchiseManagement.getFranchiseBySlug, 
    franchiseSlug ? { franchiseSlug } : "skip"
  );
  const franchiseId = franchise?._id;

  // Get products for this franchise
  const products = useQuery(api.franchiseStoreQueries.getFranchiserProductsByFranchiseSlug,
    franchiseSlug ? { franchiseSlug } : "skip"
  );

  // Get all product image URLs
  const allProductImages = products?.flatMap(product => product.images) || [];
  const productImageUrls = useConvexImageUrls(allProductImages);

  // Get product categories and mutations
  const productCategories = useAllProductCategories();
  const createProduct = useMutation(api.franchises.createFranchiserProduct);
  const requestStockTransfer = useMutation(api.stockManagement.requestStockTransfer);
  
  // Expense management
  const { uploadFile } = useFileUpload();
  const createExpense = useMutation(api.expenseManagement.createExpense);
  const deleteExpense = useMutation(api.expenseManagement.deleteExpense);
  const expenses = useQuery(api.expenseManagement.getFranchiseExpenses,
    franchiseId ? { franchiseId, limit: 50 } : "skip"
  );
  const expenseSummary = useQuery(api.expenseManagement.getExpenseSummary,
    franchiseId ? { franchiseId } : "skip"
  );
  const incomeData = useQuery(api.expenseManagement.getFranchiseIncome,
    franchiseId ? { franchiseId } : "skip"
  );

  // Budget management queries
  const currentBudget = useQuery(api.budgetManagement.getCurrentBudgetSummary,
    franchiseId ? { franchiseId } : "skip"
  );
  
  const franchiseTeam = useQuery(api.teamManagement.getFranchiseTeam,
    franchiseId ? { franchiseId, includeInactive: false } : "skip"
  );

  const payoutSummary = useQuery(api.payoutManagement.getPayoutSummary,
    franchiseId ? { franchiseId } : "skip"
  );

  const recentPayouts = useQuery(api.payoutManagement.getFranchisePayouts,
    franchiseId ? { franchiseId } : "skip"
  );

  // Helper function to get product image URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getProductImageUrl = (product: { images: any[] }, index = 0) => {
    if (product.images && product.images.length > index && productImageUrls) {
      const imageIndex = allProductImages.indexOf(product.images[index]);
      return productImageUrls[imageIndex];
    }
    return null;
  };

  // Handle product form input changes
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({ 
      ...prev, 
      [name]: name === 'cost' || name === 'price' || name === 'stockQuantity' || name === 'minStockLevel' || name === 'maxStockLevel' 
        ? parseFloat(value) || 0 
        : value 
    }));
  };

  // Handle product form submission
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchise?.franchiserId) return;

    try {
      await createProduct({
        franchiserId: franchise.franchiserId,
        ...productFormData,
        images: [], // TODO: Add image upload functionality
      });
      
      toast.success('Product added successfully!');
      setIsAddProductModalOpen(false);
      setProductFormData({
        name: '',
        description: '',
        cost: 0,
        price: 0,
        category: '',
        status: 'active',
        stockQuantity: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        unit: 'pieces',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  // Handle stock transfer request
  const handleRequestStock = async (product: { _id: string; name: string }, requestedQuantity: number) => {
    if (!franchise?._id) return;

    try {
      await requestStockTransfer({
        franchiseId: franchise._id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productId: product._id as any,
        requestedQuantity,
        notes: `Stock request for ${product.name}`,
      });
      
      toast.success(`Stock request submitted for ${product.name}`);
    } catch (error) {
      console.error('Error requesting stock:', error);
      toast.error('Failed to request stock');
    }
  };

  // Handle receipt upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setReceiptFile(file);
    
    // Create preview for images only
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview('PDF');
    }
  };

  // Handle expense form submission
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchiseId) return;

    setIsUploadingExpense(true);

    try {
      // Upload receipt if provided
      let receiptId;
      if (receiptFile) {
        receiptId = await uploadFile(receiptFile);
      }

      // Create expense
      await createExpense({
        franchiseId: franchiseId,
        category: expenseFormData.category,
        amount: expenseFormData.amount,
        description: expenseFormData.description,
        expenseDate: new Date(expenseFormData.expenseDate).getTime(),
        paymentMethod: expenseFormData.paymentMethod,
        receiptUrl: receiptId,
      });

      toast.success('Expense added successfully!');
      
      // Reset form
      setIsAddExpenseModalOpen(false);
      setExpenseFormData({
        category: '',
        amount: 0,
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
      });
      setReceiptFile(null);
      setReceiptPreview(null);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setIsUploadingExpense(false);
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteExpense({ expenseId: expenseId as any });
      toast.success('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: Library },
    { id: 'stock', label: 'Stock', icon: Box },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'payouts', label: 'Payouts', icon: DollarSign },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Show loading state while franchise data is loading
  if (!franchise) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading franchise dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-12">
      {franchiseId && (
        <FranchiseWallet 
          franchiseId={franchiseId}
          franchiseName={franchise.businessName}
          franchiseStatus={franchise.status}
          franchiseStage={franchise.stage}
        />
      )}
      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                      <p className="text-xl font-bold">123</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
                      <p className="text-xl font-bold">123</p>
                    </div>
                    <Building2 className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-xl font-bold text-green-600">123</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl font-bold text-green-600">123</p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Earnings</h3>
                  <div className="space-y-3">

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Franchise 1</p>
                          <p className="text-xs text-gray-500">Sep 2024</p>
                        </div>
                        <p className="font-semibold text-green-600">123</p>
                      </div>

                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Active Contracts</h3>
                  <div className="space-y-3">

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Franchise 1</p>
                          <p className="text-xs text-gray-500">Token #123</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                      </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Budget Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage monthly budget, team salaries, and expenses
                  </p>
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Set Budget
                </button>
              </div>

              {/* Budget Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Budget</p>
                      <p className="text-2xl font-bold">
                        ${currentBudget?.budget?.monthlyBudget?.toLocaleString() || '0'}
                      </p>
                      </div>
                    <DollarSign className="h-6 w-6 text-blue-500" />
                      </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Team Salaries</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${currentBudget?.budget?.teamSalaries?.toLocaleString() || '0'}
                        </p>
                      </div>
                    <Users className="h-6 w-6 text-green-500" />
                    </div>
                  </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${currentBudget?.actualExpenses?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                  <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        ${currentBudget?.remainingBudget?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-yellow-500" />
                  </div>
                </Card>
              </div>

              {/* Budget Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Budget Breakdown</h4>
                  <div className="space-y-4">
                    {[
                      { category: 'Team Salaries', budgeted: 8500, spent: 7200, percentage: 34 },
                      { category: 'Rent', budgeted: 4000, spent: 4000, percentage: 16 },
                      { category: 'Utilities', budgeted: 1500, spent: 1200, percentage: 6 },
                      { category: 'Supplies', budgeted: 3000, spent: 2800, percentage: 12 },
                      { category: 'Marketing', budgeted: 2000, spent: 1800, percentage: 8 },
                      { category: 'Maintenance', budgeted: 1000, spent: 800, percentage: 4 },
                      { category: 'Taxes', budgeted: 2000, spent: 1900, percentage: 8 },
                      { category: 'Insurance', budgeted: 800, spent: 800, percentage: 3 },
                      { category: 'Other', budgeted: 1200, spent: 800, percentage: 5 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm text-gray-600">${item.spent} / ${item.budgeted}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.spent > item.budgeted ? 'bg-red-500' : 
                              item.spent > item.budgeted * 0.9 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((item.spent / item.budgeted) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Recent Expenses</h4>
                  <div className="space-y-3">
                    {[
                      { description: 'Employee Salaries - January', amount: 7200, date: '2024-01-15', category: 'Salaries' },
                      { description: 'Monthly Rent Payment', amount: 4000, date: '2024-01-01', category: 'Rent' },
                      { description: 'Electricity Bill', amount: 450, date: '2024-01-10', category: 'Utilities' },
                      { description: 'Food Supplies', amount: 1200, date: '2024-01-12', category: 'Supplies' },
                      { description: 'Marketing Campaign', amount: 800, date: '2024-01-08', category: 'Marketing' },
                    ].map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{expense.description}</p>
                          <p className="text-xs text-gray-500">{expense.date} • {expense.category}</p>
                      </div>
                        <span className="font-semibold text-red-600">-${expense.amount}</span>
                      </div>
                    ))}
                    </div>
                  </Card>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Outlet Stock Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your local inventory and stock levels
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {products?.length || 0} products in stock
                  </div>
                  <button 
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Stock Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                      <p className="text-2xl font-bold">{products?.length || 0}</p>
                    </div>
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {products?.filter(p => p.minStockLevel && p.stockQuantity <= p.minStockLevel).length || 0}
                      </p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-yellow-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-600">
                        {products?.filter(p => p.stockQuantity === 0).length || 0}
                      </p>
                    </div>
                    <Box className="h-6 w-6 text-red-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stock Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${products?.reduce((sum, p) => sum + (p.stockQuantity * p.cost), 0).toLocaleString() || '0'}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>
              
              {products && products.length > 0 ? (
              <div className="space-y-4">
                  {products.map((product) => {
                    const isLowStock = product.minStockLevel && product.stockQuantity <= product.minStockLevel;
                    const isOutOfStock = product.stockQuantity === 0;
                    
                    return (
                      <Card key={product._id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {(() => {
                                const imageUrl = getProductImageUrl(product);
                                return imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                ) : (
                                  <Box className="h-6 w-6 text-gray-400" />
                                );
                              })()}
                            </div>
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {product.categoryName || product.category}
                              </p>
                            </div>
                          </div>
                      <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOutOfStock 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : isLowStock 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                    </div>
                        
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                            <p className="text-gray-600 dark:text-gray-400">Current Stock</p>
                            <p className={`font-semibold ${
                              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {product.stockQuantity} {product.unit || 'units'}
                            </p>
                      </div>
                      <div>
                            <p className="text-gray-600 dark:text-gray-400">Price</p>
                            <p className="font-semibold">${product.price}</p>
                      </div>
                      <div>
                            <p className="text-gray-600 dark:text-gray-400">Cost</p>
                            <p className="font-semibold">${product.cost}</p>
                      </div>
                      <div>
                            <p className="text-gray-600 dark:text-gray-400">Profit Margin</p>
                            <p className="font-semibold text-green-600">
                              {((product.price - product.cost) / product.cost * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <div className="flex justify-between text-xs text-gray-500 flex-1">
                              <span>Min: {product.minStockLevel || 0} {product.unit || 'units'}</span>
                              {product.maxStockLevel && (
                                <span>Max: {product.maxStockLevel} {product.unit || 'units'}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                onClick={() => {
                                  // TODO: Open stock adjustment modal
                                  console.log('Adjust stock for:', product.name);
                                }}
                              >
                                Adjust Stock
                              </button>
                              <button
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                onClick={() => {
                                  const quantity = prompt(`Enter quantity to request for ${product.name}:`);
                                  if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
                                    handleRequestStock(product, Number(quantity));
                                  }
                                }}
                              >
                                Request Stock
                              </button>
                            </div>
                      </div>
                    </div>
                  </Card>
                    );
                  })}
              </div>
              ) : (
                <Card className="p-8 text-center">
                  <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Products in Stock
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your outlet doesn&apos;t have any products in inventory yet. Add products to start managing your stock.
                  </p>
                  <button 
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </button>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Inventory Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive stock overview and analytics
                  </p>
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Stock
                </button>
              </div>

              {/* Inventory Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                      <p className="text-2xl font-bold">{products?.length || 0}</p>
                        </div>
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                        <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
                      <p className="text-2xl font-bold text-red-600">
                        {products?.filter(product => product.stockQuantity <= (product.minStockLevel || 10)).length || 0}
                      </p>
                        </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                      </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Stock Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${products?.reduce((sum, product) => sum + (product.stockQuantity * product.cost), 0).toLocaleString() || '0'}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {products?.filter(product => product.stockQuantity === 0).length || 0}
                      </p>
                    </div>
                    <Box className="h-6 w-6 text-orange-500" />
                  </div>
                </Card>
              </div>

              {/* Stock Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Stock Status Distribution</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">In Stock (Good)</span>
                        </div>
                      <span className="text-sm text-gray-600">
                        {products?.filter(product => product.stockQuantity > (product.minStockLevel || 10)).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Low Stock (Warning)</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {products?.filter(product => product.stockQuantity > 0 && product.stockQuantity <= (product.minStockLevel || 10)).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Out of Stock</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {products?.filter(product => product.stockQuantity === 0).length || 0}
                      </span>
                      </div>
                    </div>
                  </Card>

                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Top Categories by Stock Value</h4>
                  <div className="space-y-3">
                    {products && Object.entries(
                      products.reduce((acc, product) => {
                        const category = product.category;
                        const value = product.stockQuantity * product.cost;
                        acc[category] = (acc[category] || 0) + value;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, value]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-gray-600">${value.toLocaleString()}</span>
              </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Detailed Inventory Table */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Detailed Inventory</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Categories</option>
                      {products && [...new Set(products.map(p => p.category))].map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Min Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Max Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Unit Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Value</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products && products.length > 0 ? (
                        products.map((product, index) => {
                          const isLowStock = product.stockQuantity <= (product.minStockLevel || 10);
                          const isOutOfStock = product.stockQuantity === 0;
                          const totalValue = product.stockQuantity * product.cost;
                          
                          return (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    {getProductImageUrl(product) ? (
                                      <Image
                                        src={getProductImageUrl(product)!}
                                        alt={product.name}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-medium ${
                                  isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {product.stockQuantity}
                                </span>
                              </td>
                              <td className="py-3 px-4">{product.minStockLevel || 'N/A'}</td>
                              <td className="py-3 px-4">{product.maxStockLevel || 'N/A'}</td>
                              <td className="py-3 px-4">${product.cost.toFixed(2)}</td>
                              <td className="py-3 px-4">${totalValue.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isOutOfStock 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : isLowStock 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                                    Edit
                                  </button>
                                  {(isLowStock || isOutOfStock) && (
                                    <button 
                                      onClick={() => handleRequestStock(product, (product.maxStockLevel || 50) - product.stockQuantity)}
                                      className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                                    >
                                      Request
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-500">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p>No products found</p>
                            <p className="text-sm">Add products to start managing inventory</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Team Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your team members, roles, and salaries
                  </p>
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </button>
              </div>

              {/* Team Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Team</p>
                      <p className="text-2xl font-bold">{franchiseTeam?.length || 0}</p>
                    </div>
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Salaries</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${franchiseTeam?.reduce((sum, member) => sum + (member.isHourly ? (member.hourlyRate || 0) * 160 : member.salary), 0).toLocaleString() || '0'}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Managers</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {franchiseTeam?.filter(member => member.role === 'manager').length || 0}
                      </p>
                    </div>
                    <Settings className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Staff</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {franchiseTeam?.filter(member => member.role !== 'manager').length || 0}
                      </p>
                    </div>
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                </Card>
              </div>

              {/* Team Members */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Team Members</h4>
                <div className="space-y-4">
                  {franchiseTeam && franchiseTeam.length > 0 ? (
                    franchiseTeam.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.user ? `${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}` : 'U'}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-medium">
                            {member.user ? `${member.user.firstName || ''} ${member.user.lastName || ''}` : 'Unknown User'}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Hired: {new Date(member.hireDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${member.isHourly ? (member.hourlyRate || 0) * 160 : member.salary}/month
                        </p>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                            View
                          </button>
                      </div>
                    </div>
              </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>No team members found</p>
                      <p className="text-sm">Add team members to get started</p>
                    </div>
                  )}
                    </div>
                  </Card>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Expense Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track and manage all franchise expenses with receipts
                  </p>
                </div>
                <button
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </button>
              </div>

              {/* Expense Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${expenseSummary?.totalExpenses?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Receipt className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${incomeData?.totalIncome?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Net Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${((incomeData?.totalIncome || 0) - (expenseSummary?.totalExpenses || 0)).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expense Count</p>
                      <p className="text-2xl font-bold">{expenseSummary?.expenseCount || 0}</p>
                    </div>
                    <FileImage className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Expense List */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Recent Expenses</h4>
                <div className="space-y-3">
                  {expenses && expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{expense.description}</p>
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                {expense.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(expense.expenseDate).toLocaleDateString()} • {expense.paymentMethod}
                              {expense.receiptUrl && ' • Has receipt'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">
                              -${expense.amount.toLocaleString()}
                            </p>
                          </div>
                          {expense.receiptUrl && (
                            <ReceiptImage receiptId={expense.receiptUrl} />
                          )}
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No expenses recorded yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add expenses to track spending</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Expense by Category */}
              {expenseSummary?.byCategory && Object.keys(expenseSummary.byCategory).length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Expenses by Category</h4>
                  <div className="space-y-3">
                    {Object.entries(expenseSummary.byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-red-600 font-semibold">
                            ${amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'payouts' && (
            <PayoutsTab 
              franchiseId={franchiseId}
              franchise={franchise}
              payoutSummary={payoutSummary}
              recentPayouts={recentPayouts}
              incomeData={incomeData}
              expenseSummary={expenseSummary}
            />
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Wallet Transactions</h3>   
            </div>
          )}
        </div>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddProductModalOpen} onOpenChange={setIsAddProductModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Section - Product Photo */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Photo
                  </label>
                  <div className="relative w-full aspect-square max-w-xs bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="text-center">
                      <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Upload product image</p>
                      <p className="text-xs text-gray-400">PNG, JPG (max. 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Section - Product Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={productFormData.name}
                      onChange={handleProductFormChange}
                      required
                      placeholder="e.g., Signature Burger"
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <Select
                      value={productFormData.category}
                      onValueChange={(value) => setProductFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {productCategories?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productFormData.description}
                    onChange={handleProductFormChange}
                    placeholder="Brief description of the product"
                    rows={3}
                    className="h-20"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cost *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productFormData.cost}
                        onChange={handleProductFormChange}
                        required
                        placeholder="0.00"
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productFormData.price}
                        onChange={handleProductFormChange}
                        required
                        placeholder="0.00"
                        className="pl-8 h-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <Select
                      value={productFormData.unit}
                      onValueChange={(value) => setProductFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Management Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Stock Management
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Stock *
                  </label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={productFormData.stockQuantity}
                    onChange={handleProductFormChange}
                    required
                    placeholder="0"
                    className="h-9"
                  />
                </div>
                
                <div>
                  <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Stock Level
                  </label>
                  <Input
                    id="minStockLevel"
                    name="minStockLevel"
                    type="number"
                    min="0"
                    value={productFormData.minStockLevel}
                    onChange={handleProductFormChange}
                    placeholder="0"
                    className="h-9"
                  />
                </div>
                
                <div>
                  <label htmlFor="maxStockLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Stock Level
                  </label>
                  <Input
                    id="maxStockLevel"
                    name="maxStockLevel"
                    type="number"
                    min="0"
                    value={productFormData.maxStockLevel}
                    onChange={handleProductFormChange}
                    placeholder="0"
                    className="h-9"
                  />
                </div>
              </div>
              
              {/* Stock Level Indicators */}
              {productFormData.stockQuantity > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Stock Status</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        productFormData.stockQuantity === 0 
                          ? 'bg-red-500' 
                          : (productFormData.minStockLevel && productFormData.stockQuantity <= productFormData.minStockLevel)
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm">
                        {productFormData.stockQuantity === 0 
                          ? 'Out of Stock' 
                          : (productFormData.minStockLevel && productFormData.stockQuantity <= productFormData.minStockLevel)
                          ? 'Low Stock'
                          : 'In Stock'
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {productFormData.stockQuantity} {productFormData.unit || 'units'} available
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddProductModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Modal */}
      <Dialog open={isAddExpenseModalOpen} onOpenChange={setIsAddExpenseModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddExpense} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Receipt Upload */}
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Receipt (Optional)
                  </Label>
                  <div className="relative w-full aspect-square max-w-xs bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    {receiptPreview && receiptPreview !== 'PDF' ? (
                      <>
                        <Image
                          src={receiptPreview}
                          alt="Receipt preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptFile(null);
                            setReceiptPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : receiptPreview === 'PDF' ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 text-white rounded-lg flex items-center justify-center mb-2 mx-auto">
                          <span className="font-bold">PDF</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{receiptFile?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptFile(null);
                            setReceiptPreview(null);
                          }}
                          className="mt-2 text-red-500 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload receipt</p>
                        <p className="text-xs text-gray-400">Image or PDF (max. 5MB)</p>
                      </div>
                    )}
                  </div>
                  
                  {!receiptPreview && (
                    <div className="mt-3">
                      <input
                        id="receipt-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptUpload}
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Receipt
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Expense Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-category" className="text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={expenseFormData.category}
                    onValueChange={(value) => setExpenseFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Salaries">Salaries</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Taxes">Taxes</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount" className="text-sm font-medium">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="expense-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseFormData.amount || ''}
                      onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-description" className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="expense-description"
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter expense description"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-date" className="text-sm font-medium">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseFormData.expenseDate}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method" className="text-sm font-medium">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={expenseFormData.paymentMethod}
                    onValueChange={(value: 'cash' | 'card' | 'wallet' | 'transfer') => 
                      setExpenseFormData(prev => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddExpenseModalOpen(false);
                  setExpenseFormData({
                    category: '',
                    amount: 0,
                    description: '',
                    expenseDate: new Date().toISOString().split('T')[0],
                    paymentMethod: 'cash' as const,
                  });
                  setReceiptFile(null);
                  setReceiptPreview(null);
                }}
                disabled={isUploadingExpense}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploadingExpense}
                className="bg-red-600 hover:bg-red-700"
              >
                {isUploadingExpense ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Expense'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}