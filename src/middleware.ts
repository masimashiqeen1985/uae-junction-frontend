// Referral capture — stores the ref query param in a 30-day cookie so the
// sign-up flow can credit the referrer via uaej-loyalty applyReferralCode.
// Excludes /order-confirmation, whose own ref param is an order number.
import { NextRequest, NextResponse } from 'next/server'

const CODE_RE = /^[A-Za-z0-9-]{4,24}$/

export function middleware(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  const res = NextResponse.next()
  if (ref && CODE_RE.test(ref) && req.cookies.get('uaej_ref')?.value !== ref.toUpperCase()) {
    res.cookies.set('uaej_ref', ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }
  return res
}

export const config = {
  matcher: ['/((?!api|_next|order-confirmation|.*\\..*).*)'],
}
