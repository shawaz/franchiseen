import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  DocHeader,
  Section,
  SubSection,
  P,
  Bullets,
  Steps,
  Callout,
  DocTable,
  Mono,
  NextUp,
  VerifiedAgainst,
} from '@/components/docs/doc-ui'
import { docsLinks } from '@/components/docs/docsNavigation'
import {
  PLATFORM_FEE_PERCENT,
  DEFAULT_ROYALTY_PERCENT,
  RESERVE_TIERS,
  calculateExamplePayout,
} from '@/lib/platformEconomics'

const EXAMPLE = {
  grossRevenue: 100_000,
  royaltyPercent: DEFAULT_ROYALTY_PERCENT,
  walletBalance: 120_000,
  workingCapital: 300_000,
}

const result = calculateExamplePayout(EXAMPLE)

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const metadata: Metadata = {
  title: 'Ownership and payouts | Franchiseen docs',
  description:
    'The full fee stack and the reserve-tiered distribution rule that decides how much of a franchise’s revenue reaches investors, with a worked example.',
}

export default function PayoutsDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="Investors and partners"
        title="Ownership and payouts"
        intro="This is the complete rule that decides what a franchise pays its investors. Every number on this page is the number the platform actually applies."
      />

      <Section title="The order of deductions">
        <P>
          A payout run starts from the gross revenue a franchise recorded for a period. Three things happen to it, in
          this order. The order matters, because each step operates on what the previous step left.
        </P>
        <Steps
          steps={[
            {
              title: `Brand royalty comes off gross revenue`,
              body: (
                <>
                  Set by the brand owner. Where they have not set a rate, {DEFAULT_ROYALTY_PERCENT}% applies. This is
                  charged on revenue, not on profit — the brand is paid whether or not the unit made money that period.
                </>
              ),
            },
            {
              title: `Platform fee of ${PLATFORM_FEE_PERCENT}% comes off gross revenue`,
              body: 'Franchiseen’s fee for operating the platform. Also charged on revenue rather than profit.',
            },
            {
              title: 'What remains is net revenue, and it is split',
              body: 'Net revenue is divided between the franchise reserve and the investors, using the tier rule below. Investors are paid from this step only.',
            },
          ]}
        />
        <Callout kind="important" title="Operating costs are not deducted here">
          <p>
            This calculation runs on revenue, not on profit. A franchise&apos;s rent, wages, and stock are paid
            separately from its wallet — which is the same balance the reserve tier measures. So operating costs affect
            what you receive indirectly, by lowering the reserve percentage and pushing more of the next payout back
            into the reserve.
          </p>
        </Callout>
      </Section>

      <Section title="The reserve tier rule">
        <P>
          How much of net revenue reaches investors depends on how well funded the franchise is at that moment. The
          platform takes the franchise wallet balance as a percentage of the franchise&apos;s working capital
          requirement, and reads the split from that.
        </P>
        <DocTable
          columns={['Reserve as % of working capital', 'To investors', 'To reserve', 'Rule name']}
          rows={RESERVE_TIERS.map((tier) => [
            <strong key={tier.rule}>{tier.band}</strong>,
            `${tier.toTokenHolders}%`,
            `${tier.toReserve}%`,
            tier.rule,
          ])}
          caption="Applied to net revenue, after the royalty and platform fee have been deducted."
        />
        <P>
          The logic is that an under-funded franchise rebuilds its buffer before paying out, and a fully funded one
          distributes everything. A franchise at or above 75% of its working capital requirement pays investors 100% of
          net revenue.
        </P>
      </Section>

      <Section title="How your share is calculated">
        <DocTable
          columns={['Quantity', 'Formula']}
          rows={[
            ['Payout per share', 'Amount to investors ÷ total confirmed shares'],
            ['Your payout', 'Payout per share × your confirmed shares'],
            ['Your ownership percentage', 'Your confirmed shares ÷ total confirmed shares × 100'],
          ]}
        />
        <P>
          Only holdings in the <Mono>confirmed</Mono> state are counted. Pending and refunded holdings are excluded from
          both the total and the distribution.
        </P>
      </Section>

      <Section title="A worked example">
        <P>
          A franchise records {money(EXAMPLE.grossRevenue)} of revenue for a period. Its brand charges a{' '}
          {EXAMPLE.royaltyPercent}% royalty. Its working capital requirement is {money(EXAMPLE.workingCapital)} and its
          wallet currently holds {money(EXAMPLE.walletBalance)}.
        </P>
        <DocTable
          columns={['Step', 'Amount']}
          rows={[
            ['Gross revenue recorded', <strong key="g">{money(EXAMPLE.grossRevenue)}</strong>],
            [`Less brand royalty (${EXAMPLE.royaltyPercent}%)`, `− ${money(result.royalty)}`],
            [`Less platform fee (${PLATFORM_FEE_PERCENT}%)`, `− ${money(result.platformFee)}`],
            ['Net revenue', <strong key="n">{money(result.netRevenue)}</strong>],
            [
              'Reserve position',
              `${money(EXAMPLE.walletBalance)} of ${money(EXAMPLE.workingCapital)} = ${result.reservePercent.toFixed(0)}%`,
            ],
            [
              'Tier that applies',
              <strong key="t">
                {result.tier.rule} — {result.tier.toTokenHolders}% to investors
              </strong>,
            ],
            ['To investors', <strong key="i">{money(result.toTokenHolders)}</strong>],
            ['Retained in reserve', money(result.toReserve)],
          ]}
          caption={`At a ${result.reservePercent.toFixed(0)}% reserve, investors receive ${((result.toTokenHolders / EXAMPLE.grossRevenue) * 100).toFixed(1)}% of gross revenue for this period.`}
        />
        <P>
          If the same franchise had held {money(EXAMPLE.workingCapital * 0.8)} in its wallet instead, it would sit in
          the <strong>{RESERVE_TIERS[RESERVE_TIERS.length - 1].rule}</strong> tier and the whole{' '}
          {money(result.netRevenue)} of net revenue would go to investors.
        </P>
      </Section>

      <Section title="Cadence">
        <P>
          A payout run covers a stated period and is recorded as either daily or monthly for that franchise. Each run
          stores the rule that applied, the reserve balance before and after, and a record per shareholder — so any
          individual payout can be reconciled afterwards.
        </P>
      </Section>

      <Section title="What this rule does not promise">
        <Callout kind="risk" title="Revenue-dependent, single-location, and not guaranteed">
          <p>
            Every figure above is a share of revenue that a franchise actually records. A franchise that trades poorly
            distributes proportionally little; one that records no revenue distributes nothing. The tier rule governs
            how revenue is split, not whether there is any.
          </p>
          <p>
            Your exposure is to one location. Read the{' '}
            <Link href="/company/legal/funds" className="underline">
              Investment Policy
            </Link>{' '}
            and{' '}
            <Link href="/company/legal/franchise" className="underline">
              Franchise Agreement
            </Link>{' '}
            before investing.
          </p>
        </Callout>
      </Section>

      <NextUp links={docsLinks('/docs/economics', '/docs/custody', '/docs/investors', '/docs/reference')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27 · Figures derived from src/lib/platformEconomics.ts" />
    </article>
  )
}
