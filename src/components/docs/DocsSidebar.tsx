'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DOCS_GROUPS } from './docsNavigation'

export default function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Documentation" className="space-y-7">
      {DOCS_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.links.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block rounded-md px-3 py-2 text-sm transition-colors border-l-2 ${
                      isActive
                        ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 font-semibold text-yellow-700 dark:text-yellow-400'
                        : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-yellow-600 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    {link.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
