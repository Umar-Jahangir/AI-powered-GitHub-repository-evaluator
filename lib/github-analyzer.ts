import type { RepositoryAnalysis, MetricScore, RoadmapItem, CommitActivity, FileNode } from "./types"

const GITHUB_API_BASE = "https://api.github.com"

interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  created_at: string
  updated_at: string
  default_branch: string
  open_issues_count: number
  license: { name: string } | null
  topics: string[]
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
}

interface GitHubContent {
  name: string
  type: "file" | "dir"
  path: string
}

interface GitHubBranch {
  name: string
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [/github\.com\/([^/]+)\/([^/]+)/, /^([^/]+)\/([^/]+)$/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") }
    }
  }
  return null
}

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitGrade-Analyzer",
  }

  // Use GitHub token if available (5000 requests/hour vs 60)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Repository not found. Please check the URL and ensure it's a public repository.")
    }
    if (response.status === 403) {
      throw new Error("API rate limit exceeded. Please try again later or add a GitHub token.")
    }
    throw new Error(`GitHub API error: ${response.status}`)
  }

  return response.json()
}

async function getRepoInfo(owner: string, repo: string): Promise<GitHubRepo> {
  return fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`)
}

async function getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  return fetchGitHub<Record<string, number>>(`/repos/${owner}/${repo}/languages`)
}

async function getCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
  return fetchGitHub<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=100`)
}

async function getContents(owner: string, repo: string, path = ""): Promise<GitHubContent[]> {
  try {
    return await fetchGitHub<GitHubContent[]>(`/repos/${owner}/${repo}/contents/${path}`)
  } catch {
    return []
  }
}

