import { test, expect, type Page } from "@playwright/test"

test.describe("User Management E2E Tests", () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
  })

  test.afterEach(async () => {
    await page.close()
  })

  test("should display CI/CD dashboard", async () => {
    await expect(page.locator("h1")).toContainText("CI/CD Command Center")
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible()
    await expect(page.locator('[data-testid="avg-duration"]')).toBeVisible()
  })

  test("should show pipeline list", async () => {
    await expect(page.locator('[data-testid="pipeline-list"]')).toBeVisible()

    const pipelineItems = page.locator('[data-testid^="pipeline-item-"]')
    await expect(pipelineItems).toHaveCount(3)

    // Check first pipeline
    const firstPipeline = pipelineItems.first()
    await expect(firstPipeline.locator(".pipeline-name")).toContainText("main-pipeline")
    await expect(firstPipeline.locator(".pipeline-status")).toBeVisible()
  })

  test("should display pipeline details when selected", async () => {
    // Click on first pipeline
    await page.locator('[data-testid="pipeline-item-1"]').click()

    // Check pipeline details are displayed
    await expect(page.locator('[data-testid="pipeline-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="pipeline-stages"]')).toBeVisible()

    // Check stages are displayed
    const stages = page.locator('[data-testid^="stage-"]')
    await expect(stages).toHaveCount(3)

    // Check stage names
    await expect(page.locator('[data-testid="stage-build"]')).toContainText("Build & Test")
    await expect(page.locator('[data-testid="stage-e2e"]')).toContainText("E2E Tests")
    await expect(page.locator('[data-testid="stage-deploy"]')).toContainText("Deploy")
  })

  test("should show test results in test tab", async () => {
    await page.locator('[data-testid="tab-tests"]').click()

    // Check JUnit test results
    await expect(page.locator('[data-testid="junit-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="test-UserServiceTest"]')).toContainText("UserServiceTest")
    await expect(page.locator('[data-testid="test-TaskControllerTest"]')).toContainText("TaskControllerTest")

    // Check Playwright test results
    await expect(page.locator('[data-testid="playwright-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="test-LoginFlow"]')).toContainText("Login Flow")
    await expect(page.locator('[data-testid="test-TaskManagement"]')).toContainText("Task Management")
  })

  test("should display deployment information", async () => {
    await page.locator('[data-testid="tab-deployments"]').click()

    // Check production deployments
    await expect(page.locator('[data-testid="production-deployments"]')).toBeVisible()
    await expect(page.locator('[data-testid="deployment-v2.1.3"]')).toContainText("v2.1.3")
    await expect(page.locator('[data-testid="deployment-status-active"]')).toContainText("Active")

    // Check staging environment
    await expect(page.locator('[data-testid="staging-environment"]')).toBeVisible()
    await expect(page.locator('[data-testid="promote-button"]')).toBeVisible()
  })

  test("should handle pipeline actions", async () => {
    // Select a pipeline
    await page.locator('[data-testid="pipeline-item-1"]').click()

    // Check action buttons are present
    await expect(page.locator('[data-testid="view-logs-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="restart-button"]')).toBeVisible()

    // Click view logs button
    await page.locator('[data-testid="view-logs-button"]').click()

    // Should open logs modal or navigate to logs page
    // This would depend on the actual implementation
  })

  test("should show real-time updates for running pipeline", async () => {
    // Select running pipeline
    await page.locator('[data-testid="pipeline-item-1"]').click()

    // Check that running stage has progress indicator
    const runningStage = page.locator('[data-testid="stage-e2e"]')
    await expect(runningStage.locator(".progress-bar")).toBeVisible()
    await expect(runningStage.locator(".spinner")).toBeVisible()
  })

  test("should display error details for failed tests", async () => {
    await page.locator('[data-testid="tab-tests"]').click()

    // Find failed test
    const failedTest = page.locator('[data-testid="test-UserRegistration"]')
    await expect(failedTest).toContainText("User Registration")
    await expect(failedTest.locator(".status-failed")).toBeVisible()

    // Click to expand error details
    await failedTest.click()

    // Check error message is displayed
    await expect(page.locator('[data-testid="error-details"]')).toContainText("Element not found: #submit-button")
  })

  test("should filter pipelines by status", async () => {
    // Add filter functionality test
    await page.locator('[data-testid="filter-dropdown"]').click()
    await page.locator('[data-testid="filter-failed"]').click()

    // Should show only failed pipelines
    const visiblePipelines = page.locator('[data-testid^="pipeline-item-"]:visible')
    await expect(visiblePipelines).toHaveCount(1)
    await expect(visiblePipelines.first().locator(".pipeline-status")).toContainText("failed")
  })

  test("should search pipelines by branch name", async () => {
    await page.locator('[data-testid="search-input"]').fill("feature")
    await page.locator('[data-testid="search-button"]').click()

    // Should show only feature branch pipelines
    const searchResults = page.locator('[data-testid^="pipeline-item-"]:visible')
    await expect(searchResults).toHaveCount(1)
    await expect(searchResults.first().locator(".branch-name")).toContainText("feature/authentication")
  })

  test("should handle responsive design", async () => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile navigation is present
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Check that desktop sidebar is hidden
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeHidden()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Check layout adjustments
    await expect(page.locator('[data-testid="metrics-grid"]')).toHaveClass(/grid-cols-2/)
  })

  test("should persist selected pipeline across page refresh", async () => {
    // Select a pipeline
    await page.locator('[data-testid="pipeline-item-2"]').click()

    // Refresh page
    await page.reload()

    // Check that the same pipeline is still selected
    await expect(page.locator('[data-testid="pipeline-item-2"]')).toHaveClass(/selected/)
    await expect(page.locator('[data-testid="pipeline-details"]')).toContainText("feature-auth")
  })
})
