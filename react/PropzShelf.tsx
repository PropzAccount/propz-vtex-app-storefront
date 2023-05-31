import React, { useEffect, useState, ReactNode } from 'react'
import type { ComponentType } from 'react'
import { ProductSummaryListWithoutQuery } from 'vtex.product-summary'
import { canUseDOM } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'

import { getSession } from './modules/session'

import './styles/shelf/lojasntoantonio,propz-frontend.css'

interface IPropzShelf {
  children: ReactNode
  ProductSummary?: ComponentType<{
    product: any
    actionOnClick: any
    listName?: any
    position?: any
  }>
  listName: string
  bannerImage: {
    image: {
      desktop: string
      mobile: string
    }
    alt: string
    title: string
  }
}

const CSS_HANDLES = ['wrapper-shelf-propz', 'shelf-propz--picture'] as const

const PropzShelf = ({
  children,
  bannerImage,
  listName,
  ProductSummary,
}: IPropzShelf) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  const [promotions, setPromotions] = useState([])
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: {} as any,
  })

  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    // eslint-disable-next-line no-shadow
    sessionPromise.then((session) => {
      setSession({
        isAuthenticated: true,
        user: session.response,
      })
    })
  }, [sessionPromise])

  useEffect(() => {
    if (canUseDOM) {
      if (session.user.namespaces?.profile?.isAuthenticated?.value === 'true') {
        const getProductsPropz = async () => {
          const response = await fetch(`/get-promotion?document=${43012319867}`)
          const data = await response.json()

          setPromotions(data)
        }

        getProductsPropz()
      }
    }
  }, [session])

  return session.user.namespaces?.profile?.isAuthenticated?.value === 'true' ? (
    <section className={handles['wrapper-shelf-propz']}>
      <ProductSummaryListWithoutQuery
        products={promotions}
        listName={listName}
        ProductSummary={ProductSummary as any}
      >
        {children}
      </ProductSummaryListWithoutQuery>
    </section>
  ) : bannerImage ? (
    <div className={handles['wrapper-shelf-propz']}>
      <picture className={handles['shelf-propz--picture']}>
        <source srcSet={bannerImage.image.mobile} media="(max-width: 639px)" />
        <img
          src={bannerImage.image.desktop}
          alt={bannerImage.alt}
          title={bannerImage.title}
        />
      </picture>
    </div>
  ) : null
}

PropzShelf.schema = {
  title: 'Shelf Propz',
  type: 'object',
  properties: {
    listName: {
      title: 'Nome da list',
      default: 'Propz list',
      type: 'string',
    },
    bannerImage: {
      title: 'Banner',
      type: 'object',
      properties: {
        image: {
          title: 'imagens',
          type: 'object',
          properties: {
            desktop: {
              title: 'Imagem Desktop',
              type: 'string',
              widget: {
                'ui:widget': 'image-uploader',
              },
            },
            mobile: {
              title: 'Imagem Mobile',
              type: 'string',
              widget: {
                'ui:widget': 'image-uploader',
              },
            },
          },
        },
        alt: {
          title: 'Texto alternativo para imagem',
          type: 'string',
        },
        title: {
          title: 'Titulo para a imagem',
          type: 'string',
        },
      },
    },
  },
}

export default PropzShelf
