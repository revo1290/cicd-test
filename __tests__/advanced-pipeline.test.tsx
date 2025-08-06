import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { PipelineExecutionControls } from "@/components/pipeline-execution"
import { realDataService } from "@/lib/real-data-service"
import { jest } from "@jest/globals"

// モックの設定
jest.mock("@/lib/real-data-service", () => ({
  realDataService: {
    triggerPipeline: jest.fn(),
    cancelPipeline: jest.fn(),
    rerunPipeline: jest.fn(),
  },
}))

const mockPipeline = {
  id: "test-pipeline-1",
  name: "テストパイプライン",
  status: "pending" as const,
  branch: "main",
  commit: "abc123",
  author: "test-user",
  authorAvatar: "/test-avatar.png",
  duration: 300,
  startTime: new Date("2024-01-15T10:00:00Z"),
  repository: "test-repo",
  workflowUrl: "https://github.com/test/repo/actions/runs/123",
  stages: [
    {
      id: "build",
      name: "ビルド・テスト",
      status: "pending" as const,
      duration: 0,
    },
  ],
}

describe("PipelineExecutionControls", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("パイプライン情報が正しく表示される", () => {
    render(<PipelineExecutionControls pipeline={mockPipeline} />)

    expect(screen.getByText("テストパイプライン")).toBeInTheDocument()
    expect(screen.getByText("test-repo")).toBeInTheDocument()
    expect(screen.getByText("main")).toBeInTheDocument()
    expect(screen.getByText("待機中")).toBeInTheDocument()
  })

  test("実行ボタンをクリックすると実行ダイアログが開く", () => {
    render(<PipelineExecutionControls pipeline={mockPipeline} />)

    const executeButton = screen.getByRole("button", { name: /実行/ })
    fireEvent.click(executeButton)

    expect(screen.getByText("パイプライン実行")).toBeInTheDocument()
    expect(screen.getByText("パイプライン「テストパイプライン」を実行します。")).toBeInTheDocument()
  })

  test("パイプライン実行が正常に動作する", async () => {
    const mockTriggerPipeline = realDataService.triggerPipeline as jest.MockedFunction<
      typeof realDataService.triggerPipeline
    >
    mockTriggerPipeline.mockResolvedValue()

    const mockOnUpdate = jest.fn()
    render(<PipelineExecutionControls pipeline={mockPipeline} onExecutionUpdate={mockOnUpdate} />)

    // 実行ダイアログを開く
    const executeButton = screen.getByRole("button", { name: /実行/ })
    fireEvent.click(executeButton)

    // 実行開始ボタンをクリック
    const startButton = screen.getByRole("button", { name: /実行開始/ })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockTriggerPipeline).toHaveBeenCalledWith("test-pipeline-1")
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockPipeline,
          status: "running",
        }),
      )
    })
  })

  test("実行中のパイプラインでは停止ボタンが表示される", () => {
    const runningPipeline = { ...mockPipeline, status: "running" as const }
    render(<PipelineExecutionControls pipeline={runningPipeline} />)

    expect(screen.getByRole("button", { name: /停止/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /一時停止/ })).toBeInTheDocument()
    expect(screen.getByText("実行進捗")).toBeInTheDocument()
  })

  test("パイプライン停止が正常に動作する", async () => {
    const mockCancelPipeline = realDataService.cancelPipeline as jest.MockedFunction<
      typeof realDataService.cancelPipeline
    >
    mockCancelPipeline.mockResolvedValue()

    const runningPipeline = { ...mockPipeline, status: "running" as const }
    const mockOnUpdate = jest.fn()
    render(<PipelineExecutionControls pipeline={runningPipeline} onExecutionUpdate={mockOnUpdate} />)

    // 停止ボタンをクリック
    const stopButton = screen.getByRole("button", { name: /停止/ })
    fireEvent.click(stopButton)

    // 確認ダイアログで停止を確認
    const confirmButton = screen.getByRole("button", { name: /停止する/ })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockCancelPipeline).toHaveBeenCalledWith("test-pipeline-1")
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...runningPipeline,
          status: "failed",
        }),
      )
    })
  })

  test("再実行ボタンが正常に動作する", async () => {
    const mockRerunPipeline = realDataService.rerunPipeline as jest.MockedFunction<typeof realDataService.rerunPipeline>
    mockRerunPipeline.mockResolvedValue()

    const failedPipeline = { ...mockPipeline, status: "failed" as const }
    const mockOnUpdate = jest.fn()
    render(<PipelineExecutionControls pipeline={failedPipeline} onExecutionUpdate={mockOnUpdate} />)

    const rerunButton = screen.getByRole("button", { name: /再実行/ })
    fireEvent.click(rerunButton)

    await waitFor(() => {
      expect(mockRerunPipeline).toHaveBeenCalledWith("test-pipeline-1")
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...failedPipeline,
          status: "running",
        }),
      )
    })
  })

  test("失敗したパイプラインではエラーアラートが表示される", () => {
    const failedPipeline = { ...mockPipeline, status: "failed" as const }
    render(<PipelineExecutionControls pipeline={failedPipeline} />)

    expect(screen.getByText("パイプラインが失敗しました。ログを確認して問題を解決してください。")).toBeInTheDocument()
  })

  test("実行中のパイプラインでは実行中アラートが表示される", () => {
    const runningPipeline = { ...mockPipeline, status: "running" as const }
    render(<PipelineExecutionControls pipeline={runningPipeline} />)

    expect(screen.getByText("パイプラインが実行中です。進捗はリアルタイムで更新されます。")).toBeInTheDocument()
  })

  test("実行パラメータが正しく設定できる", () => {
    render(<PipelineExecutionControls pipeline={mockPipeline} />)

    // 実行ダイアログを開く
    const executeButton = screen.getByRole("button", { name: /実行/ })
    fireEvent.click(executeButton)

    // ブランチ選択
    const branchSelect = screen.getByDisplayValue("main")
    expect(branchSelect).toBeInTheDocument()

    // 環境選択
    const environmentSelect = screen.getByDisplayValue("ステージング環境")
    expect(environmentSelect).toBeInTheDocument()

    // オプションチェックボックス
    expect(screen.getByLabelText("テストをスキップ")).toBeInTheDocument()
    expect(screen.getByLabelText("成功時に自動デプロイ")).toBeInTheDocument()
    expect(screen.getByLabelText("完了時に通知")).toBeInTheDocument()
  })

  test("エラーハンドリングが正常に動作する", async () => {
    const mockTriggerPipeline = realDataService.triggerPipeline as jest.MockedFunction<
      typeof realDataService.triggerPipeline
    >
    mockTriggerPipeline.mockRejectedValue(new Error("API エラー"))

    // アラートをモック
    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {})

    render(<PipelineExecutionControls pipeline={mockPipeline} />)

    // 実行ダイアログを開く
    const executeButton = screen.getByRole("button", { name: /実行/ })
    fireEvent.click(executeButton)

    // 実行開始ボタンをクリック
    const startButton = screen.getByRole("button", { name: /実行開始/ })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("パイプラインの実行に失敗しました: API エラー")
    })

    mockAlert.mockRestore()
  })
})
