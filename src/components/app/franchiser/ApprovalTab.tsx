"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Building2, 
  DollarSign,
  Users,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import { generateRealFranchiseWallet, generateMockFranchiseWallet, shouldUseRealWallets } from '@/lib/realWalletGenerator';
import { toast } from 'sonner';

interface ApprovalTabProps {
  franchiserId: string;
}

export default function ApprovalTab({ franchiserId }: ApprovalTabProps) {
  const [selectedFranchise, setSelectedFranchise] = useState<{
    _id: string;
    franchiseSlug: string;
    businessName: string;
    franchiser?: { name: string };
    location?: { city: string; state: string; country: string };
    investment?: { totalInvestment: number };
  } | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get pending franchises
  const pendingFranchises = useQuery(api.franchiseApproval.getPendingFranchises, {
    franchiserId: franchiserId as Id<"franchiser">
  });

  // Approval mutations
  const approveFranchise = useMutation(api.franchiseApproval.approveFranchiseAndCreateToken);
  const rejectFranchise = useMutation(api.franchiseApproval.rejectFranchise);
  

  const handleApprove = async (franchiseId: string) => {
    setIsProcessing(true);
    try {
      // Find the franchise to get its details
      const franchise = pendingFranchises?.find(f => f._id === franchiseId);
      if (!franchise) {
        throw new Error('Franchise not found');
      }

      // Generate a real wallet address
      let walletAddress;
      if (shouldUseRealWallets()) {
        const walletData = generateRealFranchiseWallet(franchiseId, franchise.franchiseSlug);
        walletAddress = walletData.walletAddress;
        console.log('Generated real wallet:', walletAddress);
      } else {
        const walletData = generateMockFranchiseWallet(franchiseId, franchise.franchiseSlug);
        walletAddress = walletData.walletAddress;
        console.log('Generated mock wallet:', walletAddress);
      }

      const result = await approveFranchise({
        franchiseId: franchiseId as Id<"franchises">,
        approvedBy: 'brand-admin', // In real app, this would be the current user
      });
      
      console.log('Approval result:', result);
      
      if (result.success) {
        let message = 'Franchise approved successfully!';
        if (result.walletCreated) {
          message += ' Wallet created.';
        }
        if (result.tokenCreated) {
          message += ' Token created.';
        }
        toast.success(message);
      } else {
        toast.error('Approval failed');
      }
      
      setSelectedFranchise(null);
    } catch (error) {
      console.error('Error approving franchise:', error);
      toast.error('Failed to approve franchise: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (franchiseId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await rejectFranchise({
        franchiseId: franchiseId as Id<"franchises">,
        rejectedBy: 'brand-admin', // In real app, this would be the current user
        reason: rejectionReason,
      });
      
      toast.success('Franchise rejected successfully');
      setSelectedFranchise(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting franchise:', error);
      toast.error('Failed to reject franchise. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pendingFranchises) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading pending franchises...</p>
        </div>
      </div>
    );
  }


  if (pendingFranchises.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800 mb-2">No Pending Approvals</h3>
          <p className="text-stone-600">
            All franchise applications have been processed. New applications will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Franchise Approvals</h2>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {pendingFranchises.length} pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingFranchises.map((franchise) => (
          <Card key={franchise._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-blue-500" />
        <div>
                    <CardTitle className="text-lg">{franchise.businessName}</CardTitle>
                    <p className="text-sm text-gray-500">ID: {franchise.franchiseSlug}</p>
        </div>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Location Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    Location Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium">{franchise.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Building:</span>
                      <p className="font-medium">{franchise.buildingName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Door Number:</span>
                      <p className="font-medium">{franchise.doorNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Area:</span>
                      <p className="font-medium">{franchise.sqft} sq ft</p>
                    </div>
                  </div>
                </div>

                {/* Investment Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    Investment Details
                  </h4>
                  {franchise.investment && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Investment:</span>
                        <span className="font-medium">${franchise.investment.totalInvestment?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Franchise Fee:</span>
                        <span className="font-medium">${franchise.investment.franchiseFee?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Setup Cost:</span>
                        <span className="font-medium">${franchise.investment.setupCost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Working Capital:</span>
                        <span className="font-medium">${franchise.investment.workingCapital?.toLocaleString()}</span>
                </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Shares:</span>
                        <span className="font-medium">{franchise.investment.sharesIssued?.toLocaleString()}</span>
                </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Share Price:</span>
                        <span className="font-medium">$1.00</span>
                </div>
                </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    Contact Details
                  </h4>
                  {franchise.franchiseeContact && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <p className="font-medium">{franchise.franchiseeContact.name}</p>
        </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{franchise.franchiseeContact.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{franchise.franchiseeContact.email}</p>
                      </div>
                    </div>
                  )}
                  {franchise.landlordContact && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="font-medium text-gray-700 mb-2">Landlord Contact</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p className="font-medium">{franchise.landlordContact.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="font-medium">{franchise.landlordContact.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Date */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Applied on {new Date(franchise.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                    onClick={() => {
                      setSelectedFranchise({
                        _id: franchise._id,
                        franchiseSlug: franchise.franchiseSlug,
                        businessName: franchise.businessName,
                        franchiser: undefined, // Not available in the query result
                        location: franchise.location ? {
                          city: franchise.location.city || '',
                          state: franchise.location.state || '',
                          country: franchise.location.country
                        } : undefined,
                        investment: franchise.investment ? { totalInvestment: franchise.investment.totalInvestment } : undefined
                      });
                      setModalType('approve');
                    }}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(franchise._id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve & Create Token
                          </Button>
                          <Button 
                    variant="destructive"
                            size="sm" 
                    onClick={() => {
                      setSelectedFranchise({
                        _id: franchise._id,
                        franchiseSlug: franchise.franchiseSlug,
                        businessName: franchise.businessName,
                        franchiser: undefined,
                        location: franchise.location ? {
                          city: franchise.location.city || '',
                          state: franchise.location.state || '',
                          country: franchise.location.country
                        } : undefined,
                        investment: franchise.investment ? { totalInvestment: franchise.investment.totalInvestment } : undefined
                      });
                      setModalType('reject');
                    }}
                    disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                </div>
                    </div>
        </CardContent>
      </Card>
        ))}
      </div>

      {/* Rejection Modal */}
      {selectedFranchise && modalType === 'reject' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Reject Franchise Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this franchise application:
              </p>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mb-4"
                rows={4}
              />
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFranchise(null);
                    setModalType(null);
                    setRejectionReason('');
                  }}
                >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
                  onClick={() => handleReject(selectedFranchise._id)}
                  disabled={isProcessing || !rejectionReason.trim()}
            >
                  {isProcessing ? 'Processing...' : 'Reject Application'}
            </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}