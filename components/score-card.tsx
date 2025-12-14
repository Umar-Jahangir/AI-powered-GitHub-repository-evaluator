"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Medal } from "lucide-react"

interface ScoreCardProps {
  score: number
  level: "Beginner" | "Intermediate" | "Advanced"
  badge: "Bronze" | "Silver" | "Gold"
}

export function ScoreCard({ score, level, badge }: ScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-primary"
    if (score >= 40) return "text-yellow-400"
    return "text-orange-400"
  }

  const getBadgeColor = () => {
    switch (badge) {
      case "Gold":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Silver":
        return "bg-slate-400/20 text-slate-300 border-slate-400/30"
      case "Bronze":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    }
  }

  const getLevelColor = () => {
    switch (level) {
      case "Advanced":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "Intermediate":
        return "bg-primary/20 text-primary border-primary/30"
      case "Beginner":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getBadgeIcon = () => {
    switch (badge) {
      case "Gold":
        return <Trophy className="h-4 w-4" />
      case "Silver":
        return <Medal className="h-4 w-4" />
      case "Bronze":
        return <Star className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-foreground">Repository Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`text-6xl font-bold ${getScoreColor()}`}>{score}</span>
            <span className="text-2xl text-muted-foreground">/ 100</span>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant="outline" className={getBadgeColor()}>
              {getBadgeIcon()}
              <span className="ml-1">{badge}</span>
            </Badge>
            <Badge variant="outline" className={getLevelColor()}>
              {level}
            </Badge>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
