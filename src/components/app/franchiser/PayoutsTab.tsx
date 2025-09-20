"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { DollarSign, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
type PayoutType = 'franchise_fee' | 'setup_fee' | 'royalty';

interface Payout {
  id: string;
  type: PayoutType;
  amount: number;
  franchisee: string;
  date: Date;
  status: PayoutStatus;
  referenceId: string;
  paymentMethod: string;
}

// Dummy payout data
const dummyPayouts: Payout[] = [
  {
    id: 'p1',
    type: 'franchise_fee',
    amount: 5000,
    franchisee: 'Burger King - Downtown',
    date: new Date('2025-09-15'),
    status: 'completed',
    referenceId: 'FR-2025-001',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'p2',
    type: 'setup_fee',
    amount: 10000,
    franchisee: 'Pizza Hut - Uptown',
    date: new Date('2025-09-10'),
    status: 'processing',
    referenceId: 'SU-2025-001',
    paymentMethod: 'Stripe',
  },
  {
    id: 'p3',
    type: 'royalty',
    amount: 2500,
    franchisee: 'Burger King - Downtown',
    date: new Date('2025-09-05'),
    status: 'pending',
    referenceId: 'ROY-2025-001',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'p4',
    type: 'royalty',
    amount: 1800,
    franchisee: 'Pizza Hut - Uptown',
    date: new Date('2025-08-28'),
    status: 'completed',
    referenceId: 'ROY-2025-002',
    paymentMethod: 'Stripe',
  },
  {
    id: 'p5',
    type: 'franchise_fee',
    amount: 5000,
    franchisee: 'New Franchise - Westside',
    date: new Date('2025-08-20'),
    status: 'failed',
    referenceId: 'FR-2025-002',
    paymentMethod: 'Bank Transfer',
  },
];

const getStatusBadge = (status: PayoutStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'processing':
      return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const getTypeLabel = (type: PayoutType) => {
  switch (type) {
    case 'franchise_fee':
      return 'Franchise Fee';
    case 'setup_fee':
      return 'Setup Fee';
    case 'royalty':
      return 'Royalty';
    default:
      return type;
  }
};

export function PayoutsTab() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const filteredPayouts = activeTab === 'all' 
    ? dummyPayouts 
    : dummyPayouts.filter(payout => payout.type === activeTab);

  const totalPayouts = dummyPayouts.reduce((sum, payout) => sum + payout.amount, 0);
  const completedPayouts = dummyPayouts
    .filter(p => p.status === 'completed')
    .reduce((sum, payout) => sum + payout.amount, 0);
  const pendingPayouts = dummyPayouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, payout) => sum + payout.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time total payouts</p>
          </CardContent>
        </Card>
        <Card className="py-4" >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${completedPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dummyPayouts
                .filter(p => p.status === 'failed')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Payouts</TabsTrigger>
              <TabsTrigger value="franchise_fee">Franchise Fees</TabsTrigger>
              <TabsTrigger value="setup_fee">Setup Fees</TabsTrigger>
              <TabsTrigger value="royalty">Royalties</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Franchisee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.length > 0 ? (
                    filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.referenceId}</TableCell>
                        <TableCell>{getTypeLabel(payout.type)}</TableCell>
                        <TableCell>{payout.franchisee}</TableCell>
                        <TableCell>{format(payout.date, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${payout.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPayout(payout)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payouts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payout Details Dialog */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Payout Details</h3>
                <p className="text-sm text-muted-foreground">Reference: {selectedPayout.referenceId}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPayout(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p>{getTypeLabel(selectedPayout.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p>${selectedPayout.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{format(selectedPayout.date, 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Franchisee</p>
                  <p>{selectedPayout.franchisee}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>{selectedPayout.paymentMethod}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPayout.status === 'failed' 
                    ? 'This payment failed to process. Please verify the payment method and try again.'
                    : 'No additional notes for this transaction.'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedPayout(null)}>
                  Close
                </Button>
                {selectedPayout.status === 'failed' && (
                  <Button>Retry Payment</Button>
                )}
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
