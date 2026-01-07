'use client';

import { useState } from 'react';

export default function CustomDashboardView() {
  const [panels, setPanels] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [panelTitle, setPanelTitle] = useState('');
  const [panelQuery, setPanelQuery] = useState('');
  const [panelVizType, setPanelVizType] = useState('metric');

  const handleCreatePanel = () => {
    if (panelTitle.trim() && panelQuery.trim()) {
      const newPanel = {
        id: Date.now(),
        title: panelTitle,
        query: panelQuery,
        vizType: panelVizType,
      };

      setPanels([...panels, newPanel]);
      setPanelTitle('');
      setPanelQuery('');
      setPanelVizType('metric');
      setShowModal(false);
    }
  };

  const deletePanel = (id: number) => {
    setPanels(panels.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">カスタムダッシュボード</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[var(--splunk-green)] text-white rounded font-medium hover:bg-[var(--splunk-dark-green)] transition-colors"
        >
          + パネルを追加
        </button>
      </div>

      {/* Panels Grid */}
      {panels.length === 0 ? (
        <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 text-lg">
              「+ パネルを追加」をクリックして独自のダッシュボードを作成
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6 hover:border-[var(--splunk-green)] transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--splunk-green)]">
                  {panel.title}
                </h3>
                <button
                  onClick={() => deletePanel(panel.id)}
                  className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  🗑️
                </button>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">クエリ:</div>
                <div className="text-sm text-[var(--splunk-green)] font-mono bg-[var(--splunk-dark-bg)] p-2 rounded">
                  {panel.query}
                </div>
              </div>

              <div className="text-xs text-gray-400">
                タイプ: {panel.vizType}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Panel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">パネルを作成</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">タイトル *</label>
                <input
                  type="text"
                  value={panelTitle}
                  onChange={(e) => setPanelTitle(e.target.value)}
                  placeholder="例: エラーログ統計"
                  className="w-full px-4 py-2 bg-[var(--splunk-dark-bg)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">SPLクエリ *</label>
                <textarea
                  value={panelQuery}
                  onChange={(e) => setPanelQuery(e.target.value)}
                  rows={4}
                  placeholder="例: source=kubernetes level=ERROR | stats count by namespace"
                  className="w-full px-4 py-2 bg-[var(--splunk-dark-bg)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)] font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">ビジュアライゼーション</label>
                <select
                  value={panelVizType}
                  onChange={(e) => setPanelVizType(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--splunk-dark-bg)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)]"
                >
                  <option value="metric">メトリクス（数値）</option>
                  <option value="table">テーブル</option>
                  <option value="bar">棒グラフ</option>
                  <option value="line">折れ線グラフ</option>
                  <option value="pie">円グラフ</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--splunk-dark-bg)] text-gray-300 rounded border border-[var(--splunk-border)] hover:bg-[var(--splunk-navy)] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreatePanel}
                className="flex-1 px-4 py-2 bg-[var(--splunk-green)] text-white rounded font-medium hover:bg-[var(--splunk-dark-green)] transition-colors"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