async function getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  return fetchGitHub<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`)
}

async function getReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "GitGrade-Analyzer",
    }

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers })
    if (response.ok) {
      return response.text()
    }
    return null
  } catch {
    return null
  }
}

function analyzeCodeQuality(contents: GitHubContent[], languages: Record<string, number>): MetricScore {
  const details: string[] = []
  let score = 0
  const maxScore = 20

  // Check for linting/formatting configs
  const configFiles = contents.map((c) => c.name.toLowerCase())
  const hasEslint = configFiles.some((f) => f.includes("eslint"))
  const hasPrettier = configFiles.some((f) => f.includes("prettier"))
  const hasEditorConfig = configFiles.includes(".editorconfig")
  const hasTsConfig = configFiles.includes("tsconfig.json")

  if (hasEslint) {
    score += 4
    details.push("ESLint configuration found")
  } else {
    details.push("Missing ESLint configuration")
  }

  if (hasPrettier) {
    score += 3
    details.push("Prettier configuration found")
  }

  if (hasEditorConfig) {
    score += 2
    details.push("EditorConfig found")
  }

  if (hasTsConfig) {
    score += 3
    details.push("TypeScript configuration found")
  }

  // Language diversity bonus
  const langCount = Object.keys(languages).length
  if (langCount >= 3) {
    score += 4
    details.push(`Uses ${langCount} languages/technologies`)
  } else if (langCount >= 2) {
    score += 2
    details.push(`Uses ${langCount} languages`)
  }

  // Modern stack detection
  const hasModernStack = Object.keys(languages).some((l) => ["TypeScript", "Rust", "Go", "Kotlin"].includes(l))
  if (hasModernStack) {
    score += 4
    details.push("Uses modern language/framework")
  }

  return { score: Math.min(score, maxScore), maxScore, details }
}

function analyzeProjectStructure(contents: GitHubContent[]): MetricScore {
  const details: string[] = []
  let score = 0
  const maxScore = 20

  const names = contents.map((c) => c.name.toLowerCase())
  const dirs = contents.filter((c) => c.type === "dir").map((c) => c.name.toLowerCase())

  // Check for organized folder structure
  const hasSourceDir = dirs.some((d) => ["src", "app", "lib", "source"].includes(d))
  const hasComponentsDir = dirs.some((d) => ["components", "ui", "views"].includes(d))
  const hasConfigDir = dirs.some((d) => ["config", "configs", "settings"].includes(d))
  const hasUtilsDir = dirs.some((d) => ["utils", "helpers", "lib", "shared"].includes(d))

  if (hasSourceDir) {
    score += 5
    details.push("Organized source directory structure")
  } else {
    details.push("Consider organizing code into src/ directory")
  }

  if (hasComponentsDir) {
    score += 4
    details.push("Components directory found")
  }

  if (hasConfigDir) {
    score += 2
    details.push("Configuration directory found")
  }

  if (hasUtilsDir) {
    score += 2
    details.push("Utilities directory found")
  }

  // Check for package manager
  const hasPackageJson = names.includes("package.json")
  const hasPyproject = names.includes("pyproject.toml") || names.includes("requirements.txt")
  const hasCargoToml = names.includes("cargo.toml")
  const hasGoMod = names.includes("go.mod")

  if (hasPackageJson || hasPyproject || hasCargoToml || hasGoMod) {
    score += 4
    details.push("Package manager configuration found")
  }

  // Check for gitignore
  if (names.includes(".gitignore")) {
    score += 3
    details.push(".gitignore present")
  } else {
    details.push("Missing .gitignore file")
  }

  return { score: Math.min(score, maxScore), maxScore, details }
}

function analyzeDocumentation(contents: GitHubContent[], readme: string | null): MetricScore {
  const details: string[] = []
  let score = 0
  const maxScore = 20

  const names = contents.map((c) => c.name.toLowerCase())

  // README analysis
  if (readme) {
    score += 5
    details.push("README.md present")

    const readmeLength = readme.length
    if (readmeLength > 2000) {
      score += 4
      details.push("Comprehensive README documentation")
    } else if (readmeLength > 500) {
      score += 2
      details.push("Basic README documentation")
    } else {
      details.push("README could be more detailed")
    }

    // Check for sections
    const hasInstallation = /install|setup|getting started/i.test(readme)
    const hasUsage = /usage|how to use|example/i.test(readme)
    const hasContributing = /contribut/i.test(readme)
    const hasLicense = /license/i.test(readme)

    if (hasInstallation) {
      score += 2
      details.push("Installation instructions present")
    }
    if (hasUsage) {
      score += 2
      details.push("Usage examples present")
    }
    if (hasContributing) {
      score += 1
      details.push("Contributing guidelines mentioned")
    }
    if (hasLicense) {
      score += 1
    }
  } else {
    details.push("Missing README.md - This is critical!")
  }

  // Check for additional docs
  const hasDocsDir = contents.some((c) => c.type === "dir" && ["docs", "documentation"].includes(c.name.toLowerCase()))
  const hasChangelog = names.some((n) => n.includes("changelog"))
  const hasContributing = names.includes("contributing.md")

  if (hasDocsDir) {
    score += 3
    details.push("Documentation directory found")
  }

  if (hasChangelog) {
    score += 1
    details.push("Changelog present")
  }

  if (hasContributing) {
    score += 1
    details.push("Contributing guidelines present")
  }

  return { score: Math.min(score, maxScore), maxScore, details }
}

function analyzeTestCoverage(contents: GitHubContent[]): MetricScore {
  const details: string[] = []
  let score = 0
  const maxScore = 15

  const names = contents.map((c) => c.name.toLowerCase())
  const dirs = contents.filter((c) => c.type === "dir").map((c) => c.name.toLowerCase())

  // Check for test directories
  const hasTestDir = dirs.some((d) => ["test", "tests", "__tests__", "spec", "specs"].includes(d))
  const hasE2eDir = dirs.some((d) => ["e2e", "cypress", "playwright"].includes(d))

  if (hasTestDir) {
    score += 6
    details.push("Test directory found")
  } else {
    details.push("No test directory found")
  }

  if (hasE2eDir) {
    score += 4
    details.push("E2E test setup found")
  }

  // Check for test configuration
  const hasJestConfig = names.some((n) => n.includes("jest"))
  const hasVitestConfig = names.some((n) => n.includes("vitest"))
  const hasPytest = names.some((n) => n.includes("pytest") || n.includes("conftest"))
  const hasCypressConfig = names.some((n) => n.includes("cypress"))
  const hasPlaywrightConfig = names.some((n) => n.includes("playwright"))

  if (hasJestConfig || hasVitestConfig || hasPytest) {
    score += 3
    details.push("Test framework configuration found")
  }

  if (hasCypressConfig || hasPlaywrightConfig) {
    score += 2
    details.push("E2E testing framework configured")
  }

  if (score === 0) {
    details.push("Consider adding unit tests")
    details.push("Consider adding integration tests")
  }

  return { score: Math.min(score, maxScore), maxScore, details }
}

function analyzeVersionControl(commits: GitHubCommit[], branches: GitHubBranch[]): MetricScore {
  const details: string[] = []
  let score = 0
  const maxScore = 15

  // Analyze commit frequency
  const commitCount = commits.length
  if (commitCount >= 50) {
    score += 5
    details.push(`Strong commit history (${commitCount}+ commits)`)
  } else if (commitCount >= 20) {
    score += 3
    details.push(`Good commit history (${commitCount} commits)`)
  } else if (commitCount >= 5) {
    score += 1
    details.push(`Limited commit history (${commitCount} commits)`)
  } else {
    details.push("Very few commits - consider committing more frequently")
  }

  // Analyze commit messages
  const goodMessages = commits.filter((c) => {
    const msg = c.commit.message
    return msg.length > 10 && !msg.toLowerCase().startsWith("update") && !msg.toLowerCase().startsWith("fix")
  }).length

  const messageQuality = commitCount > 0 ? goodMessages / commitCount : 0
  if (messageQuality > 0.7) {
    score += 4
    details.push("Good commit message quality")
  } else if (messageQuality > 0.4) {
    score += 2
    details.push("Moderate commit message quality")
  } else {
    details.push("Improve commit message descriptions")
  }

  // Analyze branching
  const branchCount = branches.length
  if (branchCount >= 3) {
    score += 4
    details.push(`Uses branching strategy (${branchCount} branches)`)
  } else if (branchCount >= 2) {
    score += 2
    details.push("Some branching usage")
  } else {
    details.push("Consider using feature branches")
  }

  // Check for conventional commits
  const conventionalCommits = commits.filter((c) => {
    const msg = c.commit.message.toLowerCase()
    return /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)($$.+$$)?:/.test(msg)
  }).length

  if (conventionalCommits > commitCount * 0.3) {
    score += 2
    details.push("Uses conventional commit format")
  }

  return { score: Math.min(score, maxScore), maxScore, details }
}

function analyzeRealWorldRelevance(
  repoInfo: GitHubRepo,
  contents: GitHubContent[],
  readme: string | null,
): MetricScore {
  const details: string[] = []
  let score = 0
  const maxScore = 10

  // Stars and forks indicate community interest
  if (repoInfo.stargazers_count >= 100) {
    score += 3
    details.push(`Popular project (${repoInfo.stargazers_count} stars)`)
  } else if (repoInfo.stargazers_count >= 10) {
    score += 1
    details.push(`Some community interest (${repoInfo.stargazers_count} stars)`)
  }

  // Check for deployment/CI configs
  const names = contents.map((c) => c.name.toLowerCase())
  const dirs = contents.filter((c) => c.type === "dir").map((c) => c.name.toLowerCase())

  const hasGithubActions = dirs.includes(".github")
  const hasDockerfile = names.includes("dockerfile") || names.includes("docker-compose.yml")
  const hasVercelConfig = names.includes("vercel.json")
  const hasNetlifyConfig = names.includes("netlify.toml")

  if (hasGithubActions) {
    score += 2
    details.push("GitHub Actions CI/CD configured")
  }

  if (hasDockerfile) {
    score += 2
    details.push("Docker configuration present")
  }

  if (hasVercelConfig || hasNetlifyConfig) {
    score += 1
    details.push("Deployment configuration present")
  }

  // Check description and topics
  if (repoInfo.description && repoInfo.description.length > 20) {
    score += 1
    details.push("Good project description")
  }

  if (repoInfo.topics && repoInfo.topics.length >= 3) {
    score += 1
    details.push("Well-tagged with topics")
  }

  // License
  if (repoInfo.license) {
    score += 1
    details.push(`Licensed under ${repoInfo.license.name}`)
  } else {
    details.push("Consider adding a license")
  }

  return { score: Math.min(score, maxScore), maxScore, details }
}

function generateRoadmap(metrics: RepositoryAnalysis["metrics"]): RoadmapItem[] {
  const roadmap: RoadmapItem[] = []

  // Documentation improvements
  if (metrics.documentation.score < metrics.documentation.maxScore * 0.6) {
    roadmap.push({
      priority: "high",
      category: "Documentation",
      action: "Improve README.md",
      description: "Add project overview, installation instructions, usage examples, and contribution guidelines",
    })
  }

  if (!metrics.documentation.details.some((d) => d.includes("Installation"))) {
    roadmap.push({
      priority: "high",
      category: "Documentation",
      action: "Add installation instructions",
      description: "Include step-by-step setup guide for new developers",
    })
  }

  // Test coverage improvements
  if (metrics.testCoverage.score < metrics.testCoverage.maxScore * 0.4) {
    roadmap.push({
      priority: "high",
      category: "Testing",
      action: "Add unit tests",
      description: "Implement unit tests for core functionality using Jest, Vitest, or pytest",
    })
    roadmap.push({
      priority: "medium",
      category: "Testing",
      action: "Add integration tests",
      description: "Test component interactions and API endpoints",
    })
  }

  if (!metrics.testCoverage.details.some((d) => d.includes("E2E"))) {
    roadmap.push({
      priority: "low",
      category: "Testing",
      action: "Consider E2E testing",
      description: "Add end-to-end tests using Cypress or Playwright",
    })
  }

  // Code quality improvements
  if (!metrics.codeQuality.details.some((d) => d.includes("ESLint"))) {
    roadmap.push({
      priority: "medium",
      category: "Code Quality",
      action: "Add ESLint configuration",
      description: "Enforce consistent code style and catch potential bugs",
    })
  }

  if (!metrics.codeQuality.details.some((d) => d.includes("Prettier"))) {
    roadmap.push({
      priority: "low",
      category: "Code Quality",
      action: "Add Prettier for code formatting",
      description: "Ensure consistent code formatting across the project",
    })
  }

  // Project structure improvements
  if (metrics.projectStructure.score < metrics.projectStructure.maxScore * 0.5) {
    roadmap.push({
      priority: "medium",
      category: "Structure",
      action: "Reorganize folder structure",
      description: "Create src/, components/, utils/ directories for better organization",
    })
  }

  if (!metrics.projectStructure.details.some((d) => d.includes(".gitignore"))) {
    roadmap.push({
      priority: "high",
      category: "Structure",
      action: "Add .gitignore file",
      description: "Prevent committing sensitive files and build artifacts",
    })
  }

  // Version control improvements
  if (metrics.versionControl.score < metrics.versionControl.maxScore * 0.5) {
    roadmap.push({
      priority: "medium",
      category: "Version Control",
      action: "Improve commit practices",
      description: "Write descriptive commit messages and commit more frequently",
    })
  }

  if (!metrics.versionControl.details.some((d) => d.includes("branching"))) {
    roadmap.push({
      priority: "medium",
      category: "Version Control",
      action: "Use feature branches",
      description: "Create separate branches for features and merge via pull requests",
    })
  }

  // Real-world relevance improvements
  if (!metrics.realWorldRelevance.details.some((d) => d.includes("CI/CD"))) {
    roadmap.push({
      priority: "medium",
      category: "DevOps",
      action: "Add CI/CD pipeline",
      description: "Set up GitHub Actions for automated testing and deployment",
    })
  }

  if (!metrics.realWorldRelevance.details.some((d) => d.includes("Licensed"))) {
    roadmap.push({
      priority: "low",
      category: "Legal",
      action: "Add a license",
      description: "Choose an appropriate open-source license (MIT, Apache 2.0, etc.)",
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  roadmap.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return roadmap.slice(0, 10) // Limit to top 10 recommendations
}

function calculateCommitActivity(commits: GitHubCommit[]): CommitActivity[] {
  const weeks: Record<string, number> = {}

  commits.forEach((commit) => {
    const date = new Date(commit.commit.author.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]
    weeks[weekKey] = (weeks[weekKey] || 0) + 1
  })

  return Object.entries(weeks)
    .map(([week, commits]) => ({ week, commits }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12) // Last 12 weeks
}

function buildFileStructure(contents: GitHubContent[]): FileNode[] {
  return contents
    .map((item) => ({
      name: item.name,
      type: item.type,
      path: item.path,
    }))
    .sort((a, b) => {
      // Directories first
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}

function generateSummary(metrics: RepositoryAnalysis["metrics"], score: number, repoInfo: GitHubRepo): string {
  const parts: string[] = []

  // Overall assessment
  if (score >= 80) {
    parts.push("Excellent repository with professional-grade structure and practices.")
  } else if (score >= 60) {
    parts.push("Good repository with solid foundations.")
  } else if (score >= 40) {
    parts.push("Developing repository with room for improvement.")
  } else {
    parts.push("Early-stage repository that needs significant enhancements.")
  }

  // Strengths
  const strengths: string[] = []
  if (metrics.codeQuality.score >= metrics.codeQuality.maxScore * 0.7) {
    strengths.push("code quality")
  }
  if (metrics.projectStructure.score >= metrics.projectStructure.maxScore * 0.7) {
    strengths.push("project organization")
  }
  if (metrics.documentation.score >= metrics.documentation.maxScore * 0.7) {
    strengths.push("documentation")
  }
  if (metrics.versionControl.score >= metrics.versionControl.maxScore * 0.7) {
    strengths.push("version control practices")
  }

  if (strengths.length > 0) {
    parts.push(`Strong in ${strengths.join(", ")}.`)
  }

  // Weaknesses
  const weaknesses: string[] = []
  if (metrics.testCoverage.score < metrics.testCoverage.maxScore * 0.3) {
    weaknesses.push("test coverage")
  }
  if (metrics.documentation.score < metrics.documentation.maxScore * 0.3) {
    weaknesses.push("documentation")
  }
  if (metrics.versionControl.score < metrics.versionControl.maxScore * 0.3) {
    weaknesses.push("commit practices")
  }

  if (weaknesses.length > 0) {
    parts.push(`Needs improvement in ${weaknesses.join(", ")}.`)
  }

  return parts.join(" ")
}

export async function analyzeRepository(url: string): Promise<RepositoryAnalysis> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) {
    throw new Error("Invalid GitHub repository URL")
  }

  const { owner, repo } = parsed

  // Fetch all data in parallel
  const [repoInfo, languages, commits, contents, branches, readme] = await Promise.all([
    getRepoInfo(owner, repo),
    getLanguages(owner, repo),
    getCommits(owner, repo),
    getContents(owner, repo),
    getBranches(owner, repo),
    getReadme(owner, repo),
  ])

  // Calculate metrics
  const metrics = {
    codeQuality: analyzeCodeQuality(contents, languages),
    projectStructure: analyzeProjectStructure(contents),
    documentation: analyzeDocumentation(contents, readme),
    testCoverage: analyzeTestCoverage(contents),
    versionControl: analyzeVersionControl(commits, branches),
    realWorldRelevance: analyzeRealWorldRelevance(repoInfo, contents, readme),
  }

  // Calculate total score
  const totalScore = Object.values(metrics).reduce((sum, m) => sum + m.score, 0)
  const maxTotalScore = Object.values(metrics).reduce((sum, m) => sum + m.maxScore, 0)
  const normalizedScore = Math.round((totalScore / maxTotalScore) * 100)

  // Determine level and badge
  const level = normalizedScore >= 75 ? "Advanced" : normalizedScore >= 45 ? "Intermediate" : "Beginner"
  const badge = normalizedScore >= 80 ? "Gold" : normalizedScore >= 50 ? "Silver" : "Bronze"

  return {
    repoInfo: {
      name: repoInfo.name,
      fullName: repoInfo.full_name,
      description: repoInfo.description,
      url: repoInfo.html_url,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      watchers: repoInfo.watchers_count,
      language: repoInfo.language,
      languages,
      createdAt: repoInfo.created_at,
      updatedAt: repoInfo.updated_at,
      defaultBranch: repoInfo.default_branch,
      openIssues: repoInfo.open_issues_count,
      license: repoInfo.license?.name || null,
      topics: repoInfo.topics || [],
    },
    metrics,
    score: normalizedScore,
    level,
    badge,
    summary: generateSummary(metrics, normalizedScore, repoInfo),
    roadmap: generateRoadmap(metrics),
    commitActivity: calculateCommitActivity(commits),
    fileStructure: buildFileStructure(contents),
  }
}
