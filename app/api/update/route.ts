export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import sql from '@/lib/sql'
import { encode } from '@auth/core/jwt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const useSecureCookie = request.url.startsWith('https:')
  const salt = useSecureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token'
  if (!process.env.AUTH_SECRET) return new NextResponse(null, { status: 500 })
  const [session, cookieStore] = await Promise.all([auth(), cookies()])
  if (!session?.user?.email) return new NextResponse(null, { status: 400 })
  const [userData] = await sql(`SELECT name, email, image FROM users WHERE email = $1 LIMIT 1`, [session.user.email])
  if (!userData?.email) cookieStore.set(salt, toString(), { secure: useSecureCookie, path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 })
  else {
    const { name, email, image } = userData
    const saltVal = await encode({ salt, secret: process.env.AUTH_SECRET, token: { name, email, picture: image } })
    cookieStore.set(salt, saltVal, { secure: useSecureCookie, path: '/', httpOnly: true, sameSite: 'lax' })
  }
  return new NextResponse()
}
