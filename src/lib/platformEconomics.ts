/**
 * Single source of truth for the fee and payout numbers shown in public docs.
 *
 * IMPORTANT: these values currently mirror literals in the backend.
 *   - DEFAULT_ROYALTY_PERCENT  -> convex/payoutManagement.ts (royaltyPercentage fallback)
 *   - PLATFORM_FEE_PERCENT     -> convex/payoutManagement.ts (platformFeePercentage)
 *   - RESERVE_TIERS            -> convex/payoutManagement.ts (calculatePayoutDistribution)
 *
 * If you change a number in the backend, change it here in the same pull request.
 * Nothing enforces that automatically yet.
 */

/** Platform fee taken from gross revenue on every payout run. */
export const PLATFORM_FEE_PERCENT = 2

/** Royalty paid to the brand when a franchiser has not set its own rate. */
export const DEFAULT_ROYALTY_PERCENT = 5

export interface ReserveTier {
  /** Human-readable reserve band, as a share of required working capital. */
  band: string
  /** Lower bound of the band, inclusive (percent of working capital). */
  from: number
  /** Upper bound of the band, exclusive. null means unbounded. */
  to: number | null
  /** Percent of net revenue paid out to token holders in this band. */
  toTokenHolders: number
  /** Percent of net revenue retained in the franchise reserve. */
  toReserve: number
  /** Rule name used in the backend and in payout records. */
  rule: string
}

/**
 * How net revenue is split between token holders and the franchise reserve.
 * The band is chosen from the franchise wallet balance as a percentage of the
 * working capital requirement, so an under-funded franchise refills its reserve
 * first and a fully funded one distributes everything.
 */
export const RESERVE_TIERS: ReserveTier[] = [
  { band: 'Below 25%', from: 0, to: 25, toTokenHolders: 25, toReserve: 75, rule: 'Critical Reserve' },
  { band: '25% to 50%', from: 25, to: 50, toTokenHolders: 50, toReserve: 50, rule: 'Low Reserve' },
  { band: '50% to 75%', from: 50, to: 75, toTokenHolders: 75, toReserve: 25, rule: 'Building Reserve' },
  { band: '75% and above', from: 75, to: null, toTokenHolders: 100, toReserve: 0, rule: 'Full Reserve' },
]

/** Payout cadences the backend accepts for a revenue period. */
export const PAYOUT_CADENCES = ['daily', 'monthly'] as const

/** Franchise lifecycle stages, in order. */
export const LIFECYCLE_STAGES = [
  {
    stage: 'funding',
    label: 'Funding',
    summary: 'The location is secured and investors buy shares until the target is reached.',
    subStages: ['contacting_property', 'checking_location', 'signing_agreement', 'collecting_investments'],
  },
  {
    stage: 'launching',
    label: 'Launching',
    summary: 'Fees are transferred, the unit is built out and fitted, and the team is hired.',
    subStages: ['transferring_fees', 'setting_up'],
  },
  {
    stage: 'ongoing',
    label: 'Ongoing',
    summary: 'The franchise trades. Revenue is recorded and payouts run on the chosen cadence.',
    subStages: ['operational'],
  },
  {
    stage: 'closed',
    label: 'Closed',
    summary: 'Trading has stopped and remaining obligations are settled.',
    subStages: ['closing'],
  },
] as const

/**
 * Worked example used in the investor docs. Kept here so the arithmetic shown
 * on the page is derived, never typed by hand.
 */
export function calculateExamplePayout(params: {
  grossRevenue: number
  royaltyPercent: number
  walletBalance: number
  workingCapital: number
}) {
  const { grossRevenue, royaltyPercent, walletBalance, workingCapital } = params

  const royalty = (grossRevenue * royaltyPercent) / 100
  const platformFee = (grossRevenue * PLATFORM_FEE_PERCENT) / 100
  const netRevenue = grossRevenue - royalty - platformFee

  const reservePercent = workingCapital > 0 ? (walletBalance / workingCapital) * 100 : 0
  const tier =
    RESERVE_TIERS.find((t) => reservePercent >= t.from && (t.to === null || reservePercent < t.to)) ??
    RESERVE_TIERS[RESERVE_TIERS.length - 1]

  return {
    royalty,
    platformFee,
    netRevenue,
    reservePercent,
    tier,
    toTokenHolders: (netRevenue * tier.toTokenHolders) / 100,
    toReserve: (netRevenue * tier.toReserve) / 100,
  }
}
