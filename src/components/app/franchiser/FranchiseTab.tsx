"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MoreHorizontal, Store, CheckCircle, Rocket, Clock, XCircle, Settings } from 'lucide-react';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useParams, useRouter } from 'next/navigation';
import { useFranchiseBySlug } from '@/hooks/useFranchiseBySlug';
import { useFranchiseWalletSingle } from '@/hooks/useFranchiseWallet';
import { SoldLocationsModal } from './SoldLocationsModal';
import { useState } from 'react';
import { toast } from 'sonner';
import { DollarSign, Wallet } from 'lucide-react';

export interface Franchise {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended' | 'terminated';
  stage: 'funding' | 'launching' | 'ongoing' | 'closed';
  image: string;
  joinedDate: string;
  revenue: number;
  orders: number;
  sharesIssued: number;
  sharesSold: number;
  totalInvestment: number;
}

// Component to display franchise wallet balance
function FranchiseWalletCell({ franchiseId, stage }: { franchiseId: string; stage: string }) {
  const { wallet, isLoading } = useFranchiseWalletSingle({ franchiseId });

  if (stage === 'funding') {
    return (
      <div className="flex items-center text-sm text-stone-500">
        <Wallet className="mr-1 h-3 w-3" />
        <span>Not created yet</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-stone-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-1"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex items-center text-sm text-red-500">
        <Wallet className="mr-1 h-3 w-3" />
        <span>No wallet found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm">
      <DollarSign className="mr-1 h-3 w-3 text-green-600" />
      <span className="font-medium text-green-600">
        ${wallet.balance?.toLocaleString() || '0'}
      </span>
    </div>
  );
}


interface SoldLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  country: string;
  franchiseFee: number;
  minArea: number;
  soldAt: number;
}

