"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Activity,
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Target,
  Cpu,
  HardDrive,
  MemoryStickIcon as Memory,
  Network,
} from "lucide-react"

// リアルタイムメトリクスウィジェット
export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: 68,
    memory: 85,
    disk: 72,
    network: 45,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 50,
        memory: Math.floor(Math.random() * 20) + 70,
        disk: Math.floor(Math.random() * 15) + 65,
        network: Math.floor(Math.random() * 40) + 30,
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500"
    if (value >= thresholds.warning) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          リアルタイムシステム監視
        </CardTitle>
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
  const data = [
    { time: "00:00", cpu: 45, memory: 60, response: 120 },
    { time: "04:00", cpu: 52, memory: 65, response: 135 },
    { time: "08:00", cpu: 68, memory: 78, response: 180 },
    { time: "12:00", cpu: 75, memory: 85, response: 220 },
    { time: "16:00", cpu: 82, memory: 88, response: 195 },
    { time: "20:00", cpu: 65, memory: 72, response: 150 },
  ]

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          パフォーマンストレンド（24時間）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
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

// デプロイメント統計
export function DeploymentStats() {
  const deploymentData = [
    { name: "成功", value: 85, color: "#10b981" },
    { name: "失敗", value: 10, color: "#ef4444" },
    { name: "ロールバック", value: 5, color: "#f59e0b" },
  ]

  const weeklyData = [
    { day: "月", deployments: 12, success: 11, failed: 1 },
    { day: "火", deployments: 15, success: 14, failed: 1 },
    { day: "水", deployments: 8, success: 8, failed: 0 },
    { day: "木", deployments: 18, success: 16, failed: 2 },
    { day: "金", deployments: 22, success: 20, failed: 2 },
    { day: "土", deployments: 5, success: 5, failed: 0 },
    { day: "日", deployments: 3, success: 3, failed: 0 },
  ]

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          デプロイメント統計
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">成功率（今月）</h4>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={deploymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deploymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">週間トレンド</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="success" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// チーム生産性ウィジェット
export function TeamProductivity() {
  const teamData = [
    { name: "フロントエンド", commits: 45, prs: 12, reviews: 8, velocity: 85 },
    { name: "バックエンド", commits: 38, prs: 15, reviews: 11, velocity: 92 },
    { name: "DevOps", commits: 22, prs: 8, reviews: 15, velocity: 78 },
    { name: "QA", commits: 15, prs: 5, reviews: 20, velocity: 88 },
  ]

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          チーム生産性（今週）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamData.map((team, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{team.name}</span>
                <Badge
                  className={`${team.velocity >= 85 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {team.velocity}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{team.commits}</div>
                  <div className="text-gray-500">コミット</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{team.prs}</div>
                  <div className="text-gray-500">PR</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{team.reviews}</div>
                  <div className="text-gray-500">レビュー</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// セキュリティダッシュボード
export function SecurityDashboard() {
  const securityMetrics = {
    score: "A-",
    vulnerabilities: { critical: 0, high: 2, medium: 5, low: 12 },
    lastScan: "2時間前",
    compliance: 94,
  }

  const securityTrend = [
    { month: "1月", score: 88 },
    { month: "2月", score: 91 },
    { month: "3月", score: 89 },
    { month: "4月", score: 93 },
    { month: "5月", score: 95 },
    { month: "6月", score: 92 },
  ]

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          セキュリティダッシュボード
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">{securityMetrics.score}</div>
            <div className="text-sm text-gray-500">セキュリティスコア</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{securityMetrics.compliance}%</div>
            <div className="text-sm text-gray-500">コンプライアンス</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-red-100 rounded">
            <div className="text-lg font-bold text-red-600">{securityMetrics.vulnerabilities.critical}</div>
            <div className="text-xs text-red-700">重大</div>
          </div>
          <div className="text-center p-2 bg-orange-100 rounded">
            <div className="text-lg font-bold text-orange-600">{securityMetrics.vulnerabilities.high}</div>
            <div className="text-xs text-orange-700">高</div>
          </div>
          <div className="text-center p-2 bg-yellow-100 rounded">
            <div className="text-lg font-bold text-yellow-600">{securityMetrics.vulnerabilities.medium}</div>
            <div className="text-xs text-yellow-700">中</div>
          </div>
          <div className="text-center p-2 bg-blue-100 rounded">
            <div className="text-lg font-bold text-blue-600">{securityMetrics.vulnerabilities.low}</div>
            <div className="text-xs text-blue-700">低</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">セキュリティトレンド</span>
            <span className="text-xs text-gray-500">最終スキャン: {securityMetrics.lastScan}</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={securityTrend}>
              <Area type="monotone" dataKey="score" stroke="#dc2626" fill="#fecaca" strokeWidth={2} />
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// アクティビティフィード
export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: "deployment",
      message: "v2.1.3を本番環境にデプロイしました",
      user: "田中太郎",
      time: "5分前",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      id: 2,
      type: "test",
      message: "E2Eテストが失敗しました",
      user: "システム",
      time: "12分前",
      icon: XCircle,
      color: "text-red-500",
    },
    {
      id: 3,
      type: "pipeline",
      message: "feature-authパイプラインが開始されました",
      user: "佐藤花子",
      time: "25分前",
      icon: RefreshCw,
      color: "text-blue-500",
    },
    {
      id: 4,
      type: "security",
      message: "セキュリティスキャンが完了しました",
      user: "システム",
      time: "1時間前",
      icon: Shield,
      color: "text-purple-500",
    },
    {
      id: 5,
      type: "alert",
      message: "メモリ使用率が90%を超えました",
      user: "監視システム",
      time: "2時間前",
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
  ]

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          最近のアクティビティ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-white rounded-lg transition-colors">
              <activity.icon className={`h-4 w-4 mt-1 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">{activity.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {activity.user} • {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
