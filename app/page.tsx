'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

const chartConfig = {} satisfies ChartConfig

export default function () {
  const { status } = useSession()
  const [chartData, setChartData] = useState([])
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 11, 1),
    to: new Date(2024, 11, 31),
  })
  useEffect(() => {
    const params = new URLSearchParams({ startDate: format(date.from, 'yyyy-MM-dd'), endDate: format(date.to, 'yyyy-MM-dd') })
    fetch(`/api/sales?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        const representationData: any = {}
        res.forEach((item: any) => {
          if (representationData[item.sale_date]) {
            representationData[item.sale_date] = {
              ...representationData[item.sale_date],
              total_sales: parseFloat(item.total_sales) + parseFloat(representationData[item.sale_date].total_sales),
            }
          } else {
            representationData[item.sale_date] = {
              ...item,
              total_sales: parseFloat(item.total_sales),
            }
          }
        })
        setChartData(Object.values(representationData))
      })
      .catch(console.log)
  }, [date])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Sales</CardTitle>
        <CardDescription>
          <div className="flex flex-row items-center justify-between w-full">
            <span>
              {format(date.from, 'd MMMM yyyy')} - {format(date.to, 'd MMMM yyyy')}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={date}
                  numberOfMonths={2}
                  defaultMonth={date.from}
                  onSelect={(e) => {
                    if (e?.from) setDate({ from: e.from, to: e.to || e.from })
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {status !== 'authenticated' && (
          <>
            <div className="absolute z-40 bg-gray-100 blur-lg w-[95%] h-[95%]"></div>
            <div className="absolute bg-transparent z-40 w-[95%] h-[95%] flex flex-col items-center justify-center">
              {status === 'unauthenticated' ? (
                <button onClick={() => signIn()} className="z-50 absolute border rounded px-5 py-2 hover:border-black">
                  Sign in to view the chart &rarr;
                </button>
              ) : (
                <svg className="animate-spin -ml-1 mr-3 size-10 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </div>
          </>
        )}
        <ChartContainer className="mt-4" config={chartConfig}>
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <YAxis domain={[0, Math.max(...chartData.map(({ total_sales }: { total_sales: number }) => total_sales)) + 20]} />
            <XAxis
              dataKey="sale_date"
              tickLine={false}
              axisLine={false}
              tickMargin={2}
              // tickFormatter={(val) => val.substring(0, 1)}
            />
            <Line type="natural" strokeWidth={2} dataKey="total_sales" stroke="hsl(var(--secondary))" dot={{ fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
