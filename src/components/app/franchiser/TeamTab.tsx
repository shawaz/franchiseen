"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, UserPlus, Pencil, Trash2, Check } from 'lucide-react';

type TeamRole = 'admin' | 'manager' | 'support' | 'finance' | 'operations';
type TeamStatus = 'active' | 'inactive' | 'invited';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  status: TeamStatus;
  lastActive: string;
  avatar?: string;
  joinDate: string;
  permissions: string[];
}

// Dummy team members data
const dummyTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(555) 123-4567',
    role: 'admin',
    status: 'active',
    lastActive: '2025-09-20T10:30:00',
    avatar: '',
    joinDate: '2023-01-15',
    permissions: ['full_access']
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '(555) 234-5678',
    role: 'finance',
    status: 'active',
    lastActive: '2025-09-19T15:45:00',
    avatar: '',
    joinDate: '2023-03-22',
    permissions: ['financial_reports', 'payouts']
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    phone: '(555) 345-6789',
    role: 'operations',
    status: 'active',
    lastActive: '2025-09-18T09:15:00',
    avatar: '',
    joinDate: '2023-05-10',
    permissions: ['franchise_management', 'approvals']
  },
  {
    id: '4',
    name: 'Sarah Lee',
    email: 'sarah.lee@example.com',
    phone: '(555) 456-7890',
    role: 'support',
    status: 'active',
    lastActive: '2025-09-17T14:20:00',
    avatar: '',
    joinDate: '2023-06-05',
    permissions: ['customer_support', 'tickets']
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '(555) 567-8901',
    role: 'manager',
    status: 'invited',
    lastActive: '',
    avatar: '',
    joinDate: '2025-09-15',
    permissions: ['team_management', 'reports']
  },
];

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'support', label: 'Support' },
];

const permissionOptions = [
  { id: 'full_access', label: 'Full Access' },
  { id: 'financial_reports', label: 'Financial Reports' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'franchise_management', label: 'Franchise Management' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'team_management', label: 'Team Management' },
  { id: 'reports', label: 'Reports' },
  { id: 'customer_support', label: 'Customer Support' },
  { id: 'tickets', label: 'Support Tickets' },
];

const getRoleBadge = (role: TeamRole) => {
  const roleStyles = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    finance: 'bg-green-100 text-green-800',
    operations: 'bg-yellow-100 text-yellow-800',
    support: 'bg-gray-100 text-gray-800',
  };
  
  const roleLabels = {
    admin: 'Admin',
    manager: 'Manager',
    finance: 'Finance',
    operations: 'Operations',
    support: 'Support',
  };
  
  return <Badge className={roleStyles[role]}>{roleLabels[role]}</Badge>;
};

const getStatusBadge = (status: TeamStatus) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case 'inactive':
      return <Badge variant="outline">Inactive</Badge>;
    case 'invited':
      return <Badge className="bg-blue-100 text-blue-800">Invited</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>(dummyTeamMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    phone: '',
    role: 'support',
    status: 'invited',
    permissions: [],
  });

  const handleAddMember = () => {
    const member: TeamMember = {
      id: (members.length + 1).toString(),
      name: newMember.name || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      role: newMember.role || 'support',
      status: 'invited',
      lastActive: '',
      joinDate: new Date().toISOString().split('T')[0],
      permissions: newMember.permissions || [],
    };
    
    setMembers([...members, member]);
    setIsAddDialogOpen(false);
    resetNewMember();
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;
    
    setMembers(members.map(member => 
      member.id === selectedMember.id ? { ...selectedMember } as TeamMember : member
    ));
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const resetNewMember = () => {
    setNewMember({
      name: '',
      email: '',
      phone: '',
      role: 'support',
      status: 'invited',
      permissions: [],
    });
  };

  const togglePermission = (permission: string, isChecked: boolean) => {
    if (isChecked) {
      setNewMember(prev => ({
        ...prev,
        permissions: [...(prev.permissions || []), permission]
      }));
    } else {
      setNewMember(prev => ({
        ...prev,
        permissions: (prev.permissions || []).filter(p => p !== permission)
      }));
    }
  };

  const toggleEditPermission = (permission: string, isChecked: boolean) => {
    if (!selectedMember) return;
    
    if (isChecked) {
      setSelectedMember({
        ...selectedMember,
        permissions: [...selectedMember.permissions, permission]
      });
    } else {
      setSelectedMember({
        ...selectedMember,
        permissions: selectedMember.permissions.filter(p => p !== permission)
      });
    }
  };

  const formatLastActive = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground">
            Manage your brand team members and their permissions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    {member.status === 'active' ? (
                      <span className="text-sm text-muted-foreground">
                        {formatLastActive(member.lastActive)}
                      </span>
                    ) : member.status === 'invited' ? (
                      <span className="text-sm text-blue-600">Invitation sent</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMember(member);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite a new team member by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  placeholder="(123) 456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember({...newMember, role: value as TeamRole})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {permissionOptions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`perm-${permission.id}`}
                      checked={newMember.permissions?.includes(permission.id)}
                      onChange={(e) => togglePermission(permission.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`perm-${permission.id}`} className="text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetNewMember();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedMember && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update team member details and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={selectedMember.name}
                    onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={selectedMember.email}
                    onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={selectedMember.phone}
                    onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={selectedMember.role}
                    onValueChange={(value) => setSelectedMember({...selectedMember, role: value as TeamRole})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      checked={selectedMember.status === 'active'}
                      onChange={() => setSelectedMember({...selectedMember, status: 'active'})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      checked={selectedMember.status === 'inactive'}
                      onChange={() => setSelectedMember({...selectedMember, status: 'inactive'})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {permissionOptions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-perm-${permission.id}`}
                        checked={selectedMember.permissions.includes(permission.id)}
                        onChange={(e) => toggleEditPermission(permission.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`edit-perm-${permission.id}`} className="text-sm">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMember}>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
