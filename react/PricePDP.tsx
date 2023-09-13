import React, { ReactNode, memo, useEffect, useState } from 'react'
import { useProductDispatch, useProduct } from 'vtex.product-context'
import { canUseDOM } from 'vtex.render-runtime'
import { MaybeProduct } from 'vtex.product-context/react/ProductTypes'

import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'
import Loading from './components/Loading'

interface IPricePDP {
  children: ReactNode
}

const PricePDP = ({ children }: IPricePDP) => {
  const { session } = useSessionAndPromotions()

  const [showPricePropz, setShowPricePropz] = useState(true)

  const productContextValue = useProduct()
  const product = productContextValue?.product
  const dispatch = useProductDispatch()

  useEffect(() => {
    if (!session.isAuthenticated) {
      setShowPricePropz(false)

      return
    }

    const documentUser = session?.user?.namespaces?.profile?.document?.value.replace(
      /[^0-9]+/g,
      ''
    )

    const controller = new AbortController()
    const { signal } = controller

    if (canUseDOM) {
      const getPrice = async () => {
        const response = await fetch('/_v/post-price-pdp', {
          method: 'POST',
          body: JSON.stringify({
            document: documentUser,
            product,
          }),
          signal,
        })

        const data = await response.json()

        const isChangePrice =
          data.priceRange.sellingPrice.highPrice !==
          product?.priceRange.sellingPrice.highPrice

        if (isChangePrice) {
          dispatch?.({
            type: 'SET_PRODUCT',
            args: {
              product: {
                ...product,
                priceRange: {
                  sellingPrice: {
                    highPrice: data.priceRange.sellingPrice.highPrice,
                    lowPrice: data.priceRange.sellingPrice.lowPrice,
                  },
                  listPrice: {
                    highPrice: data.priceRange.listPrice.highPrice,
                    lowPrice: data.priceRange.listPrice.lowPrice,
                  },
                },
              } as MaybeProduct,
            },
          })
        }

        setShowPricePropz(false)
      }

      getPrice()
    }

    return () => {
      controller.abort()
    }
  }, [
    dispatch,
    product,
    session.isAuthenticated,
    session?.user?.namespaces?.profile?.document?.value,
  ])

  if (showPricePropz) {
    return <Loading />
  }

  return <>{children}</>
}

export default memo(PricePDP)
