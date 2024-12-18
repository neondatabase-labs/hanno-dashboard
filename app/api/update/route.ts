export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import { encode } from '@auth/core/jwt'
import { neon, neonConfig } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

neonConfig.poolQueryViaFetch = true

export async function POST() {
  if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) return new Response(null, { status: 500 })
  const [session, cookieStore] = await Promise.all([auth(), cookies()])
  if (!session?.user?.email) return new Response(null, { status: 400 })
  const sql = neon(process.env.DATABASE_URL)
  const [{ name, email, image }] = await sql(`SELECT name, email, image FROM users WHERE email = $1 LIMIT 1`, [session.user.email])
  const salt = 'authjs.session-token'
  const saltVal = await encode({ salt, secret: process.env.AUTH_SECRET, token: { name, email, image } })
  cookieStore.set(salt, saltVal, { secure: true, path: '/', httpOnly: true, sameSite: "lax" })
  return new Response()
}
