"use client"

import { useMemo, useRef, useState } from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { useTheme } from "next-themes"
import { useFinancialData } from "@/hooks/useFinancialData"
import { generateMultiCategoryData } from "@/lib/chart-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Info, TrendingUp, Target } from "lucide-react"
import { CategoryMatrix } from "./category-matrix"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

const CHART_DESCRIPTIONS = {
  title: "Spending trends by category",
  description:
    "Track how your spending in different categories changes over time to uncover patterns and opportunities to optimize your budget.",
  insights: [
    "Identify categories with rising spend that may need attention",
    "Spot seasonal patterns across travel, utilities, and discretionary categories",
    "Compare current month performance against recent history",
    "Set category targets and monitor progress toward each goal",
  ],
}

export default function CategoryLineChart() {
  const { categories = [], transactions, loading, error } = useFinancialData()
  const { resolvedTheme } = useTheme()
  const [chartType, setChartType] = useState<'line' | 'bar' | 'matrix'>('line')
  const [allVisible, setAllVisible] = useState(true)
  const chartRef = useRef<any>(null)

  const appearance = useMemo(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      text: isDark ? '#e5e7eb' : '#111827',
      grid: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.32)',
      tooltipBg: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.9)',
      tooltipBorder: isDark ? 'rgba(94, 234, 212, 0.45)' : 'rgba(37, 99, 235, 0.45)',
    }
  }, [resolvedTheme])

  const validCategories = useMemo(
    () => categories.filter((cat) => cat.category && typeof cat.amount === 'number'),
    [categories],
  )

  const chartData = useMemo(() => {
    if (validCategories.length === 0) return null
    return generateMultiCategoryData(transactions, validCategories)
  }, [transactions, validCategories])

  const chartOptions: ChartOptions<'line' | 'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: appearance.text,
            font: { size: 11 },
            usePointStyle: true,
            padding: 18,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: appearance.tooltipBg,
          titleColor: '#f8fafc',
          bodyColor: '#f8fafc',
          borderColor: appearance.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y
              return ` ${context.dataset.label ?? 'Amount'}: $${Number(value ?? 0).toLocaleString()}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: appearance.grid,
            drawBorder: false,
          },
          ticks: {
            color: appearance.text,
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: appearance.grid,
            drawBorder: false,
          },
          ticks: {
            color: appearance.text,
            font: { size: 11 },
            callback: (value) => `$${Number(value ?? 0).toLocaleString()}`,
          },
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
    }),
    [appearance],
  )

  const toggleAllCategories = () => {
    if (!chartRef.current) return
    const chart = chartRef.current
    const nextVisibility = !allVisible
    chart.data.datasets.forEach((_: any, index: number) => {
      chart.setDatasetVisibility(index, nextVisibility)
    })
    chart.update()
    setAllVisible(nextVisibility)
  }

  if (loading) {
    return (
      <Card className="border-border/60 bg-card/80 p-6 text-center">
        <span className="text-sm text-muted-foreground">Loading category insights…</span>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
        <span className="text-sm">Unable to load category data: {error}</span>
      </Card>
    )
  }

  if (!chartData || validCategories.length === 0) {
    return (
      <Card className="border-border/60 bg-muted/40 p-8 text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">No category data yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Import transactions or sync a financial account to populate this visualization.</p>
          <p>Once data is available, you will see month-over-month trends and insights here.</p>
        </CardContent>
      </Card>
    )
  }

  const totalAmount = validCategories.reduce((sum, cat) => sum + Number(cat.amount ?? 0), 0)

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            {CHART_DESCRIPTIONS.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{CHART_DESCRIPTIONS.description}</p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Target className="h-4 w-4 text-primary" /> Key insights
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CHART_DESCRIPTIONS.insights.map((insight) => (
                  <li key={insight} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 h-5 w-5 min-w-[1.25rem] rounded-full border-primary/40 bg-primary/10 text-[10px] text-primary">
                      •
                    </Badge>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Info className="h-4 w-4 text-primary" /> Snapshot metrics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-center">
                  <div className="text-2xl font-semibold text-foreground">{validCategories.length}</div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Tracked categories</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-center">
                  <div className="text-2xl font-semibold text-foreground">${totalAmount.toLocaleString()}</div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Total spend</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 border-border/60 bg-card/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Spending trends visualization</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'matrix') => setChartType(value)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Visualization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="line">Category breakdown (line)</SelectItem>
                    <SelectItem value="bar">Category breakdown (bar)</SelectItem>
                    <SelectItem value="matrix">Category breakdown (matrix)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {(chartType === 'line' || chartType === 'bar') && (
              <Button variant="outline" size="sm" onClick={toggleAllCategories}>
                {allVisible ? 'Hide all series' : 'Show all series'}
              </Button>
            )}
          </div>

          <div className="h-[420px] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-3">
            {chartType === 'matrix' ? (
              <CategoryMatrix />
            ) : chartType === 'line' ? (
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            ) : (
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { CategoryLineChart }
