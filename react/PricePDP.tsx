import React, { ReactNode, memo, useEffect, useState } from 'react'
import { useProductDispatch, useProduct } from 'vtex.product-context'
import { canUseDOM } from 'vtex.render-runtime'
import { MaybeProduct } from 'vtex.product-context/react/ProductTypes'

import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'
import Loading from './components/Loading'

interface IUserSession {
  session: any
  promotions: any[]
  loading: boolean
}

interface IPricePDP {
  children: ReactNode
}

const PricePDP = ({ children }: IPricePDP) => {
  const {
    session,
    promotions,
    loading,
  } = (useSessionAndPromotions() as unknown) as IUserSession

  const [showPricePropz, setShowPricePropz] = useState(true)

  const productContextValue = useProduct()
  const product = productContextValue?.product
  const dispatch = useProductDispatch()

  const isAuthenticated = session.user.namespaces?.profile?.isAuthenticated
    ?.value as boolean

  useEffect(() => {
    const productId = product?.productId

    const isChangePrice =
      Boolean(isAuthenticated) && canUseDOM && !loading && promotions.length > 0

    if (isChangePrice) {
      promotions.forEach((promotion: any) => {
        if (promotion.productId === productId) {
          dispatch?.({
            type: 'SET_PRODUCT',
            args: {
              product: {
                ...product,
                priceRange: {
                  sellingPrice: {
                    highPrice: promotion.priceRange.sellingPrice.highPrice,
                    lowPrice: promotion.priceRange.sellingPrice.lowPrice,
                  },
                  listPrice: {
                    highPrice: promotion.priceRange.listPrice.lowPrice,
                    lowPrice: promotion.priceRange.listPrice.lowPrice,
                  },
                },
              } as MaybeProduct,
            },
          })
        }

        return promotion
      })
    }

    setShowPricePropz(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAuthenticated, loading, promotions])

  if (showPricePropz) {
    return <Loading />
  }

  return <>{children}</>
}

export default memo(PricePDP)
