"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import type { RepositoryAnalysis } from "@/lib/types"

interface PdfExportButtonProps {
  analysis: RepositoryAnalysis
}

export function PdfExportButton({ analysis }: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePdf = async () => {
    setIsGenerating(true)

    try {
      // Dynamically import jspdf to reduce initial bundle
      const { default: jsPDF } = await import("jspdf")

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let yPos = 20

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight = 7) => {
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * lineHeight
      }

      // Header
      doc.setFillColor(17, 24, 39)
      doc.rect(0, 0, pageWidth, 45, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("GitGrade Report", margin, 25)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 35)

      yPos = 55

      // Repository Info Section
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Repository Information", margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(75, 85, 99)

      const repoInfo = [
        `Repository: ${analysis.repoInfo.fullName}`,
        `Description: ${analysis.repoInfo.description || "No description"}`,
        `Primary Language: ${analysis.repoInfo.language || "Not specified"}`,
        `Stars: ${analysis.repoInfo.stars} | Forks: ${analysis.repoInfo.forks} | Issues: ${analysis.repoInfo.openIssues}`,
        `License: ${analysis.repoInfo.license || "No license"}`,
      ]

      repoInfo.forEach((info) => {
        yPos = addWrappedText(info, margin, yPos, contentWidth)
      })

      yPos += 10

      // Score Section
      doc.setFillColor(243, 244, 246)
      doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F")

      doc.setTextColor(17, 24, 39)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Overall Score", margin + 10, yPos + 12)

      doc.setFontSize(28)
      doc.setTextColor(79, 70, 229)
      doc.text(`${analysis.score}/100`, margin + 10, yPos + 28)

      doc.setFontSize(12)
      doc.setTextColor(75, 85, 99)
      doc.text(`Level: ${analysis.level}`, margin + 60, yPos + 15)
      doc.text(`Badge: ${analysis.badge}`, margin + 60, yPos + 25)

      yPos += 45

      // Metrics Section
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Detailed Metrics", margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const metrics = [
        { name: "Code Quality", metric: analysis.metrics.codeQuality },
        { name: "Project Structure", metric: analysis.metrics.projectStructure },
        { name: "Documentation", metric: analysis.metrics.documentation },
        { name: "Test Coverage", metric: analysis.metrics.testCoverage },
        { name: "Version Control", metric: analysis.metrics.versionControl },
        { name: "Real-World Relevance", metric: analysis.metrics.realWorldRelevance },
      ]

      metrics.forEach(({ name, metric }) => {
        doc.setTextColor(17, 24, 39)
        doc.setFont("helvetica", "bold")
        doc.text(`${name}: ${metric.score}/${metric.maxScore}`, margin, yPos)
        yPos += 6

        doc.setTextColor(107, 114, 128)
        doc.setFont("helvetica", "normal")
        metric.details.forEach((detail) => {
          yPos = addWrappedText(`• ${detail}`, margin + 5, yPos, contentWidth - 10, 5)
        })
        yPos += 4
      })

      // New page for summary and roadmap
      doc.addPage()
      yPos = 20

      // Summary Section
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("AI Summary", margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(75, 85, 99)
      yPos = addWrappedText(analysis.summary, margin, yPos, contentWidth)
      yPos += 15

      // Roadmap Section
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Improvement Roadmap", margin, yPos)
      yPos += 10

      const priorityColors: Record<string, [number, number, number]> = {
        high: [239, 68, 68],
        medium: [245, 158, 11],
        low: [34, 197, 94],
      }

      analysis.roadmap.forEach((item, index) => {
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }

        const color = priorityColors[item.priority] || [107, 114, 128]
        doc.setFillColor(color[0], color[1], color[2])
        doc.circle(margin + 3, yPos - 2, 2, "F")

        doc.setTextColor(17, 24, 39)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text(`${index + 1}. ${item.action}`, margin + 10, yPos)
        yPos += 5

        doc.setTextColor(107, 114, 128)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.text(`Category: ${item.category} | Priority: ${item.priority.toUpperCase()}`, margin + 10, yPos)
        yPos += 5
        yPos = addWrappedText(item.description, margin + 10, yPos, contentWidth - 15, 5)
        yPos += 6
      })

      // Commit Activity Section
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }

      yPos += 10
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Commit Activity (Last 12 Weeks)", margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(75, 85, 99)

      const totalCommits = analysis.commitActivity.reduce((sum, w) => sum + w.commits, 0)
      const avgCommits =
        analysis.commitActivity.length > 0 ? Math.round(totalCommits / analysis.commitActivity.length) : 0

      doc.text(`Total Commits: ${totalCommits}`, margin, yPos)
      yPos += 6
      doc.text(`Average per Week: ${avgCommits}`, margin, yPos)
      yPos += 10

      // Draw simple bar chart for commits
      const maxCommits = Math.max(...analysis.commitActivity.map((a) => a.commits), 1)
      const barWidth = (contentWidth - 10) / analysis.commitActivity.length
      const maxBarHeight = 30

      analysis.commitActivity.forEach((week, i) => {
        const barHeight = (week.commits / maxCommits) * maxBarHeight
        const x = margin + i * barWidth
        const y = yPos + maxBarHeight - barHeight

        doc.setFillColor(79, 70, 229)
        doc.rect(x, y, barWidth - 2, barHeight, "F")
      })

      yPos += maxBarHeight + 5

      // Week labels
      doc.setFontSize(6)
      analysis.commitActivity.forEach((week, i) => {
        const x = margin + i * barWidth
        const label = new Date(week.week).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        doc.text(label, x, yPos, { angle: 45 })
      })

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
          align: "center",
        })
        doc.text("Generated by GitGrade", margin, doc.internal.pageSize.getHeight() - 10)
      }

      // Save the PDF
      doc.save(`gitgrade-report-${analysis.repoInfo.name}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePdf} disabled={isGenerating} variant="outline" className="gap-2 bg-transparent">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF Report
        </>
      )}
    </Button>
  )
}
