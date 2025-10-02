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
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useParams } from 'next/navigation';
import { useFranchiseBySlug } from '@/hooks/useFranchiseBySlug';

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

export function ApprovalTab() {
  const params = useParams();
  const brandSlug = params.brandSlug as string;
  
  // Get franchiser data to get the franchiser ID
  const { franchiseData } = useFranchiseBySlug(brandSlug);
  const franchiserId = franchiseData?.franchiser._id;
  
  // Get franchises for this brand
  const franchisesData = useQuery(api.franchiseManagement.getFranchisesByFranchiser, 
    franchiserId ? { franchiserId } : "skip"
  );

  const [selectedApp, setSelectedApp] = useState<FranchiseApplication | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Transform franchise data to application format
  const applications: FranchiseApplication[] = franchisesData?.map((franchise) => ({
    id: franchise._id,
    name: franchise.franchiseSlug,
    location: franchise.address,
    phone: franchise.franchiseeContact.phone,
    email: franchise.franchiseeContact.email,
    status: franchise.status === 'pending' ? 'property_approval' : 
            franchise.status === 'approved' ? 'brand_approval' :
            franchise.status === 'active' ? 'live' : 'closed',
    image: '/franchise/retail-1.png',
    appliedDate: new Date(franchise.createdAt).toISOString().split('T')[0],
    investment: {
      total: 0, // Will be populated from investment data if needed
      amountInvested: 0,
      investmentPercentage: 100,
      sharesTotal: 0,
      sharesPurchased: 0,
      carpetArea: franchise.sqft,
    },
    franchiseeName: franchise.franchiseeContact.name,
    realEstate: {
      contactName: franchise.landlordContact?.name || 'N/A',
      contactEmail: franchise.landlordContact?.email || 'N/A',
      contactPhone: franchise.landlordContact?.phone || 'N/A',
      location: franchise.address,
      status: franchise.status === 'pending' ? 'pending_verification' : 
              franchise.status === 'approved' ? 'verified' : 'verified',
    },
    documents: {
      businessPlan: 'https://example.com/business-plan.pdf',
      financialStatement: 'https://example.com/financial.pdf',
      kyc: 'https://example.com/kyc.pdf',
    },
  })) || [];

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
          {/* <p className="text-sm text-gray-500 mt-1">
            {statusFilter === 'all' 
              ? 'Showing all applications' 
              : `Showing ${statusFilter.replace('_', ' ')} applications`}
          </p> */}
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
                        {/* <div className="flex items-center text-sm text-stone-500">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{app.realEstate.status}</span>
                        </div> */}
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
