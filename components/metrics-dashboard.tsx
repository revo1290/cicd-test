"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Users,
  GitBranch,
  Database,
} from "lucide-react"

interface MetricData {
  name: string
  value: number
  change: number
  trend: "up" | "down" | "stable"
  target?: number
}

interface PerformanceMetrics {
  buildTime: MetricData
  testCoverage: MetricData
  deploymentFrequency: MetricData
  failureRate: MetricData
  recoveryTime: MetricData
  leadTime: MetricData
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    buildTime: {
      name: "Average Build Time",
      value: 8.5,
      change: -12.3,
      trend: "down",
      target: 10,
    },
    testCoverage: {
      name: "Test Coverage",
      value: 87.2,
      change: 2.1,
      trend: "up",
      target: 85,
    },
    deploymentFrequency: {
      name: "Deployments/Week",
      value: 12,
      change: 15.4,
      trend: "up",
      target: 10,
    },
    failureRate: {
      name: "Failure Rate",
      value: 8.3,
      change: -5.2,
      trend: "down",
      target: 10,
    },
    recoveryTime: {
      name: "Recovery Time (hrs)",
      value: 2.1,
      change: -18.7,
      trend: "down",
      target: 4,
    },
    leadTime: {
      name: "Lead Time (days)",
      value: 3.2,
      change: -8.9,
      trend: "down",
      target: 5,
    },
  })

  const [timeRange, setTimeRange] = useState("7d")

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = (change: number, isInverse = false) => {
    const isPositive = isInverse ? change < 0 : change > 0
    return isPositive ? "text-green-600" : "text-red-600"
  }

  const getTargetStatus = (value: number, target: number, isInverse = false) => {
    const isOnTarget = isInverse ? value <= target : value >= target
    return isOnTarget ? "success" : "warning"
  }

  return (
    <div className="space-y-6">
      {/* 時間範囲選択 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
        <div className="flex items-center gap-2">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* DORA メトリクス */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployment Frequency</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.deploymentFrequency.value}/week</div>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(metrics.deploymentFrequency.trend)}
                  <span className={getChangeColor(metrics.deploymentFrequency.change)}>
                    {metrics.deploymentFrequency.change > 0 ? "+" : ""}
                    {metrics.deploymentFrequency.change}%
                  </span>
                  <span className="text-gray-500">vs last period</span>
                </div>
                <Progress
                  value={(metrics.deploymentFrequency.value / (metrics.deploymentFrequency.target || 15)) * 100}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lead Time</CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.leadTime.value} days</div>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(metrics.leadTime.trend)}
                  <span className={getChangeColor(metrics.leadTime.change, true)}>
                    {metrics.leadTime.change > 0 ? "+" : ""}
                    {metrics.leadTime.change}%
                  </span>
                  <span className="text-gray-500">vs last period</span>
                </div>
                <Progress
                  value={100 - (metrics.leadTime.value / (metrics.leadTime.target || 10)) * 100}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.failureRate.value}%</div>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(metrics.failureRate.trend)}
                  <span className={getChangeColor(metrics.failureRate.change, true)}>
                    {metrics.failureRate.change > 0 ? "+" : ""}
                    {metrics.failureRate.change}%
                  </span>
                  <span className="text-gray-500">vs last period</span>
                </div>
                <Progress value={100 - metrics.failureRate.value} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Time</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.recoveryTime.value}h</div>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(metrics.recoveryTime.trend)}
                  <span className={getChangeColor(metrics.recoveryTime.change, true)}>
                    {metrics.recoveryTime.change > 0 ? "+" : ""}
                    {metrics.recoveryTime.change}%
                  </span>
                  <span className="text-gray-500">vs last period</span>
                </div>
                <Progress
                  value={100 - (metrics.recoveryTime.value / (metrics.recoveryTime.target || 8)) * 100}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* チーム効率性指標 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Story Points/Sprint</span>
                    <span className="text-2xl font-bold">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed Stories</span>
                    <span className="text-lg font-semibold">18/20</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <div className="text-xs text-gray-500">Sprint burndown: 90% complete</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Contributors</span>
                    <span className="text-2xl font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Code Review Time</span>
                    <span className="text-lg font-semibold">4.2h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Satisfaction Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">4.6/5</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Build Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Build Time</span>
                    <span className="text-xl font-bold">{metrics.buildTime.value}min</span>
                  </div>
                  <Progress
                    value={((metrics.buildTime.target! - metrics.buildTime.value) / metrics.buildTime.target!) * 100}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Fastest Build</div>
                      <div className="font-semibold">5.2min</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Slowest Build</div>
                      <div className="font-semibold">12.8min</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Test Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Test Execution Time</span>
                    <span className="text-xl font-bold">3.2min</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-700">Unit</div>
                      <div>1.1min</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-700">Integration</div>
                      <div>1.3min</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-700">E2E</div>
                      <div>0.8min</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* リソース使用率 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Resource Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm font-bold">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm font-bold">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm font-bold">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Code Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Test Coverage</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{metrics.testCoverage.value}%</span>
                      <Badge
                        className={
                          getTargetStatus(metrics.testCoverage.value, metrics.testCoverage.target!) === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {getTargetStatus(metrics.testCoverage.value, metrics.testCoverage.target!) === "success"
                          ? "On Target"
                          : "Below Target"}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={metrics.testCoverage.value} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Lines Covered</div>
                      <div className="font-semibold">12,847 / 14,732</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Branches Covered</div>
                      <div className="font-semibold">892 / 1,024</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-600">0</div>
                      <div className="text-red-700">Critical</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">2</div>
                      <div className="text-yellow-700">Medium</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-blue-700">Low</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Security Score</span>
                      <span className="font-bold">A-</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Deployment Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-xl font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Deployments</span>
                    <span className="text-lg font-semibold">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rollbacks</span>
                    <span className="text-lg font-semibold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Environment Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Production</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Staging</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Development</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">99.97%</div>
                    <div className="text-sm text-gray-500">Last 30 days</div>
                  </div>
                  <div className="text-xs text-center text-gray-500">Downtime: 13 minutes</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
