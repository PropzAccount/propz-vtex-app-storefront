import React, { ReactNode, useEffect, useState } from 'react'

import { useProduct, useProductDispatch } from 'vtex.product-context'
import { getSession } from './modules/session'
import { canUseDOM, NoSSR } from 'vtex.render-runtime'
import nookies, { parseCookies } from 'nookies'


interface IShelfPropz{
  children: ReactNode
}
function ShelfPropz({ children }: IShelfPropz) {
  const productContextValue = useProduct()
  const productContextDispatch = useProductDispatch()

  const productContext = productContextValue?.product

  const [session, setSession] = useState({
    isAuthenticated: false,
    user: {},
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
    // eslint-disable-next-line vtex/prefer-early-return
    if (
      productContext?.productId === '22456' &&
      productContextDispatch &&
      session.isAuthenticated
    ) {
      productContextDispatch({
        type: 'SET_PRODUCT',
        args: {
          product: {
            ...productContext,
            priceRange: {
              listPrice: {
                highPrice: 10.0,
                lowPrice: 10.0,
              },
              sellingPrice: {
                highPrice: 5.99,
                lowPrice: 5.99,
              },
            },
          },
        },
      })

    }

    if(canUseDOM){

      const cookies = parseCookies()

      if(!cookies.product_promotion_propz){

        const getPromotionPropz = async () => {
          const response = await fetch('/get-promotion?document=43012319867')
          const data = await response.json()

          nookies.set(null, 'product_promotion_propz', JSON.stringify(data), {
            maxAge: new Date(new Date().getMinutes() + 5)
          })
        }

        getPromotionPropz()
      }

      if(cookies.product_promotion_propz){
        const dataPromotion = JSON.parse(cookies.product_promotion_propz)
        dataPromotion.map((itemPromotion: any)=> {
          console.log(itemPromotion,  productContext)
          if(itemPromotion === productContext?.productReference){

          }
          return itemPromotion
        })
      }


    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <NoSSR>
      <div>{children}</div>
    </NoSSR>
  )
}

export default ShelfPropz
