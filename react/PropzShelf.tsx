/* eslint-disable vtex/prefer-early-return */
import React, { ReactNode } from 'react'
import type { ComponentType } from 'react'
import { Loading } from 'vtex.render-runtime'

import Banner from './components/Banner'
import ProductSummaryList from './components/ProductSummaryList'
import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'

import './styles/shelf/lojasntoantonio,propz-frontend.css'

interface IProductSummaryProps {
  product: any
  actionOnClick: any
  listName?: any
  position?: any
}

interface IPropzShelf {
  children: ReactNode
  ProductSummary?: ComponentType<IProductSummaryProps>
  listName: string
  title: string
  bannerImage: {
    image: {
      desktop: string
      mobile: string
    }
    alt: string
    title: string
  }
}

const PropzShelf = ({
  children,
  bannerImage,
  title,
  listName,
  ProductSummary,
}: IPropzShelf) => {
  const { session, promotions, loading } = useSessionAndPromotions()

  const isAuthenticated =
    session.user.namespaces?.profile?.isAuthenticated?.value

  const hasPromotions = promotions.length > 0

  if (
    (loading && isAuthenticated === 'false') ||
    (loading && !isAuthenticated)
  ) {
    return <Banner bannerImage={bannerImage} />
  }

  if (loading && isAuthenticated === 'true' && !hasPromotions) {
    return <Loading />
  }

  return (
    <ProductSummaryList
      ProductSummary={ProductSummary}
      listName={listName}
      promotions={promotions}
      title={title}
    >
      {children}
    </ProductSummaryList>
  )
}

PropzShelf.schema = {
  title: 'Shelf Propz',
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: 'Titulo para a promoção',
    },
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
