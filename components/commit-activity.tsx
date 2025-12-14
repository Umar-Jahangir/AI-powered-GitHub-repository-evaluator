"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CommitActivity as CommitActivityType } from "@/lib/types"
import { Activity } from "lucide-react"

interface CommitActivityProps {
  activity: CommitActivityType[]
}

export function CommitActivity({ activity }: CommitActivityProps) {
  const maxCommits = Math.max(...activity.map((a) => a.commits), 1)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5 text-primary" />
          Commit Activity (Last 12 Weeks)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {activity.map((week, index) => {
            const height = (week.commits / maxCommits) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${week.commits} commits`}
                />
                <span className="text-[10px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                  {new Date(week.week).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex justify-between text-xs text-muted-foreground">
          <span>Total: {activity.reduce((sum, w) => sum + w.commits, 0)} commits</span>
          <span>Avg: {Math.round(activity.reduce((sum, w) => sum + w.commits, 0) / activity.length)} / week</span>
        </div>
      </CardContent>
    </Card>
  )
}
