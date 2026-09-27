import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  DocHeader,
  Section,
  SubSection,
  P,
  Bullets,
  Callout,
  DocTable,
  Mono,
  NextUp,
  VerifiedAgainst,
} from '@/components/docs/doc-ui'
import { docsLinks } from '@/components/docs/docsNavigation'
import { PLATFORM_FEE_PERCENT, DEFAULT_ROYALTY_PERCENT, LIFECYCLE_STAGES } from '@/lib/platformEconomics'

export const metadata: Metadata = {
  title: 'Franchise unit economics | Franchiseen docs',
  description:
    'What it costs to open a franchise on Franchiseen, how the funding target is built from three components, and what each party earns.',
}

export default function EconomicsDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="Investors and partners"
        title="Franchise unit economics"
        intro="Every franchise on the platform is funded as a single unit with its own target, its own shares, and its own reserve. This page explains how that target is built and who earns what from it."
      />

      <Section title="A franchise is funded as one unit">
        <P>
          Franchiseen does not pool capital into a fund. Each franchise location raises its own total, issues its own
          shares, and holds its own wallet. An investment is in one specific location of one specific brand — not in the
          brand, and not in the platform.
        </P>
        <P>
          This is the single most important structural fact for an investor: there is no diversification unless you
          build it yourself by investing across several listings.
        </P>
      </Section>

      <Section title="What makes up the funding target">
        <P>
          The brand owner sets three figures per location. Their sum is the total investment investors are asked to
          fund.
        </P>
        <DocTable
          columns={['Component', 'Paid to', 'When it leaves', 'Recoverable?']}
          rows={[
            [
              <strong key="a">Franchise fee</strong>,
              'The brand owner',
              'On transition out of funding',
              'No — it is a fee for the right to trade under the brand.',
            ],
            [
              <strong key="b">Setup cost</strong>,
              'Design, fit-out and equipment',
              'During the launching stage',
              'Converted into the physical unit, not held as cash.',
            ],
            [
              <strong key="c">Working capital</strong>,
              'Retained by the franchise',
              'Stays in the franchise wallet',
              'Held as the reserve the franchise trades on.',
            ],
          ]}
        />
        <Callout kind="important" title="Only one of the three stays as cash">
          <p>
            The franchise fee and setup cost are spent to bring the unit into existence. Working capital is the only
            component that remains as a balance — and that balance is what the payout rule measures. A listing with a
            large fee and a thin working capital allocation will begin trading with a low reserve percentage, which
            means investors receive a smaller share of early revenue.
          </p>
        </Callout>
      </Section>

      <Section title="Shares and pricing">
        <P>
          Each franchise issues a fixed number of shares at a fixed price. Funding completes when shares purchased reach
          shares issued. Listings can also set a minimum investment, and optionally a maximum per investor so a single
          participant cannot absorb the whole raise.
        </P>
        <DocTable
          columns={['Quantity', 'Definition']}
          rows={[
            ['Total investment', 'Franchise fee + setup cost + working capital'],
            ['Shares issued', 'The fixed share count created for the franchise'],
            ['Share price', 'Fixed per listing; your shares = amount invested ÷ share price'],
            ['Funding progress', 'Shares purchased ÷ shares issued'],
          ]}
        />
      </Section>

      <Section title="Who earns what">
        <P>
          Once the franchise trades, revenue is divided between four parties. Three of them are paid before investors.
        </P>
        <DocTable
          columns={['Party', 'What they receive', 'Basis']}
          rows={[
            [
              <strong key="a">Brand owner</strong>,
              `Royalty on gross revenue (${DEFAULT_ROYALTY_PERCENT}% where unset)`,
              'Revenue — paid regardless of profitability',
            ],
            [
              <strong key="b">Franchiseen</strong>,
              `Platform fee of ${PLATFORM_FEE_PERCENT}% of gross revenue`,
              'Revenue — paid regardless of profitability',
            ],
            [
              <strong key="c">The franchise reserve</strong>,
              'A share of net revenue, larger when the reserve is low',
              'Net revenue, by reserve tier',
            ],
            [
              <strong key="d">Investors</strong>,
              'The remainder of net revenue, pro rata to confirmed shares',
              'Net revenue, by reserve tier',
            ],
          ]}
          caption="Investors are paid last, from what remains after fees and reserve replenishment."
        />
        <P>
          The exact split, and a worked example with figures, is on{' '}
          <Link href="/docs/payouts" className="text-yellow-700 dark:text-yellow-500 underline">
            Ownership and payouts
          </Link>
          .
        </P>
      </Section>

      <Section title="The timeline of an investment">
        <DocTable
          columns={['Stage', 'What happens to your money', 'Are you paid?']}
          rows={LIFECYCLE_STAGES.map((stage) => {
            const cashflow: Record<string, string> = {
              funding: 'Held while the raise completes.',
              launching: 'Fee paid to the brand; setup funds spent on the build-out.',
              ongoing: 'Working capital is in use as the trading reserve.',
              closed: 'Remaining obligations are settled.',
            }
            const paid: Record<string, string> = {
              funding: 'No',
              launching: 'No',
              ongoing: 'Yes — on the franchise’s cadence',
              closed: 'No',
            }
            return [<strong key={stage.stage}>{stage.label}</strong>, cashflow[stage.stage], paid[stage.stage]]
          })}
        />
        <P>
          There is no payout during funding or launching. The gap between investing and the first distribution is the
          length of the raise plus the build-out, and it varies by site.
        </P>
      </Section>

      <Section title="Liquidity">
        <Callout kind="risk" title="Assume an investment is illiquid">
          <p>
            The platform does not operate a secondary market. A holding is a record against one franchise; there is no
            mechanism on Franchiseen for selling it to another investor. Refunds exist as an operational process, not as
            an exit route you can rely on.
          </p>
          <p>
            Plan on holding for the life of the franchise, and read the{' '}
            <Link href="/company/legal/funds" className="underline">
              Investment Policy
            </Link>{' '}
            for the terms that govern this.
          </p>
        </Callout>
      </Section>

      <NextUp links={docsLinks('/docs/payouts', '/docs/custody', '/docs/investors', '/docs/reference')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
