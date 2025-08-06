"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Monitor,
  GitBranch,
  TestTube,
  BarChart3,
  Bell,
  Rocket,
  Settings,
  Database,
  Shield,
  Users,
  FileText,
  Calendar,
  Zap,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
}

export default function AdvancedSidebar({ activeTab, onTabChange, isOpen }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["main", "monitoring"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const menuItems = [
    {
      id: "main",
      title: "メイン機能",
      items: [
        { id: "overview", label: "ダッシュボード", icon: Monitor, badge: null },
        { id: "pipelines", label: "パイプライン", icon: GitBranch, badge: "3" },
        { id: "tests", label: "テスト結果", icon: TestTube, badge: "2" },
        { id: "deployments", label: "デプロイメント", icon: Rocket, badge: null },
      ],
    },
    {
      id: "monitoring",
      title: "監視・分析",
      items: [
        { id: "metrics", label: "メトリクス", icon: BarChart3, badge: null },
        { id: "alerts", label: "アラート", icon: Bell, badge: "5" },
        { id: "logs", label: "ログ管理", icon: FileText, badge: null },
        { id: "performance", label: "パフォーマンス", icon: Activity, badge: null },
      ],
    },
    {
      id: "security",
      title: "セキュリティ",
      items: [
        { id: "security-scan", label: "脆弱性スキャン", icon: Shield, badge: "2" },
        { id: "compliance", label: "コンプライアンス", icon: CheckCircle, badge: null },
        { id: "audit", label: "監査ログ", icon: FileText, badge: null },
      ],
    },
    {
      id: "management",
      title: "管理機能",
      items: [
        { id: "users", label: "ユーザー管理", icon: Users, badge: null },
        { id: "projects", label: "プロジェクト", icon: Database, badge: "12" },
        { id: "environments", label: "環境管理", icon: Settings, badge: null },
        { id: "integrations", label: "連携設定", icon: Zap, badge: null },
      ],
    },
    {
      id: "reports",
      title: "レポート",
      items: [
        { id: "analytics", label: "分析レポート", icon: TrendingUp, badge: null },
        { id: "schedule", label: "スケジュール", icon: Calendar, badge: null },
        { id: "exports", label: "データエクスポート", icon: FileText, badge: null },
      ],
    },
  ]

  const quickActions = [
    { label: "新規パイプライン", icon: Plus, action: () => console.log("新規パイプライン") },
    { label: "緊急デプロイ", icon: Rocket, action: () => console.log("緊急デプロイ") },
    { label: "システム再起動", icon: RefreshCw, action: () => console.log("システム再起動") },
  ]

  const recentPipelines = [
    { name: "メインパイプライン", status: "running", time: "2分前" },
    { name: "認証機能", status: "success", time: "15分前" },
    { name: "セキュリティ修正", status: "failed", time: "1時間前" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "failed":
        return <XCircle className="h-3 w-3 text-red-500" />
      case "running":
        return <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-r border-slate-700 shadow-2xl transition-all duration-300 ease-in-out">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Monitor className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DevOps Hub
            </h2>
            <p className="text-xs text-slate-400">統合管理コンソール</p>
          </div>
        </div>

        {/* クイック検索 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="機能を検索..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* クイックアクション */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">クイックアクション</h3>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
              onClick={action.action}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-6">
          {menuItems.map((section) => (
            <Collapsible
              key={section.id}
              open={expandedSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-slate-800 rounded-lg transition-colors duration-200">
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{section.title}</span>
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-2">
                {section.items.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                    onClick={() => onTabChange(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 animate-pulse">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <Separator className="my-6 bg-slate-700" />

        {/* 最近のパイプライン */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">最近のパイプライン</h3>
          {recentPipelines.map((pipeline, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors duration-200"
            >
              {getStatusIcon(pipeline.status)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{pipeline.name}</div>
                <div className="text-xs text-slate-400">{pipeline.time}</div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6 bg-slate-700" />

        {/* システム状態 */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">システム状態</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors duration-200">
              <span className="text-sm text-slate-300">CPU使用率</span>
              <span className="text-sm font-semibold text-green-400">68%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors duration-200">
              <span className="text-sm text-slate-300">メモリ使用率</span>
              <span className="text-sm font-semibold text-yellow-400">85%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors duration-200">
              <span className="text-sm text-slate-300">アクティブジョブ</span>
              <span className="text-sm font-semibold text-blue-400">12</span>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* フッター */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">システム正常</div>
              <div className="text-xs text-slate-400">稼働時間: 99.9%</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 transition-colors duration-200">
                システム設定
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 transition-colors duration-200">
                テーマ変更
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 transition-colors duration-200">
                ヘルプ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
