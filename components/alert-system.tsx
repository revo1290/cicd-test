"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Bell,
  BellOff,
  Settings,
  Clock,
  User,
  ExternalLink,
} from "lucide-react"

interface AlertItem {
  id: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
  status: "active" | "acknowledged" | "resolved"
  timestamp: Date
  source: string
  assignee?: string
  tags: string[]
  actions?: AlertAction[]
}

interface AlertAction {
  label: string
  type: "primary" | "secondary"
  action: () => void
}

export default function AlertSystem() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "acknowledged" | "resolved">("all")
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all")

  useEffect(() => {
    const mockAlerts: AlertItem[] = [
      {
        id: "1",
        title: "High Memory Usage Detected",
        description: "Production server memory usage has exceeded 90% for the last 15 minutes",
        severity: "critical",
        status: "active",
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        source: "Infrastructure Monitor",
        assignee: "DevOps Team",
        tags: ["production", "memory", "performance"],
        actions: [
          {
            label: "Scale Up",
            type: "primary",
            action: () => console.log("Scaling up..."),
          },
          {
            label: "View Logs",
            type: "secondary",
            action: () => console.log("Opening logs..."),
          },
        ],
      },
      {
        id: "2",
        title: "E2E Test Failure",
        description: "User registration flow test failed in main pipeline",
        severity: "warning",
        status: "acknowledged",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        source: "CI/CD Pipeline",
        assignee: "QA Team",
        tags: ["testing", "e2e", "main-branch"],
        actions: [
          {
            label: "Rerun Tests",
            type: "primary",
            action: () => console.log("Rerunning tests..."),
          },
          {
            label: "View Pipeline",
            type: "secondary",
            action: () => console.log("Opening pipeline..."),
          },
        ],
      },
      {
        id: "3",
        title: "Security Vulnerability Detected",
        description: "Medium severity vulnerability found in lodash dependency",
        severity: "warning",
        status: "active",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        source: "Security Scanner",
        tags: ["security", "dependency", "lodash"],
        actions: [
          {
            label: "Update Dependency",
            type: "primary",
            action: () => console.log("Updating dependency..."),
          },
          {
            label: "View Details",
            type: "secondary",
            action: () => console.log("Opening security report..."),
          },
        ],
      },
      {
        id: "4",
        title: "Deployment Completed Successfully",
        description: "Version 2.1.3 has been deployed to production",
        severity: "info",
        status: "resolved",
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        source: "Deployment System",
        tags: ["deployment", "production", "success"],
      },
      {
        id: "5",
        title: "Database Connection Pool Warning",
        description: "Connection pool utilization is at 85%",
        severity: "warning",
        status: "active",
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        source: "Database Monitor",
        assignee: "Backend Team",
        tags: ["database", "performance", "connections"],
      },
    ]
    setAlerts(mockAlerts)
  }, [])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800"
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const statusMatch = filter === "all" || alert.status === filter
    const severityMatch = severityFilter === "all" || alert.severity === severityFilter
    return statusMatch && severityMatch
  })

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" as const } : alert)))
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, status: "resolved" as const } : alert)))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  const activeAlertsCount = alerts.filter((alert) => alert.status === "active").length
  const criticalAlertsCount = alerts.filter(
    (alert) => alert.severity === "critical" && alert.status === "active",
  ).length

  return (
    <div className="space-y-6">
      {/* アラート概要 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Alert Center
          </h2>
          {activeAlertsCount > 0 && <Badge className="bg-red-100 text-red-800">{activeAlertsCount} Active</Badge>}
          {criticalAlertsCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">{criticalAlertsCount} Critical</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <BellOff className="h-4 w-4 mr-2" />
            Mute All
          </Button>
        </div>
      </div>

      {/* 重要なアラート */}
      {criticalAlertsCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong> {criticalAlertsCount} critical issue(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active" onClick={() => setFilter("active")}>
              Active ({alerts.filter((a) => a.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" onClick={() => setFilter("acknowledged")}>
              Acknowledged ({alerts.filter((a) => a.status === "acknowledged").length})
            </TabsTrigger>
            <TabsTrigger value="resolved" onClick={() => setFilter("resolved")}>
              Resolved ({alerts.filter((a) => a.status === "resolved").length})
            </TabsTrigger>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              All ({alerts.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
                  <p className="text-gray-600">All systems are running smoothly!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <p className="text-gray-600 mt-1">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                        <Badge className={getStatusColor(alert.status)}>{alert.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {alert.timestamp.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          {alert.source}
                        </div>
                        {alert.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {alert.assignee}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {alert.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.actions?.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.type === "primary" ? "default" : "outline"}
                            size="sm"
                            onClick={action.action}
                          >
                            {action.label}
                          </Button>
                        ))}

                        {alert.status === "active" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                              Acknowledge
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                              Resolve
                            </Button>
                          </>
                        )}

                        <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="border-0 shadow-lg opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(alert.status)}>ACKNOWLEDGED</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="border-0 shadow-lg opacity-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(alert.status)}>RESOLVED</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-0 shadow-lg ${alert.status === "resolved" ? "opacity-50" : alert.status === "acknowledged" ? "opacity-75" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {alert.status === "resolved" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      getSeverityIcon(alert.severity)
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                    <Badge className={getStatusColor(alert.status)}>{alert.status.toUpperCase()}</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
