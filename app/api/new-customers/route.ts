export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import sql from '@/lib/sql'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) return new NextResponse(null, { status: 400 })
  const startDate = new URL(request.url).searchParams.get('startDate')
  const endDate = new URL(request.url).searchParams.get('endDate')
  if (!startDate || !endDate) return new NextResponse(null, { status: 400 })
  const salesData = await sql(
    `WITH first_sales AS ( SELECT customer_id, MIN(sale_date) AS first_sale_date FROM sales GROUP BY customer_id ), current_period AS ( SELECT COUNT(*) AS new_customers_in_current_period FROM first_sales WHERE first_sale_date >= DATE '${startDate}' AND first_sale_date < DATE '${endDate}' ), previous_period AS ( SELECT COUNT(*) AS new_customers_in_previous_period FROM first_sales WHERE first_sale_date >= DATE '${startDate}' - (DATE '${endDate}' - DATE '${startDate}') AND first_sale_date < DATE '${startDate}' ) SELECT current_period.new_customers_in_current_period, previous_period.new_customers_in_previous_period, current_period.new_customers_in_current_period - previous_period.new_customers_in_previous_period AS difference FROM current_period, previous_period;`,
  )
  return NextResponse.json(salesData)
}
