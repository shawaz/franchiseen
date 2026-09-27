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
  title: 'Wallets and payments | Franchiseen docs',
  description:
    'How money moves on Franchiseen: card payments through Stripe, the wallets held for each brand and franchise, and what each balance means.',
}

export default function WalletsDocsPage() {
  return (
    <article>
      <DocHeader
        eyebrow="Wallets and payments"
        title="How money moves"
        intro="Payments on Franchiseen are card payments processed by Stripe. Each brand and each franchise has a wallet on the platform that records what it has received, spent and paid out."
      />

      <Section title="Paying in">
        <P>
          Investments and top-ups are taken as card payments through Stripe. You do not need a crypto wallet, a browser
          extension, or a seed phrase to use Franchiseen.
        </P>
        <Steps
          steps={[
            {
              title: 'You start a payment',
              body: 'Choosing an amount creates a Stripe payment intent for that exact figure.',
            },
            {
              title: 'Stripe takes the card details',
              body: 'Card details go to Stripe directly. Franchiseen never receives or stores your card number.',
            },
            {
              title: 'The payment is confirmed',
              body: (
                <>
                  Stripe notifies the platform. Your holding moves from <Mono>pending</Mono> to <Mono>confirmed</Mono>{' '}
                  and the receiving wallet balance is updated.
                </>
              ),
            },
          ]}
        />
        <Callout kind="note" title="Currency">
          <p>
            Payments are currently processed in Indian rupees (INR), charged in the smallest unit. A franchise listing
            also carries its local currency for display, set from the location country.
          </p>
        </Callout>
      </Section>

      <Section title="The wallets on the platform">
        <DocTable
          columns={['Wallet', 'Belongs to', 'What flows through it']}
          rows={[
            [
              <strong key="a">Franchise wallet</strong>,
              'One specific franchise location',
              'Revenue in, operating expenses out, royalties and payouts out. Its balance is the franchise reserve.',
            ],
            [
              <strong key="b">Brand wallet</strong>,
              'A brand owner',
              'Franchise fees and royalties received from every franchise under that brand.',
            ],
            [<strong key="c">Platform account</strong>, 'Franchiseen', 'Platform fees recorded as company income.'],
          ]}
        />
        <P>
          Every movement is written as a transaction record against the relevant wallet, so a balance can always be
          reconciled against the entries that produced it.
        </P>
      </Section>

      <Section title="The franchise reserve">
        <P>
          The franchise wallet balance is not idle cash — it is the number the payout rule measures. Before each payout
          the platform compares it against the working capital requirement for that franchise, and the resulting
          percentage decides how much of that period's net revenue reaches investors rather than staying in the reserve.
        </P>
        <P>
          This is the one balance worth watching if you are an investor in a franchise or the franchisee running it.
          Expenses paid from this wallet lower it, and a lower reserve means a larger share of the next payout is
          retained rather than distributed. The tiers are set out on{' '}
          <Link href="/docs/payouts" className="text-yellow-700 dark:text-yellow-500 underline">
            Ownership and payouts
          </Link>
          .
        </P>
      </Section>

      <Section title="Refunds">
        <P>
          A share purchase can be refunded. The holding status becomes <Mono>refunded</Mono> and the refund is recorded
          against it with its own timestamp, so a refunded holding remains auditable rather than disappearing. Refunded
          holdings do not count toward payouts.
        </P>
      </Section>

      <Section title="What is recorded, and what you can verify">
        <P>
          Wallet balances, transactions, payouts and per-shareholder payout records are maintained by Franchiseen in the
          platform database. You can see the full history for anything you hold from your account.
        </P>
        <Callout
          kind="important"
          title="Balances are platform records, not independently verifiable on a public ledger"
        >
          <p>
            Franchiseen&apos;s payment and ledger layer runs on Stripe and the platform database. Money movements
            between wallets are recorded by the platform, and verifying them means relying on the platform&apos;s
            records and on Stripe&apos;s records of the card payments.
          </p>
          <p>
            If you have seen older material describing on-chain settlement or transaction hashes viewable in a
            blockchain explorer, it does not describe how the platform works today. See{' '}
            <Link href="/docs/custody" className="underline">
              Fund custody and controls
            </Link>{' '}
            for what this means for you.
          </p>
        </Callout>
      </Section>

      <NextUp links={docsLinks('/docs/custody', '/docs/payouts', '/docs/investors', '/docs/reference')} />
      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
