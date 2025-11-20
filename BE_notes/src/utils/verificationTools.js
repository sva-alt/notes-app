require('dotenv').config()

class VerificationTools {

  async verifyJWT(token) {
    // Expects BE_auth to expose a /verify endpoint that returns a JSON payload
      // with user information when token is valid, e.g. { user: { id, email }, ... }
      try {
        if (!process.env.AUTH_URL) throw new Error('AUTH_URL not configured')
        const url = `${process.env.AUTH_URL.replace(/\/$/, '')}/verify`

        // Send token in Authorization header. Accept either plain token or Bearer <token>.
        const authHeader = token && token.startsWith('Bearer ') ? token : `Bearer ${token}`

        const res = await fetch(url, {
          headers: {
            authorization: authHeader,
            'content-type': 'application/json',
          },
        })

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          const err = new Error(`Auth service returned ${res.status}: ${text}`)
          err.status = res.status
          throw err
        }

    const data = await res.json()

    // BE_auth returns { message, jwt, payload, date }
    // Normalise and return the inner JWT payload so callers can do `req.user = payload`.
    // If `payload` isn't present, return the whole response as a fallback.
    return data && data.payload ? data.payload : data
      } catch (err) {
        // Propagate error to caller (middleware)
        throw err
      }
  }

}


module.exports = new VerificationTools()
