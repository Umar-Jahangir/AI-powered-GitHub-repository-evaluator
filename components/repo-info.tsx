"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Eye, Calendar, Scale, ExternalLink, Tag } from "lucide-react"
import type { RepositoryAnalysis } from "@/lib/types"

interface RepoInfoProps {
  repoInfo: RepositoryAnalysis["repoInfo"]
}

export function RepoInfo({ repoInfo }: RepoInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalBytes = Object.values(repoInfo.languages).reduce((a, b) => a + b, 0)
  const sortedLanguages = Object.entries(repoInfo.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="truncate">{repoInfo.fullName}</span>
          <a
            href={repoInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {repoInfo.description && <p className="text-muted-foreground">{repoInfo.description}</p>}

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{repoInfo.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <GitFork className="h-4 w-4" />
            <span>{repoInfo.forks.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{repoInfo.watchers.toLocaleString()}</span>
          </div>
          {repoInfo.license && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span>{repoInfo.license}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created {formatDate(repoInfo.createdAt)}</span>
          <span className="text-border">•</span>
          <span>Updated {formatDate(repoInfo.updatedAt)}</span>
        </div>

        {repoInfo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repoInfo.topics.slice(0, 8).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {topic}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Languages</h4>
          <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
            {sortedLanguages.map(([lang, bytes], index) => {
              const percentage = (bytes / totalBytes) * 100
              const colors = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
              return (
                <div
                  key={lang}
                  className={`${colors[index]} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${lang}: ${percentage.toFixed(1)}%`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {sortedLanguages.map(([lang, bytes], index) => {
              const percentage = (bytes / totalBytes) * 100
              const dotColors = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
              return (
                <div key={lang} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${dotColors[index]}`} />
                  <span className="text-foreground">{lang}</span>
                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
