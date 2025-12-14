"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { RepoInput } from "@/components/repo-input"
import { AnalysisResults } from "@/components/analysis-results"
import type { RepositoryAnalysis } from "@/lib/types"
import { AlertCircle, Code2, FileSearch, Map, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (url: string) => {
    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze repository")
      }

      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Analyze Your GitHub Repository</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Get an AI-powered evaluation of your code quality, documentation, testing, and best practices with
            personalized improvement recommendations.
          </p>
          <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground animate-pulse">Analyzing repository...</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileSearch className="h-4 w-4" /> Fetching data
                </span>
                <span className="flex items-center gap-1">
                  <Code2 className="h-4 w-4" /> Analyzing code
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Generating insights
                </span>
              </div>
            </div>
          </div>
        )}

        {analysis && !isLoading && <AnalysisResults analysis={analysis} />}

        {!analysis && !isLoading && !error && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-xl bg-card border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Code Analysis</h3>
                <p className="text-sm text-muted-foreground">Evaluate code quality, structure, and best practices</p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Summary</h3>
                <p className="text-sm text-muted-foreground">Get intelligent insights about your repository</p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Improvement Roadmap</h3>
                <p className="text-sm text-muted-foreground">Actionable steps to improve your project</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for the GitGrade Hackathon by UnsaidTalks</p>
        </div>
      </footer>
    </div>
  )
}
