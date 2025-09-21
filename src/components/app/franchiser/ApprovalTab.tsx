"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, MapPin, Clock, AlertCircle, AlertCircleIcon } from 'lucide-react';
import Image from 'next/image';

export type FranchiseStatus = 
  | 'property_approval' 
  | 'brand_approval' 
  | 'funding' 
  | 'launching' 
  | 'live' 
  | 'closed' 
  | 'rejected';

export interface Investment {
  total: number;
  amountInvested: number;
  investmentPercentage: number;
  sharesTotal: number;
  sharesPurchased: number;
  carpetArea: number;
}

export interface FranchiseApplication {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  status: FranchiseStatus;
  image: string;
  appliedDate: string;
  investment: Investment;
  website?: string;
  franchiseeName?: string;
  revenue?: number;
  profit?: number;
  realEstate: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    location: string;
    status: 'verified' | 'pending_verification' | 'rejected';
  };
  documents: {
    businessPlan: string;
    financialStatement: string;
    kyc: string;
  };
}

// Dummy franchise applications data
const dummyApplications: FranchiseApplication[] = [
  {
    id: 'app1',
    name: 'Burger King',
    location: '123 Main St, New York, NY',
    phone: '(555) 123-4567',
    email: 'bk@example.com',
    status: 'property_approval',
    image: '/images/franchises/burger-king.jpg',
    appliedDate: '2023-06-15',
    franchiseeName: 'John Smith',
    website: 'burgerking.com',
    revenue: 1200000,
    profit: 180000,
    investment: {
      total: 1500000,
      amountInvested: 750000,
      investmentPercentage: 50,
      sharesTotal: 20000,
      sharesPurchased: 10000,
      carpetArea: 1500
    },
    realEstate: {
      contactName: 'John Doe',
      contactEmail: 'john@realestate.com',
      contactPhone: '+1 (555) 987-6543',
      location: '123 Main St, New York, NY',
      status: 'pending_verification'
    },
    documents: {
      businessPlan: 'https://example.com/business-plan-1.pdf',
      financialStatement: 'https://example.com/financial-1.pdf',
      kyc: 'https://example.com/kyc-1.pdf',
    }
  },
  {
    id: 'app2',
    name: 'McDonald\'s',
    location: '456 Oak Ave, Los Angeles, CA',
    phone: '(555) 987-6543',
    email: 'mcd@example.com',
    status: 'brand_approval',
    image: '/images/franchises/mcdonalds.jpg',
    appliedDate: '2023-06-20',
    franchiseeName: 'Sarah Johnson',
    website: 'mcdonalds.com',
    revenue: 1800000,
    profit: 250000,
    investment: {
      total: 2000000,
      amountInvested: 1500000,
      investmentPercentage: 75,
      sharesTotal: 25000,
      sharesPurchased: 18750,
      carpetArea: 1800
    },
    realEstate: {
      contactName: 'Jane Smith',
      contactEmail: 'jane@realestate.com',
      contactPhone: '+1 (555) 876-5432',
      location: '456 Oak Ave, Los Angeles, CA',
      status: 'verified'
    },
    documents: {
      businessPlan: 'https://example.com/business-plan-2.pdf',
      financialStatement: 'https://example.com/financial-2.pdf',
      kyc: 'https://example.com/kyc-2.pdf',
    }
  },
  {
    id: 'app3',
    name: 'Starbucks',
    location: '789 Pine St, Seattle, WA',
    phone: '(555) 456-7890',
    email: 'sbux@example.com',
    status: 'funding',
    image: '/images/franchises/starbucks.jpg',
    appliedDate: '2023-07-01',
    franchiseeName: 'Michael Chen',
    website: 'starbucks.com',
    revenue: 1500000,
    profit: 220000,
    investment: {
      total: 1000000,
      amountInvested: 900000,
      investmentPercentage: 90,
      sharesTotal: 15000,
      sharesPurchased: 13500,
      carpetArea: 2000
    },
    realEstate: {
      contactName: 'Sarah Wilson',
      contactEmail: 'sarah@realestate.com',
      contactPhone: '+1 (555) 654-3210',
      location: '789 Pine St, Seattle, WA',
      status: 'verified'
    },
    documents: {
      businessPlan: 'https://example.com/business-plan-3.pdf',
      financialStatement: 'https://example.com/financial-3.pdf',
      kyc: 'https://example.com/kyc-3.pdf',
    }
  },
  {
    id: 'app5',
    name: 'Pizza Hut',
    location: '202 Maple Dr, Houston, TX',
    phone: '(555) 234-5678',
    email: 'pizzahut@example.com',
    status: 'live',
    image: '/images/franchises/pizza-hut.jpg',
    appliedDate: '2023-05-15',
    franchiseeName: 'Emily Rodriguez',
    website: 'pizzahut.com',
    revenue: 2000000,
    profit: 300000,
    investment: {
      total: 1800000,
      amountInvested: 2250000,
      investmentPercentage: 125,
      sharesTotal: 22000,
      sharesPurchased: 27500,
      carpetArea: 2500
    },
    realEstate: {
      contactName: 'David Brown',
      contactEmail: 'david@realestate.com',
      contactPhone: '+1 (555) 543-2109',
      location: '202 Maple Dr, Houston, TX',
      status: 'verified'
    },
    documents: {
      businessPlan: 'https://example.com/business-plan-5.pdf',
      financialStatement: 'https://example.com/financial-5.pdf',
      kyc: 'https://example.com/kyc-5.pdf',
    }
  },
  {
    id: 'app6',
    name: 'KFC',
    location: '303 Oak Ln, Miami, FL',
    phone: '(555) 876-5432',
    email: 'kfc@example.com',
    status: 'closed',
    image: '/images/franchises/kfc.jpg',
    appliedDate: '2023-04-01',
    franchiseeName: 'Robert Taylor',
    website: 'kfc.com',
    revenue: 2500000,
    profit: 375000,
    investment: {
      total: 2200000,
      amountInvested: 2200000,
      investmentPercentage: 100,
      sharesTotal: 25000,
      sharesPurchased: 25000,
      carpetArea: 3000
    },
    realEstate: {
      contactName: 'Lisa Taylor',
      contactEmail: 'lisa@realestate.com',
      contactPhone: '+1 (555) 432-1098',
      location: '753 Beach Blvd, Miami, FL',
      status: 'verified'
    },
    documents: {
      businessPlan: 'https://example.com/business-plan-6.pdf',
      financialStatement: 'https://example.com/financial-6.pdf',
      kyc: 'https://example.com/kyc-6.pdf',
    }
  },
  {
    id: 'app7',
    name: 'Pine Valley',
    location: '864 Forest Ln, Seattle, WA',
    phone: '+1 (555) 789-0123',
    email: 'pine@example.com',
    status: 'rejected',
    image: '/franchise/retail-7.png',
    appliedDate: '2024-07-20',
    investment: {
      total: 550000,
      amountInvested: 27500,
      investmentPercentage: 5,
      sharesTotal: 10000,
      sharesPurchased: 500,
      carpetArea: 1200
    },
    realEstate: {
      contactName: 'Robert Wilson',
      contactEmail: 'robert@realestate.com',
      contactPhone: '+1 (555) 321-0987',
      location: '864 Forest Ln, Seattle, WA',
      status: 'rejected'
    },
    documents: {
      businessPlan: 'https://example.com/business-plan-7.pdf',
      financialStatement: 'https://example.com/financial-7.pdf',
      kyc: 'https://example.com/kyc-7.pdf',
    }
  }
];

