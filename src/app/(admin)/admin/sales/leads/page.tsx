"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Plus, Search, Edit, Trash2, Phone, Mail, Building, Calendar, User, Upload, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  source: string;
  status: 'prospects' | 'started' | 'contacted' | 'meeting' | 'onboarded' | 'rejected';
  industry?: string;
  businessType?: string;
  investmentRange?: string;
  preferredLocation?: string;
  timeline?: string;
  notes?: string;
  lastContactDate?: number;
  nextFollowUpDate?: number;
  assignedTo?: string;
  assignedBy?: string;
  importedFrom?: string;
  importBatchId?: string;
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}


const sourceColors = {
  'franchisebazar.com': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'website': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'referral': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  'cold_call': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'social_media': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  'email_campaign': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
};

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    source: 'website',
    status: 'prospects' as Lead['status'],
    industry: '',
    businessType: '',
    investmentRange: '',
    preferredLocation: '',
    timeline: '',
    notes: '',
  });

  const [importData, setImportData] = useState('');

  // Get leads data
  const leads = useQuery(api.leadsManagement.getAllLeads) || [];
  const leadStats = useQuery(api.leadsManagement.getLeadStatistics) || { 
    total: 0, 
    byStatus: {
      prospects: 0,
      started: 0,
      contacted: 0,
      meeting: 0,
      onboarded: 0,
      rejected: 0,
    }, 
    bySource: {}, 
    byMonth: {} 
  };
  
  const createLead = useMutation(api.leadsManagement.createLead);
  const updateLead = useMutation(api.leadsManagement.updateLead);
  const updateLeadStatus = useMutation(api.leadsManagement.updateLeadStatus);
  const deleteLead = useMutation(api.leadsManagement.deleteLead);
  const importLeads = useMutation(api.leadsManagement.importLeadsFromFranchiseBazar);

  // Filter leads
  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleCreateLead = async () => {
    try {
      await createLead(newLead);
      toast.success('Lead created successfully');
      setIsAddLeadDialogOpen(false);
      setNewLead({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        website: '',
        source: 'website',
        status: 'prospects',
        industry: '',
        businessType: '',
        investmentRange: '',
        preferredLocation: '',
        timeline: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to create lead');
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    try {
      await updateLead({
        leadId: selectedLead._id as Id<"leads">,
        ...newLead,
      });
      toast.success('Lead updated successfully');
      setIsEditLeadDialogOpen(false);
      setSelectedLead(null);
    } catch (error) {
      toast.error('Failed to update lead');
      console.error('Error updating lead:', error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await updateLeadStatus({
        leadId: leadId as Id<"leads">,
        status: newStatus,
      });
      toast.success('Lead status updated');
    } catch (error) {
      toast.error('Failed to update lead status');
      console.error('Error updating lead status:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead({ leadId: leadId as Id<"leads"> });
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
      console.error('Error deleting lead:', error);
    }
  };

  const handleImportLeads = async () => {
    try {
      const leadsData = JSON.parse(importData);
      const importBatchId = `batch_${Date.now()}`;
      
      const result = await importLeads({
        leads: leadsData,
        importBatchId,
      });
      
      toast.success(`Imported ${result.successful} leads successfully`);
      setIsImportDialogOpen(false);
      setImportData('');
    } catch (error) {
      toast.error('Failed to import leads. Please check the data format.');
      console.error('Error importing leads:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead: Lead) => lead.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import from FranchiseBazar
          </Button>
          <Button onClick={() => setIsAddLeadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{leadStats.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prospects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{leadStats.byStatus.prospects || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Onboarded</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{leadStats.byStatus.onboarded || 0}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {leadStats.total > 0 ? Math.round(((leadStats.byStatus.onboarded || 0) / leadStats.total) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Leads</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="started">Started</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="meeting">Meeting</TabsTrigger>
          <TabsTrigger value="onboarded">Onboarded</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="prospects">Prospects</SelectItem>
                    <SelectItem value="started">Started</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="onboarded">Onboarded</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="franchisebazar.com">FranchiseBazar</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Leads' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
                ({activeTab === 'all' ? filteredLeads.length : getLeadsByStatus(activeTab).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === 'all' ? filteredLeads : getLeadsByStatus(activeTab)).map((lead: Lead) => (
                    <TableRow key={lead._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                          {lead.company && (
                            <div className="text-sm text-gray-500">{lead.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={sourceColors[lead.source as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800'}>
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={lead.status} onValueChange={(value: Lead['status']) => handleStatusChange(lead._id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prospects">Prospects</SelectItem>
                            <SelectItem value="started">Started</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="onboarded">Onboarded</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(lead.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setNewLead({
                                firstName: lead.firstName,
                                lastName: lead.lastName,
                                email: lead.email,
                                phone: lead.phone || '',
                                company: lead.company || '',
                                website: lead.website || '',
                                source: lead.source,
                                status: lead.status,
                                industry: lead.industry || '',
                                businessType: lead.businessType || '',
                                investmentRange: lead.investmentRange || '',
                                preferredLocation: lead.preferredLocation || '',
                                timeline: lead.timeline || '',
                                notes: lead.notes || '',
                              });
                              setIsEditLeadDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLead(lead._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead in your sales pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newLead.firstName}
                  onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newLead.lastName}
                  onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={newLead.website}
                  onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="franchisebazar.com">FranchiseBazar</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newLead.status} onValueChange={(value: Lead['status']) => setNewLead({ ...newLead, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospects">Prospects</SelectItem>
                    <SelectItem value="started">Started</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="onboarded">Onboarded</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditLeadDialogOpen} onOpenChange={setIsEditLeadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={newLead.firstName}
                  onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={newLead.lastName}
                  onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLeadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLead}>
              Update Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Leads Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Leads from FranchiseBazar</DialogTitle>
            <DialogDescription>
              Paste the JSON data from FranchiseBazar to import leads
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importData">JSON Data</Label>
              <Textarea
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                placeholder="Paste the JSON data here..."
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Expected format:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2">
{`[
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "ABC Corp",
    "industry": "Food & Beverage"
  }
]`}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportLeads}>
              Import Leads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
