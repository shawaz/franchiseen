import React from 'react'
import Link from 'next/link'
import {
  DocHeader,
  Section,
  P,
  Bullets,
  Steps,
  Callout,
  DocTable,
  Mono,
  VerifiedAgainst,
} from '@/components/docs/doc-ui'
import { DOCS_GROUPS } from '@/components/docs/docsNavigation'
import { LIFECYCLE_STAGES } from '@/lib/platformEconomics'

export default function DocsIndexPage() {
  return (
    <article>
      <DocHeader
        eyebrow="Getting started"
        title="Franchiseen documentation"
        intro="Franchiseen splits the cost of opening a franchise across many investors, then pays them a share of what the franchise earns. These guides explain how that works, whichever side of it you are on."
      />

      <Section title="The three roles">
        <P>
          Every account on Franchiseen acts in one or more of three roles. Which guide you want depends on which of
          these describes you.
        </P>
        <DocTable
          columns={['Role', 'What you do', 'Start here']}
          rows={[
            [
              <strong key="a">Brand owner</strong>,
              'You own a brand and want it opened in new locations without funding each one yourself.',
              <Link key="a2" href="/docs/franchisers" className="text-yellow-700 dark:text-yellow-500 underline">
                For brand owners
              </Link>,
            ],
            [
              <strong key="b">Franchisee</strong>,
              'You want to operate a franchise location day to day.',
              <Link key="b2" href="/docs/franchisees" className="text-yellow-700 dark:text-yellow-500 underline">
                For franchisees
              </Link>,
            ],
            [
              <strong key="c">Investor</strong>,
              'You want to put money into a franchise and earn a share of its revenue.',
              <Link key="c2" href="/docs/investors" className="text-yellow-700 dark:text-yellow-500 underline">
                For investors
              </Link>,
            ],
          ]}
        />
        <P>
          The roles are not exclusive. A brand owner can invest in their own franchises, and a franchisee can hold
          shares in the location they run.
        </P>
      </Section>

      <Section title="How a franchise comes to exist">
        <P>
          Every franchise on the platform moves through the same four stages in order. Knowing which stage a listing is
          in tells you what can happen to it next.
        </P>
        <Steps
          steps={LIFECYCLE_STAGES.map((stage) => ({
            title: stage.label,
            body: stage.summary,
          }))}
        />
        <P>
          A listing in <strong>Funding</strong> is still raising money and has not opened. A listing in{' '}
          <strong>Ongoing</strong> is trading and paying out. Only franchises in Funding accept new investment.
        </P>
      </Section>

      <Section title="Setting up your account">
        <Steps
          steps={[
            {
              title: 'Create an account',
              body: (
                <>
                  Sign up from the <Mono>Sign in</Mono> button in the header. You can browse the marketplace and read
                  these docs without an account, but you need one to invest, apply, or list a brand.
                </>
              ),
            },
            {
              title: 'A wallet is created for you',
              body: (
                <>
                  You do not need to install anything or manage a seed phrase. See{' '}
                  <Link href="/docs/wallets" className="text-yellow-700 dark:text-yellow-500 underline">
                    Wallets and payments
                  </Link>{' '}
                  for what the wallet holds and who controls it.
                </>
              ),
            },
            {
              title: 'Choose what you are here to do',
              body: 'Register a brand, apply for a franchise, or browse the marketplace and invest.',
            },
          ]}
        />
      </Section>

      <Section title="All documentation">
        <div className="space-y-8 max-w-2xl">
          {DOCS_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">
                {group.label}
              </h3>
              {group.blurb ? (
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">{group.blurb}</p>
              ) : (
                <div className="mb-3" />
              )}
              <ul className="divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
                {group.links
                  .filter((link) => link.href !== '/docs')
                  .map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="group flex flex-col gap-0.5 py-3">
                        <span className="font-semibold text-stone-900 dark:text-white group-hover:text-yellow-600">
                          {link.title}
                        </span>
                        <span className="text-sm text-stone-500 dark:text-stone-400">{link.description}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="What these docs are not">
        <Callout kind="important" title="Read the legal documents too">
          <p>
            These guides describe how the product works. They are not an offer, a prospectus, or investment advice, and
            they do not override the{' '}
            <Link href="/company/legal/terms" className="underline">
              Terms of Service
            </Link>
            ,{' '}
            <Link href="/company/legal/franchise" className="underline">
              Franchise Agreement
            </Link>{' '}
            or{' '}
            <Link href="/company/legal/funds" className="underline">
              Investment Policy
            </Link>
            . Where a guide and a legal document disagree, the legal document governs.
          </p>
          <p>
            Investing in a franchise can lose money. Payouts depend on the franchise earning revenue, and nothing on
            this platform guarantees a return.
          </p>
        </Callout>
      </Section>

      <VerifiedAgainst note="Verified against commit 8232b15 · 2026-09-27" />
    </article>
  )
}
