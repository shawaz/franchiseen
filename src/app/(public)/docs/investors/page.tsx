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

export const metadata: Metadata = {
  title: 'For investors | Franchiseen docs',
  description:
    'How to buy shares in a franchise on Franchiseen, what a share entitles you to, and how payouts reach you.',
}

export default function InvestorsDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="For investors"
        title="Investing in a franchise"
        intro="You fund part of the cost of opening a specific franchise location and receive a proportional share of the revenue it distributes. Your return depends on that one unit trading well."
      />

      <Section title="What a share is">
        <P>
          A franchise raises a fixed total and issues a fixed number of shares against it. Buying shares gives you a
          claim on a proportion of what that franchise later distributes, equal to your shares divided by all shares
          held.
        </P>
        <DocTable
          columns={['Term', 'Meaning']}
          rows={[
            [
              <strong key="a">Share price</strong>,
              'The fixed price per share for this franchise, set when the listing is created.',
            ],
            [<strong key="b">Shares issued</strong>, 'The total number of shares that exist for this franchise.'],
            [
              <strong key="c">Shares purchased</strong>,
              'How many have been sold so far. Funding completes when this reaches shares issued.',
            ],
            [<strong key="d">Minimum investment</strong>, 'The smallest amount you can put in. Set per franchise.'],
            [
              <strong key="e">Maximum investment</strong>,
              'An optional per-investor cap, so a single investor cannot take the whole listing.',
            ],
          ]}
        />
        <Callout kind="important" title="A share is not a tradeable token you can sell on an exchange">
          <p>
            Your holding is a record against a specific franchise. There is no secondary market on the platform — do not
            assume you can exit a position by selling it to someone else. Treat an investment as illiquid unless the
            franchise documents for that listing say otherwise.
          </p>
        </Callout>
      </Section>

      <Section title="Making an investment">
        <Steps
          steps={[
            {
              title: 'Find a franchise in the funding stage',
              body: (
                <>
                  Only franchises still raising accept investment. The{' '}
                  <Link href="/marketplace" className="text-yellow-700 dark:text-yellow-500 underline">
                    marketplace
                  </Link>{' '}
                  shows each listing with its target, its progress, and its location.
                </>
              ),
            },
            {
              title: 'Read the listing',
              body: 'The brand, the specific location and floor area, the total investment required, and the breakdown between franchise fee, setup cost and working capital.',
            },
            {
              title: 'Choose how much to invest',
              body: 'Between the minimum and any maximum for that listing. Your amount divided by the share price gives your shares.',
            },
            {
              title: 'Pay',
              body: (
                <>
                  Card payments are handled by Stripe. See{' '}
                  <Link href="/docs/wallets" className="text-yellow-700 dark:text-yellow-500 underline">
                    Wallets and payments
                  </Link>
                  .
                </>
              ),
            },
            {
              title: 'Your holding is confirmed',
              body: (
                <>
                  A purchase starts as <Mono>pending</Mono> and becomes <Mono>confirmed</Mono> once payment settles.
                  Only confirmed holdings count when a payout is calculated.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section title="What happens after funding completes">
        <P>
          Once the target is met the franchise leaves the funding stage. The franchise fee is transferred to the brand,
          setup funds are released, and the unit is built out and opened. This takes time and the length depends on the
          site.
        </P>
        <P>
          You are not paid during this period. Payouts begin only once the franchise is trading and recording revenue.
        </P>
      </Section>

      <Section title="How you get paid">
        <P>
          When a payout runs for a period, the brand royalty and platform fee come off gross revenue first. What remains
          is split between the franchise reserve and token holders, with the proportion set by how well funded the
          reserve currently is. The token-holder portion is then divided across all confirmed shares.
        </P>
        <DocTable
          columns={['Step', 'Calculation']}
          rows={[
            ['Payout per share', 'Amount allocated to token holders ÷ total confirmed shares'],
            ['Your payout', 'Payout per share × your shares'],
            ['Your ownership percentage', 'Your shares ÷ total confirmed shares × 100'],
          ]}
          caption="Every payout is recorded per shareholder, so you can reconcile any individual run."
        />
        <P>
          Payouts run either daily or monthly depending on the franchise. The exact tiers, and a worked example with
          numbers, are on{' '}
          <Link href="/docs/payouts" className="text-yellow-700 dark:text-yellow-500 underline">
            Ownership and payouts
          </Link>
          .
        </P>
        <Callout kind="risk" title="What can go wrong">
          <p>
            A franchise that trades poorly distributes little or nothing. A franchise whose reserve is depleted sends
            most of its net revenue back into the reserve rather than to you. A franchise can be suspended, terminated,
            or closed.
          </p>
          <p>
            Your exposure is to one location, not a diversified portfolio. Do not invest money you cannot afford to
            lose, and read the{' '}
            <Link href="/company/legal/funds" className="underline">
              Investment Policy
            </Link>{' '}
            before committing.
          </p>
        </Callout>
      </Section>

      <Section title="Tracking your position">
        <P>
          Your account shows each franchise you hold shares in, how many shares, your percentage, and the history of
          payouts you have received. Individual payout records include the period, the rule that applied, and the
          reserve balance before and after.
        </P>
      </Section>

      <NextUp links={docsLinks('/docs/payouts', '/docs/economics', '/docs/custody', '/docs/wallets')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
