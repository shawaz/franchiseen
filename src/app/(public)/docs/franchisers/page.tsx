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
import { DEFAULT_ROYALTY_PERCENT } from '@/lib/platformEconomics'

export const metadata: Metadata = {
  title: 'For brand owners | Franchiseen docs',
  description:
    'How to list a brand on Franchiseen, define locations and products, and set your franchise fee and royalty.',
}

export default function FranchisersDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="For brand owners"
        title="Listing your brand"
        intro="As a brand owner you publish what a franchise of your brand costs and where you want one. Investors fund it, a franchisee runs it, and you collect a royalty on its revenue without putting up the capital."
      />

      <Section title="What you are signing up for">
        <P>
          You are not selling your brand. You are publishing a template for a franchise location — its cost, its size,
          its products, its opening hours — and letting the platform raise the money to open it.
        </P>
        <P>In exchange you receive a royalty on the revenue of every franchise opened under your brand.</P>
      </Section>

      <Section title="Registering the brand">
        <Steps
          steps={[
            {
              title: 'Create the brand profile',
              body: 'Your brand name, a URL slug, a description, industry and category, logo, and interior images that show investors and franchisees what a location looks like.',
            },
            {
              title: 'Choose the operating model',
              body: (
                <>
                  <Mono>FOCO</Mono> (Franchise Owned, Company Operated) means the platform side runs the unit.{' '}
                  <Mono>FOFO</Mono> (Franchise Owned, Franchise Operated) means a franchisee runs it. This changes who
                  is accountable for day-to-day operations.
                </>
              ),
            },
            {
              title: 'Set your royalty percentage',
              body: (
                <>
                  Taken off gross revenue on every payout run. If you leave it unset, {DEFAULT_ROYALTY_PERCENT}% is
                  applied. See{' '}
                  <Link href="/docs/payouts" className="text-yellow-700 dark:text-yellow-500 underline">
                    Ownership and payouts
                  </Link>{' '}
                  for where it sits in the order of deductions.
                </>
              ),
            },
            {
              title: 'Declare the setup responsibility',
              body: 'Who designs and fits out a location — your team, Franchiseen, or design by you and fit-out by Franchiseen. This determines who is on the hook during the Launching stage.',
            },
            {
              title: 'Set opening hours',
              body: 'Trading days, start and end time, or a 24-hour flag. These drive the franchisee-facing operations tooling.',
            },
            {
              title: 'Submit for review',
              body: (
                <>
                  Your brand moves from <Mono>draft</Mono> to <Mono>pending</Mono>. The Franchiseen team reviews it and
                  either approves or rejects it. Only approved brands appear in the marketplace.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Defining locations">
        <P>
          A brand on its own cannot be funded. You add the specific locations you want opened, and each one becomes a
          franchise that investors can fund.
        </P>
        <P>
          For each location you set the area on a map, the required floor area in square feet, and the cost breakdown
          that becomes the funding target.
        </P>
        <SubSection title="The three numbers that set the funding target">
          <DocTable
            columns={['Component', 'What it covers']}
            rows={[
              [
                <strong key="a">Franchise fee</strong>,
                'What the franchise pays you up front for the right to trade under your brand.',
              ],
              [<strong key="b">Setup cost</strong>, 'Design, fit-out, and equipment for the unit.'],
              [
                <strong key="c">Working capital</strong>,
                'Cash the franchise holds to trade with. Also the benchmark the payout rule measures the reserve against, so this number keeps mattering after opening.',
              ],
            ]}
            caption="Together these make the total investment investors are asked to fund."
          />
          <Callout kind="important" title="Set working capital carefully">
            <p>
              Working capital is not only a startup number. After opening, the share of revenue paid to investors
              depends on the franchise reserve measured <em>as a percentage of working capital</em>. Set it too high and
              payouts to investors stay small for longer; set it too low and the franchise has no buffer. See{' '}
              <Link href="/docs/payouts" className="underline">
                Ownership and payouts
              </Link>
              .
            </p>
          </Callout>
        </SubSection>
      </Section>

      <Section title="Products">
        <P>
          Add the products a franchise of your brand sells, with categories and prices. These populate the point-of-sale
          system your franchisees use, so the catalogue you define here is what gets rung up at the till and what
          becomes recorded revenue.
        </P>
      </Section>

      <Section title="Reviewing applications">
        <P>
          When someone applies to operate one of your locations, the application arrives for review. You are assessing
          whether this person should run a unit under your brand.
        </P>
        <Bullets
          items={[
            'Applications carry the applicant contact details and their proposed location specifics.',
            'Approving an application moves the franchise into the funding process, after which investors can buy shares in it.',
            'Rejecting it leaves the location available for another applicant.',
          ]}
        />
      </Section>

      <Section title="What you receive, and when">
        <P>
          Your royalty is deducted from gross revenue on every payout run — before the platform fee, and before anything
          is split between the franchise reserve and investors. It transfers to your brand wallet each time a payout
          runs, whether that is daily or monthly for a given franchise.
        </P>
        <P>
          Because it comes off gross revenue rather than profit, you are paid on trading volume and not on whether the
          unit is profitable in that period.
        </P>
      </Section>

      <NextUp links={docsLinks('/docs/payouts', '/docs/economics', '/docs/wallets', '/docs/reference')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
