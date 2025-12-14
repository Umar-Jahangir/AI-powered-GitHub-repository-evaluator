"use client"

import type { RepositoryAnalysis } from "@/lib/types"
import { ScoreCard } from "@/components/score-card"
import { SummarySection } from "@/components/summary-section"
import { MetricsGrid } from "@/components/metrics-grid"
import { RoadmapSection } from "@/components/roadmap-section"
import { RepoInfo } from "@/components/repo-info"
import { CommitActivity } from "@/components/commit-activity"
import { FileStructure } from "@/components/file-structure"

interface AnalysisResultsProps {
  analysis: RepositoryAnalysis
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RepoInfo repoInfo={analysis.repoInfo} />
        </div>
        <div>
          <ScoreCard score={analysis.score} level={analysis.level} badge={analysis.badge} />
        </div>
      </div>

      <SummarySection summary={analysis.summary} />

      <MetricsGrid metrics={analysis.metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommitActivity activity={analysis.commitActivity} />
        <FileStructure files={analysis.fileStructure} />
      </div>

      <RoadmapSection roadmap={analysis.roadmap} />
    </div>
  )
}