export function FranchiseTab() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = params.brandSlug as string;
  
  // Get franchiser data to get the franchiser ID
  const { franchiseData } = useFranchiseBySlug(brandSlug);
  const franchiserId = franchiseData?.franchiser._id;
  
  // Get franchises for this brand with investment details
  const franchisesData = useQuery(api.franchiseManagement.getFranchises, 
    franchiserId ? { 
      limit: 100
    } : "skip"
  );

  // Mutations for franchise management
  const approveFranchise = useMutation(api.franchiseApproval.approveFranchiseAndCreateToken);
  const rejectFranchise = useMutation(api.franchiseApproval.rejectFranchise);
  const transitionToOngoingStage = useMutation(api.franchiseManagement.transitionToOngoingStage);

  // Sold locations state
  const [soldLocations, setSoldLocations] = useState<SoldLocation[]>([]);
  
  // Modal states
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; franchise: Franchise | null }>({ open: false, franchise: null });
  const [launchModal, setLaunchModal] = useState<{ open: boolean; franchise: Franchise | null }>({ open: false, franchise: null });
  const [closeModal, setCloseModal] = useState<{ open: boolean; franchise: Franchise | null }>({ open: false, franchise: null });

  // Sold locations management functions
  const addSoldLocation = (location: Omit<SoldLocation, 'id' | 'soldAt'>) => {
    const newSoldLocation: SoldLocation = {
      ...location,
      id: `${location.country}-${Date.now()}`,
      soldAt: Date.now(),
    };
    setSoldLocations(prev => [...prev, newSoldLocation]);
  };

  const removeSoldLocation = (id: string) => {
    setSoldLocations(prev => prev.filter(loc => loc.id !== id));
    toast.success('Sold location removed');
  };

  // Navigation functions
  const navigateToFranchise = (franchiseSlug: string) => {
    router.push(`/${brandSlug}/${franchiseSlug}`);
  };

  const navigateToFranchiseAccount = (franchiseSlug: string) => {
    router.push(`/${brandSlug}/${franchiseSlug}/account`);
  };


  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'funding':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Funding</Badge>;
      case 'launching':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Launching</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Ongoing</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStageOrStatusBadge = (franchise: Franchise) => {
    // For pending and rejected franchises, show the status instead of stage
    if (franchise.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500">Pending</Badge>;
    }
    if (franchise.status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>;
    }
    // For approved franchises, show the business stage
    return getStageBadge(franchise.stage);
  };

  // Approval Modal Component
  const ApprovalModal = () => {
    const franchise = approvalModal.franchise;
    if (!franchise) return null;

    return (
      <Dialog open={approvalModal.open} onOpenChange={(open) => setApprovalModal({ open, franchise: null })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Franchise Approval
            </DialogTitle>
            <DialogDescription>
              Review and approve franchise application for {franchise.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Franchise Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500">Franchise Name</h4>
                <p className="text-lg font-semibold">{franchise.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Location</h4>
                <p className="text-lg font-semibold">{franchise.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Contact Phone</h4>
                <p className="text-lg font-semibold">{franchise.phone}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Contact Email</h4>
                <p className="text-lg font-semibold">{franchise.email}</p>
              </div>
            </div>

            {/* Investment Information */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Investment Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm text-gray-500">Total Investment Required</h5>
                  <p className="text-lg font-semibold text-green-600">${franchise.totalInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-gray-500">Shares Issued</h5>
                  <p className="text-lg font-semibold">{franchise.sharesIssued.toLocaleString()}</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-gray-500">Shares Sold</h5>
                  <p className="text-lg font-semibold">{franchise.sharesSold.toLocaleString()}</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-gray-500">Funding Progress</h5>
                  <p className="text-lg font-semibold">
                    {franchise.sharesIssued > 0 ? ((franchise.sharesSold / franchise.sharesIssued) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setApprovalModal({ open: false, franchise: null })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={async () => {
                      try {
                        await rejectFranchise({
                          franchiseId: franchise.id as Id<"franchises">,
                          rejectedBy: 'brand-admin', // In real app, this would be the current user
                          reason: 'Rejected by brand admin', // In real app, this would be from a form
                        });
                        toast.success(`Franchise ${franchise.name} rejected successfully!`);
                        setApprovalModal({ open: false, franchise: null });
                      } catch (error) {
                        console.error('Error rejecting franchise:', error);
                        toast.error('Failed to reject franchise. Please try again.');
                      }
                    }}
                  >
                    Reject
                  </Button>
                </div>
                <Button 
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    try {
                      const result = await approveFranchise({
                        franchiseId: franchise.id as Id<"franchises">,
                        approvedBy: 'brand-admin', // In real app, this would be the current user
                      });
                      
                      console.log('Approval result:', result);
                      
                      if (result.success) {
                        let message = `Franchise ${franchise.name} approved successfully!`;
                        if (result.tokenCreated) {
                          message += ' Token created.';
                        }
                        message += ' Wallet will be created when funding is complete.';
                        toast.success(message);
                      } else {
                        toast.error('Approval failed');
                      }
                      
                      setApprovalModal({ open: false, franchise: null });
                    } catch (error) {
                      console.error('Error approving franchise:', error);
                      toast.error('Failed to approve franchise: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Create Token
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Launch Modal Component
  const LaunchModal = () => {
    const franchise = launchModal.franchise;
    if (!franchise) return null;

    return (
      <Dialog open={launchModal.open} onOpenChange={(open) => setLaunchModal({ open, franchise: null })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-orange-600" />
              Launch Franchise
            </DialogTitle>
            <DialogDescription>
              Launch the franchise outlet for {franchise.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Franchise Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500">Franchise Name</h4>
                <p className="text-lg font-semibold">{franchise.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Current Stage</h4>
                <div className="mt-1">{getStageBadge(franchise.stage)}</div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Location</h4>
                <p className="text-lg font-semibold">{franchise.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Joined Date</h4>
                <p className="text-lg font-semibold">{franchise.joinedDate}</p>
              </div>
            </div>

            {/* Launch Checklist */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Launch Checklist</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Funding target reached (100%)</span>
                  <Badge className={`ml-auto ${franchise.sharesIssued > 0 && franchise.sharesSold >= franchise.sharesIssued ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {franchise.sharesIssued > 0 && franchise.sharesSold >= franchise.sharesIssued ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Location secured and ready</span>
                  <Badge className="ml-auto bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Equipment and inventory ready</span>
                  <Badge className="ml-auto bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Staff hired and trained</span>
                  <Badge className="ml-auto bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Marketing campaign launched</span>
                  <Badge className="ml-auto bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
              </div>
            </div>

            {/* Launch Actions */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setLaunchModal({ open: false, franchise: null })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Schedule Launch
                  </Button>
                </div>
                <Button 
                  type="button"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={async () => {
                    try {
                      const result = await transitionToOngoingStage({
                        franchiseId: franchise.id as Id<"franchises">,
                      });
                      
                      if (result.success) {
                        toast.success(`Franchise ${franchise.name} launched successfully!`);
                        setLaunchModal({ open: false, franchise: null });
                      } else {
                        toast.error('Failed to launch franchise. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error launching franchise:', error);
                      toast.error('Failed to launch franchise: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  }}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Now
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Close Modal Component
  const CloseModal = () => {
    const franchise = closeModal.franchise;
    if (!franchise) return null;

    return (
      <Dialog open={closeModal.open} onOpenChange={(open) => setCloseModal({ open, franchise: null })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Close Franchise
            </DialogTitle>
            <DialogDescription>
              Close the franchise outlet for {franchise.name} and process refunds
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Franchise Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500">Franchise Name</h4>
                <p className="text-lg font-semibold">{franchise.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Current Stage</h4>
                <div className="mt-1">{getStageBadge(franchise.stage)}</div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Location</h4>
                <p className="text-lg font-semibold">{franchise.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500">Contact Email</h4>
                <p className="text-lg font-semibold">{franchise.email}</p>
              </div>
            </div>

            {/* Refund Information */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Refund Processing</h4>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Notice</h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Closing this franchise will permanently shut down operations. All remaining funds in the franchise wallet will be refunded to investors proportionally based on their share holdings.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm text-gray-500">Total Investment</h5>
                    <p className="text-lg font-semibold text-green-600">${franchise.totalInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-gray-500">Shares Outstanding</h5>
                    <p className="text-lg font-semibold">{franchise.sharesIssued.toLocaleString()}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-gray-500">Estimated Refund per Share</h5>
                    <p className="text-lg font-semibold">
                      ${franchise.sharesIssued > 0 ? (franchise.totalInvestment / franchise.sharesIssued).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-gray-500">Franchise Wallet Balance</h5>
                    <div className="flex items-center">
                      <FranchiseWalletCell franchiseId={franchise.id} stage={franchise.stage} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Closure Actions */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setCloseModal({ open: false, franchise: null })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Generate Refund Report
                  </Button>
                </div>
                <Button 
                  type="button"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    toast.success(`Franchise ${franchise.name} closed successfully! Refunds have been processed.`);
                    setCloseModal({ open: false, franchise: null });
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Close Franchise
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Transform the data for display, filtering by franchiserId
  const franchises: Franchise[] = franchisesData?.filter(franchise => 
    franchise.franchiserId === franchiserId
  ).map((franchise) => ({
    id: franchise._id,
    name: franchise.franchiseSlug,
    location: franchise.address,
    phone: franchise.franchiseeContact.phone,
    email: franchise.franchiseeContact.email,
    status: franchise.status,
    stage: franchise.stage,
    image: '/franchise/retail-1.png', // Default image
    joinedDate: new Date(franchise.createdAt).toISOString().split('T')[0],
    revenue: 0, // This would need to be calculated from actual revenue data
    orders: 0, // This would need to be calculated from actual order data
    sharesIssued: franchise.investment?.sharesIssued || 0,
    sharesSold: franchise.investment?.sharesPurchased || 0,
    totalInvestment: franchise.investment?.totalInvestment || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Franchise Outlets</h2>
        <div className="flex gap-2">
          <SoldLocationsModal
            soldLocations={soldLocations}
            onAddSoldLocation={addSoldLocation}
            onRemoveSoldLocation={removeSoldLocation}
          />
          <Button type="button">
            <Store className="mr-2 h-4 w-4" /> Add New Outlet
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Outlet</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Shares Issued</TableHead>
                <TableHead>Shares Sold</TableHead>
                <TableHead>Total Investment</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchises.map((franchise) => (
                <TableRow key={franchise.id}>
                  <TableCell>
                    <div 
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                      onClick={() => navigateToFranchise(franchise.name)}
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-stone-100">
                        <Image
                          src={franchise.image}
                          alt={franchise.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium hover:text-blue-600 dark:hover:text-blue-400">{franchise.name}</p>
                        <p className="text-xs text-gray-500">Click to view details</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStageOrStatusBadge(franchise)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {franchise.sharesIssued.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {franchise.sharesSold.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${franchise.totalInvestment.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <FranchiseWalletCell franchiseId={franchise.id} stage={franchise.stage} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Show Approve button for pending approval */}
                      {franchise.status === 'pending' && (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => setApprovalModal({ open: true, franchise })}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {/* Show Waiting button for funding stage (only for approved status) */}
                      {franchise.stage === 'funding' && franchise.status === 'approved' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled
                          className="text-gray-500 border-gray-300 cursor-not-allowed"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting
                        </Button>
                      )}
                      {/* Show Rejected button for rejected status */}
                      {franchise.status === 'rejected' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled
                          className="text-red-500 border-red-300 cursor-not-allowed"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </Button>
                      )}
                      {/* Show Manage button for ongoing stage */}
                      {franchise.stage === 'ongoing' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => navigateToFranchiseAccount(franchise.name)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                      )}
                      {/* Show Close button for closed stage */}
                      {franchise.stage === 'closed' && (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setCloseModal({ open: true, franchise })}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Close
                        </Button>
                      )}
                      {/* Show Launch button for launching stage */}
                      {franchise.stage === 'launching' && (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => setLaunchModal({ open: true, franchise })}
                        >
                          <Rocket className="w-3 h-3 mr-1" />
                          Launch
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <ApprovalModal />
      <LaunchModal />
      <CloseModal />
    </div>
  );
}
