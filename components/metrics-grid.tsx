"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { MetricScore } from "@/lib/types"
import { Code2, FolderTree, FileText, TestTube2, GitBranch, Globe } from "lucide-react"

interface MetricsGridProps {
  metrics: {
    codeQuality: MetricScore
    projectStructure: MetricScore
    documentation: MetricScore
    testCoverage: MetricScore
    versionControl: MetricScore
    realWorldRelevance: MetricScore
  }
}

const metricConfig = {
  codeQuality: { label: "Code Quality", icon: Code2 },
  projectStructure: { label: "Project Structure", icon: FolderTree },
  documentation: { label: "Documentation", icon: FileText },
  testCoverage: { label: "Test Coverage", icon: TestTube2 },
  versionControl: { label: "Version Control", icon: GitBranch },
  realWorldRelevance: { label: "Real-World Relevance", icon: Globe },
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(metrics).map(([key, metric]) => {
        const config = metricConfig[key as keyof typeof metricConfig]
        const Icon = config.icon
        const percentage = Math.round((metric.score / metric.maxScore) * 100)

        return (
          <Card key={key} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-foreground">{metric.score}</span>
                <span className="text-sm text-muted-foreground">/ {metric.maxScore}</span>
              </div>
              <Progress value={percentage} className="h-2 mb-3" />
              <ul className="space-y-1">
                {metric.details.slice(0, 3).map((detail, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span
                      className={
                        detail.toLowerCase().includes("missing") ||
                        detail.toLowerCase().includes("no ") ||
                        detail.toLowerCase().includes("consider")
                          ? "text-orange-400"
                          : "text-primary"
                      }
                    >
                      {detail.toLowerCase().includes("missing") ||
                      detail.toLowerCase().includes("no ") ||
                      detail.toLowerCase().includes("consider")
                        ? "•"
                        : "✓"}
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
