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
import { LIFECYCLE_STAGES } from '@/lib/platformEconomics'

export const metadata: Metadata = {
  title: 'For franchisees | Franchiseen docs',
  description:
    'How to apply for a franchise on Franchiseen, what happens during funding and setup, and how to run the location day to day.',
}

const SUB_STAGE_COPY: Record<string, string> = {
  contacting_property: 'The platform is in touch with the property owner for the site.',
  checking_location: 'The site is being assessed for suitability.',
  signing_agreement: 'The lease or property agreement is being signed.',
  collecting_investments: 'Investors are buying shares until the funding target is met.',
  transferring_fees: 'The franchise fee goes to the brand and setup funds are released.',
  setting_up: 'Design, fit-out, equipment, stock and hiring.',
  operational: 'Trading. Revenue is recorded and payouts run.',
  closing: 'Trading has stopped and remaining obligations are being settled.',
}

export default function FranchiseesDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="For franchisees"
        title="Running a franchise"
        intro="You operate a location without buying it outright. Investors fund the opening cost; you run the unit, record its revenue, and manage its stock, team and expenses through the platform."
      />

      <Section title="Applying">
        <Steps
          steps={[
            {
              title: 'Find a location',
              body: (
                <>
                  Browse the{' '}
                  <Link href="/marketplace" className="text-yellow-700 dark:text-yellow-500 underline">
                    marketplace
                  </Link>{' '}
                  for brands with locations open for applications.
                </>
              ),
            },
            {
              title: 'Submit an application',
              body: 'Your contact details and the specifics of the site you propose — address, building, floor area, and whether the property is already owned or needs to be leased.',
            },
            {
              title: 'Wait for approval',
              body: 'The brand owner and the Franchiseen team review it. An approved application creates the franchise and starts the funding stage.',
            },
          ]}
        />
        <Callout kind="note" title="If the property is not yours">
          <p>
            You can apply with a site you do not control. Provide the landlord contact and the platform handles the
            property conversation during the funding stage.
          </p>
        </Callout>
      </Section>

      <Section title="What happens before you open">
        <P>
          Your franchise moves through stages, and each has a sub-stage that tells you precisely what is being worked
          on. You can see this on your franchise page at any time.
        </P>
        {LIFECYCLE_STAGES.filter((s) => s.stage === 'funding' || s.stage === 'launching').map((stage) => (
          <SubSection key={stage.stage} title={`${stage.label} — ${stage.summary}`}>
            <DocTable
              columns={['Sub-stage', 'What is happening']}
              rows={stage.subStages.map((sub) => [<Mono key={sub}>{sub}</Mono>, SUB_STAGE_COPY[sub] ?? ''])}
            />
          </SubSection>
        ))}
        <Callout kind="important" title="Funding can take time, and may not complete">
          <p>
            Your franchise only opens once the full investment target is raised. Until then it sits in the funding
            stage. The target is the franchise fee plus setup cost plus working capital, all set by the brand owner.
          </p>
        </Callout>
      </Section>

      <Section title="Day-to-day operations">
        <P>
          Once you are trading, everything you need is on your franchise page. Each area feeds the numbers that decide
          what the franchise pays out.
        </P>

        <SubSection title="Point of sale">
          <P>
            Ring up sales against the product catalogue the brand owner defined. This is the revenue record — it is what
            payout runs are calculated from, so till accuracy directly determines what the brand, the platform, and the
            investors receive.
          </P>
        </SubSection>

        <SubSection title="Stock and inventory">
          <Bullets
            items={[
              'Track stock levels per product at your location.',
              'Request or receive stock transfers between locations under the same brand.',
              'Inventory movements are recorded against the franchise, not against you personally.',
            ]}
          />
        </SubSection>

        <SubSection title="Expenses and budgets">
          <P>
            Record operating expenses against the franchise and work within the budgets set for it. Expenses are paid
            from the franchise wallet, which is the same reserve the payout rule measures — spending it down lowers the
            reserve percentage and shifts more of the next payout back into the reserve rather than to investors.
          </P>
        </SubSection>

        <SubSection title="Team">
          <P>
            Add the people working at your location and their roles. A team member can be given <Mono>cashier</Mono>{' '}
            access to operate the till without seeing the rest of the franchise.
          </P>
        </SubSection>

        <SubSection title="Invoices">
          <P>
            Raise invoices from the franchise with line items, a due date, and a status that moves from draft through
            sent to paid.
          </P>
        </SubSection>
      </Section>

      <Section title="What the franchise owes">
        <P>
          You do not decide this — it runs automatically on each payout. Off the top of gross revenue comes the brand
          royalty and the platform fee. What remains is split between the franchise reserve and the investors who funded
          you, with the split depending on how well funded the reserve currently is.
        </P>
        <P>
          The practical consequence for you: a healthy reserve means more of the revenue reaches investors, and a
          depleted one means the franchise rebuilds its buffer first. The full rule is on{' '}
          <Link href="/docs/payouts" className="text-yellow-700 dark:text-yellow-500 underline">
            Ownership and payouts
          </Link>
          .
        </P>
      </Section>

      <NextUp links={docsLinks('/docs/payouts', '/docs/wallets', '/docs/economics', '/docs/reference')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
