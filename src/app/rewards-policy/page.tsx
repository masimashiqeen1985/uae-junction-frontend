import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rewards Program Policy',
  description:
    'How the UAE Junction Rewards Program works — earning points, loyalty tiers, redemption, and program terms.',
}

const earn: [string, string][] = [
  ['Create your account', '50,000'],
  ['Complete your profile', '50,000'],
  ['Log in each day', '5,000 / day'],
  ['Refer a friend (they sign up)', '50,000'],
  ['Your referred friend makes their first booking', '150,000'],
  ['Your birthday', '100,000'],
  ['Write a review on a product you bought', '25,000'],
  ['Every AED you spend on a booking', '250 points'],
]

const tiers: [string, string][] = [
  ['Voyager', '200,000 lifetime points'],
  ['Trail Blazer', '400,000 lifetime points'],
  ['Ambassador', '600,000 lifetime points'],
]

export default function Page() {
  return (
    <div className="container-xl py-16 max-w-3xl">
      <h1 className="font-display font-bold text-4xl text-secondary mb-2">Rewards Program Policy</h1>
      <p className="text-neutral-500 mb-10">Effective 4 June 2026</p>

      <section className="space-y-4 mb-10">
        <h2 className="font-display font-bold text-2xl text-secondary">How points work</h2>
        <p className="text-neutral-700">
          Every <strong>10,000 points = AED 1.00</strong>. Points are earned automatically on your
          account and can be redeemed as a discount during checkout.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-display font-bold text-2xl text-secondary mb-4">How to earn points</h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left">
            <tbody>
              {earn.map(([label, pts], i) => (
                <tr key={label} className={i % 2 ? 'bg-neutral-50' : ''}>
                  <td className="px-4 py-3 text-neutral-700">{label}</td>
                  <td className="px-4 py-3 font-semibold text-secondary whitespace-nowrap">{pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-neutral-700 mt-4">
          <strong>Welcome &amp; activity bonuses unlock after your first purchase.</strong> Points
          from registration, profile completion, daily logins and friend sign-ups are credited right
          away and become available to redeem once you complete your first booking. A successful referral — your friend signs up and completes their first booking — earns you a total of 200,000 points, worth AED 20.
        </p>
        <p className="text-neutral-600 text-sm mt-3">
          Limits that keep things fair: daily login points are awarded once per calendar day, up to
          150,000 points per year; birthday points require an account at least 60 days old with at
          least one booking, once each year; review points apply to verified purchases only, up to 5
          rewarded reviews per year; referral points cannot be earned by referring yourself, and each
          person can only be referred once.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-display font-bold text-2xl text-secondary mb-4">Loyalty tiers</h2>
        <p className="text-neutral-700 mb-4">
          Your tier is based on the total points you have earned over your lifetime with us, and never
          drops when you redeem points.
        </p>
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left">
            <tbody>
              {tiers.map(([label, req], i) => (
                <tr key={label} className={i % 2 ? 'bg-neutral-50' : ''}>
                  <td className="px-4 py-3 font-semibold text-secondary">{label}</td>
                  <td className="px-4 py-3 text-neutral-700">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="font-display font-bold text-2xl text-secondary">How to redeem points</h2>
        <ul className="list-disc pl-5 text-neutral-700 space-y-1">
          <li>Conversion: 10,000 points = AED 1.00</li>
          <li>Minimum order: AED 600</li>
          <li>Maximum discount per booking: the lower of AED 200 or 20% of your order total</li>
          <li>Where: at checkout only, applied as a discount to your booking</li>
        </ul>
        <p className="text-neutral-700">
          Points cannot be exchanged for cash and cannot be transferred to another account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl text-secondary">Program terms</h2>
        <p className="text-neutral-700">
          <strong>Non-monetary value.</strong> Points have no cash value and cannot be exchanged,
          refunded, or transferred outside the redemption system described above.
        </p>
        <p className="text-neutral-700">
          <strong>Cancellations &amp; refunds.</strong> If a booking is cancelled or refunded, the
          points earned on that booking are removed (proportionally for partial refunds). If you used
          points on a booking that is later refunded, those redeemed points are credited back to your
          account.
        </p>
        <p className="text-neutral-700">
          <strong>Expiry.</strong> Points may expire after 12 months of account inactivity.
        </p>
        <p className="text-neutral-700">
          <strong>Account integrity.</strong> Points may be adjusted or revoked in cases of misuse,
          fraud, or violation of platform policies.
        </p>
        <p className="text-neutral-700">
          <strong>Program changes.</strong> UAE Junction reserves the right to modify, suspend, or
          terminate the Rewards Program, including point values, tier thresholds, and redemption
          limits, at any time without prior notice.
        </p>
      </section>
    </div>
  )
}
