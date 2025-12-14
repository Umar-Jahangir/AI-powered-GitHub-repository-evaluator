"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CommitActivity as CommitActivityType } from "@/lib/types"
import { Activity } from "lucide-react"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CommitActivityProps {
  activity: CommitActivityType[]
}

export function CommitActivity({ activity }: CommitActivityProps) {
  const chartData = activity.map((week) => ({
    week: new Date(week.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    commits: week.commits,
  }))

  const totalCommits = activity.reduce((sum, w) => sum + w.commits, 0)
  const avgCommits = activity.length > 0 ? Math.round(totalCommits / activity.length) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5 text-green-500" />
          Commit Activity (Last 12 Weeks)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            commits: {
              label: "Commits",
              color: "#22c55e",
            },
          }}
          className="h-[200px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="commits" stroke="#22c55e" strokeWidth={2} fill="url(#commitGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>Total: {totalCommits} commits</span>
          <span>Avg: {avgCommits} / week</span>
        </div>
      </CardContent>
    </Card>
  )
}
