// ───────────────────────────────────────────────────────────────────
// Auth.js (NextAuth v5) configuration — App Router.
// Providers are GATED behind env presence so the production build stays
// green and nothing breaks when OAuth secrets are absent. Add the secrets
// later (see HANDOVER) to light each provider up.
//
// Required env (env only, NEVER committed):
//   AUTH_SECRET (or NEXTAUTH_SECRET), NEXTAUTH_URL,
//   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET,
//   FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
// OAuth callback URLs to register:
//   https://www.theuaejunction.cloud/api/auth/callback/google
//   https://www.theuaejunction.cloud/api/auth/callback/facebook
//
// Phase 4 (additive): the WP JWT authToken/refreshToken returned by
// authenticateWithWordpress are stashed INSIDE the NextAuth JWT (encrypted,
// httpOnly cookie). The session callback deliberately exposes only safe
// fields (uid/name/email) to the client — tokens never leave the server.
// ───────────────────────────────────────────────────────────────────
import NextAuth, { type NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import Credentials from 'next-auth/providers/credentials'
import { authenticateWithWordpress, type WpAuthUser } from '@/lib/auth/wordpress'

const providers: NextAuthConfig['providers'] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  )
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  )
}

// Credentials is always registered (no external secret needed) but its
// authorize() only succeeds when the WP JWT plugin + runtime fetch are live.
providers.push(
  Credentials({
    name: 'Email',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(creds) {
      const email = typeof creds?.email === 'string' ? creds.email : ''
      const password = typeof creds?.password === 'string' ? creds.password : ''
      const user = await authenticateWithWordpress(email, password)
      return user ?? null
    },
  }),
)

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers,
  pages: { signIn: '/my-account' }, // full-page destination (Phase 4); header dropdown stays the quick path
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
        // Phase 4: stash WP JWTs server-side (encrypted JWT cookie only).
        const wp = user as WpAuthUser
        if (wp.wpAuthToken) token.wpAuthToken = wp.wpAuthToken
        if (wp.wpRefreshToken) token.wpRefreshToken = wp.wpRefreshToken
      }
      return token
    },
    async session({ session, token }) {
      if (token?.uid && session.user) session.user.id = token.uid as string
      // NOTE: wpAuthToken / wpRefreshToken are intentionally NOT copied here —
      // the session object is client-visible. Server code reads them via
      // getToken() (see /api/account/me).
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Whether ANY social provider is configured — drives provider buttons in the UI.
export const authProviderFlags = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  facebook: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
  configured: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
}
