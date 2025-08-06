import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Task Manager E2E Tests", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("should add a new task", () => {
    const taskTitle = "New E2E Test Task"

    cy.get('[data-testid="task-input"]').type(taskTitle)
    cy.get('[data-testid="add-task-button"]').click()

    cy.contains(taskTitle).should("be.visible")
  })

  it("should complete a task", () => {
    // 新しいタスクを追加
    const taskTitle = "Task to Complete"
    cy.get('[data-testid="task-input"]').type(taskTitle)
    cy.get('[data-testid="add-task-button"]').click()

    // タスクを完了にする
    cy.contains(taskTitle).parent().find('[data-testid^="task-checkbox-"]').click()

    // タスクが完了状態になることを確認
    cy.contains(taskTitle).should("have.class", "line-through")
  })

  it("should delete a task", () => {
    // 新しいタスクを追加
    const taskTitle = "Task to Delete"
    cy.get('[data-testid="task-input"]').type(taskTitle)
    cy.get('[data-testid="add-task-button"]').click()

    // タスクを削除
    cy.contains(taskTitle).parent().find('[data-testid^="delete-task-"]').click()

    // タスクが削除されることを確認
    cy.contains(taskTitle).should("not.exist")
  })

  it("should show task statistics", () => {
    // 複数のタスクを追加
    cy.get('[data-testid="task-input"]').type("Task 1")
    cy.get('[data-testid="add-task-button"]').click()

    cy.get('[data-testid="task-input"]').type("Task 2")
    cy.get('[data-testid="add-task-button"]').click()

    // 1つのタスクを完了
    cy.contains("Task 1").parent().find('[data-testid^="task-checkbox-"]').click()

    // 統計が正しく表示されることを確認
    cy.contains("完了: 1 / 全体: 2").should("be.visible")
  })
})
