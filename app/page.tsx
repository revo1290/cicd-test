"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PipelineLogs from "@/components/pipeline-logs"
import MetricsDashboard from "@/components/metrics-dashboard"
import AlertSystem from "@/components/alert-system"
import {
  GitBranch,
  Play,
  RefreshCw,
  Activity,
  TrendingUp,
  AlertTriangle,
  Zap,
  TestTube,
  Rocket,
  Eye,
  Settings,
  BarChart3,
  Bell,
  Database,
  Monitor,
  Github,
  ExternalLink,
  Square,
} from "lucide-react"
import Navigation from "@/components/navigation"
import { StatusIndicator } from "@/components/status-indicators"
import AdvancedSidebar from "@/components/advanced-sidebar"
import {
  RealTimeMetrics,
  PerformanceTrendChart,
  RealTimePipelines,
  RealTimeTestResults,
  RealTimeEnvironments,
} from "@/components/real-time-dashboard"
import {
  ProjectManagement,
  EnvironmentManagement,
  IntegrationSettings,
  ScheduleManagement,
} from "@/components/advanced-features"
import { PipelineExecutionControls } from "@/components/pipeline-execution"
import { realDataService, type Pipeline, type GitHubRepository } from "@/lib/real-data-service"

export default function AdvancedCICDDashboard() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // リアルデータの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [pipelineData, repoData] = await Promise.all([
          realDataService.getPipelines(),
          realDataService.getRepositories(),
        ])

        setPipelines(pipelineData)
        setRepositories(repoData)

        if (pipelineData.length > 0) {
          setSelectedPipeline(pipelineData[0])
        }
      } catch (error) {
        console.error("データの読み込みに失敗:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // 定期的にデータを更新
    const interval = setInterval(loadData, 30000) // 30秒ごと
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    return <StatusIndicator status={status as any} size="md" />
  }

  const getStatusColor = (status: string) => {
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

  const successRate =
    pipelines.length > 0 ? (pipelines.filter((p) => p.status === "success").length / pipelines.length) * 100 : 0

  const avgDuration = pipelines.length > 0 ? pipelines.reduce((acc, p) => acc + p.duration, 0) / pipelines.length : 0

  const runPipeline = async (pipelineId?: string) => {
    try {
      if (pipelineId) {
        await realDataService.triggerPipeline(pipelineId)
        console.log("パイプライン実行:", pipelineId)
        // パイプライン状態を更新
        setPipelines((prev) => prev.map((p) => (p.id === pipelineId ? { ...p, status: "running" } : p)))
      } else {
        console.log("新規パイプライン実行")
      }
    } catch (error) {
      console.error("パイプライン実行エラー:", error)
      alert("パイプラインの実行に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    }
  }

  const stopPipeline = async (pipelineId: string) => {
    try {
      await realDataService.cancelPipeline(pipelineId)
      console.log("パイプライン停止:", pipelineId)
      // パイプライン状態を更新
      setPipelines((prev) => prev.map((p) => (p.id === pipelineId ? { ...p, status: "failed" } : p)))
    } catch (error) {
      console.error("パイプライン停止エラー:", error)
      alert("パイプラインの停止に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    }
  }

  const handlePipelineUpdate = (updatedPipeline: Pipeline) => {
    setPipelines((prev) => prev.map((p) => (p.id === updatedPipeline.id ? updatedPipeline : p)))
    if (selectedPipeline?.id === updatedPipeline.id) {
      setSelectedPipeline(updatedPipeline)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex">
        <AdvancedSidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={sidebarOpen} />
        <div className={`flex-1 p-6 space-y-6 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                エンタープライズCI/CD統合管理センター
              </h1>
              <p className="text-lg text-gray-600 mt-2">リアルタイムパイプライン管理とDevOpsインテリジェンス</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>GitHub連携: 有効</span>
                <span>リポジトリ: {repositories.length}個</span>
                <span>アクティブパイプライン: {pipelines.filter((p) => p.status === "running").length}個</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
              <Button size="sm" onClick={() => runPipeline()}>
                <Play className="h-4 w-4 mr-2" />
                パイプライン実行
              </Button>
            </div>
          </div>

          {/* メトリクスカード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">成功率</p>
                    <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
                    <p className="text-xs text-green-200 mt-1">過去24時間</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">平均実行時間</p>
                    <p className="text-3xl font-bold">{Math.round(avgDuration / 60)}分</p>
                    <p className="text-xs text-blue-200 mt-1">全パイプライン</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">実行中</p>
                    <p className="text-3xl font-bold">{pipelines.filter((p) => p.status === "running").length}</p>
                    <p className="text-xs text-purple-200 mt-1">アクティブジョブ</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">失敗</p>
                    <p className="text-3xl font-bold">{pipelines.filter((p) => p.status === "failed").length}</p>
                    <p className="text-xs text-orange-200 mt-1">要対応</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 bg-white shadow-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                概要
              </TabsTrigger>
              <TabsTrigger value="pipelines" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                パイプライン
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                テスト
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                メトリクス
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                アラート
              </TabsTrigger>
              <TabsTrigger value="deployments" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                デプロイ
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                プロジェクト
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                設定
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealTimeMetrics />
                <PerformanceTrendChart />
              </div>
              <RealTimePipelines />
              <RealTimeEnvironments />
            </TabsContent>

            <TabsContent value="pipelines" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* パイプライン一覧 */}
                <div className="lg:col-span-1 space-y-4">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        リアルタイムパイプライン
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3" data-testid="pipeline-list">
                      {pipelines.slice(0, 10).map((pipeline) => (
                        <div
                          key={pipeline.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            selectedPipeline?.id === pipeline.id ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white"
                          }`}
                          onClick={() => setSelectedPipeline(pipeline)}
                          data-testid={`pipeline-item-${pipeline.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(pipeline.status)}
                              <span className="font-medium text-sm pipeline-name">{pipeline.name}</span>
                            </div>
                            <Badge className={`${getStatusColor(pipeline.status)} pipeline-status`}>
                              {pipeline.status === "running"
                                ? "実行中"
                                : pipeline.status === "success"
                                  ? "成功"
                                  : pipeline.status === "failed"
                                    ? "失敗"
                                    : "待機中"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="branch-name">ブランチ: {pipeline.branch}</div>
                            <div>コミット: {pipeline.commit}</div>
                            <div>作成者: {pipeline.author}</div>
                            <div>リポジトリ: {pipeline.repository}</div>
                          </div>
                          {pipeline.status === "running" && (
                            <div className="mt-2">
                              <Progress value={65} className="h-1" />
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {pipeline.status === "running" ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  stopPipeline(pipeline.id)
                                }}
                              >
                                <Square className="h-3 w-3 mr-1" />
                                停止
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  runPipeline(pipeline.id)
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                実行
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* パイプライン詳細 */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedPipeline && (
                    <>
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2" data-testid="pipeline-details">
                              {getStatusIcon(selectedPipeline.status)}
                              {selectedPipeline.name}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLogs(true)}
                                data-testid="view-logs-button"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                ログ表示
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => runPipeline(selectedPipeline.id)}
                                data-testid="restart-button"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                再実行
                              </Button>
                              {selectedPipeline.workflowUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={selectedPipeline.workflowUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    GitHub
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          <CardDescription>
                            {selectedPipeline.branch} • {selectedPipeline.commit} • {selectedPipeline.author} •{" "}
                            {selectedPipeline.repository}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* パイプライン進行状況 */}
                          <div className="space-y-4" data-testid="pipeline-stages">
                            {selectedPipeline.stages.map((stage, index) => (
                              <div key={stage.id} className="relative" data-testid={`stage-${stage.id}`}>
                                {index < selectedPipeline.stages.length - 1 && (
                                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                                )}
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                    {getStatusIcon(stage.status)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium">{stage.name}</h4>
                                      <div className="flex items-center gap-2">
                                        <Badge className={`${getStatusColor(stage.status)} status-badge`}>
                                          {stage.status === "running"
                                            ? "実行中"
                                            : stage.status === "success"
                                              ? "成功"
                                              : stage.status === "failed"
                                                ? "失敗"
                                                : stage.status === "skipped"
                                                  ? "スキップ"
                                                  : "待機中"}
                                        </Badge>
                                        {stage.duration > 0 && (
                                          <span className="text-sm text-gray-500">{stage.duration}秒</span>
                                        )}
                                      </div>
                                    </div>
                                    {stage.status === "running" && (
                                      <Progress value={65} className="h-2 mb-2 progress-bar" />
                                    )}
                                    {stage.startTime && (
                                      <div className="text-xs text-gray-500">
                                        開始: {stage.startTime.toLocaleString("ja-JP")}
                                        {stage.endTime && ` • 終了: ${stage.endTime.toLocaleString("ja-JP")}`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* パイプライン実行制御 */}
                      <PipelineExecutionControls pipeline={selectedPipeline} onExecutionUpdate={handlePipelineUpdate} />
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="space-y-6">
              <RealTimeTestResults />
            </TabsContent>

            <TabsContent value="metrics">
              <MetricsDashboard />
            </TabsContent>

            <TabsContent value="alerts">
              <AlertSystem />
            </TabsContent>

            <TabsContent value="deployments" className="space-y-6">
              <RealTimeEnvironments />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectManagement />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnvironmentManagement />
                <IntegrationSettings />
              </div>
              <ScheduleManagement />
            </TabsContent>
          </Tabs>

          {/* ログモーダル */}
          <PipelineLogs pipelineId={selectedPipeline?.id || ""} isOpen={showLogs} onClose={() => setShowLogs(false)} />
        </div>
      </div>
    </div>
  )
}
