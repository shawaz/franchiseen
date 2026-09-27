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

export const metadata: Metadata = {
  title: 'Fund custody and controls | Franchiseen docs',
  description:
    'Who holds funds on Franchiseen, who can move them, what is recorded, and what an investor can and cannot independently verify.',
}

export default function CustodyDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="Investors and partners"
        title="Fund custody and controls"
        intro="Where your money sits, who is able to move it, and what you can check for yourself. This page states the arrangement plainly, including the parts an investor should ask further questions about."
      />

      <Section title="Who processes payments">
        <P>
          Card payments are processed by <strong>Stripe</strong>. Card details are collected by Stripe and are not
          received or stored by Franchiseen. Stripe holds its own independent record of every card payment you make,
          which is the one part of the flow you can verify without relying on Franchiseen.
        </P>
        <P>Brand owners and franchise wallets are associated with Stripe Connect accounts for receiving funds.</P>
      </Section>

      <Section title="Who holds the balances">
        <P>
          Wallet balances, transaction histories, payout runs and per-shareholder payout records are maintained by
          Franchiseen in the platform database. A franchise wallet balance is a platform record of what that franchise
          is entitled to, maintained by Franchiseen.
        </P>
        <DocTable
          columns={['What', 'Held by', 'Independently verifiable by you?']}
          rows={[
            ['Your card payment', 'Stripe', 'Yes — through your own Stripe receipt and card statement'],
            [
              'Your share holding',
              'Franchiseen platform records',
              'No — visible in your account, maintained by the platform',
            ],
            ['Franchise wallet balance', 'Franchiseen platform records', 'No'],
            [
              'Payout calculation and history',
              'Franchiseen platform records',
              'No — but each run is itemised per shareholder',
            ],
          ]}
        />
      </Section>

      <Section title="What is recorded for every movement">
        <P>
          The platform is built so that no balance changes without a corresponding record. This is what makes a payout
          reconcilable after the fact.
        </P>
        <Bullets
          items={[
            'Each payout run stores the period, the gross revenue, the royalty and platform fee amounts, the distribution rule that applied, and the reserve balance both before and after.',
            'Each shareholder receives an individual payout record with their share count and their percentage of the total.',
            'Royalties are recorded as brand wallet transactions; platform fees are recorded as company income.',
            'Share purchases carry a status — pending, confirmed, failed or refunded — and refunds are recorded against the original holding rather than deleting it.',
          ]}
        />
        <P>
          The practical effect: if you hold shares, you can take any individual payout and check that the arithmetic
          matches the published rule on{' '}
          <Link href="/docs/payouts" className="text-yellow-700 dark:text-yellow-500 underline">
            Ownership and payouts
          </Link>
          . That is a meaningful check, and it is the one we recommend you actually perform.
        </P>
      </Section>

      <Section title="Who can move funds">
        <P>
          Payout runs and wallet operations are performed by the platform. Administrative access is role-based, with{' '}
          <Mono>super_admin</Mono>, <Mono>admin</Mono> and <Mono>manager</Mono> levels, and brand owners and franchisees
          see only their own brand or location.
        </P>
        <Callout kind="important" title="Franchiseen operates the ledger it also records">
          <p>
            Franchiseen calculates payouts, holds the balance records, and administers the accounts. There is no
            third-party custodian standing between the platform and the recorded balances, and no on-chain settlement
            that would let you confirm a transfer independently.
          </p>
          <p>
            This is a normal arrangement for a platform of this kind, but it means your protection comes from the legal
            agreements and from the platform&apos;s own controls rather than from cryptographic proof. Read the{' '}
            <Link href="/company/legal/funds" className="underline">
              Investment Policy
            </Link>{' '}
            and{' '}
            <Link href="/company/legal/terms" className="underline">
              Terms of Service
            </Link>{' '}
            on that basis.
          </p>
        </Callout>
      </Section>

      <Section title="On blockchain settlement">
        <Callout kind="risk" title="Earlier descriptions of on-chain settlement do not describe the platform today">
          <p>
            Franchiseen previously used Solana for wallet generation and transfers. That layer has been replaced by
            Stripe. Payments, balances and payouts are handled through Stripe and the platform database.
          </p>
          <p>
            If you encounter older Franchiseen material describing tokenized on-chain ownership, real wallet generation,
            or transaction hashes viewable in a blockchain explorer, treat it as out of date. Ownership records are
            platform records. Where a page still offers a blockchain explorer link, it is a remnant of the previous
            implementation and should not be relied on as verification.
          </p>
        </Callout>
        <P>
          We would rather state this plainly than let a reader assume a guarantee that is not there. If on-chain
          settlement matters to your decision, ask before investing rather than inferring it from older material.
        </P>
      </Section>

      <Section title="Questions worth asking before you invest">
        <P>
          These are not answered by the product itself, and an investor is entitled to ask them of the company directly.
        </P>
        <Bullets
          items={[
            'Are investor funds held in an account segregated from Franchiseen’s operating funds, and where?',
            'What happens to the working capital held in a franchise wallet if Franchiseen ceases to operate?',
            'Who is entitled to what if a franchise is suspended or terminated mid-life?',
            'Is the payout ledger subject to any external audit?',
            'What is the refund position once funding has completed and the franchise fee has been paid out?',
          ]}
        />
        <P>
          The entity you are contracting with is the one named in the{' '}
          <Link href="/company/legal/terms" className="text-yellow-700 dark:text-yellow-500 underline">
            Terms of Service
          </Link>
          , which is the governing document.
        </P>
      </Section>

      <NextUp links={docsLinks('/docs/payouts', '/docs/economics', '/docs/wallets', '/docs/reference')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
