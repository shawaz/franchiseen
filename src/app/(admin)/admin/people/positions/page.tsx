'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PositionsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - in real app this would come from API/database
  const positions = [
    {
      id: 'POS001',
      title: 'Senior Blockchain Developer',
      department: 'Technology',
      location: 'Dubai, UAE',
      type: 'Full-time',
      status: 'Open',
      openings: 2,
      applied: 45,
      interviewed: 8,
      hired: 1,
      salaryRange: 'AED 25,000 - 35,000',
      experience: '5+ years',
      postedDate: '2024-01-01',
      deadline: '2024-02-15',
      description: 'Lead blockchain development for our franchise platform, implementing smart contracts and DeFi solutions.',
      requirements: ['Solidity expertise', 'Web3.js', 'DeFi protocols', 'Smart contracts', 'Ethereum'],
      priority: 'High'
    },
    {
      id: 'POS002',
      title: 'Franchise Operations Manager',
      department: 'Operations',
      location: 'Dubai, UAE',
      type: 'Full-time',
      status: 'Open',
      openings: 1,
      applied: 32,
      interviewed: 5,
      hired: 0,
      salaryRange: 'AED 20,000 - 30,000',
      experience: '7+ years',
      postedDate: '2024-01-05',
      deadline: '2024-02-20',
      description: 'Oversee franchise operations, ensuring quality standards and operational excellence across all locations.',
      requirements: ['Franchise operations', 'Multi-unit management', 'Leadership', 'Process improvement', 'Brand management'],
      priority: 'High'
    },
    {
      id: 'POS003',
      title: 'AI/ML Engineer',
      department: 'Technology',
      location: 'Dubai, UAE',
      type: 'Full-time',
      status: 'Open',
      openings: 1,
      applied: 28,
      interviewed: 6,
      hired: 0,
      salaryRange: 'AED 22,000 - 32,000',
      experience: '4+ years',
      postedDate: '2024-01-10',
      deadline: '2024-02-25',
      description: 'Develop AI-powered solutions for franchise analytics, predictive modeling, and automated decision-making.',
      requirements: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science'],
      priority: 'Medium'
    },
    {
      id: 'POS004',
      title: 'Investment Analyst',
      department: 'Finance',
      location: 'Dubai, UAE',
      type: 'Full-time',
      status: 'Filled',
      openings: 1,
      applied: 18,
      interviewed: 4,
      hired: 1,
      salaryRange: 'AED 18,000 - 28,000',
      experience: '3+ years',
      postedDate: '2023-12-15',
      deadline: '2024-01-30',
      description: 'Analyze franchise investment opportunities, conduct due diligence, and provide investment recommendations.',
      requirements: ['Financial analysis', 'Excel', 'Bloomberg', 'CFA preferred', 'Investment experience'],
      priority: 'Medium'
    },
    {
      id: 'POS005',
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Dubai, UAE',
      type: 'Full-time',
      status: 'Open',
      openings: 2,
      applied: 24,
      interviewed: 7,
      hired: 0,
      salaryRange: 'AED 15,000 - 25,000',
      experience: '3+ years',
      postedDate: '2024-01-08',
      deadline: '2024-02-18',
      description: 'Ensure customer satisfaction and success for franchisees, franchisors, and investors on our platform.',
      requirements: ['Customer success', 'B2B SaaS', 'Relationship building', 'Communication', 'Franchise knowledge'],
      priority: 'Low'
    },
    {
      id: 'POS006',
      title: 'Digital Marketing Specialist',
      department: 'Marketing',
      location: 'Dubai, UAE',
      type: 'Full-time',
      status: 'On Hold',
      openings: 1,
      applied: 15,
      interviewed: 3,
      hired: 0,
      salaryRange: 'AED 12,000 - 20,000',
      experience: '2+ years',
      postedDate: '2024-01-12',
      deadline: '2024-02-28',
      description: 'Develop and execute digital marketing campaigns to promote our franchise platform and attract new users.',
      requirements: ['Digital marketing', 'Google Ads', 'Facebook Ads', 'SEO', 'Content marketing'],
      priority: 'Low'
    }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Customer Success', label: 'Customer Success' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'Filled', label: 'Filled' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Closed', label: 'Closed' }
  ];

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || position.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Filled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalOpenings = positions.reduce((sum, pos) => sum + pos.openings, 0);
  const totalApplied = positions.reduce((sum, pos) => sum + pos.applied, 0);
  const totalInterviewed = positions.reduce((sum, pos) => sum + pos.interviewed, 0);
  const totalHired = positions.reduce((sum, pos) => sum + pos.hired, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Positions</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage job positions and track hiring progress</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Position</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job Position</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Create a new job position form would go here with all the necessary fields.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Openings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOpenings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplied}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviewed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalInterviewed}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hired</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHired}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <Input
                placeholder="Search by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPositions.map((position) => (
          <Card key={position.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {position.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{position.department}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusBadgeColor(position.status)}>
                    {position.status}
                  </Badge>
                  <Badge className={getPriorityBadgeColor(position.priority)}>
                    {position.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{position.location}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{position.type}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{position.experience}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Salary:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{position.salaryRange}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Posted:</span>
                <p className="text-sm text-gray-900 dark:text-white">{position.postedDate}</p>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Deadline:</span>
                <p className="text-sm text-gray-900 dark:text-white">{position.deadline}</p>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Requirements:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {position.requirements.slice(0, 3).map((req, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {position.requirements.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{position.requirements.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hiring Progress</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {position.hired}/{position.openings} filled
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(position.hired / position.openings) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Applied: {position.applied}</span>
                  <span>Interviewed: {position.interviewed}</span>
                  <span>Hired: {position.hired}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Applications
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit Position
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPositions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No positions found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
