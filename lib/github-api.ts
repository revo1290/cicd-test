export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  default_branch: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
}

export interface GitHubWorkflowRun {
  id: number
  name: string
  head_branch: string
  head_sha: string
  status: string
  conclusion: string | null
  workflow_id: number
  check_suite_id: number
  check_suite_node_id: string
  url: string
  html_url: string
  pull_requests: any[]
  created_at: string
  updated_at: string
  run_attempt: number
  run_started_at: string
  actor: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
  triggering_actor: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
  run_number: number
  event: string
  display_title: string
}

export interface GitHubCommit {
  sha: string
  node_id: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
    tree: {
      sha: string
      url: string
    }
    url: string
    comment_count: number
  }
  url: string
  html_url: string
  comments_url: string
  author: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  } | null
  committer: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  } | null
  parents: Array<{
    sha: string
    url: string
    html_url: string
  }>
}

export interface GitHubWorkflow {
  id: number
  node_id: string
  name: string
  path: string
  state: string
  created_at: string
  updated_at: string
  url: string
  html_url: string
  badge_url: string
}

class GitHubAPI {
  private readonly baseUrl = "https://api.github.com"
  private readonly token: string | null

  constructor() {
    this.token = process.env.GITHUB_TOKEN || null
  }

  private async request<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CI-CD-Dashboard/1.0",
    }

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`)
  }

  async getRepositories(owner: string): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(`/users/${owner}/repos?sort=updated&per_page=10`)
  }

  async getWorkflows(owner: string, repo: string): Promise<{ workflows: GitHubWorkflow[] }> {
    return this.request<{ workflows: GitHubWorkflow[] }>(`/repos/${owner}/${repo}/actions/workflows`)
  }

  async getWorkflowRuns(owner: string, repo: string, per_page = 10): Promise<GitHubWorkflowRun[]> {
    const response = await this.request<{ workflow_runs: GitHubWorkflowRun[] }>(
      `/repos/${owner}/${repo}/actions/runs?per_page=${per_page}`,
    )
    return response.workflow_runs
  }

  async getCommits(owner: string, repo: string, per_page = 10): Promise<GitHubCommit[]> {
    return this.request<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=${per_page}`)
  }

  async getWorkflowRunLogs(owner: string, repo: string, runId: number): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}/logs`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: this.token ? `token ${this.token}` : "",
          "User-Agent": "CI-CD-Dashboard/1.0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error("Error fetching workflow logs:", error)
      return `ログの取得に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }

  async triggerWorkflow(owner: string, repo: string, workflowId: number, ref = "main"): Promise<void> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: this.token ? `token ${this.token}` : "",
        "User-Agent": "CI-CD-Dashboard/1.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref }),
    })

    if (!response.ok) {
      throw new Error(`Failed to trigger workflow: ${response.status} ${response.statusText}`)
    }
  }

  async cancelWorkflowRun(owner: string, repo: string, runId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: this.token ? `token ${this.token}` : "",
        "User-Agent": "CI-CD-Dashboard/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel workflow: ${response.status} ${response.statusText}`)
    }
  }

  async rerunWorkflow(owner: string, repo: string, runId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}/rerun`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: this.token ? `token ${this.token}` : "",
        "User-Agent": "CI-CD-Dashboard/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to rerun workflow: ${response.status} ${response.statusText}`)
    }
  }
}

export const githubApi = new GitHubAPI()
