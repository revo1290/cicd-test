import { realDataService } from "@/lib/real-data-service"
import { githubApi } from "@/lib/github-api"
import jest from "jest" // Declare the jest variable

// GitHub APIをモック
jest.mock("@/lib/github-api", () => ({
  githubApi: {
    getRepository: jest.fn(),
    getWorkflowRuns: jest.fn(),
    getCommits: jest.fn(),
    getWorkflowRunLogs: jest.fn(),
    triggerWorkflow: jest.fn(),
    cancelWorkflowRun: jest.fn(),
    rerunWorkflow: jest.fn(),
  },
}))

describe("RealDataService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("パイプライン一覧を取得できる", async () => {
    const mockWorkflowRuns = [
      {
        id: 123,
        name: "テストワークフロー",
        head_branch: "main",
        head_sha: "abc123def456",
        status: "completed",
        conclusion: "success",
        workflow_id: 456,
        html_url: "https://github.com/test/repo/actions/runs/123",
        run_started_at: "2024-01-15T10:00:00Z",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:05:00Z",
        actor: {
          login: "test-user",
          avatar_url: "https://github.com/test-user.png",
        },
      },
    ]

    const mockCommits = [
      {
        sha: "abc123def456",
        commit: {
          author: { name: "Test User", email: "test@example.com", date: "2024-01-15T10:00:00Z" },
          committer: { name: "Test User", email: "test@example.com", date: "2024-01-15T10:00:00Z" },
          message: "テストコミット",
        },
        author: { login: "test-user", avatar_url: "https://github.com/test-user.png" },
      },
    ]
    ;(githubApi.getWorkflowRuns as jest.Mock).mockResolvedValue(mockWorkflowRuns)
    ;(githubApi.getCommits as jest.Mock).mockResolvedValue(mockCommits)
    ;(githubApi.getRepository as jest.Mock).mockResolvedValue({
      id: 1,
      name: "test-repo",
      full_name: "test/repo",
    })

    const pipelines = await realDataService.getPipelines()

    expect(pipelines).toHaveLength(4) // 4つのリポジトリ × 1つのワークフロー
    expect(pipelines[0]).toMatchObject({
      name: "テストワークフロー",
      status: "success",
      branch: "main",
      commit: "abc123d",
      author: "test-user",
    })
  })

  test("システムメトリクスを取得できる", () => {
    const metrics = realDataService.getCurrentMetrics()

    if (metrics) {
      expect(metrics).toHaveProperty("cpu")
      expect(metrics).toHaveProperty("memory")
      expect(metrics).toHaveProperty("disk")
      expect(metrics).toHaveProperty("network")
      expect(metrics).toHaveProperty("timestamp")
      expect(typeof metrics.cpu).toBe("number")
      expect(typeof metrics.memory).toBe("number")
      expect(typeof metrics.disk).toBe("number")
      expect(typeof metrics.network).toBe("number")
      expect(metrics.timestamp).toBeInstanceOf(Date)
    }
  })

  test("テスト結果を取得できる", async () => {
    const testResults = await realDataService.getTestResults()

    expect(testResults).toHaveLength(6)
    expect(testResults[0]).toMatchObject({
      name: "ユーザーサービステスト",
      status: "passed",
      duration: 2.3,
      suite: "JUnit",
    })
    expect(testResults[5]).toMatchObject({
      name: "ユーザー登録",
      status: "failed",
      duration: 8.1,
      error: "要素が見つかりません: #submit-button",
      suite: "Playwright",
    })
  })

  test("デプロイメント環境を取得できる", async () => {
    const environments = await realDataService.getDeploymentEnvironments()

    expect(environments).toHaveLength(3)
    expect(environments[0]).toMatchObject({
      name: "本番環境",
      status: "healthy",
      version: "v2.1.3",
      uptime: "99.9%",
      url: "https://production.example.com",
    })
  })

  test("パイプラインログを取得できる", async () => {
    const mockLogs = "テストログ内容"
    ;(githubApi.getWorkflowRunLogs as jest.Mock).mockResolvedValue(mockLogs)

    const logs = await realDataService.getPipelineLogs("test-repo-123")

    expect(logs).toContain("パイプライン開始")
    expect(logs).toContain("ブランチ:")
    expect(logs).toContain("コミット:")
  })

  test("パイプラインをトリガーできる", async () => {
    ;(githubApi.triggerWorkflow as jest.Mock).mockResolvedValue(undefined)

    // まずパイプラインを作成
    const mockPipeline = {
      id: "test-repo-123",
      workflowId: 456,
      repository: "test-repo",
      branch: "main",
    }

    // プライベートメソッドにアクセスするためのハック
    ;(realDataService as any).pipelinesCache = [mockPipeline]

    await realDataService.triggerPipeline("test-repo-123")

    expect(githubApi.triggerWorkflow).toHaveBeenCalledWith("vercel", "test-repo", 456, "main")
  })

  test("パイプラインをキャンセルできる", async () => {
    ;(githubApi.cancelWorkflowRun as jest.Mock).mockResolvedValue(undefined)

    // まずパイプラインを作成
    const mockPipeline = {
      id: "test-repo-123",
      runId: 789,
      repository: "test-repo",
    }

    // プライベートメソッドにアクセスするためのハック
    ;(realDataService as any).pipelinesCache = [mockPipeline]

    await realDataService.cancelPipeline("test-repo-123")

    expect(githubApi.cancelWorkflowRun).toHaveBeenCalledWith("vercel", "test-repo", 789)
  })

  test("パイプラインを再実行できる", async () => {
    ;(githubApi.rerunWorkflow as jest.Mock).mockResolvedValue(undefined)

    // まずパイプラインを作成
    const mockPipeline = {
      id: "test-repo-123",
      runId: 789,
      repository: "test-repo",
    }

    // プライベートメソッドにアクセスするためのハック
    ;(realDataService as any).pipelinesCache = [mockPipeline]

    await realDataService.rerunPipeline("test-repo-123")

    expect(githubApi.rerunWorkflow).toHaveBeenCalledWith("vercel", "test-repo", 789)
  })

  test("存在しないパイプラインでエラーが発生する", async () => {
    await expect(realDataService.triggerPipeline("non-existent")).rejects.toThrow(
      "パイプラインまたはワークフローIDが見つかりません",
    )
  })

  test("メトリクス履歴を取得できる", () => {
    const history = realDataService.getMetricsHistory(1) // 1時間分

    expect(Array.isArray(history)).toBe(true)
    history.forEach((metric) => {
      expect(metric).toHaveProperty("cpu")
      expect(metric).toHaveProperty("memory")
      expect(metric).toHaveProperty("disk")
      expect(metric).toHaveProperty("network")
      expect(metric).toHaveProperty("timestamp")
    })
  })

  test("リポジトリ一覧を取得できる", async () => {
    const mockRepository = {
      id: 1,
      name: "test-repo",
      full_name: "test/repo",
      description: "テストリポジトリ",
      private: false,
      html_url: "https://github.com/test/repo",
      default_branch: "main",
      language: "TypeScript",
      stargazers_count: 100,
      forks_count: 20,
      open_issues_count: 5,
      owner: {
        login: "test",
        avatar_url: "https://github.com/test.png",
        html_url: "https://github.com/test",
      },
    }
    ;(githubApi.getRepository as jest.Mock).mockResolvedValue(mockRepository)

    const repositories = await realDataService.getRepositories()

    expect(repositories).toHaveLength(4) // 4つのリポジトリ
    expect(repositories[0]).toMatchObject({
      name: "test-repo",
      full_name: "test/repo",
      language: "TypeScript",
    })
  })
})
