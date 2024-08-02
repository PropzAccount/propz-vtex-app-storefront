import { useEffect, useState } from 'react'

import { getSession } from '../modules/session'

export const useSessionAndPromotions = () => {
  const [session, setSession] = useState({
    isAuthenticated: false,
    user: {} as any,
  })

  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
    sessionPromise.then((session) => {
      setSession({
        isAuthenticated: true,
        user: session.response,
      })
    })
  }, [sessionPromise])

  return { session }
}
