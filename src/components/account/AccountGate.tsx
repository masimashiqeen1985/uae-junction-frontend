// Server gate for /my-account — picks the variant server-side (no auth flash).
// Signed out (or auth unconfigured) → AuthPanel. Signed in → AccountDashboard.
import type { Session } from 'next-auth'
import { AuthPanel } from './AuthPanel'
import { AccountDashboard } from './AccountDashboard'

type Props = {
  session: Session | null
  configured: boolean
  providers: { google: boolean; facebook: boolean }
}

export function AccountGate({ session, configured, providers }: Props) {
  if (configured && session?.user) {
    return (
      <AccountDashboard
        name={session.user.name ?? null}
        email={session.user.email ?? null}
      />
    )
  }
  return <AuthPanel configured={configured} providers={providers} />
}
