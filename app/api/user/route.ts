export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import { neon, neonConfig } from '@neondatabase/serverless'

neonConfig.poolQueryViaFetch = true

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!process.env.DATABASE_URL) return new Response(null, { status: 500 })
    if (!session?.user?.email) return new Response(null, { status: 400 })
    const body = await request.json()
    const sql = neon(process.env.DATABASE_URL)
    if (body.name) await sql(`UPDATE users SET name = $1 WHERE email = $2`, [body.name, session.user.email])
    if (body.image) await sql(`UPDATE users SET image = $1 WHERE email = $2`, [body.image, session.user.email])
    return new Response()
  } catch (e: any) {
    const message = e.message || e.toString()
    console.log(message)
    return new Response(message, { status: 500 })
  }
}
