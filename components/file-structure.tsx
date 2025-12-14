"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FileNode } from "@/lib/types"
import { Folder, FileCode, FolderTree } from "lucide-react"

interface FileStructureProps {
  files: FileNode[]
}

export function FileStructure({ files }: FileStructureProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FolderTree className="h-5 w-5 text-primary" />
          File Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 font-mono text-sm max-h-64 overflow-y-auto">
          {files.slice(0, 20).map((file) => (
            <div key={file.path} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-secondary/50">
              {file.type === "dir" ? (
                <Folder className="h-4 w-4 text-primary" />
              ) : (
                <FileCode className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={file.type === "dir" ? "text-foreground font-medium" : "text-muted-foreground"}>
                {file.name}
              </span>
            </div>
          ))}
          {files.length > 20 && (
            <p className="text-xs text-muted-foreground px-2 pt-2">And {files.length - 20} more files...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
