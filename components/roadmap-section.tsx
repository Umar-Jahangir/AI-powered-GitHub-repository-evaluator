"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoadmapItem } from "@/lib/types"
import { Map, ArrowRight } from "lucide-react"

interface RoadmapSectionProps {
  roadmap: RoadmapItem[]
}

export function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Documentation: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Testing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "Code Quality": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Structure: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Version Control": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      DevOps: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      Legal: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    }
    return colors[category] || "bg-secondary text-secondary-foreground"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Map className="h-5 w-5 text-primary" />
          Improvement Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roadmap.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                  <Badge variant="outline" className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  {item.action}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
