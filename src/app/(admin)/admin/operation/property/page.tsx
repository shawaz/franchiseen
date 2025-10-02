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
  ChevronDown, 
  Plus, 
  MapPin, 
  Table, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  DollarSign,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import PropertyApprovalModal from "./PropertyApprovalModal";

// Dynamically import the PropertyMapComponent with SSR disabled
const PropertyMapComponent = dynamic(
  () => import('./PropertyMapComponent'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )}
);

export type Property = {
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

const data: Property[] = [
  {
    id: "prop-1",
    status: "pending",
    buildingName: "Empire State Building",
    doorNumber: "350",
    city: "New York",
    country: "USA",
    carpetArea: 1500,
    rate: 100,
    propertyType: "commercial",
    address: "350 5th Ave, New York, NY 10118",
    coordinates: { lat: 40.7484, lng: -73.9857 },
    franchiseId: "franchise-1",
    franchiseName: "Coffee Corner Downtown",
    fundingProgress: 65,
    totalInvestment: 150000,
    raisedAmount: 97500,
    isFullyFunded: false,
    uploadedBy: "user123",
    uploadedDate: "2024-01-15",
    landlordContact: {
      name: "John Smith",
      phone: "+1-555-0123",
      email: "john@example.com"
    },
    images: ["/images/property1.jpg"],
    amenities: ["Parking", "Elevator", "Security"]
  },
  {
    id: "prop-2",
    status: "approved",
    buildingName: "One World Trade Center",
    doorNumber: "285",
    city: "New York",
    country: "USA",
    carpetArea: 2000,
    rate: 120,
    propertyType: "commercial",
    address: "285 Fulton St, New York, NY 10007",
    coordinates: { lat: 40.7127, lng: -74.0134 },
    franchiseId: "franchise-2",
    franchiseName: "Tech Hub NYC",
    fundingProgress: 100,
    totalInvestment: 200000,
    raisedAmount: 200000,
    isFullyFunded: true,
    uploadedBy: "user456",
    uploadedDate: "2024-01-10",
    landlordContact: {
      name: "Sarah Johnson",
      phone: "+1-555-0456",
      email: "sarah@example.com"
    },
    images: ["/images/property2.jpg"],
    amenities: ["Parking", "Elevator", "Security", "Gym"]
  },
  {
    id: "prop-3",
    status: "blocked",
    buildingName: "Times Square Plaza",
    doorNumber: "1475",
    city: "New York",
    country: "USA",
    carpetArea: 1200,
    rate: 150,
    propertyType: "commercial",
    address: "1475 Broadway, New York, NY 10036",
    coordinates: { lat: 40.7580, lng: -73.9855 },
    franchiseId: "franchise-3",
    franchiseName: "Fitness Studio Times Square",
    fundingProgress: 45,
    totalInvestment: 120000,
    raisedAmount: 54000,
    isFullyFunded: false,
    blockAgreementExpiry: "2024-03-15",
    uploadedBy: "user789",
    uploadedDate: "2024-01-20",
    landlordContact: {
      name: "Mike Wilson",
      phone: "+1-555-0789",
      email: "mike@example.com"
    },
    images: ["/images/property3.jpg"],
    amenities: ["Parking", "Security"]
  },
  {
    id: "prop-4",
    status: "rejected",
    buildingName: "Central Park Tower",
    doorNumber: "225",
    city: "New York",
    country: "USA",
    carpetArea: 800,
    rate: 200,
    propertyType: "commercial",
    address: "225 W 57th St, New York, NY 10019",
    coordinates: { lat: 40.7648, lng: -73.9808 },
    uploadedBy: "user101",
    uploadedDate: "2024-01-05",
    landlordContact: {
      name: "Lisa Brown",
      phone: "+1-555-0101",
      email: "lisa@example.com"
    },
    images: ["/images/property4.jpg"],
    amenities: ["Parking", "Elevator", "Security", "Gym", "Pool"],
    fundingProgress: 0,
    totalInvestment: 0,
    raisedAmount: 0,
    isFullyFunded: false
  },
  {
    id: "prop-5",
    status: "available",
    buildingName: "Brooklyn Bridge Plaza",
    doorNumber: "100",
    city: "Brooklyn",
    country: "USA",
    carpetArea: 1800,
    rate: 90,
    propertyType: "commercial",
    address: "100 Water St, Brooklyn, NY 11201",
    coordinates: { lat: 40.7021, lng: -73.9969 },
    uploadedBy: "admin",
    uploadedDate: "2024-01-25",
    landlordContact: {
      name: "David Lee",
      phone: "+1-555-0202",
      email: "david@example.com"
    },
    images: ["/images/property5.jpg"],
    amenities: ["Parking", "Elevator"],
    fundingProgress: 0,
    totalInvestment: 0,
    raisedAmount: 0,
    isFullyFunded: false
  }
];

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "blocked":
      return <Building2 className="h-4 w-4 text-orange-500" />;
    case "funded":
      return <DollarSign className="h-4 w-4 text-blue-500" />;
    case "available":
      return <MapPin className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const createColumns = (onView: (property: Property) => void): ColumnDef<Property>[] => [
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
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          {getStatusBadge(status)}
        </div>
      );
    },
  },
  {
    accessorKey: "buildingName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Building Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const buildingName = row.getValue("buildingName") as string;
      const doorNumber = row.original.doorNumber;
      return (
        <div>
          <div className="font-medium">{buildingName}</div>
          <div className="text-sm text-muted-foreground">Door #{doorNumber}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const city = row.getValue("city") as string;
      const country = row.original.country;
      return (
        <div>
          <div className="font-medium">{city}</div>
          <div className="text-sm text-muted-foreground">{country}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "carpetArea",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Area
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const area = row.getValue("carpetArea") as number;
      return (
        <div className="text-right">
          <div className="font-medium">{area.toLocaleString()} sq ft</div>
        </div>
      );
    },
  },
  {
    accessorKey: "rate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rate = row.getValue("rate") as number;
      return (
        <div className="text-right">
          <div className="font-medium">${rate}/sq ft</div>
        </div>
      );
    },
  },
  {
    accessorKey: "fundingProgress",
    header: "Funding",
    cell: ({ row }) => {
      const property = row.original;
      const progress = property.fundingProgress;
      const isFullyFunded = property.isFullyFunded;
      
      return (
        <div className="w-20">
          <div className="flex justify-between text-xs mb-1">
            <span>{progress}%</span>
            <span>{isFullyFunded ? "Funded" : "Pending"}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFullyFunded ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
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
      const property = row.original;
      const isPending = property.status === "pending";
      const isFullyFunded = property.isFullyFunded;

      return (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(property)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {isPending && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={() => onView(property)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onView(property)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {property.status === "approved" && !isFullyFunded && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-orange-600 hover:text-orange-700"
              onClick={() => onView(property)}
            >
              <Building2 className="h-4 w-4 mr-1" />
              Block Agreement
            </Button>
          )}
          {property.status === "approved" && isFullyFunded && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => onView(property)}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Upload Agreement
            </Button>
          )}
        </div>
      );
    },
  },
];

