'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

const chartConfig = {} satisfies ChartConfig

export default function () {
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
      <CardContent>
        <ChartContainer className="mt-4" config={chartConfig}>
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
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
