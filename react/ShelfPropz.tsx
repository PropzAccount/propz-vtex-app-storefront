import React, { ReactNode, useCallback, useEffect, useState, memo } from 'react'

import { useProduct, useProductDispatch } from 'vtex.product-context'
import { getSession } from './modules/session'
import { canUseDOM } from 'vtex.render-runtime'


interface IShelfPropz{
  children: ReactNode
}
function ShelfPropz({ children }: IShelfPropz) {
  const productContextValue = useProduct()
  const productContextDispatch = useProductDispatch()

  const productContext = productContextValue?.product

  const [session, setSession] = useState({
    isAuthenticated: false,
    user: {} as any,
  })
  const [productPromotion, setProductPromotion] = useState({} as any)

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
    if(canUseDOM){


      const getPromotionPropz = async () => {

        const response = await fetch('/get-promotion?document=43012319867')
        const data = await response.json()

        data.map((item: any) => {
          setProductPromotion(item)
        })

        if(session.user.namespaces?.profile?.isAuthenticated?.value === 'true'){

          data.map((item: { isActive: boolean, promotion: { isActive: boolean, properties: { PRODUCT_ID_INCLUSION: string}}}) => {
            if(item.promotion.properties.PRODUCT_ID_INCLUSION === productContext?.productReference && productContextDispatch){
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
          })
        }
      }
      getPromotionPropz()

    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const renderShelf = useCallback(() =>{
    const product_id_inclusion = productPromotion?.promotion?.properties?.PRODUCT_ID_INCLUSION
    const product_id_context = productContext?.productReference
    const isAutenticated = session.user.namespaces?.profile?.isAuthenticated?.value

      if(product_id_inclusion !== product_id_context){
        return <>{children}</>
      }

      if(isAutenticated === 'true' && product_id_inclusion === product_id_context){
        return <>{children}</>
      }

      return <p>logar para desbloquer uma promoção</p>
  }, [productPromotion, session])

  console.log(productPromotion)
  console.log(session)

  return (
    <div>{renderShelf()}</div>
  )
}

export default memo(ShelfPropz)
