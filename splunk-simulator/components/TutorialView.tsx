'use client';

import { useSplunk } from '@/lib/context/splunk-context';

export default function TutorialView() {
  const { setSearchQuery, executeSearch, setCurrentView } = useSplunk();

  const tryQuery = (query: string) => {
    setSearchQuery(query);
    executeSearch(query);
    setCurrentView('search');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Splunk トレーニング</h1>
      </div>

      {/* Tutorial Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Introduction Card */}
        <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
          <h2 className="text-2xl font-bold text-[var(--splunk-green)] mb-4">🎯 はじめに</h2>
          <p className="text-gray-300 mb-4">
            15種類以上のログフォーマットで実践的なログ分析を学習できます。
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-[var(--splunk-green)]">✓</span>
              <span>Kubernetes & Docker コンテナログ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--splunk-green)]">✓</span>
              <span>AWS & Azure クラウドログ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--splunk-green)]">✓</span>
              <span>Redis, MongoDB, Elasticsearch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--splunk-green)]">✓</span>
              <span>Nginx, Apache, Firewall</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--splunk-green)]">✓</span>
              <span>Windows Event, Kafka, Prometheus</span>
            </li>
          </ul>
        </div>

        {/* Basic SPL Commands */}
        <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
          <h2 className="text-2xl font-bold text-[var(--splunk-green)] mb-4">📚 基本SPLコマンド</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. ソース検索</h3>
              <code className="block bg-[var(--splunk-dark-bg)] p-3 rounded text-[var(--splunk-green)] font-mono text-sm mb-2">
                source=kubernetes
              </code>
              <button
                onClick={() => tryQuery('source=kubernetes')}
                className="px-4 py-2 bg-[var(--splunk-green)] text-white rounded text-sm hover:bg-[var(--splunk-dark-green)] transition-colors"
              >
                試す
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. フィールドフィルター</h3>
              <code className="block bg-[var(--splunk-dark-bg)] p-3 rounded text-[var(--splunk-green)] font-mono text-sm mb-2">
                source=docker level=ERROR
              </code>
              <button
                onClick={() => tryQuery('source=docker level=ERROR')}
                className="px-4 py-2 bg-[var(--splunk-green)] text-white rounded text-sm hover:bg-[var(--splunk-dark-green)] transition-colors"
              >
                試す
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. 統計集計</h3>
              <code className="block bg-[var(--splunk-dark-bg)] p-3 rounded text-[var(--splunk-green)] font-mono text-sm mb-2">
                source=nginx | stats count by status
              </code>
              <button
                onClick={() => tryQuery('source=nginx | stats count by status')}
                className="px-4 py-2 bg-[var(--splunk-green)] text-white rounded text-sm hover:bg-[var(--splunk-dark-green)] transition-colors"
              >
                試す
              </button>
            </div>
          </div>
        </div>

        {/* Practical Examples */}
        <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
          <h2 className="text-2xl font-bold text-[var(--splunk-green)] mb-4">💡 実践例</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">K8sエラー分析</h3>
              <p className="text-sm text-gray-400 mb-2">
                Kubernetesのエラーログをポッド別に集計
              </p>
              <button
                onClick={() => tryQuery('source=kubernetes level=ERROR | stats count by pod')}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                解答を見る
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">AWS分析</h3>
              <p className="text-sm text-gray-400 mb-2">
                AWSサービス別にログを集計
              </p>
              <button
                onClick={() => tryQuery('source=aws:cloudwatch | stats count by aws_service')}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                解答を見る
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">遅いDB検出</h3>
              <p className="text-sm text-gray-400 mb-2">
                MongoDBの遅いクエリを検出
              </p>
              <button
                onClick={() => tryQuery('source=mongodb duration_ms>=100 | stats avg(duration_ms) by operation')}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                解答を見る
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Topics */}
      <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
        <h2 className="text-2xl font-bold text-[var(--splunk-green)] mb-4">🔥 高度なトピック</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">時間範囲フィルタリング</h3>
            <p className="text-sm text-gray-400 mb-3">
              上部のナビゲーションバーで時間範囲を選択できます（5分、15分、1時間、4時間、24時間、7日）。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">ソースフィルタリング</h3>
            <p className="text-sm text-gray-400 mb-3">
              サイドバーで特定のログソースを選択/解除して、表示するログをフィルタリングできます。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">検索の保存</h3>
            <p className="text-sm text-gray-400 mb-3">
              検索ビューで💾ボタンをクリックすると、よく使うクエリを保存できます。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">データのエクスポート</h3>
            <p className="text-sm text-gray-400 mb-3">
              検索結果をCSV、JSON、またはRaw形式でエクスポートできます。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">カスタムダッシュボード</h3>
            <p className="text-sm text-gray-400 mb-3">
              カスタムビューで独自のSPLクエリと可視化パネルを作成できます。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">比較演算子</h3>
            <p className="text-sm text-gray-400 mb-3">
              {'>='}, {'<='}, {'>'}, {'<'} を使用して数値フィールドをフィルタリングできます。
              <br />
              例: status{'>'}=500, duration_ms{'>'}=100
            </p>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
        <h2 className="text-2xl font-bold text-[var(--splunk-green)] mb-4">📝 クイックリファレンス</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[var(--splunk-dark-bg)] p-4 rounded">
            <h4 className="font-semibold text-white mb-2">基本検索</h4>
            <code className="text-sm text-[var(--splunk-green)]">source=ソース名</code>
          </div>

          <div className="bg-[var(--splunk-dark-bg)] p-4 rounded">
            <h4 className="font-semibold text-white mb-2">フィールドフィルター</h4>
            <code className="text-sm text-[var(--splunk-green)]">field=value</code>
          </div>

          <div className="bg-[var(--splunk-dark-bg)] p-4 rounded">
            <h4 className="font-semibold text-white mb-2">数値比較</h4>
            <code className="text-sm text-[var(--splunk-green)]">
              field{'>'}=100
            </code>
          </div>

          <div className="bg-[var(--splunk-dark-bg)] p-4 rounded">
            <h4 className="font-semibold text-white mb-2">AND条件</h4>
            <code className="text-sm text-[var(--splunk-green)]">field1=A field2=B</code>
          </div>

          <div className="bg-[var(--splunk-dark-bg)] p-4 rounded">
            <h4 className="font-semibold text-white mb-2">統計集計</h4>
            <code className="text-sm text-[var(--splunk-green)]">| stats count by field</code>
          </div>

          <div className="bg-[var(--splunk-dark-bg)] p-4 rounded">
            <h4 className="font-semibold text-white mb-2">全文検索</h4>
            <code className="text-sm text-[var(--splunk-green)]">キーワード</code>
          </div>
        </div>
      </div>
    </div>
  );
}