export function ApprovalTab() {
  const [applications] = useState<FranchiseApplication[]>(dummyApplications);
  const [selectedApp, setSelectedApp] = useState<FranchiseApplication | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const handleApprove = (application: FranchiseApplication) => {
    setSelectedApp(application);
    setInvestmentAmount(application.investment.amountInvested.toString());
    setIsApproveDialogOpen(true);
  };

  const handleReject = (application: FranchiseApplication) => {
    setSelectedApp(application);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedApp) return;
    
    const amount = parseFloat(investmentAmount);
    const amountInvested = selectedApp.investment.amountInvested;
    const total = selectedApp.investment.total;
    
    if (isNaN(amount) || amount < amountInvested || amount > total) {
      alert(`Investment amount must be between $${amountInvested.toLocaleString()} and $${total.toLocaleString()}`);
      return;
    }



    setIsApproveDialogOpen(false);
    setSelectedApp(null);
  };

  const confirmReject = () => {
    if (!selectedApp) return;
    

    setIsRejectDialogOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Franchise Applications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {statusFilter === 'all' 
              ? 'Showing all applications' 
              : `Showing ${statusFilter.replace('_', ' ')} applications`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">Filter by status:</div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="property_approval">
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                  Property Approval
                </div>
              </SelectItem>
              <SelectItem value="brand_approval">
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-2 text-blue-500" />
                  Brand Approval
                </div>
              </SelectItem>
              <SelectItem value="funding">
                <div className="flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                  Funding
                </div>
              </SelectItem>
              <SelectItem value="launching">
                <div className="flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-2 text-purple-500" />
                  Launching
                </div>
              </SelectItem>
              <SelectItem value="live">
                <div className="flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-500" />
                  Live
                </div>
              </SelectItem>
              <SelectItem value="closed">
                <div className="flex items-center">
                  <XCircle className="h-3.5 w-3.5 mr-2 text-gray-500" />
                  Closed
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center">
                  <XCircle className="h-3.5 w-3.5 mr-2 text-red-500" />
                  Rejected
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Franchise</TableHead>
                <TableHead>Carpet Area</TableHead>
                <TableHead>Investment</TableHead>
                <TableHead>Invested</TableHead>
                <TableHead>Share Purchased</TableHead>

                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-stone-100">
                        <Image
                          src={app.image}
                          alt={app.name}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <div className="flex items-center text-sm text-stone-500">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{app.location}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">{app.id === 'app1' ? '1,500' : app.id === 'app2' ? '1,800' : app.id === 'app3' ? '2,000' : app.id === 'app4' ? '2,200' : app.id === 'app5' ? '2,500' : app.id === 'app6' ? '3,000' : '1,200'} SQFT</TableCell>
                  <TableCell className="text-center">${app.investment.total.toLocaleString()}</TableCell>
                  <TableCell className="text-center">${app.investment.amountInvested.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                  <div >
                      {Math.floor(app.investment.amountInvested / (app.investment.total / 1000))}/{Math.floor(app.investment.total / 1000)}K
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {app.status === 'property_approval' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-amber-600 hover:bg-amber-50"
                          disabled
                        >
                          <AlertCircleIcon className="h-4 w-4 mr-1" />
                          Confirming Property
                        </Button>
                      )}
                      
                      {app.status === 'brand_approval' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleApprove(app)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleReject(app)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {app.status === 'funding' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:bg-indigo-50"
                          disabled
                        >
                          <AlertCircleIcon className="h-4 w-4 mr-1" />
                          Fundraising
                        </Button>
                      )}
                      
                      {app.status === 'launching' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:bg-purple-50"
                          disabled
                        >
                          <AlertCircleIcon className="h-4 w-4 mr-1" />
                          Launching
                        </Button>
                      )}
                      
                      {app.status === 'live' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:bg-green-50"
                          disabled
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Live
                        </Button>
                      )}
                      
                      {app.status === 'closed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:bg-gray-50"
                          disabled
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Closed
                        </Button>
                      )}
                      
                      {app.status === 'rejected' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          disabled
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejected
                        </Button>
                      )}
                      
                      
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Franchise Application</DialogTitle>
            <DialogDescription>
              Set the investment amount for {selectedApp?.name}. The minimum required is ${selectedApp?.investment.amountInvested.toLocaleString()} (5%).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="investment">Investment Amount (USD)</Label>
              <Input
                id="investment"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min={selectedApp?.investment.amountInvested}
                max={selectedApp?.investment.total}
                step="1000"
              />
              <p className="text-sm text-stone-500 mt-1">
                Min: ${selectedApp?.investment.amountInvested.toLocaleString()} (5%) | 
                Max: ${selectedApp?.investment.total.toLocaleString()} (100%)
              </p>
              
              {parseFloat(investmentAmount || '0') === selectedApp?.investment.total && (
                <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Full investment selected. This franchise will move to Launching stage.</span>
                </div>
              )}
              
              {parseFloat(investmentAmount || '0') < (selectedApp?.investment.total || 0) && 
               parseFloat(investmentAmount || '0') >= (selectedApp?.investment.amountInvested || 0) && (
                <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded-md flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Partial investment selected. This franchise will move to Funding stage to raise the remaining amount.</span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Franchise Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the application for {selectedApp?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Reason for Rejection (Optional)</Label>
              <Input
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
