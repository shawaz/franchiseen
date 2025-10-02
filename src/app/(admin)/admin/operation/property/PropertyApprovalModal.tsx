"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Building2, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface Property {
  id: string;
  status: "pending" | "approved" | "rejected" | "blocked" | "funded" | "available";
  buildingName: string;
  doorNumber: string;
  city: string;
  country: string;
  carpetArea: number;
  rate: number;
  propertyType: "commercial" | "residential" | "mixed";
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  franchiseId?: string;
  franchiseName?: string;
  fundingProgress: number;
  totalInvestment: number;
  raisedAmount: number;
  isFullyFunded: boolean;
  blockAgreementExpiry?: string;
  uploadedBy: string;
  uploadedDate: string;
  landlordContact: {
    name: string;
    phone: string;
    email: string;
  };
  images: string[];
  amenities: string[];
}

interface PropertyApprovalModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (propertyId: string, notes: string) => void;
  onReject: (propertyId: string, reason: string) => void;
  onBlockAgreement: (propertyId: string, duration: number) => void;
  onUploadAgreement: (propertyId: string) => void;
}

const PropertyApprovalModal: React.FC<PropertyApprovalModalProps> = ({
  property,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onBlockAgreement,
  onUploadAgreement
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'block' | 'upload'>('approve');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!property) return;
    
    setIsLoading(true);
    
    try {
      switch (action) {
        case 'approve':
          await onApprove(property.id, notes);
          break;
        case 'reject':
          await onReject(property.id, reason);
          break;
        case 'block':
          await onBlockAgreement(property.id, blockDuration);
          break;
        case 'upload':
          await onUploadAgreement(property.id);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "blocked":
        return <Badge className="bg-orange-100 text-orange-800">Blocked</Badge>;
      case "funded":
        return <Badge className="bg-blue-100 text-blue-800">Funded</Badge>;
      case "available":
        return <Badge className="bg-gray-100 text-gray-800">Available</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Property Review - {property.buildingName}</span>
            {getStatusBadge(property.status)}
          </DialogTitle>
          <DialogDescription>
            Review property details and take appropriate action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Building Name</Label>
                  <p className="text-sm text-muted-foreground">{property.buildingName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Door Number</Label>
                  <p className="text-sm text-muted-foreground">#{property.doorNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">{property.city}, {property.country}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Carpet Area</Label>
                  <p className="text-sm text-muted-foreground">{property.carpetArea.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Rate</Label>
                  <p className="text-sm text-muted-foreground">${property.rate}/sq ft</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Property Type</Label>
                  <p className="text-sm text-muted-foreground capitalize">{property.propertyType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded By</Label>
                  <p className="text-sm text-muted-foreground">{property.uploadedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Franchise Information */}
          {property.franchiseId && (
            <Card>
              <CardHeader>
                <CardTitle>Franchise Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Franchise Name</Label>
                    <p className="text-sm text-muted-foreground">{property.franchiseName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Funding Progress</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            property.isFullyFunded ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${property.fundingProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{property.fundingProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Investment</Label>
                    <p className="text-sm text-muted-foreground">${property.totalInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Raised Amount</Label>
                    <p className="text-sm text-muted-foreground">${property.raisedAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Landlord Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Landlord Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{property.landlordContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{property.landlordContact.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{property.landlordContact.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={action === 'approve' ? 'default' : 'outline'}
                  onClick={() => setAction('approve')}
                  className="h-20 flex flex-col space-y-2"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Approve Property</span>
                </Button>
                <Button
                  variant={action === 'reject' ? 'default' : 'outline'}
                  onClick={() => setAction('reject')}
                  className="h-20 flex flex-col space-y-2"
                >
                  <XCircle className="h-6 w-6" />
                  <span>Reject Property</span>
                </Button>
                {property.status === 'approved' && !property.isFullyFunded && (
                  <Button
                    variant={action === 'block' ? 'default' : 'outline'}
                    onClick={() => setAction('block')}
                    className="h-20 flex flex-col space-y-2"
                  >
                    <Building2 className="h-6 w-6" />
                    <span>Block Agreement</span>
                  </Button>
                )}
                {property.status === 'approved' && property.isFullyFunded && (
                  <Button
                    variant={action === 'upload' ? 'default' : 'outline'}
                    onClick={() => setAction('upload')}
                    className="h-20 flex flex-col space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Upload Agreement</span>
                  </Button>
                )}
              </div>

              {/* Action-specific inputs */}
              {action === 'approve' && (
                <div className="space-y-2">
                  <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                  <Textarea
                    id="approval-notes"
                    placeholder="Add any notes about the approval..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}

              {action === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rejection reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insufficient-documentation">Insufficient Documentation</SelectItem>
                      <SelectItem value="location-issues">Location Issues</SelectItem>
                      <SelectItem value="property-standards">Does not meet property standards</SelectItem>
                      <SelectItem value="legal-issues">Legal Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {reason === 'other' && (
                    <Textarea
                      placeholder="Please specify the reason..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  )}
                </div>
              )}

              {action === 'block' && (
                <div className="space-y-2">
                  <Label htmlFor="block-duration">Block Duration (Days)</Label>
                  <Select value={blockDuration.toString()} onValueChange={(value) => setBlockDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days (Maximum)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Block agreement will expire on {new Date(Date.now() + blockDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {action === 'upload' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Property is fully funded. You can now upload the final agreement.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (action === 'reject' && !reason) || (action === 'reject' && reason === 'other' && !notes)}
            className={
              action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
              action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
              action === 'block' ? 'bg-orange-600 hover:bg-orange-700' :
              'bg-blue-600 hover:bg-blue-700'
            }
          >
            {isLoading ? 'Processing...' : 
             action === 'approve' ? 'Approve Property' :
             action === 'reject' ? 'Reject Property' :
             action === 'block' ? 'Create Block Agreement' :
             'Upload Agreement'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyApprovalModal;
