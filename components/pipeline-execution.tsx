"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  GitBranch,
  Zap,
} from "lucide-react"
import { realDataService, type Pipeline } from "@/lib/real-data-service"

interface PipelineExecutionProps {
  pipeline: Pipeline
  onExecutionUpdate?: (pipeline: Pipeline) => void
}

export function PipelineExecutionControls({ pipeline, onExecutionUpdate }: PipelineExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [showExecuteDialog, setShowExecuteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [executionParams, setExecutionParams] = useState({
    branch: pipeline.branch,
    environment: "staging",
    skipTests: false,
    deployAfterSuccess: true,
    notifyOnComplete: true,
  })

  const handleExecute = async () => {
    try {
      setIsExecuting(true)
      await realDataService.triggerPipeline(pipeline.id)
      setShowExecuteDialog(false)

      // パイプライン状態を更新
      const updatedPipeline = { ...pipeline, status: "running" as const }
      onExecutionUpdate?.(updatedPipeline)

      // 成功通知
      console.log("パイプライン実行開始:", pipeline.name)
    } catch (error) {
      console.error("パイプライン実行エラー:", error)
      alert("パイプラインの実行に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCancel = async () => {
    try {
      await realDataService.cancelPipeline(pipeline.id)
      setShowCancelDialog(false)

      // パイプライン状態を更新
      const updatedPipeline = { ...pipeline, status: "failed" as const }
      onExecutionUpdate?.(updatedPipeline)

      console.log("パイプライン停止:", pipeline.name)
    } catch (error) {
      console.error("パイプライン停止エラー:", error)
      alert("パイプラインの停止に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    }
  }

  const handleRerun = async () => {
    try {
      setIsExecuting(true)
      await realDataService.rerunPipeline(pipeline.id)

      // パイプライン状態を更新
      const updatedPipeline = { ...pipeline, status: "running" as const }
      onExecutionUpdate?.(updatedPipeline)

      console.log("パイプライン再実行:", pipeline.name)
    } catch (error) {
      console.error("パイプライン再実行エラー:", error)
      alert("パイプラインの再実行に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setIsExecuting(false)
    }
  }

  const getStatusIcon = (status: Pipeline["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Pipeline["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(pipeline.status)}
            パイプライン実行制御
          </CardTitle>
          <Badge className={getStatusColor(pipeline.status)}>
            {pipeline.status === "running"
              ? "実行中"
              : pipeline.status === "success"
                ? "成功"
                : pipeline.status === "failed"
                  ? "失敗"
                  : "待機中"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* パイプライン情報 */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-500">パイプライン名</div>
            <div className="font-medium">{pipeline.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">リポジトリ</div>
            <div className="font-medium">{pipeline.repository}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">ブランチ</div>
            <div className="font-medium flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {pipeline.branch}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">最終実行</div>
            <div className="font-medium">{pipeline.startTime.toLocaleString("ja-JP")}</div>
          </div>
        </div>

        {/* 実行進捗 */}
        {pipeline.status === "running" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>実行進捗</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-2" />
            <div className="text-xs text-gray-500">現在のステージ: E2Eテスト</div>
          </div>
        )}

        {/* 実行制御ボタン */}
        <div className="flex gap-2">
          {pipeline.status === "running" ? (
            <>
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Square className="h-4 w-4 mr-2" />
                    停止
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>パイプライン停止確認</DialogTitle>
                    <DialogDescription>
                      実行中のパイプライン「{pipeline.name}」を停止しますか？ この操作は取り消せません。
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      キャンセル
                    </Button>
                    <Button variant="destructive" onClick={handleCancel}>
                      停止する
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" disabled>
                <Pause className="h-4 w-4 mr-2" />
                一時停止
              </Button>
            </>
          ) : (
            <>
              <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={isExecuting}>
                    <Play className="h-4 w-4 mr-2" />
                    {isExecuting ? "実行中..." : "実行"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>パイプライン実行</DialogTitle>
                    <DialogDescription>
                      パイプライン「{pipeline.name}」を実行します。実行パラメータを設定してください。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="branch" className="text-right">
                        ブランチ
                      </Label>
                      <Select
                        value={executionParams.branch}
                        onValueChange={(value) => setExecutionParams({ ...executionParams, branch: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">main</SelectItem>
                          <SelectItem value="develop">develop</SelectItem>
                          <SelectItem value="staging">staging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="environment" className="text-right">
                        環境
                      </Label>
                      <Select
                        value={executionParams.environment}
                        onValueChange={(value) => setExecutionParams({ ...executionParams, environment: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">開発環境</SelectItem>
                          <SelectItem value="staging">ステージング環境</SelectItem>
                          <SelectItem value="production">本番環境</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">オプション</Label>
                      <div className="col-span-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="skipTests"
                            checked={executionParams.skipTests}
                            onChange={(e) => setExecutionParams({ ...executionParams, skipTests: e.target.checked })}
                          />
                          <Label htmlFor="skipTests" className="text-sm">
                            テストをスキップ
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="deployAfterSuccess"
                            checked={executionParams.deployAfterSuccess}
                            onChange={(e) =>
                              setExecutionParams({ ...executionParams, deployAfterSuccess: e.target.checked })
                            }
                          />
                          <Label htmlFor="deployAfterSuccess" className="text-sm">
                            成功時に自動デプロイ
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="notifyOnComplete"
                            checked={executionParams.notifyOnComplete}
                            onChange={(e) =>
                              setExecutionParams({ ...executionParams, notifyOnComplete: e.target.checked })
                            }
                          />
                          <Label htmlFor="notifyOnComplete" className="text-sm">
                            完了時に通知
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={handleExecute} disabled={isExecuting}>
                      <Play className="h-4 w-4 mr-2" />
                      実行開始
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleRerun} disabled={isExecuting}>
                <RefreshCw className="h-4 w-4 mr-2" />
                再実行
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            設定
          </Button>
        </div>

        {/* アラート */}
        {pipeline.status === "failed" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              パイプラインが失敗しました。ログを確認して問題を解決してください。
            </AlertDescription>
          </Alert>
        )}

        {pipeline.status === "running" && (
          <Alert className="border-blue-200 bg-blue-50">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              パイプラインが実行中です。進捗はリアルタイムで更新されます。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default PipelineExecutionControls
