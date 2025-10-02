"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { TrendingUp, TrendingDown, Users, Target, BarChart3, PieChart, Activity } from 'lucide-react';

export default function LeadsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedSource, setSelectedSource] = useState('all');

  // Get leads data and statistics
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      prospects: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      started: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      onboarded: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceColor = (source: string) => {
    const colors = {
      'franchisebazar.com': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'website': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'referral': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'cold_call': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'social_media': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'email_campaign': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Calculate conversion rates
  const totalLeads = leadStats.total;
  const onboardedLeads = leadStats.byStatus.onboarded || 0;
  const conversionRate = totalLeads > 0 ? Math.round((onboardedLeads / totalLeads) * 100) : 0;
  
  // Calculate pipeline progression
  const prospects = leadStats.byStatus.prospects || 0;
  const started = leadStats.byStatus.started || 0;
  const contacted = leadStats.byStatus.contacted || 0;
  const meeting = leadStats.byStatus.meeting || 0;
  // Recent leads (last 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentLeads = leads.filter((lead: { createdAt: number }) => lead.createdAt > thirtyDaysAgo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analytics and insights for your sales leads
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-48">
              <SelectValue />
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{recentLeads.length} this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Onboarded</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{onboardedLeads}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Pipeline</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{prospects + started + contacted + meeting}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Lead Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadStats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${totalLeads > 0 ? (count as number / totalLeads) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Lead Source Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadStats.bySource)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Progression */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{prospects}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Prospects</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{started}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Started</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{contacted}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contacted</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{meeting}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Meeting</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{onboardedLeads}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Onboarded</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads
              .sort((a: { createdAt: number }, b: { createdAt: number }) => b.createdAt - a.createdAt)
              .slice(0, 10)
              .map((lead: { _id: string; firstName: string; lastName: string; email: string; source: string; status: string; createdAt: number }) => (
              <div key={lead._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{lead.firstName} {lead.lastName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getSourceColor(lead.source)}>
                    {lead.source}
                  </Badge>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
