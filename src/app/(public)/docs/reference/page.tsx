import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { DocHeader, Section, P, Callout, DocTable, Mono, NextUp, VerifiedAgainst } from '@/components/docs/doc-ui'
import { docsLinks } from '@/components/docs/docsNavigation'
import {
  PLATFORM_FEE_PERCENT,
  DEFAULT_ROYALTY_PERCENT,
  RESERVE_TIERS,
  PAYOUT_CADENCES,
  LIFECYCLE_STAGES,
} from '@/lib/platformEconomics'

export const metadata: Metadata = {
  title: 'Glossary and fee schedule | Franchiseen docs',
  description: 'Every fee, stage and term used across Franchiseen in one reference page.',
}

const GLOSSARY: { term: string; definition: React.ReactNode }[] = [
  {
    term: 'Brand owner (franchiser)',
    definition:
      'The owner of a brand who lists it so franchises can be opened under it, and who receives a royalty on their revenue.',
  },
  { term: 'Franchisee', definition: 'The operator of a single franchise location.' },
  {
    term: 'Investor',
    definition: 'Someone who buys shares in a specific franchise and receives a pro-rata share of what it distributes.',
  },
  {
    term: 'FOCO',
    definition:
      'Franchise Owned, Company Operated. The unit is funded as a franchise but operated by the company side.',
  },
  {
    term: 'FOFO',
    definition:
      'Franchise Owned, Franchise Operated. The unit is both funded as a franchise and operated by a franchisee.',
  },
  {
    term: 'Total investment',
    definition: 'The funding target for a franchise: franchise fee plus setup cost plus working capital.',
  },
  {
    term: 'Franchise fee',
    definition: 'A one-off amount paid to the brand owner for the right to trade under the brand. Not recoverable.',
  },
  {
    term: 'Setup cost',
    definition: 'Design, fit-out and equipment for the location. Spent during the launching stage.',
  },
  {
    term: 'Working capital',
    definition: 'Cash retained by the franchise to trade on. Also the benchmark the reserve tier is measured against.',
  },
  {
    term: 'Franchise reserve',
    definition: 'The franchise wallet balance. Compared against working capital to decide each payout split.',
  },
  { term: 'Share price', definition: 'The fixed price of one share in a franchise, set when the listing is created.' },
  {
    term: 'Shares issued',
    definition: 'The total share count created for a franchise. Funding completes when all are purchased.',
  },
  {
    term: 'Confirmed holding',
    definition: 'A share purchase whose payment has settled. Only confirmed holdings count toward payouts.',
  },
  {
    term: 'Gross revenue',
    definition: 'Revenue a franchise recorded for a period, before any deduction. The starting point of a payout run.',
  },
  {
    term: 'Net revenue',
    definition: 'Gross revenue after the brand royalty and platform fee. The amount the reserve tier splits.',
  },
  { term: 'Payout per share', definition: 'The amount allocated to investors divided by the total confirmed shares.' },
  {
    term: 'Payout run',
    definition:
      'A single distribution covering a stated period, recorded with the rule applied and the reserve before and after.',
  },
]

export default function ReferenceDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="Reference"
        title="Glossary and fee schedule"
        intro="Every number and every term used across these guides, collected in one place."
      />

      <Section title="Fee schedule">
        <DocTable
          columns={['Fee', 'Rate', 'Charged on', 'Paid to']}
          rows={[
            [
              <strong key="a">Brand royalty</strong>,
              `Set per brand; ${DEFAULT_ROYALTY_PERCENT}% where unset`,
              'Gross revenue',
              'The brand owner',
            ],
            [<strong key="b">Platform fee</strong>, `${PLATFORM_FEE_PERCENT}%`, 'Gross revenue', 'Franchiseen'],
          ]}
          caption="Both are charged on revenue rather than profit, and both are deducted before anything is split between the reserve and investors."
        />
      </Section>

      <Section title="Reserve tiers">
        <DocTable
          columns={['Reserve as % of working capital', 'To investors', 'To reserve', 'Rule name']}
          rows={RESERVE_TIERS.map((tier) => [
            <strong key={tier.rule}>{tier.band}</strong>,
            `${tier.toTokenHolders}%`,
            `${tier.toReserve}%`,
            tier.rule,
          ])}
          caption="Applied to net revenue. Full detail and a worked example on the payouts page."
        />
      </Section>

      <Section title="Payout cadence">
        <P>
          A payout run is recorded as one of the following for a given franchise:{' '}
          {PAYOUT_CADENCES.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 ? ' or ' : ''}
              <Mono>{c}</Mono>
            </React.Fragment>
          ))}
          .
        </P>
      </Section>

      <Section title="Franchise stages">
        <DocTable
          columns={['Stage', 'Meaning', 'Sub-stages']}
          rows={LIFECYCLE_STAGES.map((stage) => [
            <strong key={stage.stage}>{stage.label}</strong>,
            stage.summary,
            <span key={`${stage.stage}-sub`} className="font-mono text-xs">
              {stage.subStages.join(', ')}
            </span>,
          ])}
        />
      </Section>

      <Section title="Statuses you will see">
        <DocTable
          columns={['Where', 'Possible values']}
          rows={[
            ['Brand', <Mono key="b">draft · pending · approved · rejected</Mono>],
            ['Franchise', <Mono key="f">pending · approved · rejected · active · suspended · terminated</Mono>],
            ['Share holding', <Mono key="s">pending · confirmed · failed · refunded</Mono>],
            ['Investment round', <Mono key="i">draft · active · completed · cancelled</Mono>],
            ['Invoice', <Mono key="v">draft · sent · paid · overdue · cancelled</Mono>],
          ]}
        />
      </Section>

      <Section title="Glossary">
        <dl className="max-w-2xl divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
          {GLOSSARY.map((entry) => (
            <div key={entry.term} className="py-4">
              <dt className="font-semibold text-stone-900 dark:text-white mb-1">{entry.term}</dt>
              <dd className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="If a number here disagrees with the platform">
        <Callout kind="important" title="The legal documents govern">
          <p>
            These guides describe how the product works and are kept in step with it, but they are not the contract. The{' '}
            <Link href="/company/legal/terms" className="underline">
              Terms of Service
            </Link>
            ,{' '}
            <Link href="/company/legal/franchise" className="underline">
              Franchise Agreement
            </Link>{' '}
            and{' '}
            <Link href="/company/legal/funds" className="underline">
              Investment Policy
            </Link>{' '}
            govern where they disagree. If you spot a discrepancy, treat it as a bug and tell us.
          </p>
        </Callout>
      </Section>

      <NextUp links={docsLinks('/docs/payouts', '/docs/economics', '/docs/custody', '/docs')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27 · Figures derived from src/lib/platformEconomics.ts" />
    </article>
  )
}
