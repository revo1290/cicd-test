import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TaskManager from "../components/task-manager"

describe("TaskManager Component", () => {
  it("renders task manager with initial tasks", () => {
    render(<TaskManager />)

    expect(screen.getByText("タスク管理アプリ（テスト対象）")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("新しいタスクを入力...")).toBeInTheDocument()
    expect(screen.getByText("JUnitテストケースを作成")).toBeInTheDocument()
  })

  it("adds a new task when form is submitted", async () => {
    const user = userEvent.setup()
    render(<TaskManager />)

    const input = screen.getByTestId("task-input")
    const addButton = screen.getByTestId("add-task-button")

    await user.type(input, "New Test Task")
    await user.click(addButton)

    expect(screen.getByText("New Test Task")).toBeInTheDocument()
    expect(input).toHaveValue("")
  })

  it("toggles task completion status", async () => {
    const user = userEvent.setup()
    render(<TaskManager />)

    const checkbox = screen.getByTestId("task-checkbox-1")
    await user.click(checkbox)

    const taskText = screen.getByText("JUnitテストケースを作成")
    expect(taskText).toHaveClass("line-through")
  })

  it("deletes a task when delete button is clicked", async () => {
    const user = userEvent.setup()
    render(<TaskManager />)

    const deleteButton = screen.getByTestId("delete-task-1")
    await user.click(deleteButton)

    expect(screen.queryByText("JUnitテストケースを作成")).not.toBeInTheDocument()
  })

  it("shows correct task statistics", async () => {
    const user = userEvent.setup()
    render(<TaskManager />)

    // 初期状態: 1つ完了、2つ全体
    expect(screen.getByText("完了: 1 / 全体: 2")).toBeInTheDocument()

    // 未完了のタスクを完了にする
    const checkbox = screen.getByTestId("task-checkbox-1")
    await user.click(checkbox)

    // 統計が更新される
    expect(screen.getByText("完了: 2 / 全体: 2")).toBeInTheDocument()
  })

  it("handles empty task input gracefully", async () => {
    const user = userEvent.setup()
    render(<TaskManager />)

    const addButton = screen.getByTestId("add-task-button")
    const initialTaskCount = screen.getAllByTestId(/^task-\d+$/).length

    await user.click(addButton)

    const finalTaskCount = screen.getAllByTestId(/^task-\d+$/).length
    expect(finalTaskCount).toBe(initialTaskCount)
  })
})
