'use client';

import { useState } from 'react';
import { useSplunk } from '@/lib/context/splunk-context';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function SearchView() {
  const {
    searchQuery,
    setSearchQuery,
    executeSearch,
    searchResults,
    saveSearch,
    searchHistory,
  } = useSplunk();

  const [showHistory, setShowHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'raw' | 'chart'>('table');
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  const handleSearch = () => {
    executeSearch(searchQuery);
  };

  const handleSaveSearch = () => {
    if (saveName.trim()) {
      saveSearch(saveName, searchQuery, saveDesc);
      setSaveName('');
      setSaveDesc('');
      setShowSaveModal(false);
    }
  };

  const exportData = (format: 'csv' | 'json' | 'raw') => {
    let content = '';
    let filename = `search-results-${Date.now()}`;

    if (format === 'csv') {
      const headers = Object.keys(searchResults[0] || {});
      content = headers.join(',') + '\n';
      searchResults.forEach((log: any) => {
        const row = headers.map((h) => JSON.stringify(log[h] || '')).join(',');
        content += row + '\n';
      });
      filename += '.csv';
    } else if (format === 'json') {
      content = JSON.stringify(searchResults, null, 2);
      filename += '.json';
    } else {
      content = searchResults.map((log) => log._raw).join('\n');
      filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickExamples = [
    { label: 'K8s エラー', query: 'source=kubernetes level=ERROR' },
    { label: 'Docker', query: 'source=docker' },
    { label: 'AWS', query: 'source=aws:cloudwatch' },
    { label: 'Nginx 5xx', query: 'source=nginx status>=500' },
    { label: '遅いDB', query: 'source=mongodb duration_ms>=100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">ログ検索</h1>
      </div>

      {/* Search Input */}
      <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="SPL クエリを入力... (例: source=kubernetes level=ERROR)"
              className="w-full px-4 py-3 bg-[var(--splunk-dark-bg)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)] font-mono"
            />
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-3 bg-[var(--splunk-dark-bg)] text-gray-300 rounded border border-[var(--splunk-border)] hover:bg-[var(--splunk-navy)] transition-colors"
            title="検索履歴"
          >
            📜
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-3 bg-[var(--splunk-dark-bg)] text-gray-300 rounded border border-[var(--splunk-border)] hover:bg-[var(--splunk-navy)] transition-colors"
            title="検索を保存"
          >
            💾
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[var(--splunk-green)] text-white rounded font-medium hover:bg-[var(--splunk-dark-green)] transition-colors"
          >
            🔍 検索
          </button>
        </div>

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="mb-4 p-4 bg-[var(--splunk-dark-bg)] rounded border border-[var(--splunk-border)]">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">検索履歴</h4>
            <div className="space-y-1">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(query);
                    setShowHistory(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[var(--splunk-navy)] rounded font-mono"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">クイック例:</span>
          {quickExamples.map((example) => (
            <button
              key={example.label}
              onClick={() => {
                setSearchQuery(example.query);
                executeSearch(example.query);
              }}
              className="px-3 py-1 text-sm bg-[var(--splunk-dark-bg)] text-[var(--splunk-green)] rounded border border-[var(--splunk-border)] hover:bg-[var(--splunk-navy)] transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)]">
        {/* Results Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--splunk-border)]">
          <h3 className="text-lg font-semibold text-white">
            検索結果 <span className="text-[var(--splunk-green)]">({searchResults.length})</span>
          </h3>

          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  'px-3 py-1 rounded',
                  viewMode === 'table'
                    ? 'bg-[var(--splunk-green)] text-white'
                    : 'bg-[var(--splunk-dark-bg)] text-gray-300'
                )}
                title="テーブル"
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={clsx(
                  'px-3 py-1 rounded',
                  viewMode === 'raw'
                    ? 'bg-[var(--splunk-green)] text-white'
                    : 'bg-[var(--splunk-dark-bg)] text-gray-300'
                )}
                title="Raw"
              >
                📄
              </button>
            </div>

            {/* Export */}
            {searchResults.length > 0 && (
              <div className="relative group">
                <button className="px-4 py-2 bg-[var(--splunk-dark-bg)] text-gray-300 rounded border border-[var(--splunk-border)] hover:bg-[var(--splunk-navy)]">
                  📤 エクスポート ▼
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-[var(--splunk-dark-bg)] border border-[var(--splunk-border)] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => exportData('csv')}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-[var(--splunk-navy)]"
                  >
                    CSV形式
                  </button>
                  <button
                    onClick={() => exportData('json')}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-[var(--splunk-navy)]"
                  >
                    JSON形式
                  </button>
                  <button
                    onClick={() => exportData('raw')}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-[var(--splunk-navy)]"
                  >
                    Raw形式
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Content */}
        <div className="p-4">
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400">検索を実行してください</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {searchResults.map((log, index) => (
                <div
                  key={index}
                  className="p-4 bg-[var(--splunk-dark-bg)] rounded border border-[var(--splunk-border)] hover:border-[var(--splunk-green)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        log.level === 'ERROR'
                          ? 'bg-red-500/20 text-red-400'
                          : log.level === 'WARN'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {log.level || 'INFO'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-400">
                          {format(new Date(log._time), 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                        <span className="text-xs px-2 py-1 bg-[var(--splunk-green)]/20 text-[var(--splunk-green)] rounded">
                          {log.source}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 font-mono">{log._raw}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--splunk-dark-bg)] p-4 rounded font-mono text-sm text-gray-300 max-h-[600px] overflow-y-auto">
              {searchResults.map((log, index) => (
                <div key={index} className="mb-2">
                  {log._raw}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">検索を保存</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">名前 *</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="例: K8s エラーログ"
                  className="w-full px-4 py-2 bg-[var(--splunk-dark-bg)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">説明</label>
                <textarea
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  rows={3}
                  placeholder="この検索の説明..."
                  className="w-full px-4 py-2 bg-[var(--splunk-dark-bg)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">クエリ</label>
                <div className="px-4 py-2 bg-[var(--splunk-dark-bg)] text-[var(--splunk-green)] rounded border border-[var(--splunk-border)] font-mono text-sm">
                  {searchQuery}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--splunk-dark-bg)] text-gray-300 rounded border border-[var(--splunk-border)] hover:bg-[var(--splunk-navy)] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveSearch}
                className="flex-1 px-4 py-2 bg-[var(--splunk-green)] text-white rounded font-medium hover:bg-[var(--splunk-dark-green)] transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