export default function PropertyManagement() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [viewMode, setViewMode] = React.useState<"table" | "map">("table");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);

  const table = useReactTable({
    data,
    columns: [],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Filter data based on search and status
  const filteredData = React.useMemo(() => {
    return data.filter((property) => {
      const matchesSearch = 
        property.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const stats = {
    total: data.length,
    pending: data.filter(p => p.status === "pending").length,
    approved: data.filter(p => p.status === "approved").length,
    rejected: data.filter(p => p.status === "rejected").length,
    blocked: data.filter(p => p.status === "blocked").length,
    funded: data.filter(p => p.status === "funded").length,
    available: data.filter(p => p.status === "available").length
  };

  // Handler functions for property actions
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsApprovalModalOpen(true);
  };

  const handleApproveProperty = async (propertyId: string, notes: string) => {
    console.log('Approving property:', propertyId, notes);
    // TODO: Implement actual approval logic
  };

  const handleRejectProperty = async (propertyId: string, reason: string) => {
    console.log('Rejecting property:', propertyId, reason);
    // TODO: Implement actual rejection logic
  };

  const handleBlockAgreement = async (propertyId: string, duration: number) => {
    console.log('Creating block agreement for property:', propertyId, duration);
    // TODO: Implement actual block agreement logic
  };

  const handleUploadAgreement = async (propertyId: string) => {
    console.log('Uploading agreement for property:', propertyId);
    // TODO: Implement actual agreement upload logic
  };

  const columns = createColumns(handleViewProperty);

  // Update table with columns
  React.useEffect(() => {
    table.setOptions(prev => ({
      ...prev,
      columns
    }));
  }, [columns, table]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Management</h1>
          <p className="text-muted-foreground">
            Manage properties uploaded by franchisees and track funding progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Properties</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Blocked</p>
                <p className="text-2xl font-bold">{stats.blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Funded</p>
                <p className="text-2xl font-bold">{stats.funded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Available</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Manage and review property submissions from franchisees
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="view-mode" className="text-sm">View Mode</Label>
                <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Columns Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === "table" ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-md border">
                <TableComponent>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
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
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
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
                          No properties found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </TableComponent>
              </div>
              
              <div className="flex items-center justify-end space-x-2 py-4">
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
          ) : (
            <div className="h-[600px] w-full">
              <PropertyMapComponent properties={filteredData} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Approval Modal */}
      <PropertyApprovalModal
        property={selectedProperty}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedProperty(null);
        }}
        onApprove={handleApproveProperty}
        onReject={handleRejectProperty}
        onBlockAgreement={handleBlockAgreement}
        onUploadAgreement={handleUploadAgreement}
      />
    </div>
  );
}