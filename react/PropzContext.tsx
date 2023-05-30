import React, { PropsWithChildren } from 'react'
import { PropzProvider } from './context/PropzProvider'

interface IPropzContext {
  children: PropsWithChildren<any>
}
const PropzContext = ({ children }: IPropzContext) => {
  return (
   <PropzProvider>{children}</PropzProvider>
  )
}

export default PropzContext
