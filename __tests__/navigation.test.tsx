import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import Navigation from "@/components/navigation"
import { jest } from "@jest/globals"

describe("Navigation", () => {
  const mockOnToggleSidebar = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("ナビゲーションが正しく表示される", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    expect(screen.getByText("DevOps統合管理")).toBeInTheDocument()
    expect(screen.getByText("エンタープライズCI/CDプラットフォーム")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("パイプライン、ログ、メトリクスを検索...")).toBeInTheDocument()
  })

  test("サイドバートグルボタンが動作する", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    const toggleButton = screen.getByRole("button", { name: "" }) // アイコンボタン
    fireEvent.click(toggleButton)

    expect(mockOnToggleSidebar).toHaveBeenCalledTimes(1)
  })

  test("新規パイプラインダイアログが開く", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    const newPipelineButton = screen.getByRole("button", { name: /新規パイプライン/ })
    fireEvent.click(newPipelineButton)

    expect(screen.getByText("新規パイプライン作成")).toBeInTheDocument()
    expect(screen.getByText("新しいCI/CDパイプラインを作成します。")).toBeInTheDocument()
  })

  test("新規パイプライン作成フォームが正常に動作する", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {})

    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    // ダイアログを開く
    const newPipelineButton = screen.getByRole("button", { name: /新規パイプライン/ })
    fireEvent.click(newPipelineButton)

    // フォームに入力
    fireEvent.change(screen.getByLabelText("パイプライン名"), {
      target: { value: "テストパイプライン" },
    })
    fireEvent.change(screen.getByLabelText("リポジトリ"), {
      target: { value: "owner/test-repo" },
    })
    fireEvent.change(screen.getByLabelText("ブランチ"), {
      target: { value: "develop" },
    })
    fireEvent.change(screen.getByLabelText("説明"), {
      target: { value: "テスト用のパイプライン" },
    })

    // 作成ボタンをクリック
    const createButton = screen.getByRole("button", { name: /作成/ })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("新規パイプライン作成:", {
        name: "テストパイプライン",
        repository: "owner/test-repo",
        branch: "develop",
        description: "テスト用のパイプライン",
      })
    })

    consoleSpy.mockRestore()
  })

  test("通知ドロップダウンが正しく表示される", async () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    // 通知ボタンをクリック
    const notificationButton = screen.getByRole("button", { name: "" }) // ベルアイコン
    const bellButtons = screen
      .getAllByRole("button")
      .filter((button) => button.querySelector("svg")?.getAttribute("class")?.includes("lucide-bell"))

    if (bellButtons.length > 0) {
      fireEvent.click(bellButtons[0])

      await waitFor(() => {
        expect(screen.getByText("通知")).toBeInTheDocument()
      })
    }
  })

  test("検索機能が動作する", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {})

    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    const searchInput = screen.getByPlaceholderText("パイプライン、ログ、メトリクスを検索...")
    fireEvent.change(searchInput, { target: { value: "テスト検索" } })

    expect(consoleSpy).toHaveBeenCalledWith("検索クエリ:", "テスト検索")

    consoleSpy.mockRestore()
  })

  test("ダークモード切り替えが動作する", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    const darkModeButton = screen
      .getAllByRole("button")
      .find((button) => button.querySelector("svg")?.getAttribute("class")?.includes("lucide-moon"))

    if (darkModeButton) {
      fireEvent.click(darkModeButton)
      // ダークモードの切り替えが実行されることを確認
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    }
  })

  test("ユーザーメニューが表示される", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    expect(screen.getByText("DevOps管理者")).toBeInTheDocument()
    expect(screen.getByText("admin@company.com")).toBeInTheDocument()
  })

  test("キーボードショートカット（⌘K）で検索ダイアログが開く", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    // ⌘K を押下
    fireEvent.keyDown(document, { key: "k", metaKey: true })

    expect(screen.getByText("検索")).toBeInTheDocument()
    expect(screen.getByText("パイプライン、ログ、メトリクス、設定を検索できます。")).toBeInTheDocument()
  })

  test("ホバーエフェクトが適用される", () => {
    render(<Navigation onToggleSidebar={mockOnToggleSidebar} sidebarOpen={true} />)

    const githubButton = screen.getByRole("button", { name: /GitHub/ })
    expect(githubButton).toHaveClass("hover:bg-gray-50", "hover:border-gray-300", "transition-all", "duration-200")
  })
})
