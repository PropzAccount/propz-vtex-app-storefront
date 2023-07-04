import { useEffect, useState } from 'react'
import { canUseDOM } from 'vtex.render-runtime'

import { getSession } from '../modules/session'

export const useSessionAndPromotions = () => {
  const [promotions, setPromotions] = useState([])
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: {} as any,
  })

  const [loading, setLoading] = useState(true)

  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    // eslint-disable-next-line no-shadow
    sessionPromise.then((session) => {
      setSession({
        isAuthenticated: true,
        user: session.response,
      })
    })
  }, [sessionPromise])

  useEffect(() => {
    if (canUseDOM) {
      if (session.user.namespaces?.profile?.isAuthenticated?.value === 'true') {
        const user = session.user.namespaces.profile.document.value

        const getProductsPropz = async () => {
          const response = await fetch(`/_v/get-promotion?document=${user}`)
          const dataPromotions = await response.json()

          if (dataPromotions.length > 0) {
            setPromotions(dataPromotions)
            setLoading(false)
          }
        }

        getProductsPropz()
      }
    }
  }, [session])

  return { session, promotions, loading }
}
