import { formatPrice } from './formatPrice'

interface IVerifyPurchase {
  orderForm: any
  productEan: string
  price: number
  user: string
}

export const getVerifyPurchase = ({
  orderForm,
  productEan,
  price,
  user,
}: IVerifyPurchase) => {
  const itemsTickeks = orderForm.items.reduce(
    (
      acc: Array<{
        itemId: string
        ean: string
        unitPrice: number
        quantity: number
        unitSize: string
        blockUpdate: number
      }>,

      currentItem: {
        sellingPrice: number
        ean: string
        quantity: number
        manualPrice: number
      },
      index: number
    ) => {
      acc.push({
        itemId: String(index),
        ean: productEan,
        unitPrice: Number(formatPrice(price)),
        unitSize: 'Unit',
        quantity: currentItem.quantity,
        blockUpdate: 0,
      })

      return acc
    },
    []
  )

  const verifyPurchase = {
    sessionId: orderForm.userProfileId,
    customer: {
      customerId: user,
    },
    ticket: {
      ticketId: orderForm.userProfileId,
      storeId: '3',
      posId: '1',
      employeeId: null,
      amount: 1,
      date: new Date(),
      blockUpdate: 0,
      items: itemsTickeks,
    },
  }

  return verifyPurchase
}
