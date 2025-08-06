# CI/CD & テスト自動化 学習プロジェクト

このプロジェクトは、CI/CD、E2Eテスト、JUnitによる自動化を学習するための実践的なシステムです。

## 🎯 学習目標

- **JUnit**: Java単体テスト・統合テストの実装
- **Cypress**: E2Eテストによるユーザーフローの自動化
- **GitHub Actions**: CI/CDパイプラインの構築
- **Docker**: コンテナ化とデプロイメント自動化

## 🏗️ プロジェクト構成

\`\`\`
├── app/                    # Next.jsアプリケーション
├── components/             # Reactコンポーネント
├── __tests__/             # Jest単体テスト
├── cypress/               # Cypressテスト
├── src/test/java/         # JUnit統合テスト
├── scripts/               # データベーススクリプト
├── .github/workflows/     # GitHub Actionsワークフロー
└── docker/                # Docker設定
\`\`\`

## 🚀 セットアップ

### 1. 依存関係のインストール
\`\`\`bash
npm install
\`\`\`

### 2. データベースセットアップ
\`\`\`bash
# Docker Composeでデータベース起動
docker-compose up -d db

# テーブル作成とデータ投入
npm run db:setup
\`\`\`

### 3. 開発サーバー起動
\`\`\`bash
npm run dev
\`\`\`

## 🧪 テスト実行

### 単体テスト (Jest)
\`\`\`bash
# テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ測定
npm run test:coverage
\`\`\`

### 統合テスト (JUnit)
\`\`\`bash
# Javaテスト実行
./gradlew test

# テストレポート生成
./gradlew jacocoTestReport
\`\`\`

### E2Eテスト (Cypress)
\`\`\`bash
# インタラクティブモード
npm run e2e

# ヘッドレスモード
npm run e2e:headless
\`\`\`

## 🔄 CI/CDパイプライン

### パイプライン構成
1. **テスト段階**
   - Jest単体テスト
   - JUnit統合テスト
   - Cypress E2Eテスト

2. **品質チェック**
   - ESLint静的解析
   - コードカバレッジ測定
   - セキュリティスキャン

3. **デプロイメント**
   - ステージング環境デプロイ
   - 本番環境デプロイ
   - ヘルスチェック

### ワークフロー実行
\`\`\`bash
# プッシュでパイプライン実行
git push origin main

# プルリクエストでテスト実行
git push origin feature/new-feature
\`\`\`

## 📊 学習モジュール

### 1. JUnit基礎
- [ ] テストケース作成
- [ ] アサーション使用
- [ ] モック・スタブ実装
- [ ] テストカバレッジ測定

### 2. 統合テスト
- [ ] Spring Boot Test
- [ ] データベーステスト
- [ ] REST APIテスト
- [ ] テストコンテナ使用

### 3. E2Eテスト
- [ ] Cypressセットアップ
- [ ] ユーザーフローテスト
- [ ] ページオブジェクトパターン
- [ ] テストデータ管理

### 4. CI/CDパイプライン
- [ ] GitHub Actions設定
- [ ] 自動テスト実行
- [ ] デプロイメント自動化
- [ ] 品質ゲート設定

## 🛠️ 使用技術

### フロントエンド
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### バックエンド
- Spring Boot 3
- Java 17
- PostgreSQL
- Redis

### テスト
- Jest (単体テスト)
- JUnit 5 (統合テスト)
- Cypress (E2Eテスト)
- TestContainers

### CI/CD
- GitHub Actions
- Docker
- Vercel (デプロイ)

## 📈 品質メトリクス

### テストカバレッジ目標
- 単体テスト: 80%以上
- 統合テスト: 70%以上
- E2Eテスト: 主要フロー100%

### パフォーマンス目標
- ページ読み込み: 2秒以内
- API応答時間: 500ms以内
- テスト実行時間: 10分以内

## 🔍 トラブルシューティング

### よくある問題

1. **テスト失敗**
   \`\`\`bash
   # キャッシュクリア
   npm run test -- --clearCache
   \`\`\`

2. **Cypress起動エラー**
   \`\`\`bash
   # Cypressキャッシュクリア
   npx cypress cache clear
   \`\`\`

3. **Docker問題**
   \`\`\`bash
   # コンテナ再起動
   docker-compose down && docker-compose up -d
   \`\`\`

## 📚 参考資料

- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Cypress Documentation](https://docs.cypress.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)

## 🤝 コントリビューション

1. フォークしてブランチ作成
2. 機能実装・テスト追加
3. プルリクエスト作成
4. CI/CDパイプライン通過確認

## 📄 ライセンス

MIT License
