'use client';

import { useSplunk } from '@/lib/context/splunk-context';
import type { LogSource } from '@/lib/types/logs';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCE_INFO: Record<LogSource, { icon: string; color: string; label: string }> = {
  'kubernetes': { icon: '☸️', color: '#326CE5', label: 'Kubernetes' },
  'docker': { icon: '🐳', color: '#2496ED', label: 'Docker' },
  'aws:cloudwatch': { icon: '☁️', color: '#FF9900', label: 'AWS CloudWatch' },
  'azure:monitor': { icon: '🔷', color: '#0078D4', label: 'Azure Monitor' },
  'windows:event': { icon: '🪟', color: '#0078D6', label: 'Windows Event' },
  'firewall': { icon: '🔥', color: '#E74C3C', label: 'Firewall' },
  'loadbalancer': { icon: '⚖️', color: '#3498DB', label: 'Load Balancer' },
  'redis': { icon: '🔴', color: '#DC382D', label: 'Redis' },
  'mongodb': { icon: '🍃', color: '#47A248', label: 'MongoDB' },
  'elasticsearch': { icon: '🔍', color: '#FEC514', label: 'Elasticsearch' },
  'kafka': { icon: '📨', color: '#231F20', label: 'Kafka' },
  'prometheus': { icon: '📊', color: '#E6522C', label: 'Prometheus' },
  'nginx': { icon: '🟢', color: '#009639', label: 'Nginx' },
  'apache': { icon: '🪶', color: '#D22128', label: 'Apache' },
  'application': { icon: '💻', color: '#65A637', label: 'Application' },
};

const ALL_SOURCES: LogSource[] = Object.keys(SOURCE_INFO) as LogSource[];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const {
    selectedSources,
    toggleSource,
    setSelectedSources,
    savedSearches,
    loadSearch,
    deleteSearch,
    filteredLogs,
  } = useSplunk();

  const errorCount = filteredLogs.filter((log) => log.level === 'ERROR').length;
  const allSelected = selectedSources.length === ALL_SOURCES.length;

  const toggleAll = () => {
    setSelectedSources(allSelected ? [] : ALL_SOURCES);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-80 bg-[var(--splunk-dark-bg)] border-r border-[var(--splunk-border)] flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--splunk-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--splunk-green)] flex items-center gap-2">
              🔍 Splunk Simulator
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Source Filters */}
          <div className="p-6 border-b border-[var(--splunk-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                ログソース
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs text-[var(--splunk-green)] hover:underline"
              >
                {allSelected ? '全解除' : '全選択'}
              </button>
            </div>

            <div className="space-y-2">
              {ALL_SOURCES.map((source) => {
                const info = SOURCE_INFO[source];
                const isSelected = selectedSources.includes(source);
                const count = filteredLogs.filter((log) => log.source === source).length;

                return (
                  <label
                    key={source}
                    className={clsx(
                      'flex items-center gap-3 p-2 rounded cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-[var(--splunk-navy)]'
                        : 'hover:bg-[var(--splunk-navy)]/50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSource(source)}
                      className="w-4 h-4 rounded border-gray-600 text-[var(--splunk-green)] focus:ring-[var(--splunk-green)] focus:ring-offset-0"
                    />
                    <span className="text-lg">{info.icon}</span>
                    <span className="flex-1 text-sm text-gray-300">{info.label}</span>
                    <span className="text-xs text-gray-500">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Saved Searches */}
          <div className="p-6 border-b border-[var(--splunk-border)]">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              保存された検索
            </h3>

            {savedSearches.length === 0 ? (
              <p className="text-sm text-gray-500 italic">保存された検索がありません</p>
            ) : (
              <div className="space-y-2">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="group p-3 rounded bg-[var(--splunk-navy)] hover:bg-[var(--splunk-navy)]/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => loadSearch(search.id)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium text-white mb-1">
                          {search.name}
                        </div>
                        {search.description && (
                          <div className="text-xs text-gray-400 mb-2">
                            {search.description}
                          </div>
                        )}
                        <div className="text-xs text-[var(--splunk-green)] font-mono">
                          {search.query}
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSearch(search.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs p-1 transition-opacity"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      実行回数: {search.runCount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              統計
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-[var(--splunk-navy)]">
                <span className="text-sm text-gray-300">総ログ:</span>
                <span className="text-lg font-bold text-white">{filteredLogs.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-[var(--splunk-navy)]">
                <span className="text-sm text-gray-300">エラー:</span>
                <span className="text-lg font-bold text-red-400">{errorCount}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
