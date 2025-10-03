"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { 
  ArrowUpDown, 
  MapPin, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  Edit,
  Trash2,
  AlertCircle,
  Store,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import Image from "next/image";
import { useConvexImageUrl } from "@/hooks/useConvexImageUrl";
import AdminPageTemplate from "@/components/admin/AdminPageTemplate";

// Franchise Cell Component
function FranchiseCell({ franchise }: { franchise: { franchiser?: { logoUrl?: string; name?: string } | null; franchiseSlug: string; businessName: string; stage: string; address: string; sqft: number; investment?: { totalInvestment: number; sharePrice: number } | null } }) {
  const logoUrl = useConvexImageUrl(franchise.franchiser?.logoUrl as Id<"_storage"> | undefined);
  
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <Image 
        src={logoUrl || "/logo/logo-4.svg"} 
        alt={franchise.franchiser?.name || "Unknown Brand"} 
        width={24} 
        height={24} 
        className="ml-3 mr-1 object-cover"
        unoptimized 
      />
      <span className="font-medium text-sm">{franchise.franchiseSlug}</span>
    </div>
  );
}

// Types based on the actual Convex query response
type Franchise = {
  _id: string;
  franchiserId: string;
  franchiseeId: string;
  locationId: string;
  franchiseSlug: string;
  businessName: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  buildingName?: string;
  doorNumber?: string;
  sqft: number;
  isOwned: boolean;
  landlordContact?: {
    name: string;
    phone: string;
    email: string;
  };
  franchiseeContact: {
    name: string;
    phone: string;
    email: string;
  };
  investmentId: string;
  status: "pending" | "approved" | "active" | "suspended" | "terminated";
  stage: "funding" | "launching" | "ongoing" | "closed";
  createdAt: number;
  updatedAt: number;
  investorCount: number;
  franchiser?: {
    _id: string;
    name: string;
    slug: string;
    industry: string;
    category: string;
    logoUrl?: string;
  } | null;
  location?: {
    _id: string;
    country: string;
    city?: string;
    franchiseFee: number;
    setupCost: number;
    workingCapital: number;
  } | null;
  investment?: {
    _id: string;
    totalInvestment: number;
    totalInvested: number;
    sharesIssued: number;
    sharesPurchased: number;
    sharePrice: number;
    minimumInvestment: number;
    maximumInvestment?: number;
    expectedReturn?: number;
    status: "draft" | "active" | "completed" | "cancelled";
  } | null;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case "active":
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    case "suspended":
      return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
    case "terminated":
      return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStageBadge = (stage: string) => {
  switch (stage) {
    case "funding":
      return <Badge className="bg-purple-100 text-purple-800">Funding</Badge>;
    case "launching":
      return <Badge className="bg-blue-100 text-blue-800">Launching</Badge>;
    case "ongoing":
      return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
    case "closed":
      return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
    default:
      return <Badge variant="outline">{stage}</Badge>;
  }
};

const createColumns = (onView: (franchise: Franchise) => void): ColumnDef<Franchise>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  
  {
    accessorKey: "businessName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Franchise</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Fix: Only pass the props FranchiseCell expects
      const { franchiser, franchiseSlug, businessName, stage, address, sqft, investment } = row.original;
      return (
        <FranchiseCell
          franchise={{
            franchiser,
            franchiseSlug,
            businessName,
            stage,
            address,
            sqft,
            investment: investment
              ? {
                  totalInvestment: investment.totalInvestment,
                  sharePrice: investment.sharePrice,
                }
              : undefined,
          }}
        />
      );
    },
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Status</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex justify-center">
          {getStatusBadge(status)}
        </div>
      );
    },
  },
  {
    accessorKey: "sqft",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Area</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const sqft = row.getValue("sqft") as number;
      return (
          <div className="font-medium text-center">{sqft.toLocaleString()}</div>

      );
    },
  },
  {
    accessorKey: "investmentDetails",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Investment</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const investment = row.original.investment;
      if (!investment) {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm text-muted-foreground">No data</div>
          </div>
        );
      }
      
      const totalInvestment = investment.totalInvestment || 0;
      
      return (
        <div className="flex justify-center">
          <div className="font-medium text-sm">${totalInvestment.toLocaleString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "invested",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Funded</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const investment = row.original.investment;
      if (!investment) {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm text-muted-foreground">No data</div>
          </div>
        );
      }
      
      const totalInvested = investment.totalInvested || 0;
      
      return (
        <div className="flex justify-center">
          <div className="font-medium text-sm">${totalInvested.toLocaleString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "investors",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Investor</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const franchise = row.original;
      const investorCount = franchise.investorCount || 0;
      
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium">{investorCount} </span>
        </div>
      );
    },
  },
  {
    accessorKey: "stage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Stage</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const franchise = row.original;
      const investment = franchise.investment;
      
      // Determine stage based on funding progress
      let displayStage = franchise.stage;
      if (investment && investment.totalInvestment > 0) {
        const fundingProgress = (investment.totalInvested / investment.totalInvestment) * 100;
        if (fundingProgress >= 100 && franchise.stage === "funding") {
          displayStage = "launching";
        }
      }
      
      return (
        <div className="flex justify-center">
          {getStageBadge(displayStage)}
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <span>Progress</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const investment = row.original.investment;
      if (!investment) {
        return (
          <div className="flex justify-end">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
            </div>
          </div>
        );
      }
      
      const totalInvestment = investment.totalInvestment || 0;
      const totalInvested = investment.totalInvested || 0;
      const progress = totalInvestment > 0 ? (totalInvested / totalInvestment) * 100 : 0;
      
      return (
        <div className="flex justify-center">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress >= 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const franchise = row.original;
      const isPending = franchise.status === "pending";
      const isActive = franchise.status === "active";

      return (
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(franchise)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(franchise)}>
                <MapPin className="mr-2 h-4 w-4" />
                View Location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(franchise)}>
                <Store className="mr-2 h-4 w-4" />
                View Outlet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(franchise)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {isPending && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onView(franchise)}
                    className="text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onView(franchise)}
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {isActive && (
                <DropdownMenuItem 
                  onClick={() => onView(franchise)}
                  className="text-orange-600"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onView(franchise)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function FranchiseManagement() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [stageFilter, setStageFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch franchises from the database
  const franchises = useQuery(api.franchiseManagement.getFranchises, {
    limit: 100,
    status: statusFilter === "all" ? undefined : statusFilter as "pending" | "approved" | "active" | "suspended" | "terminated",
    stage: stageFilter === "all" ? undefined : stageFilter as "funding" | "launching" | "ongoing" | "closed",
  });

  // Debug: Log the franchises data
  React.useEffect(() => {
    console.log('Franchises data:', franchises);
    console.log('Franchises count:', franchises?.length);
    if (franchises && franchises.length > 0) {
      console.log('First franchise:', franchises[0]);
      console.log('First franchise investment:', franchises[0].investment);
      console.log('First franchise investmentId:', franchises[0].investmentId);
      if (franchises[0].investment) {
        console.log('Investment totalInvestment:', franchises[0].investment.totalInvestment);
        console.log('Investment totalInvested:', franchises[0].investment.totalInvested);
      }
    }
  }, [franchises]);

  // Handler functions for franchise actions
  const handleViewFranchise = (franchise: Franchise) => {
    // TODO: Open franchise details modal
    console.log('Viewing franchise:', franchise);
  };

  const columns = createColumns(handleViewFranchise);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!franchises) return [];
    
    return franchises.filter((franchise) => {
      const matchesSearch = 
        franchise.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        franchise.franchiseSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        franchise.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        franchise.franchiseeContact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        franchise.franchiseeContact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        franchise.franchiser?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [franchises, searchQuery]);

  const table = useReactTable({
    data: filteredData as unknown as Franchise[],
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const stats = React.useMemo(() => {
    if (!franchises) return { total: 0, pending: 0, approved: 0, active: 0, suspended: 0, terminated: 0 };
    
    return {
      total: franchises.length,
      pending: franchises.filter(f => f.status === "pending").length,
      approved: franchises.filter(f => f.status === "approved").length,
      active: franchises.filter(f => f.status === "active").length,
      suspended: franchises.filter(f => f.status === "suspended").length,
      terminated: franchises.filter(f => f.status === "terminated").length,
    };
  }, [franchises]);

  if (!franchises) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statsData = [
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "Total Franchises",
      value: stats.total,
      color: "text-blue-500"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-500"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Approved",
      value: stats.approved,
      color: "text-green-500"
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "Active",
      value: stats.active,
      color: "text-blue-500"
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Suspended",
      value: stats.suspended,
      color: "text-orange-500"
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      label: "Terminated",
      value: stats.terminated,
      color: "text-red-500"
    }
  ];

  const filters = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
        { value: "terminated", label: "Terminated" }
      ],
      onValueChange: setStatusFilter
    },
    {
      label: "Stage",
      value: stageFilter,
      options: [
        { value: "all", label: "All Stages" },
        { value: "funding", label: "Funding" },
        { value: "launching", label: "Launching" },
        { value: "ongoing", label: "Ongoing" },
        { value: "closed", label: "Closed" }
      ],
      onValueChange: setStageFilter
    }
  ];

  return (
    <AdminPageTemplate
      title="Franchise Management"
      description="Manage all franchises in the system and track their progress"
      addButtonText="Add New Franchise"
      onAddClick={() => console.log('Add franchise clicked')}
      stats={statsData}
      searchPlaceholder="Search franchises..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      filters={filters}
    >
      <div className="space-y-4">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <TableComponent>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="whitespace-nowrap">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="whitespace-nowrap">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No franchises found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </TableComponent>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
    </AdminPageTemplate>
  );
}
