import React from 'react'
import type { Metadata } from 'next'
import DocsSidebar from '@/components/docs/DocsSidebar'

export const metadata: Metadata = {
  title: 'Documentation | Franchiseen',
  description:
    'Guides for brand owners, franchisees and investors on Franchiseen, plus the full detail of how fees, funding and payouts work.',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
            <DocsSidebar />
          </div>
        </aside>

        {/* Mobile navigation: the sidebar collapses into a disclosure above the content. */}
        <details className="lg:hidden mb-8 border border-stone-200 dark:border-stone-800 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-stone-900 dark:text-white">
            Browse documentation
          </summary>
          <div className="px-4 pb-4 pt-1">
            <DocsSidebar />
          </div>
        </details>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
