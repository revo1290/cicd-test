import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// グローバルなテスト設定
global.fetch = jest.fn()

// テスト前の共通セットアップ
jest.beforeEach(() => {
  jest.clearAllMocks()
})
