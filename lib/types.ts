export interface RepositoryAnalysis {
  repoInfo: {
    name: string
    fullName: string
    description: string | null
    url: string
    stars: number
    forks: number
    watchers: number
    language: string | null
    languages: Record<string, number>
    createdAt: string
    updatedAt: string
    defaultBranch: string
    openIssues: number
    license: string | null
    topics: string[]
  }
  metrics: {
    codeQuality: MetricScore
    projectStructure: MetricScore
    documentation: MetricScore
    testCoverage: MetricScore
    versionControl: MetricScore
    realWorldRelevance: MetricScore
  }
  score: number
  level: "Beginner" | "Intermediate" | "Advanced"
  badge: "Bronze" | "Silver" | "Gold"
  summary: string
  roadmap: RoadmapItem[]
  commitActivity: CommitActivity[]
  fileStructure: FileNode[]
}

export interface MetricScore {
  score: number
  maxScore: number
  details: string[]
}

export interface RoadmapItem {
  priority: "high" | "medium" | "low"
  category: string
  action: string
  description: string
}

export interface CommitActivity {
  week: string
  commits: number
}

export interface FileNode {
  name: string
  type: "file" | "dir"
  path: string
  children?: FileNode[]
}
