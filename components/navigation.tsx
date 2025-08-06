"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Moon,
  Sun,
  Search,
  Command,
  Plus,
  Github,
  Menu,
  X,
} from "lucide-react"

interface Notification {
  id: string
  type: "error" | "warning" | "success" | "info"
  title: string
  message: string
  time: string
  read: boolean
}

interface NavigationProps {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export default function Navigation({ onToggleSidebar, sidebarOpen }: NavigationProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showNewPipeline, setShowNewPipeline] = useState(false)

  useEffect(() => {
    // リアルタイム通知の生成
    const generateNotifications = () => {
      const notificationTypes = [
        {
          type: "error" as const,
          title: "パイプライン失敗",
          message: "メインパイプラインがE2Eステージで失敗しました",
          time: "2分前",
        },
        {
          type: "warning" as const,
          title: "高メモリ使用",
          message: "本番サーバーが90%メモリを使用しています",
          time: "15分前",
        },
        {
          type: "success" as const,
          title: "デプロイ成功",
          message: "v2.1.3が本番環境にデプロイされました",
          time: "1時間前",
        },
        {
          type: "info" as const,
          title: "セキュリティスキャン完了",
          message: "新しい脆弱性は検出されませんでした",
          time: "2時間前",
        },
      ]

      const newNotifications = notificationTypes.map((notif, index) => ({
        id: `notif-${index}`,
        ...notif,
        read: false,
      }))

      setNotifications(newNotifications)
    }

    generateNotifications()
    const interval = setInterval(generateNotifications, 30000) // 30秒ごとに更新

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // 実際の検索機能を実装
    console.log("検索クエリ:", query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setShowSearch(true)
    }
  }

  const handleNewPipeline = async (data: { name: string; repository: string; branch: string; description: string }) => {
    try {
      // 実際のパイプライン作成ロジック
      console.log("新規パイプライン作成:", data)
      setShowNewPipeline(false)
      // 成功通知を追加
      const successNotification: Notification = {
        id: `success-${Date.now()}`,
        type: "success",
        title: "パイプライン作成完了",
        message: `${data.name}パイプラインが正常に作成されました`,
        time: "たった今",
        read: false,
      }
      setNotifications((prev) => [successNotification, ...prev])
    } catch (error) {
      console.error("パイプライン作成エラー:", error)
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* サイドバートグル・ロゴ・タイトル */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DevOps統合管理
                </h1>
                <p className="text-xs text-gray-500">エンタープライズCI/CDプラットフォーム</p>
              </div>
            </div>
          </div>

          {/* 検索バー */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="パイプライン、ログ、メトリクスを検索..."
                className="pl-10 pr-16 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* 右側のアクション */}
          <div className="flex items-center gap-3">
            {/* 新規パイプライン */}
            <Dialog open={showNewPipeline} onOpenChange={setShowNewPipeline}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新規パイプライン
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>新規パイプライン作成</DialogTitle>
                  <DialogDescription>新しいCI/CDパイプラインを作成します。</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleNewPipeline({
                      name: formData.get("name") as string,
                      repository: formData.get("repository") as string,
                      branch: formData.get("branch") as string,
                      description: formData.get("description") as string,
                    })
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        パイプライン名
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        className="col-span-3"
                        placeholder="例: メインパイプライン"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="repository" className="text-right">
                        リポジトリ
                      </Label>
                      <Input
                        id="repository"
                        name="repository"
                        className="col-span-3"
                        placeholder="例: owner/repository"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="branch" className="text-right">
                        ブランチ
                      </Label>
                      <Input
                        id="branch"
                        name="branch"
                        className="col-span-3"
                        placeholder="例: main"
                        defaultValue="main"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        説明
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        className="col-span-3"
                        placeholder="パイプラインの説明を入力..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowNewPipeline(false)}>
                      キャンセル
                    </Button>
                    <Button type="submit">作成</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* GitHub連携 */}
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-transparent"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>

            {/* 通知 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 transition-colors duration-200">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  通知
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount}件の未読
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">新しい通知はありません</div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-0 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3 p-3 w-full">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "error"
                              ? "bg-red-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : notification.type === "success"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div
                            className={`font-medium text-sm ${!notification.read ? "text-gray-900" : "text-gray-600"}`}
                          >
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-500">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ダークモード切り替え */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsDarkMode(!isDarkMode)
                document.documentElement.classList.toggle("dark")
              }}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* ヘルプ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors duration-200">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>ドキュメント</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>キーボードショートカット</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>サポートに連絡</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>フィードバック送信</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 設定 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors duration-200">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>一般設定</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>通知設定</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>セキュリティ</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>統合設定</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <span>データエクスポート</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ユーザーメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">DevOps管理者</div>
                    <div className="text-xs text-gray-500">admin@company.com</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <User className="mr-2 h-4 w-4" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <Settings className="mr-2 h-4 w-4" />
                  アカウント設定
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 transition-colors duration-200">
                  <Bell className="mr-2 h-4 w-4" />
                  通知設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 transition-colors duration-200">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 検索モーダル */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>検索</DialogTitle>
            <DialogDescription>パイプライン、ログ、メトリクス、設定を検索できます。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="検索キーワードを入力..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">最近の検索</div>
              <div className="space-y-1">
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm transition-colors duration-200">
                  メインパイプライン
                </div>
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm transition-colors duration-200">
                  失敗したテスト
                </div>
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm transition-colors duration-200">
                  デプロイログ
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  )
}
