/** Single definition of the docs tree. Sidebar, index page and next-links read from this. */
export interface DocsLink {
  href: string
  title: string
  description: string
}

export interface DocsGroup {
  label: string
  blurb: string
  links: DocsLink[]
}

export const DOCS_GROUPS: DocsGroup[] = [
  {
    label: 'Using Franchiseen',
    blurb: 'Task guides for the three roles on the platform.',
    links: [
      {
        href: '/docs',
        title: 'Getting started',
        description: 'What Franchiseen is, the three roles, and setting up your account.',
      },
      {
        href: '/docs/franchisers',
        title: 'For brand owners',
        description: 'List a brand, define locations and products, set your fee and royalty.',
      },
      {
        href: '/docs/franchisees',
        title: 'For franchisees',
        description: 'Apply for a franchise, get through setup, then run it day to day.',
      },
      {
        href: '/docs/investors',
        title: 'For investors',
        description: 'Buy shares in a franchise and track what you earn.',
      },
      {
        href: '/docs/wallets',
        title: 'Wallets and payments',
        description: 'How money moves in and out, and how to verify it.',
      },
    ],
  },
  {
    label: 'Investors and partners',
    blurb: 'How the economics work, in detail.',
    links: [
      {
        href: '/docs/economics',
        title: 'Franchise unit economics',
        description: 'What a franchise costs to open and how the funding target is built.',
      },
      {
        href: '/docs/payouts',
        title: 'Ownership and payouts',
        description: 'The fee stack and the reserve-tiered split, with a worked example.',
      },
      {
        href: '/docs/custody',
        title: 'Fund custody and controls',
        description: 'Who holds keys, how they are protected, what is publicly verifiable.',
      },
    ],
  },
  {
    label: 'Reference',
    blurb: '',
    links: [
      {
        href: '/docs/reference',
        title: 'Glossary and fee schedule',
        description: 'Every term and every number in one place.',
      },
    ],
  },
]

export const ALL_DOCS_LINKS: DocsLink[] = DOCS_GROUPS.flatMap((g) => g.links)

export function findDocsLink(href: string): DocsLink | undefined {
  return ALL_DOCS_LINKS.find((l) => l.href === href)
}

/** Convenience for building NextUp blocks without repeating copy. */
export function docsLinks(...hrefs: string[]): DocsLink[] {
  return hrefs.map((href) => {
    const link = findDocsLink(href)
    if (!link) throw new Error(`Unknown docs href: ${href}`)
    return link
  })
}
