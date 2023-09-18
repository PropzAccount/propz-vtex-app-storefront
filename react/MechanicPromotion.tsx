import React, { useEffect, useState, memo } from 'react'
import { canUseDOM } from 'vtex.render-runtime'
import { useProduct } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'

import { PromotionType } from './typings/promotionPropz'
import './styles/messageMechanic/lojasantoantonio.propz-frontend.css'
import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'

const CSS_HANDLES = ['mechanic-message'] as const

const MechanicPromotion = () => {
  const productContextValue = useProduct()
  const product = productContextValue?.product
  const { handles } = useCssHandles(CSS_HANDLES)
  const { session } = useSessionAndPromotions()

  const [mechanic, setMechanic] = useState({
    isShow: false,
    message: '',
  })

  useEffect(() => {
    if (!session.isAuthenticated) return

    if (canUseDOM) {
      const promotionPropz = localStorage.getItem(
        '@propz/promotion-ma-per-customer'
      )

      if (promotionPropz) {
        const promotions = JSON.parse(promotionPropz)

        promotions.map((promotion: PromotionType) => {
          const mechanicVirtualPack =
            promotion.typeMechanic === 'virtual_pack' &&
            product?.productReference === promotion.product

          const mechanicGetAnaPay =
            promotion.typeMechanic === 'get_and_pay' &&
            product?.productReference === promotion.product

          if (mechanicVirtualPack) {
            setMechanic({
              isShow: true,
              message: `Promoção válida a cada ${promotion.quantityFlag} unid.`,
            })
          }

          if (mechanicGetAnaPay) {
            setMechanic({
              isShow: true,
              message: `Promoção válida acima de ${promotion.quantityFlag} unid.`,
            })
          }

          return promotion
        })
      }
    }
  }, [product, session.isAuthenticated])

  return (
    <>
      {mechanic.isShow && (
        <p className={handles['mechanic-message']}>{mechanic.message}</p>
      )}
    </>
  )
}

export default memo(MechanicPromotion)
