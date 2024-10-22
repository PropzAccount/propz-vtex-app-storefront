/* eslint-disable vtex/prefer-early-return */
import React, { useEffect, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { canUseDOM } from 'vtex.render-runtime'
// import type { MaybeProduct } from 'vtex.product-context/react/ProductTypes'

import Banner from './components/Banner'
import ProductSummaryList from './components/ProductSummaryList'
import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'

import './styles/shelf/propzpartnerbr.propz-frontend.css'

// interface IPromotionMaxPerCustumer {
//   pricePropz: Array<{
//     sellingPrice: number
//     listPrice: number
//   }>
//   priceVtex: Array<{
//     sellingPrice: number
//     listPrice: number
//   }>
//   maxItems: number
//   product: string
// }

// interface IPromotions {
//   products: MaybeProduct[]
//   promotionMaxPerCustomer: IPromotionMaxPerCustumer[]
// }

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
    link: string
  }
}

const PropzShelf = ({
  children,
  bannerImage,
  title,
  listName,
  ProductSummary,
}: IPropzShelf) => {
  const { session } = useSessionAndPromotions()

  const [promotions, setPromotions] = useState([])

  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    if (canUseDOM) {
      if (session.user.namespaces?.profile?.isAuthenticated?.value === 'true') {
        const user = session.user.namespaces.profile.document.value

        const documentUser = user.replace(/[^0-9]+/g, '')

        const getProductsPropz = async () => {
          try {
            const urlProtocol =
              window.location.protocol === 'https:' ? 'https' : 'http'

            const urlPort = urlProtocol === 'https' ? '443' : '80'

            const response = await fetch(
              `${urlProtocol}://${window.location.hostname}:${urlPort}/_v/get-promotion?document=${documentUser}`,
              {
                signal,
                headers: {
                  'X-VTEX-Use-Https': 'true',
                },
              }
            )

            const dataPromotions = await response.json()

            if (dataPromotions.products.length > 0) {
              setPromotions(dataPromotions.products)
              setLoading(false)
              localStorage.setItem(
                '@propz/promotion-ma-per-customer',
                JSON.stringify(dataPromotions.promotionMaxPerCustomer)
              )
            }
          } catch (error) {
            controller.abort()
          }
        }

        getProductsPropz()
      }
    }

    return () => {
      controller.abort()
    }
  }, [session])

  const isAuthenticated =
    session.user.namespaces?.profile?.isAuthenticated?.value

  const hasPromotions = promotions?.length > 0

  const isShowBanner =
    (loading && isAuthenticated === 'false') || (loading && !isAuthenticated)

  if (!bannerImage) {
    return null
  }

  if (isShowBanner) {
    return <Banner bannerImage={bannerImage} />
  }

  return (
    hasPromotions && (
      <ProductSummaryList
        ProductSummary={ProductSummary}
        listName={listName}
        promotions={promotions}
        title={title}
      >
        {children}
      </ProductSummaryList>
    )
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
        link: {
          title: 'Link do banner',
          type: 'string',
        },
      },
    },
  },
}

export default PropzShelf
