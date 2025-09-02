import React from 'react'
import { useQuery } from 'react-query'
import {
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import tenantService from '../services/tenant'
import LoadingSpinner from '../components/LoadingSpinner'
import { clsx } from 'clsx'

const DashboardPage: React.FC = () => {
  const { data: tenantStats, isLoading } = useQuery(
    'tenant-stats',
    () => tenantService.getTenantStats(),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  const stats = [
    {
      name: 'Total Franchises',
      value: tenantStats?.totalTenants || 0,
      change: '+12%',
      changeType: 'positive',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Active Franchises',
      value: tenantStats?.activeTenants || 0,
      change: '+8%',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'Total Revenue',
      value: `$${(tenantStats?.totalRevenue || 0).toLocaleString()}`,
      change: '+23%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Monthly Growth',
      value: `${tenantStats?.monthlyGrowth || 0}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your franchise management platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div
                      className={clsx(
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600',
                        'ml-2 flex items-baseline text-sm font-semibold'
                      )}
                    >
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Franchises */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Franchises</h3>
            <a href="/tenants" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <BuildingOfficeIcon className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Demo Franchise {i}</p>
                  <p className="text-sm text-gray-500">Created 2 hours ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="badge-success">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            <span className="badge-success">All Systems Operational</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Server</span>
              <span className="text-sm text-success-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm text-success-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Solana Network</span>
              <span className="text-sm text-success-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateways</span>
              <span className="text-sm text-success-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-outline text-left p-4 h-auto">
            <BuildingOfficeIcon className="h-6 w-6 text-gray-400 mb-2" />
            <div className="text-sm font-medium text-gray-900">Create Franchise</div>
            <div className="text-xs text-gray-500">Set up a new franchise</div>
          </button>
          <button className="btn-outline text-left p-4 h-auto">
            <UsersIcon className="h-6 w-6 text-gray-400 mb-2" />
            <div className="text-sm font-medium text-gray-900">Manage Users</div>
            <div className="text-xs text-gray-500">Add or edit user accounts</div>
          </button>
          <button className="btn-outline text-left p-4 h-auto">
            <CurrencyDollarIcon className="h-6 w-6 text-gray-400 mb-2" />
            <div className="text-sm font-medium text-gray-900">View Reports</div>
            <div className="text-xs text-gray-500">Financial and usage reports</div>
          </button>
          <button className="btn-outline text-left p-4 h-auto">
            <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400 mb-2" />
            <div className="text-sm font-medium text-gray-900">Analytics</div>
            <div className="text-xs text-gray-500">Platform performance metrics</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
