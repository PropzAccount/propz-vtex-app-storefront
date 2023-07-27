import { formatPrice } from './formatPrice'

interface IVerifyPurchase {
  orderForm: any
  productEan: string
}

export const getVerifyPurchase = ({
  orderForm,
  productEan,
}: IVerifyPurchase) => {
  const itemsTickeks = orderForm.items.map(
    (
      item: { sellingPrice: number; ean: string; quantity: number },
      index: number
    ) => {
      return {
        itemId: String(index),
        ean: productEan,
        unitPrice: Number(formatPrice(item.sellingPrice)),
        unitSize: 'Unit',
        quantity: item.quantity,
        blockUpdate: 0,
      }
    }
  )

  const verifyPurchase = {
    sessionId: orderForm.userProfileId,
    customer: {
      customerId: '43012319867',
    },
    ticket: {
      ticketId: orderForm.userProfileId,
      storeId: '3',
      posId: '1',
      employeeId: null,
      amount: 885,
      date: new Date(),
      blockUpdate: 0,
      items: itemsTickeks,
    },
  }

  return verifyPurchase
}
