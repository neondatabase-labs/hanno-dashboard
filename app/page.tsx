'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { differenceInDays, format, subDays } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CartesianGrid, Label, LabelList, Line, LineChart, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis, YAxis } from 'recharts'

interface DateRange {
  from: Date
  to: Date
}

export default function () {
  const { status } = useSession()
  const [chartData, setChartData] = useState([])
  const [newCustomers, setNewCustomers] = useState({ prev: 0, new: 0 })
  const [signups, setSignups] = useState<{ count: string; type: string }[]>([])
  const [salesRange, setSalesRange] = useState<DateRange>({ from: new Date(2024, 11, 1), to: new Date(2024, 11, 31) })
  const [signupsRange, setSignupsRange] = useState<DateRange>({ from: new Date(2023, 11, 1), to: new Date(2023, 11, 31) })
  const [newCustomersRange, setNewCustomersRange] = useState<DateRange>({ from: new Date(2024, 0, 1), to: new Date(2024, 11, 31) })
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
    const params = new URLSearchParams({ startDate: format(newCustomersRange.from, 'yyyy-MM-dd'), endDate: format(newCustomersRange.to, 'yyyy-MM-dd') })
    fetch(`/api/new-customers?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setNewCustomers({
          new: res[0].new_customers_in_current_period,
          prev: res[0].new_customers_in_previous_period,
        })
      })
      .catch(console.log)
  }, [newCustomersRange])
  useEffect(() => {
    const params = new URLSearchParams({ startDate: format(signupsRange.from, 'yyyy-MM-dd'), endDate: format(signupsRange.to, 'yyyy-MM-dd') })
    fetch(`/api/signups?${params.toString()}`)
      .then((res) => res.json())
      .then(setSignups)
      .catch(console.log)
  }, [signupsRange])
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-4">
      <Card className="border border-gray-100 px-5 py-5 rounded-none shadow-none">
        <CardHeader className="p-0">
          <CardTitle>Total Sales</CardTitle>
          <CardDescription>
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <span className="w-full">
                {format(salesRange.from, 'd MMMM yyyy')} - {format(salesRange.to, 'd MMMM yyyy')}
              </span>
              <Popover>
                <PopoverTrigger className="mt-3" asChild>
                  <Button variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !salesRange && 'text-muted-foreground')}>
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
        <CardContent className="relative p-0">
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
          <ChartContainer className="mt-8" config={{}}>
            <LineChart accessibilityLayer data={chartData} margin={{ right: 22, left: 0 }}>
              <CartesianGrid />
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis dataKey="sale_date" />
              <YAxis domain={[0, Math.max(...chartData.map(({ total_sales }: { total_sales: number }) => total_sales))]} />
              <Line type="natural" strokeWidth={2} dataKey="total_sales" stroke="hsl(var(--secondary))" dot={{ fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="border border-gray-100 px-5 py-5 rounded-none shadow-none">
        <CardHeader className="p-0">
          <CardTitle>New Customers</CardTitle>
          <CardDescription>
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <div className="w-full flex flex-col gap-y-1 text-xs">
                <span className="w-full">
                  From{' '}
                  {`${format(subDays(newCustomersRange.from, differenceInDays(newCustomersRange.to, newCustomersRange.from)), 'd MMMM yyyy')} to ${format(newCustomersRange.from, 'd MMMM yyyy')}`}
                </span>
                <span className="w-full">To {`${format(newCustomersRange.from, 'd MMMM yyyy')} to ${format(newCustomersRange.to, 'd MMMM yyyy')}`}</span>
              </div>
              <Popover>
                <PopoverTrigger className="mt-3" asChild>
                  <Button variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !newCustomersRange && 'text-muted-foreground')}>
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
        <CardContent className="relative p-0">
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
          <ChartContainer className="mt-8" config={{}}>
            <LineChart
              accessibilityLayer
              margin={{ right: 22, left: -32 }}
              data={[
                {
                  value: newCustomers.prev,
                  label: `From ${format(subDays(newCustomersRange.from, differenceInDays(newCustomersRange.to, newCustomersRange.from)), 'd MMMM yyyy')} to ${format(newCustomersRange.from, 'd MMMM yyyy')}`,
                },
                {
                  value: newCustomers.new,
                  label: `From ${format(newCustomersRange.from, 'd MMMM yyyy')} to ${format(newCustomersRange.to, 'd MMMM yyyy')}`,
                },
              ]}
            >
              <CartesianGrid />
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis dataKey="label" />
              <YAxis domain={[0, Math.max(newCustomers.prev, newCustomers.new)]} />
              <Line dataKey="value" strokeWidth={2} type="natural" stroke="hsl(var(--secondary))" dot={{ fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}>
                <LabelList dataKey="name" />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="border border-gray-100 px-5 py-5 rounded-none shadow-none">
        <CardHeader className="p-0">
          <CardTitle>Paying vs Free</CardTitle>
          <CardDescription>
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <span className="w-full">
                From {format(signupsRange.from, 'd MMMM yyyy')} To {format(signupsRange.to, 'd MMMM yyyy')}
              </span>
              <Popover>
                <PopoverTrigger className="mt-3" asChild>
                  <Button variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !signupsRange && 'text-muted-foreground')}>
                    <CalendarIcon />
                    {signupsRange?.from ? (
                      signupsRange.to ? (
                        <>
                          {format(signupsRange.from, 'LLL dd, y')} - {format(signupsRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(signupsRange.from, 'LLL dd, y')
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
                    selected={signupsRange}
                    defaultMonth={signupsRange.from}
                    onSelect={(e) => {
                      if (e?.from) setSignupsRange({ from: e.from, to: e.to || e.from })
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-0">
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
          <ChartContainer className="mt-8" config={{}}>
            <RadialBarChart
              endAngle={180}
              innerRadius={80}
              outerRadius={130}
              data={signups?.length > 0 ? [{ [signups[0].type]: signups[0].count, [signups[1].type]: signups[1].count }] : []}
            >
              <ChartTooltip content={<ChartTooltipContent />} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 16} className="fill-foreground text-2xl font-bold">
                            {signups.reduce((acc, i) => acc + Number(i.count), 0)}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 4} className="fill-muted-foreground">
                            Customers
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar dataKey="Free" fill="hsl(var(--primary))" stackId="a" />
              <RadialBar dataKey="Paying" fill="hsl(var(--destructive))" stackId="a" />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
