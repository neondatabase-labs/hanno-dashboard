export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import sql from '@/lib/sql'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) return new NextResponse(null, { status: 400 })
    const body = await request.json()
    if (body.name) await sql(`UPDATE users SET name = $1 WHERE email = $2`, [body.name, session.user.email])
    if (body.image) await sql(`UPDATE users SET image = $1 WHERE email = $2`, [body.image, session.user.email])
    return new NextResponse()
  } catch (e: any) {
    const message = e.message || e.toString()
    console.log(message)
    return new NextResponse(message, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) return new NextResponse(null, { status: 400 })
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)
    const offset = (page - 1) * limit
    const totalUsersResult = await sql(`SELECT COUNT(*) FROM users`)
    const totalUsers = totalUsersResult[0].count
    const pageCount = Math.ceil(totalUsers / limit)
    const users = await sql(`SELECT id, name, email, city, rpu, image, "emailVerified" FROM users LIMIT $1 OFFSET $2`, [limit, offset])
    return NextResponse.json({ users, pageCount })
  } catch (e: any) {
    const message = e.message || e.toString()
    console.log(message)
    return new NextResponse(message, { status: 500 })
  }
}
