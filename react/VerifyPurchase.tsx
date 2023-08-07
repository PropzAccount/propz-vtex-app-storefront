/* eslint-disable no-console */
import { useEffect } from 'react'
import { useProduct } from 'vtex.product-context'
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

import { getVerifyPurchase } from './utils/verifyPurchase'
import { useSessionAndPromotions } from './hooks/UseSessionAndPromotions'
import { IItemVerifyPurchase } from './typings/veirfyPurchase'

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

  const productContextValue = useProduct()
  const product = productContextValue?.product

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    if (queueStatusRef.current === QueueStatus.FULFILLED) {
      const productSkuId = product?.items[0].itemId
      const ean = product?.items[0].ean as string

      if (orderForm.items.length > 0) {
        const ItemsOrderformUpdated = Promise.all(
          orderForm.items.map(
            (item: { id: string; manualPrice: number | null }) => {
              if (productSkuId === item.id && !item.manualPrice) {
                const user = session.user.namespaces?.profile.document.value
                const purchase = getVerifyPurchase({
                  orderForm,
                  productEan: ean,
                  user,
                })

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

                    if (data.data) {
                      enqueue(() =>
                        refetch({ refreshOutdatedData: true }).then(
                          ({ data: refreshedData }) => refreshedData.orderForm
                        )
                      ).then((updatedOrderForm: Partial<Order>) => {
                        if (queueStatusRef.current === QueueStatus.FULFILLED) {
                          setOrderForm(updatedOrderForm)
                        }
                      })

                      const propzLocalStorage = localStorage.getItem(
                        '@propz-data'
                      )

                      if (propzLocalStorage) {
                        const propzData = JSON.parse(propzLocalStorage)

                        const newData = {
                          ...propzData,
                          ticket: {
                            ...propzData.ticket,
                            amountWithAllDiscount: (
                              Number(propzData.ticket.amountWithAllDiscount) +
                              Number(
                                data.propzPromotions.ticket
                                  .amountWithAllDiscount
                              )
                            ).toFixed(2),
                            items: [
                              ...propzData.ticket.items,
                              data.propzPromotions.ticket.items[0],
                            ],
                          },
                        }

                        localStorage.setItem(
                          '@propz-data',
                          JSON.stringify(newData)
                        )
                      } else {
                        localStorage.setItem(
                          '@propz-data',
                          JSON.stringify(data.propzPromotions)
                        )
                      }
                    }
                  } catch (error) {
                    controller.abort()
                  }
                }

                postVerifyPurchase()
              }

              return item
            }
          )
        )

        ItemsOrderformUpdated.then((itemOrderForm) => {
          const localStoragePropz = localStorage.getItem('@propz-data')

          const verifyPurchase = new Promise((resolver, reject) => {
            if (localStoragePropz) {
              const propz = JSON.parse(localStoragePropz)
              let amountWithAllDiscount = 0

              const itemsTicket = propz.ticket.items.reduce(
                (
                  acc: IItemVerifyPurchase[],
                  currentTicketItem: IItemVerifyPurchase
                ) => {
                  itemOrderForm.map((itemForm: any) => {
                    const priceDiscountPropz = String(
                      currentTicketItem.discounts[0].unitPriceWithDiscount.toFixed(
                        2
                      )
                    ).replace(/[^\d]+/, '')

                    const priceManualVtex = Number(
                      itemForm.manualPrice?.toFixed(2)
                    )

                    const alreadyExistItem = acc.some(
                      (currentItem: IItemVerifyPurchase) => {
                        const pricePropz = Number(
                          String(
                            currentItem.discounts[0].unitPriceWithDiscount.toFixed(
                              2
                            )
                          ).replace(/[^\d]+/, '')
                        )

                        return pricePropz === priceManualVtex
                      }
                    )

                    const isSameItem =
                      Number(priceDiscountPropz) === priceManualVtex

                    if (isSameItem && !alreadyExistItem) {
                      amountWithAllDiscount += +priceDiscountPropz
                      acc.push(currentTicketItem)
                    }

                    return itemForm
                  })

                  return acc
                },
                []
              )

              resolver({
                ...propz,
                ticket: {
                  ...propz.ticket,
                  amountWithAllDiscount,
                  items: itemsTicket,
                },
              })
            } else {
              reject(localStoragePropz)
            }
          })

          verifyPurchase.then((purchase) => {
            localStorage.setItem('@propz-data', JSON.stringify(purchase))
          })
        })
      }
    }

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderForm])

  return null
}

export default VerifyPurchase
