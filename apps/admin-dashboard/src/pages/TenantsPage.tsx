import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import tenantService from '../services/tenant'
import LoadingSpinner from '../components/LoadingSpinner'
import { clsx } from 'clsx'
import { format } from 'date-fns'

const TenantsPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const { data, isLoading, error } = useQuery(
    ['tenants', page, search, statusFilter, planFilter],
    () =>
      tenantService.getTenants({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        plan: planFilter || undefined,
      }),
    {
      keepPreviousData: true,
    }
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge-success">Active</span>
      case 'SUSPENDED':
        return <span className="badge-warning">Suspended</span>
      case 'INACTIVE':
        return <span className="badge-gray">Inactive</span>
      default:
        return <span className="badge-gray">{status}</span>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE':
        return <span className="badge bg-purple-100 text-purple-800">Enterprise</span>
      case 'PROFESSIONAL':
        return <span className="badge bg-blue-100 text-blue-800">Professional</span>
      case 'BASIC':
        return <span className="badge bg-gray-100 text-gray-800">Basic</span>
      default:
        return <span className="badge-gray">{plan}</span>
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load franchises. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchises</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all franchises on the platform
          </p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Franchise
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search franchises..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select
              className="input"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="">All Plans</option>
              <option value="BASIC">Basic</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Franchise</th>
                    <th>Owner</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.subdomain}.franchiseen.com</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {tenant.owner?.firstName} {tenant.owner?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{tenant.owner?.email}</div>
                        </div>
                      </td>
                      <td>{getPlanBadge(tenant.plan)}</td>
                      <td>{getStatusBadge(tenant.status)}</td>
                      <td className="text-sm text-gray-500">
                        {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/tenants/${tenant.id}`}
                            className="text-primary-600 hover:text-primary-500"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                <div className="text-sm text-gray-500">
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TenantsPage
