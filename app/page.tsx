'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { differenceInDays, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from 'recharts'

export default function () {
  const { status } = useSession()
  const [chartData, setChartData] = useState([])
  const [newCustomers, setNewCustomers] = useState({ prev: 0, new: 0 })
  const [salesRange, setSalesRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 11, 1),
    to: new Date(2024, 11, 31),
  })
  const [newCustomersRange, setNewCustomersRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 11, 31),
  })
  useEffect(() => {
    const params = new URLSearchParams({ startDate: format(salesRange.from, 'yyyy-MM-dd'), endDate: format(salesRange.to, 'yyyy-MM-dd') })
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
  }, [salesRange])
  useEffect(() => {
    const newParams = new URLSearchParams({ len: differenceInDays(newCustomersRange.to, newCustomersRange.from).toString() })
    fetch(`/api/new-customers?${newParams.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setNewCustomers({
          new: res[0].new_customers_in_current_period,
          prev: res[0].new_customers_in_previous_period,
        })
      })
      .catch(console.log)
  }, [newCustomersRange])
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
          <CardDescription>
            <div className="flex flex-row items-center justify-between w-full">
              <span>
                {format(salesRange.from, 'd MMMM yyyy')} - {format(salesRange.to, 'd MMMM yyyy')}
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date" variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !salesRange && 'text-muted-foreground')}>
                    <CalendarIcon />
                    {salesRange?.from ? (
                      salesRange.to ? (
                        <>
                          {format(salesRange.from, 'LLL dd, y')} - {format(salesRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(salesRange.from, 'LLL dd, y')
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
                    numberOfMonths={2}
                    selected={salesRange}
                    defaultMonth={salesRange.from}
                    onSelect={(e) => {
                      if (e?.from) setSalesRange({ from: e.from, to: e.to || e.from })
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
          <ChartContainer className="mt-4" config={{}}>
            <LineChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <YAxis domain={[0, Math.max(...chartData.map(({ total_sales }: { total_sales: number }) => total_sales)) + 20]} />
              <XAxis dataKey="sale_date" tickLine={false} axisLine={false} tickMargin={2} />
              <Line type="natural" strokeWidth={2} dataKey="total_sales" stroke="hsl(var(--secondary))" dot={{ fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>New Customers</CardTitle>
          <CardDescription>
            <div className="flex flex-row items-center justify-between w-full">
              <span>In the last {differenceInDays(newCustomersRange.to, newCustomersRange.from)} days</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date" variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !newCustomersRange && 'text-muted-foreground')}>
                    <CalendarIcon />
                    {newCustomersRange?.from ? (
                      newCustomersRange.to ? (
                        <>
                          {format(newCustomersRange.from, 'LLL dd, y')} - {format(newCustomersRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(newCustomersRange.from, 'LLL dd, y')
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
                    numberOfMonths={2}
                    selected={newCustomersRange}
                    defaultMonth={newCustomersRange.from}
                    onSelect={(e) => {
                      if (e?.from) setNewCustomersRange({ from: e.from, to: e.to || e.from })
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
          <ChartContainer config={{}}>
            <LineChart
              accessibilityLayer
              data={[
                { value: newCustomers.prev, name: 'Last 2X days to Last X days' },
                { value: newCustomers.new, name: 'Last X days' },
              ]}
            >
              <CartesianGrid vertical={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <YAxis domain={[0, Math.max(newCustomers.prev, newCustomers.new) + 2]} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={2} />
              <Line className="bg-asd" dataKey="value" strokeWidth={2} type="natural" stroke="hsl(var(--secondary))" dot={{ fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}>
                <LabelList dataKey="name" />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
