import React, { memo } from 'react'
import { useCssHandles } from 'vtex.css-handles'

import '../../styles/shelf/lojasntoantonio,propz-frontend.css'

const CSS_HANDLES = [
  'wrapper-shelf-propz',
  'shelf-propz--title',
  'shelf-propz--picture',
] as const

interface IBannerProps {
  bannerImage: {
    image: {
      desktop: string
      mobile: string
    }
    alt: string
    title: string
  }
}
const Banner = ({ bannerImage: { image, alt, title } }: IBannerProps) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  return (
    <a href="/login" className={handles['wrapper-shelf-propz']}>
      <picture className={handles['shelf-propz--picture']}>
        <source srcSet={image.mobile} media="(max-width: 639px)" />
        <img
          src={image.desktop}
          alt={alt}
          title={title}
          loading="lazy"
          width="100%"
          height="auto"
        />
      </picture>
    </a>
  )
}

export default memo(Banner)
