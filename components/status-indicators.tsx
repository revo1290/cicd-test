"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Shield, Activity } from "lucide-react"

interface StatusIndicatorProps {
  status: "success" | "failed" | "running" | "pending" | "warning"
  size?: "sm" | "md" | "lg"
  showText?: boolean
  animated?: boolean
}

export function StatusIndicator({ status, size = "md", showText = false, animated = true }: StatusIndicatorProps) {
  const getIcon = () => {
    const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4"

    switch (status) {
      case "success":
        return <CheckCircle className={`${iconSize} text-green-500`} />
      case "failed":
        return <XCircle className={`${iconSize} text-red-500`} />
      case "running":
        return <RefreshCw className={`${iconSize} text-blue-500 ${animated ? "animate-spin" : ""}`} />
      case "pending":
        return <Clock className={`${iconSize} text-yellow-500`} />
      case "warning":
        return <AlertTriangle className={`${iconSize} text-orange-500`} />
      default:
        return <Clock className={`${iconSize} text-gray-400`} />
    }
  }

  const getText = () => {
    switch (status) {
      case "success":
        return "Success"
      case "failed":
        return "Failed"
      case "running":
        return "Running"
      case "pending":
        return "Pending"
      case "warning":
        return "Warning"
      default:
        return "Unknown"
    }
  }

  const getBadgeColor = () => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (showText) {
    return (
      <Badge className={getBadgeColor()}>
        <div className="flex items-center gap-1">
          {getIcon()}
          <span className="text-xs font-medium">{getText()}</span>
        </div>
      </Badge>
    )
  }

  return getIcon()
}

interface HealthIndicatorProps {
  health: "healthy" | "warning" | "critical" | "unknown"
  label: string
  value?: string | number
  trend?: "up" | "down" | "stable"
}

export function HealthIndicator({ health, label, value, trend }: HealthIndicatorProps) {
  const getHealthColor = () => {
    switch (health) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthIcon = () => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null

    switch (trend) {
      case "up":
        return <span className="text-green-500">↗</span>
      case "down":
        return <span className="text-red-500">↘</span>
      case "stable":
        return <span className="text-gray-500">→</span>
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
      <div className="flex items-center gap-2">
        {getHealthIcon()}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className={`text-sm font-semibold ${getHealthColor()}`}>{value}</span>}
        {getTrendIcon()}
      </div>
    </div>
  )
}

interface SecurityScoreProps {
  score: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F"
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export function SecurityScore({ score, vulnerabilities }: SecurityScoreProps) {
  const getScoreColor = () => {
    if (score.startsWith("A")) return "text-green-600"
    if (score.startsWith("B")) return "text-yellow-600"
    if (score.startsWith("C")) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBg = () => {
    if (score.startsWith("A")) return "bg-green-100"
    if (score.startsWith("B")) return "bg-yellow-100"
    if (score.startsWith("C")) return "bg-orange-100"
    return "bg-red-100"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Security Score</span>
        </div>
        <div className={`px-3 py-1 rounded-full ${getScoreBg()} ${getScoreColor()} font-bold text-lg`}>{score}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-lg font-bold text-red-600">{vulnerabilities.critical}</div>
          <div className="text-xs text-red-700">Critical</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="text-lg font-bold text-orange-600">{vulnerabilities.high}</div>
          <div className="text-xs text-orange-700">High</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-lg font-bold text-yellow-600">{vulnerabilities.medium}</div>
          <div className="text-xs text-yellow-700">Medium</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-lg font-bold text-blue-600">{vulnerabilities.low}</div>
          <div className="text-xs text-blue-700">Low</div>
        </div>
      </div>
    </div>
  )
}

interface PerformanceIndicatorProps {
  label: string
  current: number
  target: number
  unit: string
  isInverse?: boolean // true if lower values are better (like response time)
}

export function PerformanceIndicator({ label, current, target, unit, isInverse = false }: PerformanceIndicatorProps) {
  const percentage = isInverse
    ? Math.max(0, Math.min(100, ((target - current) / target) * 100))
    : Math.max(0, Math.min(100, (current / target) * 100))

  const isOnTarget = isInverse ? current <= target : current >= target

  const getColor = () => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getColor()}`}>
            {current}
            {unit}
          </span>
          {isOnTarget ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            Target: {target}
            {unit}
          </span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
