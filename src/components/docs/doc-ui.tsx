import React from 'react'
import Link from 'next/link'

/** Page title block. Every docs page opens with one. */
export function DocHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <header className="mb-10 pb-8 border-b border-stone-200 dark:border-stone-800">
      <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600 mb-3">{eyebrow}</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4 text-balance">{title}</h1>
      <p className="text-lg leading-relaxed text-stone-600 dark:text-stone-300 max-w-2xl">{intro}</p>
    </header>
  )
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 className="text-2xl font-semibold text-stone-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl">{children}</p>
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 max-w-2xl">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300 leading-relaxed">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Numbered sequence. Only use where order genuinely matters. */
export function Steps({ steps }: { steps: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="max-w-2xl divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4 py-4">
          <span className="shrink-0 font-mono text-sm font-bold text-yellow-600 tabular-nums pt-0.5">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-white mb-1">{step.title}</h4>
            <div className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

const CALLOUT_STYLES = {
  note: {
    wrap: 'border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/50',
    label: 'text-stone-500 dark:text-stone-400',
  },
  important: {
    wrap: 'border-yellow-500 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20',
    label: 'text-yellow-700 dark:text-yellow-400',
  },
  risk: {
    wrap: 'border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    label: 'text-red-700 dark:text-red-400',
  },
} as const

export function Callout({
  kind = 'note',
  title,
  children,
}: {
  kind?: keyof typeof CALLOUT_STYLES
  title: string
  children: React.ReactNode
}) {
  const style = CALLOUT_STYLES[kind]
  return (
    <div className={`max-w-2xl border-l-4 rounded-r-lg px-5 py-4 ${style.wrap}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${style.label}`}>{title}</p>
      <div className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 space-y-2">{children}</div>
    </div>
  )
}

export function DocTable({
  columns,
  rows,
  caption,
}: {
  columns: string[]
  rows: React.ReactNode[][]
  caption?: string
}) {
  return (
    <figure className="max-w-3xl my-2">
      <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg">
        <table className="w-full text-sm min-w-[32rem]">
          <thead>
            <tr className="bg-stone-100 dark:bg-stone-800/70">
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {rows.map((row, i) => (
              <tr key={i} className="bg-white dark:bg-stone-900/40">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 align-top text-stone-700 dark:text-stone-300 tabular-nums leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="mt-2 text-xs text-stone-500 dark:text-stone-400">{caption}</figcaption> : null}
    </figure>
  )
}

/** Inline code / identifier. */
export function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.85em] bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-stone-800 dark:text-stone-200">
      {children}
    </code>
  )
}

/** "Next / related" links at the foot of a page. */
export function NextUp({ links }: { links: { href: string; title: string; description: string }[] }) {
  return (
    <nav
      aria-label="Related pages"
      className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 grid gap-3 sm:grid-cols-2 max-w-3xl"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group block rounded-lg border border-stone-200 dark:border-stone-800 p-4 transition-colors hover:border-yellow-600 dark:hover:border-yellow-600"
        >
          <span className="block font-semibold text-stone-900 dark:text-white group-hover:text-yellow-600 mb-1">
            {link.title}
          </span>
          <span className="block text-sm text-stone-500 dark:text-stone-400">{link.description}</span>
        </Link>
      ))}
    </nav>
  )
}

/** Footer line recording what the page was verified against. */
export function VerifiedAgainst({ note }: { note: string }) {
  return (
    <p className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 font-mono">
      {note}
    </p>
  )
}
