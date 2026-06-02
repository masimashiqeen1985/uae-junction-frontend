import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// On-demand revalidation. WordPress (or any trusted caller) POSTs here on content
// changes to bust the relevant Next.js cache immediately instead of waiting for ISR.
//   POST /api/revalidate?secret=XXX   body: { "tag": "wp-menu" }  or  { "path": "/about-us" }
//   no body -> revalidates the shared menu tag + the whole layout (header + footer).
// Accepts either REVALIDATE_SECRET or the pre-existing WP_REVALIDATE_SECRET env var.
export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET || process.env.WP_REVALIDATE_SECRET
  const secret = req.nextUrl.searchParams.get('secret')
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({} as { tag?: string; path?: string }))
  const tag = body?.tag
  const path = body?.path

  if (tag) revalidateTag(tag)
  if (path) revalidatePath(path)
  if (!tag && !path) {
    revalidateTag('wp-menu')
    revalidatePath('/', 'layout')
  }

  return NextResponse.json({
    revalidated: true,
    tag: tag ?? null,
    path: path ?? null,
    ts: Date.now(),
  })
}
