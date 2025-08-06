"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  X,
  Download,
  Search,
  Filter,
  RefreshCw,
  Copy,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react"
import { realDataService } from "@/lib/real-data-service"

interface PipelineLogsProps {
  pipelineId: string
  isOpen: boolean
  onClose: () => void
}

interface LogEntry {
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  stage: string
  message: string
}

export default function PipelineLogs({ pipelineId, isOpen, onClose }: PipelineLogsProps) {
  const [logs, setLogs] = useState<string>("")
  const [parsedLogs, setParsedLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedStage, setSelectedStage] = useState<string>("all")
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && pipelineId) {
      loadLogs()
      // リアルタイム更新のための定期実行
      const interval = setInterval(loadLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen, pipelineId])

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [parsedLogs, autoScroll])

  const loadLogs = async () => {
    if (!pipelineId) return

    try {
      setLoading(true)
      const logData = await realDataService.getPipelineLogs(pipelineId)
      setLogs(logData)
      setParsedLogs(parseLogEntries(logData))
    } catch (error) {
      console.error("ログの読み込みに失敗:", error)
      setLogs("ログの読み込みに失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setLoading(false)
    }
  }

  const parseLogEntries = (logText: string): LogEntry[] => {
    const lines = logText.split("\n").filter((line) => line.trim())
    return lines.map((line, index) => {
      // ログエントリーをパース
      const timestampMatch = line.match(/^\[([^\]]+)\]/)
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toLocaleString("ja-JP")

      let level: LogEntry["level"] = "info"
      let stage = "一般"
      let message = line

      if (line.includes("エラー") || line.includes("失敗") || line.includes("ERROR")) {
        level = "error"
      } else if (line.includes("警告") || line.includes("WARNING")) {
        level = "warning"
      } else if (line.includes("成功") || line.includes("完了") || line.includes("SUCCESS")) {
        level = "success"
      }

      if (line.includes("ビルド")) {
        stage = "ビルド"
      } else if (line.includes("テスト")) {
        stage = "テスト"
      } else if (line.includes("デプロイ")) {
        stage = "デプロイ"
      } else if (line.includes("E2E")) {
        stage = "E2E"
      }

      // タイムスタンプを除いたメッセージを抽出
      if (timestampMatch) {
        message = line.substring(timestampMatch[0].length).trim()
      }

      return {
        timestamp,
        level,
        stage,
        message,
      }
    })
  }

  const filteredLogs = parsedLogs.filter((log) => {
    const matchesSearch = searchQuery === "" || log.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel
    const matchesStage = selectedStage === "all" || log.stage === selectedStage
    return matchesSearch && matchesLevel && matchesStage
  })

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const handleDownload = () => {
    const blob = new Blob([logs], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pipeline-${pipelineId}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs)
      console.log("ログをクリップボードにコピーしました")
    } catch (error) {
      console.error("コピーに失敗:", error)
    }
  }

  const stages = Array.from(new Set(parsedLogs.map((log) => log.stage)))
  const levels = ["all", "info", "warning", "error", "success"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                パイプラインログ
              </DialogTitle>
              <DialogDescription>パイプライン ID: {pipelineId}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                更新
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                ダウンロード
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                コピー
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Separator />
        </div>

        {/* フィルターとサーチ */}
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ログを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  レベル: {selectedLevel === "all" ? "すべて" : selectedLevel}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {levels.map((level) => (
                  <DropdownMenuItem key={level} onClick={() => setSelectedLevel(level)}>
                    {level === "all" ? "すべて" : level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  ステージ: {selectedStage === "all" ? "すべて" : selectedStage}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStage("all")}>すべて</DropdownMenuItem>
                {stages.map((stage) => (
                  <DropdownMenuItem key={stage} onClick={() => setSelectedStage(stage)}>
                    {stage}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{filteredLogs.length} エントリー</Badge>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoScroll"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                <label htmlFor="autoScroll" className="text-sm">
                  自動スクロール
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">
                エラー: {parsedLogs.filter((log) => log.level === "error").length}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                警告: {parsedLogs.filter((log) => log.level === "warning").length}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                成功: {parsedLogs.filter((log) => log.level === "success").length}
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-6">
          <Separator />
        </div>

        {/* ログ表示エリア */}
        <div className="flex-1 p-6 pt-0">
          <ScrollArea className="h-[500px] w-full border rounded-lg" ref={scrollAreaRef}>
            <div className="p-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2">ログを読み込み中...</span>
                </div>
              )}
              {!loading && filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery || selectedLevel !== "all" || selectedStage !== "all"
                    ? "フィルター条件に一致するログが見つかりません"
                    : "ログがありません"}
                </div>
              )}
              {!loading &&
                filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getLevelColor(log.level)} hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{log.timestamp}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.stage}
                          </Badge>
                        </div>
                        <div className="text-sm font-mono break-all">{log.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
