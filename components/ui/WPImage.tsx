import Image from 'next/image'
import type { WPImage as WPImageData } from '@/types'

interface WPImageProps {
  image: WPImageData
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  quality?: number
}

/**
 * All WordPress media must go through this component.
 * Receives mediaDetails from WPGraphQL and passes correct
 * width/height/sizes to next/image. Never use <img> directly for WP media.
 */
export function WPImage({
  image,
  className,
  sizes,
  priority = false,
  fill = false,
  quality = 85,
}: WPImageProps) {
  if (!image?.sourceUrl) return null

  const alt = image.altText ?? ''
  const commonProps = {
    src: image.sourceUrl,
    className,
    priority,
    quality,
  }

  if (fill) {
    return (
      <Image
        {...commonProps}
        alt={alt}
        fill
        sizes={sizes ?? '100vw'}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <Image
      {...commonProps}
      alt={alt}
      width={image.mediaDetails.width}
      height={image.mediaDetails.height}
      sizes={
        sizes ??
        '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      }
    />
  )
}
