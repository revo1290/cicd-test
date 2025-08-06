"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Database,
  Shield,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Share,
  Eye,
  Github,
  Slack,
  DiscIcon as Discord,
  Twitter,
} from "lucide-react"

// プロジェクト管理機能
export function ProjectManagement() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Eコマースプラットフォーム",
      status: "active",
      progress: 75,
      team: ["田中太郎", "佐藤花子", "鈴木一郎"],
      deadline: "2024-03-15",
      priority: "high",
    },
    {
      id: 2,
      name: "モバイルアプリ開発",
      status: "planning",
      progress: 25,
      team: ["山田次郎", "高橋美咲"],
      deadline: "2024-04-30",
      priority: "medium",
    },
    {
      id: 3,
      name: "データ分析基盤",
      status: "completed",
      progress: 100,
      team: ["伊藤健太", "渡辺由美", "中村大輔"],
      deadline: "2024-02-28",
      priority: "low",
    },
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            プロジェクト管理
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新規プロジェクト
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新規プロジェクト作成</DialogTitle>
                <DialogDescription>新しいプロジェクトの詳細を入力してください。</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    プロジェクト名
                  </Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    説明
                  </Label>
                  <Textarea id="description" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    優先度
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="優先度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority === "high" ? "高" : project.priority === "medium" ? "中" : "低"}
                  </Badge>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status === "active" ? "進行中" : project.status === "planning" ? "計画中" : "完了"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>進捗状況</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{project.team.length}名のメンバー</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>期限: {project.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    詳細
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    共有
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 環境管理機能
export function EnvironmentManagement() {
  const [environments, setEnvironments] = useState([
    {
      name: "本番環境",
      status: "healthy",
      version: "v2.1.3",
      uptime: "99.9%",
      lastDeploy: "2時間前",
      resources: { cpu: 45, memory: 62, disk: 78 },
    },
    {
      name: "ステージング環境",
      status: "warning",
      version: "v2.2.0-rc1",
      uptime: "98.5%",
      lastDeploy: "30分前",
      resources: { cpu: 78, memory: 85, disk: 65 },
    },
    {
      name: "開発環境",
      status: "healthy",
      version: "v2.2.0-dev",
      uptime: "97.2%",
      lastDeploy: "5分前",
      resources: { cpu: 32, memory: 48, disk: 55 },
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600" />
          環境管理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {environments.map((env, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(env.status)}
                  <h3 className="font-semibold">{env.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{env.version}</Badge>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    再起動
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-sm">
                  <span className="text-gray-500">稼働時間: </span>
                  <span className="font-semibold">{env.uptime}</span>
                </div>
                <div className="text-sm">
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

// 統合設定機能
export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState([
    { name: "GitHub", status: "connected", icon: Github, color: "text-gray-900" },
    { name: "Slack", status: "connected", icon: Slack, color: "text-purple-600" },
    { name: "Discord", status: "disconnected", icon: Discord, color: "text-indigo-600" },
    { name: "Twitter", status: "connected", icon: Twitter, color: "text-blue-500" },
  ])

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          外部サービス連携
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <integration.icon className={`h-6 w-6 ${integration.color}`} />
                <div>
                  <div className="font-medium">{integration.name}</div>
                  <div className="text-sm text-gray-500">
                    {integration.status === "connected" ? "接続済み" : "未接続"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={integration.status === "connected"} />
                <Button variant="outline" size="sm">
                  設定
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// スケジュール管理機能
export function ScheduleManagement() {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      name: "定期バックアップ",
      type: "backup",
      frequency: "daily",
      time: "02:00",
      enabled: true,
      lastRun: "2024-01-15 02:00",
      nextRun: "2024-01-16 02:00",
    },
    {
      id: 2,
      name: "セキュリティスキャン",
      type: "security",
      frequency: "weekly",
      time: "03:00",
      enabled: true,
      lastRun: "2024-01-14 03:00",
      nextRun: "2024-01-21 03:00",
    },
    {
      id: 3,
      name: "パフォーマンステスト",
      type: "test",
      frequency: "monthly",
      time: "01:00",
      enabled: false,
      lastRun: "2023-12-15 01:00",
      nextRun: "2024-02-15 01:00",
    },
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "backup":
        return <Database className="h-4 w-4 text-blue-500" />
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />
      case "test":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            スケジュール管理
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新規スケジュール
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(schedule.type)}
                  <h3 className="font-semibold">{schedule.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={schedule.enabled} />
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">頻度: </span>
                  <span className="font-semibold">
                    {schedule.frequency === "daily" ? "毎日" : schedule.frequency === "weekly" ? "毎週" : "毎月"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">実行時刻: </span>
                  <span className="font-semibold">{schedule.time}</span>
                </div>
                <div>
                  <span className="text-gray-500">前回実行: </span>
                  <span className="font-semibold">{schedule.lastRun}</span>
                </div>
                <div>
                  <span className="text-gray-500">次回実行: </span>
                  <span className="font-semibold">{schedule.nextRun}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
