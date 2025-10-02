"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Plus, Search, Edit, Trash2, Shield, User, Crown, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';


interface TeamMember {
  _id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'member';
  departments: ('management' | 'operations' | 'finance' | 'people' | 'marketing' | 'sales' | 'support' | 'software')[];
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  invitedBy?: string;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

const roleIcons = {
  super_admin: Crown,
  admin: Shield,
  manager: Users,
  member: User,
};

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  member: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const departmentColors = {
  management: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  operations: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  finance: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  people: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  marketing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  sales: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  support: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  software: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
};

const departments = [
  { value: 'management', label: 'Management', icon: Crown },
  { value: 'operations', label: 'Operations', icon: Building2 },
  { value: 'finance', label: 'Finance', icon: Shield },
  { value: 'people', label: 'People', icon: Users },
  { value: 'marketing', label: 'Marketing', icon: Building2 },
  { value: 'sales', label: 'Sales', icon: Building2 },
  { value: 'support', label: 'Support', icon: Building2 },
  { value: 'software', label: 'Software', icon: Building2 },
];

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    walletAddress: '',
    email: '',
    name: '',
    departments: [] as string[],
    permissions: [] as string[],
  });

  // Get all team members
  const teamMembers = useQuery(api.adminManagement.getAllTeamMembers) || [];
  const createUserAndAddToTeam = useMutation(api.adminManagement.createUserAndAddToTeam);
  const updateTeamMember = useMutation(api.adminManagement.updateTeamMember);
  const removeTeamMember = useMutation(api.adminManagement.removeTeamMember);

  // Filter team members
  const filteredMembers = teamMembers.filter((member: TeamMember) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || member.departments.includes(departmentFilter as 'management' | 'operations' | 'finance' | 'people' | 'marketing' | 'sales' | 'support' | 'software');
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Note: We now create users directly instead of selecting from existing users

  const handleAddMember = async () => {
    if (!newMember.walletAddress || !newMember.email || !newMember.name || newMember.departments.length === 0) {
      toast.error('Please fill in all required fields and select at least one department');
      return;
    }

    try {
      await createUserAndAddToTeam({
        walletAddress: newMember.walletAddress,
        email: newMember.email,
        name: newMember.name,
        role: 'member', // Default role, can be changed later
        departments: newMember.departments as ('management' | 'operations' | 'finance' | 'people' | 'marketing' | 'sales' | 'support' | 'software')[],
        permissions: newMember.permissions,
      });
      
      toast.success('Team member added successfully');
      setNewMember({ walletAddress: '', email: '', name: '', departments: [], permissions: [] });
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add team member');
      console.error('Error adding team member:', error);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;

    try {
      await updateTeamMember({
        teamMemberId: selectedMember._id as Id<"adminTeam">,
        departments: selectedMember.departments as ('management' | 'operations' | 'finance' | 'people' | 'marketing' | 'sales' | 'support' | 'software')[],
        permissions: selectedMember.permissions,
      });
      
      toast.success('Team member updated successfully');
      setIsEditMemberDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error('Failed to update team member');
      console.error('Error updating team member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      await removeTeamMember({ teamMemberId: memberId as Id<"adminTeam"> });
      toast.success('Team member removed successfully');
    } catch (error) {
      toast.error('Failed to remove team member');
      console.error('Error removing team member:', error);
    }
  };

  const handleDepartmentChange = (department: string, checked: boolean) => {
    if (checked) {
      setNewMember({
        ...newMember,
        departments: [...newMember.departments, department],
      });
    } else {
      setNewMember({
        ...newMember,
        departments: newMember.departments.filter(d => d !== department),
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage team members and their department access
          </p>
        </div>
        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a user to the team and assign department access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input
                  id="walletAddress"
                  value={newMember.walletAddress}
                  onChange={(e) => setNewMember({ ...newMember, walletAddress: e.target.value })}
                  placeholder="Enter wallet address"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label>Departments</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <div key={dept.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept.value}
                          checked={newMember.departments.includes(dept.value)}
                          onCheckedChange={(checked) => handleDepartmentChange(dept.value, checked as boolean)}
                        />
                        <Label htmlFor={dept.value} className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{dept.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member: TeamMember) => {
                const RoleIcon = roleIcons[member.role];
                return (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {member.avatar ? (
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role]}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.departments.map((dept) => (
                          <Badge key={dept} className={departmentColors[dept]} variant="secondary">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[member.status]}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.lastLoginAt ? formatDate(member.lastLoginAt) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {formatDate(member.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditMemberDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={setIsEditMemberDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update department access and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div>
                <Label>Departments</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <div key={dept.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${dept.value}`}
                          checked={selectedMember.departments.includes(dept.value as 'management' | 'operations' | 'finance' | 'people' | 'marketing' | 'sales' | 'support' | 'software')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                            setSelectedMember({
                              ...selectedMember,
                              departments: [...selectedMember.departments, dept.value as 'management' | 'operations' | 'finance' | 'people' | 'marketing' | 'sales' | 'support' | 'software'],
                            });
                            } else {
                              setSelectedMember({
                                ...selectedMember,
                                departments: selectedMember.departments.filter(d => d !== dept.value),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`edit-${dept.value}`} className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{dept.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMember}>
              Update Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
