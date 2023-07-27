import { useEffect } from 'react'
import { useProduct } from 'vtex.product-context'
import { OrderForm } from 'vtex.order-manager'
import {
  useOrderQueue,
  useQueueStatus,
  QueueStatus,
} from 'vtex.order-manager/OrderQueue'

import { getVerifyPurchase } from './utils/verifyPurchase'

const VerifyPurchase = () => {
  const { useOrderForm } = OrderForm
  const { orderForm, setOrderForm } = useOrderForm()

  const { enqueue, listen } = useOrderQueue()
  const queueStatusRef = useQueueStatus(listen)

  const productContextValue = useProduct()
  const product = productContextValue?.product

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    if (queueStatusRef.current === QueueStatus.FULFILLED) {
      const productSkuId = product?.items[0].itemId
      const ean = product?.items[0].ean as string

      orderForm.items.length > 0 &&
        orderForm.items.map(
          (item: { id: string; manualPrice: number | null }) => {
            if (productSkuId === item.id && item.manualPrice === null) {
              const purchase = getVerifyPurchase({ orderForm, productEan: ean })

              const postVerifyPurchase = async () => {
                try {
                  const response = await fetch('/_v/post-verify-purchase', {
                    method: 'POST',
                    body: JSON.stringify({
                      verifyPurchase: purchase,
                      orderForm,
                    }),
                    signal,
                  })

                  const data = await response.json()

                  enqueue(() => setOrderForm(data.data))

                  console.log(data)
                  // await setOrderForm(data.data)
                } catch (error) {
                  controller.abort()
                }
              }

              postVerifyPurchase()
            }

            return item
          }
        )
    }

    return () => {
      controller.abort()
    }
  }, [orderForm, queueStatusRef, product, setOrderForm, enqueue])

  return null
}

export default VerifyPurchase
