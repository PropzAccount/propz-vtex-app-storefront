export interface IItemDiscountsVerifyPurchase {
  partnerPromotionId: string
  unitPriceWithDiscount: number
  quantity: number
  unitDiscount: number
}

export interface IItemVerifyPurchase {
  itemId: string
  ean: string
  unitPrice: number
  unitSize: string
  quantity: nmumber
  packingQuantity: number | null
  blockUpdate: number
  discounts: IItemDiscountsVerifyPurchase[]
}

export interface IVerifyPurchase {
  sessionId: string
  customer: {
    customerId: string
  }
  ticket: {
    ticketId: string
    storeId: string
    posId: string
    employeeId: string | null
    amount: number
    amountWithAllDiscount: number
    ticketDiscounts: []
    date: string
    blockUpdate: number
    items: IItemVerifyPurchase[]
  }
}
