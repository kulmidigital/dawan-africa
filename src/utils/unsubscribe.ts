import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://dawan.africa'
const SECRET = process.env.UNSUBSCRIBE_TOKEN_SECRET
const FALLBACK_SECRET =
  'da7f89b2c5e34a6f8d9e0c12b845a3f7e68d92c1b5f74e89a0d3c67b4e12f953c8a6d4e7b9f2c5a8e1d47b6c9f2e58a3d70b4e81c6f923d57a84e69c12b5f7'

/** Utility function to normalize email addresses for consistent token generation */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/** Helper that builds a timestamped HMAC token */
function generateSecureToken(email: string): string {
  const currentSecret = SECRET || FALLBACK_SECRET

  if (!SECRET) {
    console.warn('⚠️ UNSUBSCRIBE_TOKEN_SECRET not set, using fallback secret')
  }

  const normalizedEmail = normalizeEmail(email)
  const timestamp = Date.now().toString()
  const data = `${normalizedEmail}:${timestamp}`
  const hmac = crypto.createHmac('sha256', currentSecret)
  hmac.update(data)
  const signature = hmac.digest('hex')

  // Return timestamp:signature format for verification
  return `${timestamp}:${signature}`
}

/** Public function – returns full unsubscribe URL with secure token */
export function buildUnsubscribeUrl(email: string): string {
  const normalizedEmail = normalizeEmail(email)
  const token = generateSecureToken(normalizedEmail)

  const query = new URLSearchParams({
    email: normalizedEmail,
    token,
  })

  return `${BASE_URL}/api/newsletter/unsubscribe?${query.toString()}`
}

/** Helper to escape URLs for HTML attributes */
export function escapeUrlForHtml(url: string): string {
  return url.replace(/&/g, '&amp;')
}
