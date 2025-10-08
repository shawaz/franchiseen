'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ApplicationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');

  // Mock data - in real app this would come from API/database
  const applications = [
    {
      id: 'APP001',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed.rashid@email.com',
      phone: '+971 50 123 4567',
      position: 'Senior Blockchain Developer',
      appliedDate: '2024-01-15',
      status: 'Under Review',
      experience: '6 years',
      location: 'Dubai, UAE',
      cvUrl: '/resumes/ahmed-rashid-cv.pdf',
      coverLetter: 'I am passionate about blockchain technology and have extensive experience...',
      skills: ['Solidity', 'Web3.js', 'DeFi', 'Smart Contracts', 'Ethereum'],
      rating: 4.5
    },
    {
      id: 'APP002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+971 50 987 6543',
      position: 'AI/ML Engineer',
      appliedDate: '2024-01-14',
      status: 'Interview Scheduled',
      experience: '5 years',
      location: 'Dubai, UAE',
      cvUrl: '/resumes/sarah-johnson-cv.pdf',
      coverLetter: 'With my background in machine learning and AI, I believe I can contribute...',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Data Science'],
      rating: 4.8
    },
    {
      id: 'APP003',
      name: 'Mohammed Hassan',
      email: 'mohammed.hassan@email.com',
      phone: '+971 50 555 1234',
      position: 'Franchise Operations Manager',
      appliedDate: '2024-01-13',
      status: 'Rejected',
      experience: '8 years',
      location: 'Dubai, UAE',
      cvUrl: '/resumes/mohammed-hassan-cv.pdf',
      coverLetter: 'I have extensive experience in franchise operations and multi-unit management...',
      skills: ['Operations', 'Franchise Management', 'Team Leadership', 'Process Improvement'],
      rating: 3.2
    },
    {
      id: 'APP004',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+971 50 777 8888',
      position: 'Investment Analyst',
      appliedDate: '2024-01-12',
      status: 'Hired',
      experience: '4 years',
      location: 'Dubai, UAE',
      cvUrl: '/resumes/emily-chen-cv.pdf',
      coverLetter: 'My experience in investment analysis and financial modeling makes me...',
      skills: ['Financial Analysis', 'Excel', 'Bloomberg', 'CFA', 'Risk Assessment'],
      rating: 4.9
    },
    {
      id: 'APP005',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+971 50 999 1111',
      position: 'Digital Marketing Specialist',
      appliedDate: '2024-01-11',
      status: 'Under Review',
      experience: '3 years',
      location: 'Dubai, UAE',
      cvUrl: '/resumes/david-wilson-cv.pdf',
      coverLetter: 'I specialize in digital marketing strategies and have a proven track record...',
      skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Content Marketing', 'Analytics'],
      rating: 4.1
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Interview Scheduled', label: 'Interview Scheduled' },
    { value: 'Hired', label: 'Hired' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const positionOptions = [
    { value: 'all', label: 'All Positions' },
    { value: 'Senior Blockchain Developer', label: 'Senior Blockchain Developer' },
    { value: 'AI/ML Engineer', label: 'AI/ML Engineer' },
    { value: 'Franchise Operations Manager', label: 'Franchise Operations Manager' },
    { value: 'Investment Analyst', label: 'Investment Analyst' },
    { value: 'Digital Marketing Specialist', label: 'Digital Marketing Specialist' }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || app.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Hired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Interview Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (rating >= 4.0) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Applications</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage and review job applications from candidates</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">127</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interview Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(option => (
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

      {/* Applications List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {application.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{application.position}</p>
                </div>
                <Badge className={getStatusBadgeColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{application.experience}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Applied:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{application.appliedDate}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                  <p className={`font-medium ${getRatingColor(application.rating)}`}>
                    ⭐ {application.rating}/5
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{application.location}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Contact:</span>
                <p className="text-sm text-gray-900 dark:text-white">{application.email}</p>
                <p className="text-sm text-gray-900 dark:text-white">{application.phone}</p>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {application.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {application.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{application.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Download CV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
