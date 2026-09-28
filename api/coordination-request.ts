type RequestBody = {
  name?: unknown
  email?: unknown
  projectAddress?: unknown
  message?: unknown
  website?: unknown
  route?: unknown
  team?: unknown
  turnstileToken?: unknown
}

type Response = { status: (code: number) => Response; json: (body: unknown) => void; setHeader: (name: string, value: string) => void }

const value = (input: unknown, max = 1200) => typeof input === 'string' ? input.trim().slice(0, max) : ''
const emailIsValid = (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)

export default async function handler(request: { method?: string; body?: RequestBody }, response: Response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') return response.status(405).json({ message: 'Method not allowed.' })

  const body = request.body ?? {}
  const name = value(body.name, 120), email = value(body.email, 254), projectAddress = value(body.projectAddress, 300), message = value(body.message), website = value(body.website, 200), route = value(body.route, 120), team = value(body.team, 160), token = value(body.turnstileToken, 2048)
  if (website) return response.status(400).json({ message: 'Unable to process this request.' })
  if (!name || !emailIsValid(email) || !projectAddress || !message || !route || !team || !token) return response.status(400).json({ message: 'Complete all required fields and verification.' })

  const secret = process.env.TURNSTILE_SECRET_KEY
  const cityEmail = process.env.CITY_COORDINATION_EMAIL
  if (!secret || !cityEmail) return response.status(503).json({ message: 'The City request form has not been configured yet.' })

  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, response: token })
  })
  const result = await verification.json() as { success?: boolean }
  if (!verification.ok || !result.success) return response.status(400).json({ message: 'Verification expired or failed. Please try again.' })

  const subject = `Coordination request: ${route}`
  const emailBody = `City coordination request\n\nRecommended group: ${team}\nProject route: ${route}\n\nName: ${name}\nEmail: ${email}\nProject address or parcel: ${projectAddress}\n\nRequest:\n${message}`
  const mailtoUrl = `mailto:${encodeURIComponent(cityEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
  return response.status(200).json({ mailtoUrl })
}
