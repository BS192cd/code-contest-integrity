"use client"

import { Editor } from "@monaco-editor/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CodeEditor({ language, value, onChange, className }: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "")
  }

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case "python":
        return "python"
      case "javascript":
        return "javascript"
      case "java":
        return "java"
      case "cpp":
        return "cpp"
      default:
        return "plaintext"
    }
  }

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "python":
        return "Python"
      case "javascript":
        return "JavaScript"
      case "java":
        return "Java"
      case "cpp":
        return "C++"
      default:
        return lang
    }
  }

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{getLanguageLabel(language)}</span>
        </div>
        <div className="text-xs text-muted-foreground">Lines: {value.split("\n").length}</div>
      </div>

      <div className="flex-1">
        <Editor
          language={getMonacoLanguage(language)}
          value={value}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            acceptSuggestionOnCommitCharacter: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            contextmenu: true,
            mouseWheelZoom: true
          }}
        />
      </div>
    </Card>
  )
}
