import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * ISR Revalidation webhook endpoint.
 * Called by WP Webhooks plugin on every post/page save.
 * Protected by WP_REVALIDATE_SECRET — returns 401 if missing or wrong.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { secret, path } = body

    if (!secret || secret !== process.env.WP_REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      )
    }

    const pathToRevalidate = path ?? '/'
    revalidatePath(pathToRevalidate)

    return NextResponse.json({
      revalidated: true,
      path: pathToRevalidate,
      ts: Date.now(),
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
     )
  }
}
