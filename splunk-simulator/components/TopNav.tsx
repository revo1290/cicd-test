'use client';

import { useSplunk } from '@/lib/context/splunk-context';
import clsx from 'clsx';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { currentView, setCurrentView, timeRange, setTimeRange, refreshData } = useSplunk();

  const views = [
    { id: 'dashboard' as const, label: '📊 ダッシュボード' },
    { id: 'search' as const, label: '🔍 検索' },
    { id: 'custom' as const, label: '📈 カスタム' },
    { id: 'tutorial' as const, label: '🎓 チュートリアル' },
  ];

  const timeRanges = [
    { value: '5m', label: '5分' },
    { value: '15m', label: '15分' },
    { value: '1h', label: '1時間' },
    { value: '4h', label: '4時間' },
    { value: '24h', label: '24時間' },
    { value: '7d', label: '7日' },
  ];

  return (
    <nav className="bg-[var(--splunk-dark-bg)] border-b border-[var(--splunk-border)] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden px-4 py-2 text-gray-300 hover:text-white hover:bg-[var(--splunk-navy)] rounded transition-colors"
        >
          ☰ メニュー
        </button>

        {/* View tabs */}
        <div className="hidden lg:flex items-center gap-2 flex-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={clsx(
                'px-6 py-2 rounded-md font-medium transition-all duration-200',
                currentView === view.id
                  ? 'bg-[var(--splunk-green)] text-white shadow-lg shadow-[var(--splunk-green)]/40'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Mobile dropdown */}
        <div className="lg:hidden flex-1">
          <select
            value={currentView}
            onChange={(e) => setCurrentView(e.target.value as 'dashboard' | 'search' | 'custom' | 'tutorial')}
            className="w-full px-4 py-2 bg-[var(--splunk-navy)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)]"
          >
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-[var(--splunk-navy)] text-white rounded border border-[var(--splunk-border)] focus:outline-none focus:ring-2 focus:ring-[var(--splunk-green)] text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <button
            onClick={refreshData}
            className="px-4 py-2 bg-[var(--splunk-green)] text-white rounded font-medium hover:bg-[var(--splunk-dark-green)] transition-colors flex items-center gap-2"
          >
            🔄 更新
          </button>
        </div>
      </div>
    </nav>
  );
}
