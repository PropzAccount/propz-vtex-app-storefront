import React from 'react'
import { useCssHandles } from 'vtex.css-handles'

import './propzpartnerbr.propz-frontend.css'

const CSS_HANDLES = ['skeleton-loader-button'] as const

const Loading = () => {
  const { handles } = useCssHandles(CSS_HANDLES)

  return <div className={handles['skeleton-loader-button']} />
}

export default Loading
