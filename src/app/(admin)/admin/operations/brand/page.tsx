"use client";

import * as React from "react";
import { Building2, CheckCircle, Clock, AlertCircle, XCircle, Eye, Edit, Trash2, MoreHorizontal, ArrowUpDown, ShieldCheck } from "lucide-react";
import AdminPageTemplate from "@/components/admin/AdminPageTemplate";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useConvexImageUrl } from "@/hooks/useConvexImageUrl";
import { useMasterData } from "@/hooks/useMasterData";
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

// Types based on the database schema
type Brand = {
  _id: string;
  ownerUserId: string;
  brandWalletAddress: string;
  logoUrl?: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  category: string;
  categoryName: string;
  industryName: string;
  website?: string;
  status: "draft" | "pending" | "approved" | "rejected";
  createdAt: number;
  updatedAt: number;
  franchiseCount: number;
  locationCount: number;
  productCount: number;
};

// Brand Logo Component
function BrandLogo({ brand }: { brand: Brand }) {
  const logoUrl = useConvexImageUrl(brand.logoUrl as Id<"_storage"> | undefined);
  
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
        {brand.logoUrl ? (
          <Image
            src={logoUrl || "/logo/logo-4.svg"}
            alt={brand.name}
            width={32}
            height={32}
            className="object-cover"
            unoptimized
          />
        ) : (
          <Building2 className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate">{brand.name}</div>
        <div className="text-xs text-muted-foreground truncate">@{brand.slug}</div>
      </div>
    </div>
  );
}

export default function BrandManagement() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch brands data
  const brands = useQuery(api.brandManagement.getBrands, {
    status: statusFilter === "all" ? undefined : statusFilter as "draft" | "pending" | "approved" | "rejected",
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: searchQuery || undefined,
  });

  // Fetch brand stats
  const stats = useQuery(api.brandManagement.getBrandStats, {});

  // Fetch categories and industries for filters
  const { categories, industries } = useMasterData();

  // Mutation for approving brands
  const approveBrand = useMutation(api.brandManagement.approveBrand);

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns: ColumnDef<Brand>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Brand</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <BrandLogo brand={row.original} />;
      },
      size: 250,
      minSize: 200,
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
        return (
          <div className="flex justify-center">
            {getStatusBadge(row.getValue("status"))}
          </div>
        );
      },
    },
    {
      accessorKey: "industryName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Industry</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{row.getValue("industryName")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Category</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{row.getValue("categoryName")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "franchiseCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Franchises</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{row.getValue("franchiseCount")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "locationCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Locations</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{row.getValue("locationCount")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "productCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Products</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{row.getValue("productCount")}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const brand = row.original;
        const isPending = brand.status === "pending";

        const handleApprove = async () => {
          try {
            await approveBrand({ id: brand._id as Id<"franchiser"> });
          } catch (error) {
            console.error("Failed to approve brand:", error);
          }
        };

        return (
          <div className="flex justify-center gap-2">
            {isPending && (
              <Button
                size="sm"
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                Verify
              </Button>
            )}
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
                  Edit Brand
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Brand
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: brands || [],
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

  // Loading state
  if (!brands || !stats || !categories || !industries) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statsData = [
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "Total Brands",
      value: stats.total,
      color: "text-blue-500"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Approved",
      value: stats.approved,
      color: "text-green-500"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-500"
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Draft",
      value: stats.draft,
      color: "text-orange-500"
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      label: "Rejected",
      value: stats.rejected,
      color: "text-red-500"
    }
  ];

  const filters = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" }
      ],
      onValueChange: setStatusFilter
    },
    {
      label: "Category",
      value: categoryFilter,
      options: [
        { value: "all", label: "All Categories" },
        ...(categories?.map(cat => ({ value: cat._id, label: cat.name })) || [])
      ],
      onValueChange: setCategoryFilter
    }
  ];


  return (
    <AdminPageTemplate
      title="Brand Management"
      description="Manage all brands and their franchise opportunities"
      addButtonText="Add New Brand"
      onAddClick={() => console.log('Add brand clicked')}
      stats={statsData}
      searchPlaceholder="Search brands..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      filters={filters}
    >
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
                      No brands found.
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
