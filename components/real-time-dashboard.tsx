"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import {
  Activity,
  TrendingUp,
  Cpu,
  HardDrive,
  MemoryStickIcon as Memory,
  Network,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Play,
  Pause,
  GitBranch,
  Users,
  Target,
} from "lucide-react"
import {
  realDataService,
  type Pipeline,
  type SystemMetrics,
  type TestResult,
  type DeploymentEnvironment,
} from "@/lib/real-data-service"

// リアルタイムメトリクスコンポーネント
export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const updateMetrics = () => {
      if (isLive) {
        const currentMetrics = realDataService.getCurrentMetrics()
        setMetrics(currentMetrics)
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)
    return () => clearInterval(interval)
  }, [isLive])

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500"
    if (value >= thresholds.warning) return "text-yellow-500"
    return "text-green-500"
  }

  if (!metrics) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2">メトリクス読み込み中...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            リアルタイムシステム監視
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={isLive ? "text-green-600" : "text-gray-600"}
            >
              {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isLive ? "ライブ" : "一時停止"}
            </Button>
            <div className="text-xs text-gray-500">{metrics.timestamp.toLocaleTimeString("ja-JP")}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">CPU使用率</span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
                {metrics.cpu}%
              </span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Memory className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">メモリ使用率</span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
                {metrics.memory}%
              </span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">ディスク使用率</span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(metrics.disk, { warning: 80, critical: 95 })}`}>
                {metrics.disk}%
              </span>
            </div>
            <Progress value={metrics.disk} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">ネットワーク</span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(metrics.network, { warning: 70, critical: 90 })}`}>
                {metrics.network}%
              </span>
            </div>
            <Progress value={metrics.network} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// パフォーマンストレンドチャート
export function PerformanceTrendChart() {
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([])

  useEffect(() => {
    const updateHistory = () => {
      const history = realDataService.getMetricsHistory(6) // 6時間分
      setMetricsHistory(history)
    }

    updateHistory()
    const interval = setInterval(updateHistory, 30000) // 30秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  const chartData = metricsHistory.map((metric) => ({
    time: metric.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    cpu: metric.cpu,
    memory: metric.memory,
    disk: metric.disk,
    network: metric.network,
  }))

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          パフォーマンストレンド（6時間）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="CPU使用率(%)"
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="memory"
              stroke="#06b6d4"
              strokeWidth={2}
              name="メモリ使用率(%)"
              dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// リアルタイムパイプライン表示
export function RealTimePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPipelines = async () => {
      try {
        const data = await realDataService.getPipelines()
        setPipelines(data)
      } catch (error) {
        console.error("Failed to load pipelines:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPipelines()
    const interval = setInterval(loadPipelines, 10000) // 10秒ごとに更新
    return () => clearInterval(interval)
  }, [])

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

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2">パイプライン読み込み中...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-600" />
          リアルタイムパイプライン
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pipelines.slice(0, 5).map((pipeline) => (
            <div key={pipeline.id} className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(pipeline.status)}
                  <span className="font-medium">{pipeline.name}</span>
                </div>
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
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-4">
                  <span>ブランチ: {pipeline.branch}</span>
                  <span>コミット: {pipeline.commit}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>作成者: {pipeline.author}</span>
                  <span>開始: {pipeline.startTime.toLocaleTimeString("ja-JP")}</span>
                </div>
              </div>
              {pipeline.status === "running" && (
                <div className="mt-2">
                  <Progress value={65} className="h-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// リアルタイムテスト結果
export function RealTimeTestResults() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTestResults = async () => {
      try {
        const results = await realDataService.getTestResults()
        setTestResults(results)
      } catch (error) {
        console.error("Failed to load test results:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTestResults()
    const interval = setInterval(loadTestResults, 15000) // 15秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  const getTestIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2">テスト結果読み込み中...</span>
        </CardContent>
      </Card>
    )
  }

  const junitTests = testResults.filter((test) => test.suite === "JUnit")
  const playwrightTests = testResults.filter((test) => test.suite === "Playwright")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            JUnitテスト結果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {junitTests.map((test, index) => (
              <div key={index} className={`p-3 rounded-lg ${test.status === "passed" ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTestIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{test.duration}s</span>
                </div>
                {test.error && <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">{test.error}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Playwright E2Eテスト結果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playwrightTests.map((test, index) => (
              <div key={index} className={`p-3 rounded-lg ${test.status === "passed" ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTestIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{test.duration}s</span>
                </div>
                {test.error && <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">{test.error}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// リアルタイムデプロイメント環境
export function RealTimeEnvironments() {
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEnvironments = async () => {
      try {
        const envs = await realDataService.getDeploymentEnvironments()
        setEnvironments(envs)
      } catch (error) {
        console.error("Failed to load environments:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEnvironments()
    const interval = setInterval(loadEnvironments, 20000) // 20秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: DeploymentEnvironment["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2">環境情報読み込み中...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          デプロイメント環境
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {environments.map((env, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(env.status)}
                  <h3 className="font-semibold">{env.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{env.version}</Badge>
                  {env.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={env.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" />
                        表示
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">稼働時間: </span>
                  <span className="font-semibold">{env.uptime}</span>
                </div>
                <div>
                  <span className="text-gray-500">最終デプロイ: </span>
                  <span className="font-semibold">{env.lastDeploy}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CPU</span>
                  <span>{env.resources.cpu}%</span>
                </div>
                <Progress value={env.resources.cpu} className="h-1" />

                <div className="flex items-center justify-between text-sm">
                  <span>メモリ</span>
                  <span>{env.resources.memory}%</span>
                </div>
                <Progress value={env.resources.memory} className="h-1" />

                <div className="flex items-center justify-between text-sm">
                  <span>ディスク</span>
                  <span>{env.resources.disk}%</span>
                </div>
                <Progress value={env.resources.disk} className="h-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
