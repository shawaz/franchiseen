"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Store, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useParams } from 'next/navigation';
import { useFranchiseBySlug } from '@/hooks/useFranchiseBySlug';

export interface Franchise {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'terminated';
  stage: 'funding' | 'launching' | 'ongoing' | 'closed';
  image: string;
  joinedDate: string;
  revenue: number;
  orders: number;
  sharesIssued: number;
  sharesSold: number;
  totalInvestment: number;
}


export function FranchiseTab() {
  const params = useParams();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Approved</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Suspended</Badge>;
      case 'terminated':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Terminated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
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
        <Button>
          <Store className="mr-2 h-4 w-4" /> Add New Outlet
        </Button>
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
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchises.map((franchise) => (
                <TableRow key={franchise.id}>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-stone-100">
                        <Image
                          src={franchise.image}
                          alt={franchise.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{franchise.name}</p>
                        <div className="flex items-center text-sm text-stone-500">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{franchise.location.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStageBadge(franchise.stage)}
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
                  <TableCell className="text-right">{getStatusBadge(franchise.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
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
    </div>
  );
}
