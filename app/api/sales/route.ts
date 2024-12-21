export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import { neon, neonConfig } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

neonConfig.poolQueryViaFetch = true

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) return new NextResponse(null, { status: 400 })
  if (!process.env.DATABASE_URL) return new NextResponse(null, { status: 500 })
  const startDate = new URL(request.url).searchParams.get('startDate')
  const endDate = new URL(request.url).searchParams.get('endDate')
  if (!startDate || !endDate) return new NextResponse(null, { status: 400 })
  const sql = neon(process.env.DATABASE_URL)
  const query = `
    SELECT 
      sale_date,
      channel,
      SUM(sale_amount) AS total_sales
    FROM sales
    WHERE sale_date BETWEEN $1 AND $2
    GROUP BY sale_date, channel
    ORDER BY sale_date, channel;
  `
  const values = [startDate, endDate]
  const salesData = await sql(query, values)
  return NextResponse.json(salesData)
}
