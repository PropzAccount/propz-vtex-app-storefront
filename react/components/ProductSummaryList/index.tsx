import React, { ReactNode, memo } from 'react'
import type { ComponentType } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { ProductSummaryListWithoutQuery } from 'vtex.product-summary'

import '../../styles/shelf/lojasntoantonio,propz-frontend.css'

const CSS_HANDLES = [
  'wrapper-shelf-propz',
  'shelf-propz--title',
  'shelf-propz--picture',
] as const

interface IProductSummaryProps {
  product: any
  actionOnClick: any
  listName?: any
  position?: any
}

interface IProductSummaryListProps {
  promotions: any
  title: string
  listName: string
  children: ReactNode
  ProductSummary?: ComponentType<IProductSummaryProps>
}
const ProductSummaryList = ({
  promotions,
  listName,
  title,
  children,
  ProductSummary,
}: IProductSummaryListProps) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  return (
    <section className={handles['wrapper-shelf-propz']}>
      <h1 className={handles['shelf-propz--title']}>{title}</h1>

      <ProductSummaryListWithoutQuery
        products={promotions}
        listName={listName}
        ProductSummary={ProductSummary as any}
      >
        {children}
      </ProductSummaryListWithoutQuery>
    </section>
  )
}

export default memo(ProductSummaryList)
