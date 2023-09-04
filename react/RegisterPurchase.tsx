import { useEffect } from 'react'
import { canUseDOM } from 'vtex.render-runtime'

const RegisterPurchase = () => {
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    if (canUseDOM) {
      const register = localStorage.getItem('@propz/register-puchase')

      if (register) {
        const registerPuchase = JSON.parse(register)

        if (registerPuchase.ticket.items > 0) {
          try {
            const registerPurchase = async () => {
              const response = await fetch('/_v/post-register-purchase', {
                method: 'POST',
                signal,
                body: register,
              })

              if (response.ok) {
                localStorage.removeItem('@propz/register-puchase')
              }
            }

            registerPurchase()
          } catch (error) {
            console.warn(error)
          }
        }
      }
    }

    return () => {
      controller.abort()
    }
  }, [])

  return null
}

export default RegisterPurchase
