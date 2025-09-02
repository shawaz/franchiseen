import React from 'react'
import { useQuery } from 'react-query'
import {
  UsersIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useTenant } from '../contexts/TenantContext'
import clientService from '../services/client'
import transactionService from '../services/transaction'
import LoadingSpinner from '../components/LoadingSpinner'
import { clsx } from 'clsx'
import { format } from 'date-fns'

const DashboardPage: React.FC = () => {
  const { tenant } = useTenant()

  const { data: clientStats, isLoading: clientsLoading } = useQuery(
    'client-stats',
    () => clientService.getClientStats(),
    {
      refetchInterval: 30000,
    }
  )

  const { data: transactionStats, isLoading: transactionsLoading } = useQuery(
    'transaction-stats',
    () => transactionService.getTransactionStats(),
    {
      refetchInterval: 30000,
    }
  )

  const { data: recentTransactions, isLoading: recentLoading } = useQuery(
    'recent-transactions',
    () => transactionService.getTransactions({ page: 1, limit: 5 }),
    {
      refetchInterval: 30000,
    }
  )

  const stats = [
    {
      name: 'Total Clients',
      value: clientStats?.totalClients || 0,
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'primary',
    },
    {
      name: 'Transaction Volume',
      value: `$${(transactionStats?.totalVolume || 0).toLocaleString()}`,
      change: '+23%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'success',
    },
    {
      name: 'Total Transactions',
      value: transactionStats?.totalTransactions || 0,
      change: '+8%',
      changeType: 'positive',
      icon: CreditCardIcon,
      color: 'primary',
    },
    {
      name: 'Commission Earned',
      value: `$${(transactionStats?.totalCommissions || 0).toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUpIcon,
      color: 'warning',
    },
  ]

  const isLoading = clientsLoading || transactionsLoading

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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {tenant?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your franchise today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={clsx(
                  'p-2 rounded-lg',
                  {
                    'bg-primary-100': stat.color === 'primary',
                    'bg-success-100': stat.color === 'success',
                    'bg-warning-100': stat.color === 'warning',
                  }
                )}>
                  <stat.icon className={clsx(
                    'h-6 w-6',
                    {
                      'text-primary-600': stat.color === 'primary',
                      'text-success-600': stat.color === 'success',
                      'text-warning-600': stat.color === 'warning',
                    }
                  )} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-label truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="stat-value">{stat.value}</div>
                    <div className={clsx(
                      'stat-change ml-2',
                      stat.changeType === 'positive' ? 'positive' : 'negative'
                    )}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </a>
              </div>
              
              {recentLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions?.data.map((transaction) => (
                    <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={clsx(
                          'h-8 w-8 rounded-full flex items-center justify-center',
                          {
                            'bg-success-100': transaction.status === 'SUCCESS',
                            'bg-warning-100': transaction.status === 'PENDING',
                            'bg-error-100': transaction.status === 'FAILURE',
                          }
                        )}>
                          {transaction.status === 'SUCCESS' && (
                            <CheckCircleIcon className="h-4 w-4 text-success-600" />
                          )}
                          {transaction.status === 'PENDING' && (
                            <ClockIcon className="h-4 w-4 text-warning-600" />
                          )}
                          {transaction.status === 'FAILURE' && (
                            <ExclamationTriangleIcon className="h-4 w-4 text-error-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.transactionType} - ${transaction.amount}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.client?.firstName} {transaction.client?.lastName} • {format(new Date(transaction.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={clsx(
                          'badge',
                          {
                            'badge-success': transaction.status === 'SUCCESS',
                            'badge-warning': transaction.status === 'PENDING',
                            'badge-error': transaction.status === 'FAILURE',
                          }
                        )}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {(!recentTransactions?.data || recentTransactions.data.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start processing payments to see activity here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Solana Pay Status */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Solana Pay</h3>
                <span className="badge-crypto">Active</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network</span>
                  <span className="text-sm font-medium">Devnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supported Tokens</span>
                  <span className="text-sm font-medium">SOL, USDC, USDT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm text-success-600">Connected</span>
                </div>
              </div>
              <div className="mt-4">
                <a href="/solana-pay" className="btn-crypto w-full text-center">
                  <BanknotesIcon className="h-4 w-4 mr-2" />
                  Manage Crypto Payments
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/clients" className="btn-outline w-full text-left">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Add New Client
                </a>
                <a href="/transactions" className="btn-outline w-full text-left">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Process Payment
                </a>
                <a href="/financial-accounts" className="btn-outline w-full text-left">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Manage Accounts
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
