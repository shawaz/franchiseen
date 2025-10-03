"use client";

import * as React from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Check, 
  ArrowUpDown, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import AdminPageTemplate from "@/components/admin/AdminPageTemplate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

// Types based on SetupTab data structure
type SetupStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

type SetupProject = {
  _id: string;
  name: string;
  franchisee: string;
  location: string;
  startDate: Date | null;
  targetDate: Date;
  status: SetupStatus;
  progress: number;
  investmentAmount: number;
  investmentReceived: boolean;
  brandName: string;
  brandSlug: string;
  createdAt: number;
  updatedAt: number;
};

export default function SetupManagement() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [brandFilter, setBrandFilter] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedProject, setSelectedProject] = React.useState<SetupProject | null>(null);
  const [isStartDialogOpen, setIsStartDialogOpen] = React.useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = React.useState(false);

  // Mock data - replace with actual data fetching
  const projects: SetupProject[] = [
    {
      _id: "setup-1",
      name: "Burger King - Downtown",
      franchisee: "John Doe",
      location: "123 Main St, New York, NY",
      startDate: new Date('2025-09-15'),
      targetDate: new Date('2025-11-15'),
      status: 'in_progress',
      progress: 45,
      investmentAmount: 150000,
      investmentReceived: true,
      brandName: "Burger King",
      brandSlug: "burger-king",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: "setup-2",
      name: "Pizza Hut - Uptown",
      franchisee: "Jane Smith",
      location: "456 Oak Ave, Los Angeles, CA",
      startDate: null,
      targetDate: new Date('2025-12-01'),
      status: 'not_started',
      progress: 0,
      investmentAmount: 200000,
      investmentReceived: true,
      brandName: "Pizza Hut",
      brandSlug: "pizza-hut",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: "setup-3",
      name: "Taco Bell - Midtown",
      franchisee: "Mike Johnson",
      location: "789 Pine Rd, Chicago, IL",
      startDate: new Date('2025-08-01'),
      targetDate: new Date('2025-10-15'),
      status: 'delayed',
      progress: 70,
      investmentAmount: 175000,
      investmentReceived: true,
      brandName: "Taco Bell",
      brandSlug: "taco-bell",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: "setup-4",
      name: "Subway - Westside",
      franchisee: "Sarah Williams",
      location: "321 Elm St, Houston, TX",
      startDate: new Date('2025-07-01'),
      targetDate: new Date('2025-09-30'),
      status: 'completed',
      progress: 100,
      investmentAmount: 120000,
      investmentReceived: true,
      brandName: "Subway",
      brandSlug: "subway",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  // Calculate stats
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    delayed: projects.filter(p => p.status === 'delayed').length,
    completed: projects.filter(p => p.status === 'completed').length,
    notStarted: projects.filter(p => p.status === 'not_started').length,
    totalInvestment: projects.reduce((sum, p) => sum + p.investmentAmount, 0),
  };

  const statsData = [
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Total Projects",
      value: stats.total,
      color: "text-blue-500"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "In Progress",
      value: stats.inProgress,
      color: "text-blue-500"
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Delayed",
      value: stats.delayed,
      color: "text-red-500"
    },
    {
      icon: <Check className="h-5 w-5" />,
      label: "Completed",
      value: stats.completed,
      color: "text-green-500"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Not Started",
      value: stats.notStarted,
      color: "text-gray-500"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Total Investment",
      value: Math.round(stats.totalInvestment / 1000000 * 10) / 10, // Convert to millions with 1 decimal place
      color: "text-green-500"
    }
  ];

  const getStatusBadge = (status: SetupStatus) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      not_started: "bg-gray-100 text-gray-800",
      delayed: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={colors[status]}>
        {status === 'in_progress' ? 'In Progress' : 
         status === 'not_started' ? 'Not Started' :
         status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not started';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : `${Math.abs(diffDays)} days overdue`;
  };

  const startProject = (projectId: string) => {
    // In real implementation, this would call a mutation
    console.log('Starting project:', projectId);
    setIsStartDialogOpen(false);
  };

  const completeProject = (projectId: string) => {
    // In real implementation, this would call a mutation
    console.log('Completing project:', projectId);
    setIsCompleteDialogOpen(false);
  };

  const columns: ColumnDef<SetupProject>[] = [
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
            <span>Project</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{project.name}</div>
              <div className="text-xs text-muted-foreground truncate">{project.brandName}</div>
            </div>
          </div>
        );
      },
      size: 250,
      minSize: 200,
      maxSize: 300,
    },
    {
      accessorKey: "franchisee",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Franchisee</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">{row.getValue("franchisee")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Location</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm truncate max-w-[150px]">{row.getValue("location")}</span>
          </div>
        );
      },
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
        const project = row.original;
        return (
          <div className="flex justify-center">
            <div className="w-20">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500' : 
                    project.status === 'delayed' ? 'bg-red-500' : 
                    'bg-blue-500'
                  }`} 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{project.progress}%</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "targetDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            <span>Target Date</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm">{formatDate(project.targetDate)}</span>
            <span className="text-xs text-muted-foreground">
              {getDaysRemaining(project.targetDate)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "investmentAmount",
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
        return (
          <div className="flex justify-center">
            <div className="font-medium text-sm">${(row.getValue("investmentAmount") as number).toLocaleString()}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;

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
                <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                {project.status === 'not_started' && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedProject(project);
                      setIsStartDialogOpen(true);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Start Project
                  </DropdownMenuItem>
                )}
                {(project.status === 'in_progress' || project.status === 'delayed') && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedProject(project);
                      setIsCompleteDialogOpen(true);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: projects,
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
        { value: "not_started", label: "Not Started" },
        { value: "in_progress", label: "In Progress" },
        { value: "delayed", label: "Delayed" },
        { value: "completed", label: "Completed" }
      ],
      onValueChange: setStatusFilter
    },
    {
      label: "Brand",
      value: brandFilter,
      options: [
        { value: "all", label: "All Brands" },
        { value: "burger-king", label: "Burger King" },
        { value: "pizza-hut", label: "Pizza Hut" },
        { value: "taco-bell", label: "Taco Bell" },
        { value: "subway", label: "Subway" }
      ],
      onValueChange: setBrandFilter
    }
  ];

  return (
    <>
      <AdminPageTemplate
        title="Setup Management"
        description="Manage franchise setup projects and track their progress"
        addButtonText="Add New Project"
        onAddClick={() => console.log('Add project clicked')}
        stats={statsData}
        searchPlaceholder="Search projects..."
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
                        No projects found.
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

      {/* Start Project Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Project Setup</DialogTitle>
            <DialogDescription>
              Are you sure you want to start the setup for {selectedProject?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Franchisee</p>
                <p>{selectedProject?.franchisee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{selectedProject?.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investment</p>
                <p>${selectedProject?.investmentAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>{selectedProject ? getStatusBadge(selectedProject.status) : null}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedProject && startProject(selectedProject._id)}
              disabled={!selectedProject?.investmentReceived}
            >
              {selectedProject?.investmentReceived ? 'Confirm Start' : 'Investment Pending'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Project Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Project as Complete</DialogTitle>
            <DialogDescription>
              Confirm that the setup for {selectedProject?.name} is fully complete?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Franchisee</p>
                <p>{selectedProject?.franchisee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{selectedProject?.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p>{selectedProject?.startDate ? formatDate(selectedProject.startDate) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Date</p>
                <p>{selectedProject ? formatDate(selectedProject.targetDate) : 'N/A'}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">All setup tasks completed?</p>
              <div className="space-y-2">
                {[
                  'Site inspection completed',
                  'Construction/renovation finished',
                  'Equipment installed and tested',
                  'Staff hired and trained',
                  'Initial inventory received',
                  'All permits and licenses obtained'
                ].map((task, i) => (
                  <div key={i} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`task-${i}`} 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`task-${i}`} className="ml-2 text-sm text-gray-700">
                      {task}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => selectedProject && completeProject(selectedProject._id)}
            >
              Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
