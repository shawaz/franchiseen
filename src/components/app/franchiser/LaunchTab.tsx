"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LaunchTabProps {
  franchiserId: Id<"franchiser">;
}


export default function LaunchTab({ franchiserId }: LaunchTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Get franchises for this brand
  const franchises = useQuery(
    api.franchiseManagement.getFranchisesByFranchiser,
    franchiserId ? { franchiserId } : "skip"
  );


  // Mutation to transition franchise to ongoing stage
  const transitionToOngoing = useMutation(api.franchiseManagement.transitionToOngoingStage);

  // Filter franchises based on search and stage
  const filteredFranchises = useMemo(() => {
    if (!franchises) return [];
    
    return franchises.filter(franchise => {
      const matchesSearch = 
        franchise.franchiseSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchise.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchise.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchise.franchiseeContact.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = selectedStage === 'all' || franchise.stage === selectedStage;
      
      return matchesSearch && matchesStage;
    });
  }, [franchises, searchTerm, selectedStage]);

  const handleTransitionToOngoing = async (franchiseId: Id<"franchises">) => {
    try {
      await transitionToOngoing({ franchiseId });
      toast.success('Franchise transitioned to ongoing stage successfully!');
    } catch (error) {
      console.error('Error transitioning franchise:', error);
      toast.error('Failed to transition franchise to ongoing stage');
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'funding':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Funding</Badge>;
      case 'launching':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Launching</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Ongoing</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">{stage}</Badge>;
    }
  };

  const getStatusIcon = (stage: string) => {
    switch (stage) {
      case 'funding':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'launching':
        return <Building2 className="h-4 w-4 text-yellow-600" />;
      case 'ongoing':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <Pause className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!franchises) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading franchises...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Franchise Launch Management
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Manage franchise stages and transitions from launching to ongoing operations
          </p>
        </div>
        <div className="text-sm text-stone-600 dark:text-stone-400">
          {filteredFranchises.length} franchise{filteredFranchises.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex-1 col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search by franchise name, location, or franchisee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {selectedStage === 'all' ? 'All Stages' : selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setSelectedStage('all')}>All Stages</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedStage('funding')}>Funding</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedStage('launching')}>Launching</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedStage('ongoing')}>Ongoing</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedStage('closed')}>Closed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Franchises Table */}
      <Card>
        <div className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchise</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Franchisee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFranchises.map((franchise) => (
                  <TableRow key={franchise._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          {getStatusIcon(franchise.stage)}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900 dark:text-stone-100">
                            {franchise.businessName}
                          </div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">
                            {franchise.franchiseSlug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStageBadge(franchise.stage)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        <span className="text-stone-600 dark:text-stone-400">
                          {franchise.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(franchise.investment.totalInvested)}
                        </div>
                        <div className="text-stone-500 dark:text-stone-400">
                          of {formatCurrency(franchise.investment.totalInvestment)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-stone-900 dark:text-stone-100">
                          {franchise.franchiseeContact.name}
                        </div>
                        <div className="text-stone-500 dark:text-stone-400">
                          {franchise.franchiseeContact.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(franchise.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {franchise.stage === 'launching' && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionToOngoing(franchise._id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Launch
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Wallet</DropdownMenuItem>
                            <DropdownMenuItem>View Transactions</DropdownMenuItem>
                            {franchise.stage === 'launching' && (
                              <DropdownMenuItem onClick={() => handleTransitionToOngoing(franchise._id)}>
                                Transition to Ongoing
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFranchises.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">
                No franchises found matching your criteria
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
