"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Store, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export interface Franchise {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  image: string;
  joinedDate: string;
  revenue: number;
  orders: number;
}

// Dummy franchise data
const dummyFranchises: Franchise[] = [
  {
    id: 'f1',
    name: 'Downtown Outlet',
    location: '123 Main St, New York, NY',
    phone: '+1 (555) 123-4567',
    email: 'downtown@example.com',
    status: 'active',
    image: '/franchise/retail-1.png',
    joinedDate: '2024-01-15',
    revenue: 125000,
    orders: 1245
  },
  {
    id: 'f2',
    name: 'Uptown Plaza',
    location: '456 Central Ave, Chicago, IL',
    phone: '+1 (555) 987-6543',
    email: 'uptown@example.com',
    status: 'active',
    image: '/franchise/retail-2.png',
    joinedDate: '2024-02-20',
    revenue: 98750,
    orders: 876
  },
  {
    id: 'f3',
    name: 'Riverside Mall',
    location: '789 River Rd, Miami, FL',
    phone: '+1 (555) 456-7890',
    email: 'riverside@example.com',
    status: 'pending',
    image: '/franchise/retail-3.png',
    joinedDate: '2024-03-10',
    revenue: 0,
    orders: 0
  },
];

export function FranchiseTab() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

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
                <TableHead>Contact</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyFranchises.map((franchise) => (
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
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-stone-500" />
                        <span>{franchise.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-stone-500" />
                        <span className="truncate max-w-[180px]">{franchise.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${franchise.revenue.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {franchise.orders.toLocaleString()}
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
