# Splunk Training Simulator

運用監視ツールSplunkの学習・トレーニング用シミュレーター

## 概要

Splunk Training Simulatorは、Splunkの基本的な機能を無料で学習できるWebアプリケーションです。実際のSplunkを使用せずに、SPL（Search Processing Language）の練習や、ログデータの検索・分析・可視化を体験できます。

## 主な機能

### 1. ダッシュボード
- リアルタイムのシステム監視メトリクス表示
- 総イベント数、エラー数、警告数、アクティブユーザー数の可視化
- 時系列チャートとログレベル分布グラフ
- 最新イベントの一覧表示

### 2. ログ検索
- SPL（Search Processing Language）クエリのサポート
- 基本的な検索コマンド（source、フィールドフィルタリング、比較演算子）
- 統計コマンド（stats、count、avg、sum、max、min）
- ソートコマンド（sort）
- 検索結果の複数ビュー（テーブル、Raw、チャート）

### 3. チュートリアル
- SPLの基本的な使い方を学習
- 段階的なレッスンと実践的な練習問題
- ワンクリックでクエリを試せる機能

## サポートされているSPLコマンド

### 検索とフィルタリング
```spl
source=web_access
source=web_access status=500
source=web_access status>=400
```

### 統計コマンド
```spl
source=web_access | stats count by status
source=web_access | stats count, avg(response_time) by host
```

### ソート
```spl
source=web_access | stats count by status | sort -count
```

### その他
```spl
source=web_access | head 10
source=web_access | tail 10
source=web_access | fields host, status, response_time
```

## サンプルデータ

シミュレーターには以下のサンプルログデータが含まれています：

### Webアクセスログ（source=web_access）
- timestamp: イベント発生時刻
- host: サーバーホスト名
- status: HTTPステータスコード
- method: HTTPメソッド（GET、POST等）
- path: アクセスパス
- user: ユーザー名
- response_time: レスポンスタイム（ms）
- bytes: 転送バイト数
- ip: クライアントIPアドレス

### アプリケーションログ（source=app_log）
- timestamp: イベント発生時刻
- host: サーバーホスト名
- level: ログレベル（INFO、WARN、ERROR）
- message: ログメッセージ
- thread: スレッド名
- class: クラス名

## 使い方

### 1. アプリケーションの起動

ブラウザでindex.htmlを開くだけで使用できます。

```bash
# シンプルなHTTPサーバーを起動する場合（Python 3）
cd splunk-training-simulator
python3 -m http.server 8000
```

その後、ブラウザで http://localhost:8000 にアクセスします。

### 2. ダッシュボードの確認

起動直後はダッシュボード画面が表示されます。
- 各メトリクスカードでシステムの状態を確認
- 時間範囲を変更してデータを更新
- 🔄更新ボタンで新しいデータを生成

### 3. ログ検索

「検索」タブに移動して：
1. クエリ入力欄にSPLクエリを入力
2. 検索ボタンをクリック、またはEnterキーを押す
3. 結果をテーブル、Raw、チャート形式で表示

クエリ例ボタンをクリックすると、すぐに例を試せます。

### 4. チュートリアル

「チュートリアル」タブで：
- Splunkの基本概念を学習
- SPLクエリの構文を段階的に学習
- 「試してみる」ボタンで即座にクエリを実行
- 練習問題に挑戦

## プロジェクト構造

```
splunk-training-simulator/
├── index.html              # メインHTMLファイル
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── app.js             # メインアプリケーションロジック
│   ├── data-generator.js  # サンプルログデータ生成
│   ├── query-parser.js    # SPLクエリパーサーと実行エンジン
│   └── visualizations.js  # Chart.jsを使用したビジュアライゼーション
└── README.md              # このファイル
```

## 技術スタック

- **フロントエンド**: HTML5、CSS3、JavaScript (ES6+)
- **チャートライブラリ**: Chart.js 4.4.0
- **依存関係**: なし（Chart.jsのみCDN経由）

## 学習の進め方

1. **初級**: ダッシュボードでデータを観察
2. **初級〜中級**: 基本的な検索クエリを試す
3. **中級**: statsコマンドで集計を学ぶ
4. **中級〜上級**: 複数コマンドのパイプライン処理
5. **上級**: 複雑なクエリを自分で作成

## 制限事項

このシミュレーターは学習目的で作成されており、以下の制限があります：

- データは毎回ランダムに生成されます（永続化されません）
- 実際のSplunkの全機能をサポートしているわけではありません
- パフォーマンスは実際のSplunkと異なります
- 一部の高度なSPLコマンドはサポートされていません

## ライセンス

このプロジェクトは教育目的で作成されたものです。

## 貢献

改善提案やバグ報告は歓迎します。

## 参考リンク

- [Splunk公式ドキュメント](https://docs.splunk.com/)
- [SPLクイックリファレンス](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/SearchCheatsheet)

---

**注意**: これは公式のSplunk製品ではありません。学習・トレーニング目的のシミュレーターです。
