# Splunk Training Simulator - Enterprise Edition
https://cicd-test-rfbn.vercel.app/
本格的なSplunkトレーニングシミュレーター。15種類以上のエンタープライズログフォーマットでSPLクエリを学習できます。

## 🚀 機能

### ログソース（15種類以上）
- **コンテナ**: Kubernetes, Docker
- **クラウド**: AWS CloudWatch, Azure Monitor
- **システム**: Windows Event, Firewall, Load Balancer
- **データベース**: Redis, MongoDB, Elasticsearch
- **メッセージング**: Kafka
- **監視**: Prometheus
- **Webサーバー**: Nginx, Apache
- **アプリケーション**: Application Logs

### メイン機能
- 📊 **ダッシュボード**: リアルタイムメトリクス、チャート、最新イベント
- 🔍 **検索**: SPL風クエリパーサー、フィールドフィルタリング、比較演算子
- 💾 **保存された検索**: よく使うクエリを保存・管理
- 📤 **エクスポート**: CSV、JSON、Raw形式でデータをエクスポート
- 📈 **カスタムダッシュボード**: 独自のパネルとクエリを作成
- 🎓 **チュートリアル**: SPL学習のためのガイドと例

## 🛠️ 技術スタック

- **Next.js 16** - App Router
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - Splunkテーマ
- **Recharts** - データ可視化
- **React Context** - 状態管理

## 📦 インストール

```bash
npm install
```

## 🔧 開発サーバー

```bash
npm run dev
```

開発サーバーが http://localhost:3000 で起動します。

## 🏗️ ビルド

```bash
npm run build
npm start
```

## ▲ Vercelへのデプロイ

### 重要: Root Directoryの設定

このプロジェクトは `cicd-test` リポジトリの **サブディレクトリ** にあるため、Vercelで以下の設定が必要です：

1. [Vercel](https://vercel.com)にログイン
2. 「Add New Project」→「Import Git Repository」
3. GitHubリポジトリ `revo1290/cicd-test` を選択
4. **重要**: 「Root Directory」を `splunk-simulator` に設定
5. Framework Preset: Next.js（自動検出）
6. 「Deploy」をクリック

### Vercel CLI でのデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# このディレクトリでデプロイ
vercel
```

## 📚 使い方

### 基本的な検索

```spl
# ソースで検索
source=kubernetes

# フィールドフィルター
source=docker level=ERROR

# 比較演算子
source=nginx status>=500
source=mongodb duration_ms>=100

# AND条件（スペース区切り）
source=kubernetes level=ERROR namespace=production
```

### 高度な検索

```spl
# 統計集計（※実装予定）
source=nginx | stats count by status

# Kubernetesのエラーをポッド別に集計
source=kubernetes level=ERROR | stats count by pod
```

## 🎨 Splunkテーマ

本物のSplunkに似た認証済みテーマ：
- シグネチャグリーン: `#65A637`
- ダークモード背景: `#0b1014`, `#171d1f`, `#1e2933`
- グリーンのアクセントと光る効果

## 📁 プロジェクト構成

```
splunk-simulator/
├── app/                   # Next.js App Router
├── components/            # Reactコンポーネント
├── lib/
│   ├── context/          # React Context (状態管理)
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ（データ生成など）
└── vercel.json           # Vercel設定
```

## 📄 ライセンス

MIT
