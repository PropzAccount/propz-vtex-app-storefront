/* eslint-disable no-console */
import { useEffect, memo, useCallback } from 'react'
import { OrderForm } from 'vtex.order-manager'
import { useQuery } from 'react-apollo'
import type {
  OrderForm as Order,
  QueryOrderFormArgs,
} from 'vtex.checkout-graphql'
import OrderFormQuery from 'vtex.checkout-resources/QueryOrderForm'
import {
  useOrderQueue,
  useQueueStatus,
  QueueStatus,
} from 'vtex.order-manager/OrderQueue'

import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'
import { isDeepEqual } from './utils/isDeppEqual'

/**
 * Verifies the purchase of a product and updates the order form accordingly.
 * It also handles the storage of promotional data in local storage.
 *
 * Inputs:
 * - No direct inputs, but it relies on several imported modules and functions:
 *   - 'useQuery' and 'useOrderQueue' from 'vtex.order-manager'
 *   - 'useProduct' from 'vtex.product-context'
 *   - 'useSessionAndPromotions' from './hooks/UseSessionAndPromotions'
 *   - 'getVerifyPurchase' from './utils/verifyPurchase'
 *   - 'OrderFormQuery' from 'vtex.checkout-resources/QueryOrderForm'
 *
 * Flow:
 * 1. The function initializes several variables and hooks, including 'useQuery', 'useOrderQueue', 'useProduct', and 'useSessionAndPromotions'.
 * 2. It then checks the status of the order queue and retrieves the product SKU ID and EAN.
 * 3. If the order form has items, it updates the order form with the purchase verification and promotional data.
 * 4. It then stores the promotional data in local storage.
 *
 * Outputs:
 * - No direct outputs, as the function returns null. However, it updates the order form and stores promotional data in local storage.
 *
 * Additional aspects:
 * - The function uses several hooks and imported functions to retrieve and update data.
 * - It relies on local storage to store promotional data.
 */
const VerifyPurchase = () => {
  const { refetch } = useQuery<
    {
      orderForm: Order
    },
    QueryOrderFormArgs
  >(OrderFormQuery, {
    ssr: false,
    fetchPolicy: 'no-cache',
  })

  const { useOrderForm } = OrderForm
  const { orderForm, setOrderForm } = useOrderForm()
  const { session } = useSessionAndPromotions()

  const { enqueue, listen } = useOrderQueue()
  const queueStatusRef = useQueueStatus(listen)

  const getPromo = useCallback(async () => {
    const documentUser =
      session?.user?.namespaces?.profile?.document?.value.replace(
        /[^0-9]+/g,
        ''
      )

    const sessionId = session.user.id

    const response = fetch('/_v/post-verify-purchase', {
      method: 'POST',
      body: JSON.stringify({
        orderFormId: orderForm.id,
        document: documentUser,
        sessionId,
      }),
    })

    const data = (await response).json()

    return data
  }, [
    orderForm.id,
    session.user.id,
    session.user?.namespaces?.profile?.document?.value,
  ])

  const verifyOrderForm = useCallback(async () => {
    if (!session.isAuthenticated) return

    const isAuthenticated =
      session?.user?.namespaces?.profile?.isAuthenticated?.value === 'true'

    if (queueStatusRef.current !== QueueStatus.FULFILLED || !isAuthenticated)
      return

    if (orderForm.items.length > 0) {
      const order = await enqueue(() => getPromo())

      if (order.response.ticket.items.length > 0) {
        const propz = localStorage.getItem('@propz/register-puchase')

        if (propz) {
          enqueue(() =>
            refetch({ refreshOutdatedData: true }).then(
              ({ data: refreshedData }) => refreshedData.orderForm
            )
          ).then((updatedOrderForm: Partial<Order>) => {
            if (!isDeepEqual(orderForm, updatedOrderForm)) {
              localStorage.setItem(
                '@propz/register-puchase',
                JSON.stringify(order.response)
              )
              setOrderForm(updatedOrderForm)
            } else {
              localStorage.setItem(
                '@propz/register-puchase',
                JSON.stringify(order.response)
              )
            }
          })
        } else {
          localStorage.setItem(
            '@propz/register-puchase',
            JSON.stringify(order.response)
          )
          enqueue(() =>
            refetch({ refreshOutdatedData: true }).then(
              ({ data: refreshedData }) => refreshedData.orderForm
            )
          ).then((updatedOrderForm: Partial<Order>) => {
            setOrderForm(updatedOrderForm)
          })
        }
      }
    } else {
      localStorage.removeItem('@propz/register-puchase')
    }

    return orderForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderForm])

  useEffect(() => {
    verifyOrderForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderForm])

  return null
}

export default memo(VerifyPurchase)
