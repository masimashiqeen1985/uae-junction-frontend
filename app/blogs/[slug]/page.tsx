import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchGraphQL } from '@/lib/graphql-client'
import { GET_POST, GET_ALL_POST_SLUGS } from '@/lib/queries'
import type { WPPost } from '@/types'

interface PostData {
  post: WPPost | null
}

interface SlugData {
  posts: { nodes: Array<{ slug: string }> }
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const data = await fetchGraphQL<SlugData>(GET_ALL_POST_SLUGS, {}, false)
    return data.posts.nodes.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const data = await fetchGraphQL<PostData>(GET_POST, { slug })
    const post = data.post
    if (!post) return {}
    return {
      title: post.seo?.title ?? post.title,
      description: post.seo?.metaDesc ?? post.excerpt,
    }
  } catch {
    return {}
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post: WPPost | null = null
  try {
    const data = await fetchGraphQL<PostData>(GET_POST, { slug })
    post = data.post
  } catch {
    // GraphQL not yet configured — render placeholder
  }

  if (post === null && post !== undefined) notFound()

  return (
    <main className="container section-py">
      <h1>{post?.title ?? slug}</h1>
      {post?.content ? (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : (
        <p>Content coming in FE-06 blog build phase.</p>
      )}
    </main>
  )
}
