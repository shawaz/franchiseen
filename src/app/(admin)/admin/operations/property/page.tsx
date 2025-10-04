"use client";

import * as React from "react";
import { MapPin, CheckCircle, Clock, XCircle, Home, ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import AdminPageTemplate from "@/components/admin/AdminPageTemplate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

// Mock data type - replace with actual data structure
type Property = {
  _id: string;
  address: string;
  buildingName: string;
  doorNumber: string;
  sqft: number;
  costPerSqft: number;
  propertyType: "commercial" | "retail" | "office" | "warehouse" | "mixed_use";
  stage: "listing" | "requested" | "blocked" | "rented" | "sold";
  isAvailable: boolean;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
};

export default function PropertyManagement() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Mock data - replace with actual data fetching
  const stats = {
    total: 150,
    available: 45,
    occupied: 89,
    maintenance: 12,
    sold: 4
  };

  // Mock properties data
  const properties: Property[] = [
    {
      _id: "1",
      address: "123 Main Street, Dubai",
      buildingName: "Business Center",
      doorNumber: "A-101",
      sqft: 1200,
      costPerSqft: 150,
      propertyType: "retail",
      stage: "listing",
      isAvailable: true,
      isVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: "2",
      address: "456 Sheikh Zayed Road, Dubai",
      buildingName: "Tower Plaza",
      doorNumber: "B-205",
      sqft: 800,
      costPerSqft: 200,
      propertyType: "office",
      stage: "rented",
      isAvailable: false,
      isVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const statsData = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Total Properties",
      value: stats.total,
      color: "text-blue-500"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Available",
      value: stats.available,
      color: "text-green-500"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Occupied",
      value: stats.occupied,
      color: "text-blue-500"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Maintenance",
      value: stats.maintenance,
      color: "text-yellow-500"
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      label: "Sold",
      value: stats.sold,
      color: "text-red-500"
    }
  ];

  const getStageBadge = (stage: string) => {
    const colors = {
      listing: "bg-blue-100 text-blue-800",
      requested: "bg-yellow-100 text-yellow-800",
      blocked: "bg-red-100 text-red-800",
      rented: "bg-green-100 text-green-800",
      sold: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={colors[stage as keyof typeof colors]}>
        {stage.charAt(0).toUpperCase() + stage.slice(1)}
      </Badge>
    );
  };

  const columns: ColumnDef<Property>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Property</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const property = row.original;
        return (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{property.buildingName}</div>
              <div className="text-xs text-muted-foreground truncate">{property.address}</div>
            </div>
          </div>
        );
      },
      size: 300,
      minSize: 250,
      maxSize: 400,
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
        return (
          <div className="flex justify-center">
            {getStageBadge(row.getValue("stage"))}
          </div>
        );
      },
    },
    {
      accessorKey: "propertyType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Type</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm capitalize">{row.getValue("propertyType")}</div>
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
            <span>Area (sqft)</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{(row.getValue("sqft") as number).toLocaleString()}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "costPerSqft",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Cost/sqft</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">${row.getValue("costPerSqft")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "isAvailable",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Available</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isAvailable = row.getValue("isAvailable");
        return (
          <div className="flex justify-center">
            <Badge className={isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isAvailable ? "Yes" : "No"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: () => {
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Property
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: properties,
    columns,
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
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const filters = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "available", label: "Available" },
        { value: "occupied", label: "Occupied" },
        { value: "maintenance", label: "Maintenance" },
        { value: "sold", label: "Sold" }
      ],
      onValueChange: setStatusFilter
    },
    {
      label: "Type",
      value: typeFilter,
      options: [
        { value: "all", label: "All Types" },
        { value: "retail", label: "Retail Space" },
        { value: "office", label: "Office Space" },
        { value: "warehouse", label: "Warehouse" },
        { value: "restaurant", label: "Restaurant" }
      ],
      onValueChange: setTypeFilter
    }
  ];

  return (
    <AdminPageTemplate
      title="Property Management"
      description="Manage all properties and their availability for franchises"
      addButtonText="Register New Property"
      onAddClick={() => window.location.href = '/admin/operations/property/register'}
      stats={statsData}
      searchPlaceholder="Search properties..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      filters={filters}
    >
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/admin/operations/property/register">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">Register Property</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Register new commercial property</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/operations/property/penalties">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">Penalty Management</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Monitor and manage penalties</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">Property Verification</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">Verify property details</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
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
                      No properties found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
