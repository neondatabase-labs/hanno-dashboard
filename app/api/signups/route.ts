export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import sql from '@/lib/sql'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) return new NextResponse(null, { status: 400 })
  const startDate = new URL(request.url).searchParams.get('startDate') as string
  const endDate = new URL(request.url).searchParams.get('endDate') as string
  if (!startDate || !endDate) return new NextResponse(null, { status: 400 })
  const signUpsData = await sql(`SELECT type, COUNT(*) as count FROM customers WHERE signup_date BETWEEN $1 AND $2 GROUP BY type ORDER BY type`, [startDate, endDate])
  return NextResponse.json(signUpsData)
}
