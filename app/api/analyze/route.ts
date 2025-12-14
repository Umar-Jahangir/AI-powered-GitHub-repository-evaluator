import { type NextRequest, NextResponse } from "next/server"
import { analyzeRepository } from "@/lib/github-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    const analysis = await analyzeRepository(url)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze repository" },
      { status: 500 },
    )
  }
}
