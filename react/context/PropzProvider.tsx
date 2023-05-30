import React, { ReactNode, createContext, useEffect } from 'react'
import { canUseDOM } from 'vtex.render-runtime'

const PropzContext = createContext({} as any)

interface IPropzProvider {
  children: ReactNode
}
const PropzProvider = ({ children }: IPropzProvider) => {

  useEffect(()=>{
    if(canUseDOM) {
      const getPromotionPropz = async () => {

        const response = await fetch('/get-promotion?document=43012319867')
        const data = await response.json()
        console.log(data)
      }
      getPromotionPropz()
    }
  },[])

  return (
    <PropzContext.Provider value={{teste: 'teste'}}>{children}</PropzContext.Provider>
  )
}

export {PropzProvider, PropzContext}
