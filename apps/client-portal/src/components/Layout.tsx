import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  UserIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: CreditCardIcon },
  { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
  { name: 'Crypto', href: '/crypto', icon: CurrencyDollarIcon, badge: 'New' },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { client, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <div className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl px-6 pb-2 shadow-xl">
                  <div className="flex h-16 shrink-0 items-center">
                    <div>
                      <h1 className="text-lg font-bold gradient-text">Franchiseen</h1>
                      <p className="text-xs text-gray-500">Financial Portal</p>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={clsx(
                                  'nav-item',
                                  location.pathname === item.href ? 'active' : ''
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {item.name}
                                {item.badge && (
                                  <span className="ml-auto badge-crypto text-xs">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl border-r border-gray-200/50 px-6 shadow-lg">
          <div className="flex h-16 shrink-0 items-center">
            <div>
              <h1 className="text-lg font-bold gradient-text">Franchiseen</h1>
              <p className="text-xs text-gray-500">Financial Portal</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          'nav-item',
                          location.pathname === item.href ? 'active' : ''
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto badge-crypto text-xs">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              {client && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Welcome back,</span>
                    <span className="text-sm font-medium text-gray-900">
                      {client.firstName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">•</span>
                  <span className={clsx(
                    'badge text-xs',
                    {
                      'badge-success': client.kycStatus === 'VERIFIED',
                      'badge-warning': client.kycStatus === 'PENDING',
                      'badge-error': client.kycStatus === 'REJECTED',
                      'badge-gray': client.kycStatus === 'NOT_STARTED',
                    }
                  )}>
                    {client.kycStatus === 'VERIFIED' && 'Verified'}
                    {client.kycStatus === 'PENDING' && 'Verification Pending'}
                    {client.kycStatus === 'REJECTED' && 'Verification Required'}
                    {client.kycStatus === 'NOT_STARTED' && 'Unverified'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 transition-colors">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                      {client?.firstName} {client?.lastName}
                    </span>
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={clsx(
                            active ? 'bg-gray-50' : '',
                            'flex items-center px-3 py-2 text-sm leading-6 text-gray-900'
                          )}
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={clsx(
                            active ? 'bg-gray-50' : '',
                            'flex items-center px-3 py-2 text-sm leading-6 text-gray-900'
                          )}
                        >
                          <CogIcon className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100 my-1" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            active ? 'bg-gray-50' : '',
                            'flex items-center w-full text-left px-3 py-2 text-sm leading-6 text-gray-900'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
