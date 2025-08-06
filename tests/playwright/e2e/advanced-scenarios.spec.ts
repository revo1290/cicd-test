import { test, expect } from "@playwright/test"

test.describe("Advanced CI/CD Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should handle real-time pipeline updates", async ({ page }) => {
    // Start monitoring a running pipeline
    await page.locator('[data-testid="pipeline-item-1"]').click()

    // Verify initial state
    await expect(page.locator('[data-testid="stage-e2e"]')).toContainText("running")

    // Simulate real-time updates (in real implementation, this would be WebSocket)
    await page.evaluate(() => {
      // Mock WebSocket message
      window.dispatchEvent(
        new CustomEvent("pipeline-update", {
          detail: {
            pipelineId: "1",
            stageId: "e2e",
            status: "success",
          },
        }),
      )
    })

    // Verify status update
    await expect(page.locator('[data-testid="stage-e2e"]')).toContainText("success")
  })

  test("should display comprehensive metrics dashboard", async ({ page }) => {
    await page.locator('[data-testid="tab-metrics"]').click()

    // Verify DORA metrics are displayed
    await expect(page.locator("text=Deployment Frequency")).toBeVisible()
    await expect(page.locator("text=Lead Time")).toBeVisible()
    await expect(page.locator("text=Failure Rate")).toBeVisible()
    await expect(page.locator("text=Recovery Time")).toBeVisible()

    // Check performance metrics
    await page.locator('[data-testid="tab-performance"]').click()
    await expect(page.locator("text=Build Performance")).toBeVisible()
    await expect(page.locator("text=Test Performance")).toBeVisible()

    // Verify resource utilization
    await expect(page.locator("text=CPU Usage")).toBeVisible()
    await expect(page.locator("text=Memory Usage")).toBeVisible()
    await expect(page.locator("text=Storage Usage")).toBeVisible()
  })

  test("should manage alerts effectively", async ({ page }) => {
    await page.locator('[data-testid="tab-alerts"]').click()

    // Verify alert center is displayed
    await expect(page.locator("text=Alert Center")).toBeVisible()

    // Check for active alerts
    const activeAlerts = page.locator('[data-testid="alert-item"]')
    const alertCount = await activeAlerts.count()

    if (alertCount > 0) {
      // Test acknowledging an alert
      const firstAlert = activeAlerts.first()
      await firstAlert.locator('button:has-text("Acknowledge")').click()

      // Verify alert status changed
      await expect(firstAlert.locator(".status-badge")).toContainText("acknowledged")
    }

    // Test filtering alerts
    await page.locator('select[data-testid="severity-filter"]').selectOption("critical")

    // Verify only critical alerts are shown
    const criticalAlerts = page.locator('[data-testid="alert-item"]:visible')
    const criticalCount = await criticalAlerts.count()

    for (let i = 0; i < criticalCount; i++) {
      await expect(criticalAlerts.nth(i).locator(".severity-badge")).toContainText("CRITICAL")
    }
  })

  test("should handle complex deployment scenarios", async ({ page }) => {
    await page.locator('[data-testid="tab-deployments"]').click()

    // Verify production and staging environments
    await expect(page.locator('[data-testid="production-deployments"]')).toBeVisible()
    await expect(page.locator('[data-testid="staging-environment"]')).toBeVisible()

    // Test promotion workflow
    const promoteButton = page.locator('[data-testid="promote-button"]')
    if (await promoteButton.isVisible()) {
      await promoteButton.click()

      // Handle confirmation dialog
      await page.locator('[data-testid="confirm-promote"]').click()

      // Verify promotion status
      await expect(page.locator('[data-testid="promotion-status"]')).toContainText("Promoting")
    }
  })

  test("should provide detailed log analysis", async ({ page }) => {
    // Select a pipeline and open logs
    await page.locator('[data-testid="pipeline-item-1"]').click()
    await page.locator('[data-testid="view-logs-button"]').click()

    // Verify logs modal opens
    await expect(page.locator('[data-testid="logs-modal"]')).toBeVisible()

    // Test log filtering
    await page.locator('[data-testid="search-input"]').fill("error")
    await expect(page.locator('[data-testid="log-entry"]:visible')).toContainText("error")

    // Test log level filtering
    await page.locator('select[data-testid="level-filter"]').selectOption("error")

    const errorLogs = page.locator('[data-testid="log-entry"]:visible')
    const errorCount = await errorLogs.count()

    for (let i = 0; i < errorCount; i++) {
      await expect(errorLogs.nth(i).locator(".level-badge")).toContainText("ERROR")
    }

    // Test stage-specific logs
    await page.locator('[data-testid="tab-e2e"]').click()
    await expect(page.locator('[data-testid="log-entry"]:visible')).toContainText("e2e")
  })

  test("should handle performance monitoring", async ({ page }) => {
    await page.locator('[data-testid="tab-metrics"]').click()
    await page.locator('[data-testid="tab-performance"]').click()

    // Verify build performance metrics
    await expect(page.locator("text=Average Build Time")).toBeVisible()
    await expect(page.locator("text=Fastest Build")).toBeVisible()
    await expect(page.locator("text=Slowest Build")).toBeVisible()

    // Check test performance breakdown
    await expect(page.locator("text=Unit")).toBeVisible()
    await expect(page.locator("text=Integration")).toBeVisible()
    await expect(page.locator("text=E2E")).toBeVisible()

    // Verify resource utilization charts
    const cpuUsage = page.locator("text=CPU Usage").locator("..").locator(".progress-bar")
    await expect(cpuUsage).toBeVisible()

    const memoryUsage = page.locator("text=Memory Usage").locator("..").locator(".progress-bar")
    await expect(memoryUsage).toBeVisible()
  })

  test("should support advanced search and filtering", async ({ page }) => {
    // Test pipeline search
    await page.locator('[data-testid="search-input"]').fill("feature")
    await page.locator('[data-testid="search-button"]').click()

    const searchResults = page.locator('[data-testid^="pipeline-item-"]:visible')
    const resultCount = await searchResults.count()

    for (let i = 0; i < resultCount; i++) {
      await expect(searchResults.nth(i)).toContainText("feature")
    }

    // Test status filtering
    await page.locator('[data-testid="filter-dropdown"]').click()
    await page.locator('[data-testid="filter-success"]').click()

    const successPipelines = page.locator('[data-testid^="pipeline-item-"]:visible')
    const successCount = await successPipelines.count()

    for (let i = 0; i < successCount; i++) {
      await expect(successPipelines.nth(i).locator(".pipeline-status")).toContainText("success")
    }
  })

  test("should handle error scenarios gracefully", async ({ page }) => {
    // Test network error handling
    await page.route("**/api/pipelines", (route) => route.abort())

    await page.reload()

    // Verify error state is displayed
    await expect(page.locator("text=Failed to load pipelines")).toBeVisible()

    // Test retry functionality
    await page.unroute("**/api/pipelines")
    await page.locator('[data-testid="retry-button"]').click()

    // Verify data loads after retry
    await expect(page.locator('[data-testid="pipeline-list"]')).toBeVisible()
  })

  test("should maintain state across navigation", async ({ page }) => {
    // Select a pipeline
    await page.locator('[data-testid="pipeline-item-2"]').click()

    // Navigate to different tab
    await page.locator('[data-testid="tab-metrics"]').click()

    // Navigate back to pipelines
    await page.locator('[data-testid="tab-pipelines"]').click()

    // Verify selection is maintained
    await expect(page.locator('[data-testid="pipeline-item-2"]')).toHaveClass(/selected/)
    await expect(page.locator('[data-testid="pipeline-details"]')).toContainText("feature-auth")
  })

  test("should support keyboard navigation", async ({ page }) => {
    // Focus on first pipeline
    await page.locator('[data-testid="pipeline-item-1"]').focus()

    // Navigate with arrow keys
    await page.keyboard.press("ArrowDown")
    await expect(page.locator('[data-testid="pipeline-item-2"]')).toBeFocused()

    // Select with Enter
    await page.keyboard.press("Enter")
    await expect(page.locator('[data-testid="pipeline-details"]')).toContainText("feature-auth")

    // Navigate tabs with Tab key
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Enter")

    // Verify tab navigation works
    await expect(page.locator('[data-testid="tab-tests"]')).toHaveAttribute("data-state", "active")
  })
})
