import { useEffect, useState } from 'react'
import { canUseDOM } from 'vtex.render-runtime'
import { Product } from 'vtex.product-context/react/ProductTypes'

import { getSession } from '../modules/session'

interface IPromotionMaxPerCustumer {
  pricePropz: Array<{
    sellingPrice: number
    listPrice: number
  }>
  priceVtex: Array<{
    sellingPrice: number
    listPrice: number
  }>
  maxItems: number
  product: string
}

interface IPromotions {
  products: Product[]
  promotionMaxPerCustomer: IPromotionMaxPerCustumer[]
}

export const useSessionAndPromotions = () => {
  const [promotions, setPromotions] = useState<IPromotions>({
    products: [],
    promotionMaxPerCustomer: [],
  })

  const [session, setSession] = useState({
    isAuthenticated: false,
    user: {} as any,
  })

  const [loading, setLoading] = useState(true)

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
        const user = session.user.namespaces.profile.document.value
        const controller = new AbortController()
        const { signal } = controller

        const getProductsPropz = async () => {
          try {
            const response = await fetch(`/_v/get-promotion?document=${user}`, {
              signal,
            })

            const dataPromotions: IPromotions = await response.json()

            if (dataPromotions.products.length > 0) {
              setPromotions(dataPromotions)
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
  }, [session])

  return { session, promotions, loading }
}
