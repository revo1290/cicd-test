import { test, expect } from "@playwright/test"

test.describe("Pipeline Flow E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should complete full pipeline flow", async ({ page }) => {
    // Start a new pipeline
    await page.locator('[data-testid="run-pipeline-button"]').click()

    // Select branch
    await page.locator('[data-testid="branch-selector"]').click()
    await page.locator('[data-testid="branch-main"]').click()

    // Confirm pipeline start
    await page.locator('[data-testid="confirm-run"]').click()

    // Wait for pipeline to appear in list
    await expect(page.locator('[data-testid^="pipeline-item-"]:first-child')).toBeVisible()

    // Check initial status is running
    const newPipeline = page.locator('[data-testid^="pipeline-item-"]:first-child')
    await expect(newPipeline.locator(".pipeline-status")).toContainText("running")
  })

  test("should show stage progression", async ({ page }) => {
    // Select running pipeline
    await page.locator('[data-testid="pipeline-item-1"]').click()

    // Check build stage is completed
    const buildStage = page.locator('[data-testid="stage-build"]')
    await expect(buildStage.locator(".status-icon")).toHaveClass(/text-green-500/)

    // Check E2E stage is running
    const e2eStage = page.locator('[data-testid="stage-e2e"]')
    await expect(e2eStage.locator(".status-icon")).toHaveClass(/animate-spin/)

    // Check deploy stage is pending
    const deployStage = page.locator('[data-testid="stage-deploy"]')
    await expect(deployStage.locator(".status-icon")).toHaveClass(/text-yellow-500/)
  })

  test("should handle pipeline failure", async ({ page }) => {
    // Select failed pipeline
    await page.locator('[data-testid="pipeline-item-3"]').click()

    // Check overall status is failed
    await expect(page.locator('[data-testid="pipeline-status"]')).toContainText("failed")

    // Check failed stage details
    const failedStage = page.locator('[data-testid="stage-e2e"]')
    await expect(failedStage.locator(".status-icon")).toHaveClass(/text-red-500/)

    // Check subsequent stages are skipped
    const deployStage = page.locator('[data-testid="stage-deploy"]')
    await expect(deployStage.locator(".status-badge")).toContainText("skipped")
  })

  test("should restart failed pipeline", async ({ page }) => {
    // Select failed pipeline
    await page.locator('[data-testid="pipeline-item-3"]').click()

    // Click restart button
    await page.locator('[data-testid="restart-button"]').click()

    // Confirm restart
    await page.locator('[data-testid="confirm-restart"]').click()

    // Check pipeline status changes to running
    await expect(page.locator('[data-testid="pipeline-status"]')).toContainText("running")
  })

  test("should promote staging to production", async ({ page }) => {
    await page.locator('[data-testid="tab-deployments"]').click()

    // Check staging deployment is ready
    await expect(page.locator('[data-testid="staging-deployment"]')).toBeVisible()
    await expect(page.locator('[data-testid="staging-status"]')).toContainText("Testing")

    // Click promote button
    await page.locator('[data-testid="promote-button"]').click()

    // Confirm promotion
    await page.locator('[data-testid="confirm-promote"]').click()

    // Check promotion starts
    await expect(page.locator('[data-testid="promotion-status"]')).toContainText("Promoting")

    // Wait for promotion to complete
    await expect(page.locator('[data-testid="production-status"]')).toContainText("Active", { timeout: 30000 })
  })

  test("should view pipeline logs", async ({ page }) => {
    // Select a pipeline
    await page.locator('[data-testid="pipeline-item-1"]').click()

    // Click view logs button
    await page.locator('[data-testid="view-logs-button"]').click()

    // Check logs modal opens
    await expect(page.locator('[data-testid="logs-modal"]')).toBeVisible()

    // Check log content is displayed
    await expect(page.locator('[data-testid="log-content"]')).toContainText("Starting pipeline execution")

    // Check different log levels
    await expect(page.locator('[data-testid="log-info"]')).toBeVisible()
    await expect(page.locator('[data-testid="log-error"]')).toBeVisible()

    // Close logs modal
    await page.locator('[data-testid="close-logs"]').click()
    await expect(page.locator('[data-testid="logs-modal"]')).toBeHidden()
  })
})
