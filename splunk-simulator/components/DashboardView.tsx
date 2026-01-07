'use client';

import { useMemo } from 'react';
import { useSplunk } from '@/lib/context/splunk-context';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function DashboardView() {
  const { filteredLogs } = useSplunk();

  // Calculate metrics
  const metrics = useMemo(() => {
    const errorCount = filteredLogs.filter((log) => log.level === 'ERROR').length;
    const warnCount = filteredLogs.filter((log) => log.level === 'WARN').length;
    const securityCount = filteredLogs.filter((log) =>
      log.source === 'firewall' || log.source === 'windows:event'
    ).length;

    return {
      total: filteredLogs.length,
      errors: errorCount,
      warnings: warnCount,
      security: securityCount,
    };
  }, [filteredLogs]);

  // Time series data
  const timeSeriesData = useMemo(() => {
    const buckets: Record<string, { time: string; count: number; errors: number }> = {};

    filteredLogs.forEach((log) => {
      const time = format(new Date(log._time), 'HH:mm');
      if (!buckets[time]) {
        buckets[time] = { time, count: 0, errors: 0 };
      }
      buckets[time].count++;
      if (log.level === 'ERROR') buckets[time].errors++;
    });

    return Object.values(buckets).slice(0, 20);
  }, [filteredLogs]);

  // Source distribution
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      sources[log.source] = (sources[log.source] || 0) + 1;
    });

    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredLogs]);

  // HTTP status codes
  const statusData = useMemo(() => {
    const statuses: Record<string, number> = {};
    filteredLogs.forEach((log: any) => {
      if (log.status || log.status_code) {
        const status = log.status || log.status_code;
        const bucket = `${Math.floor(status / 100)}xx`;
        statuses[bucket] = (statuses[bucket] || 0) + 1;
      }
    });

    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  // Top endpoints
  const endpointData = useMemo(() => {
    const endpoints: Record<string, number> = {};
    filteredLogs.forEach((log: any) => {
      if (log.endpoint || log.uri) {
        const endpoint = log.endpoint || log.uri;
        endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
      }
    });

    return Object.entries(endpoints)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredLogs]);

  const COLORS = ['#65A637', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">システム監視ダッシュボード</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon="📝"
          title="総イベント数"
          value={metrics.total}
          iconColor="text-[var(--splunk-green)]"
        />
        <MetricCard
          icon="❌"
          title="エラー数"
          value={metrics.errors}
          iconColor="text-red-400"
          valueColor="text-red-400"
        />
        <MetricCard
          icon="⚠️"
          title="警告数"
          value={metrics.warnings}
          iconColor="text-yellow-400"
          valueColor="text-yellow-400"
        />
        <MetricCard
          icon="🔐"
          title="セキュリティ"
          value={metrics.security}
          iconColor="text-blue-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <ChartCard title="時系列ログ統計">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3a3f" />
              <XAxis dataKey="time" stroke="#a8adb3" />
              <YAxis stroke="#a8adb3" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e2933', border: '1px solid #2f3a3f' }}
                labelStyle={{ color: '#e8e9eb' }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#65A637" name="総数" strokeWidth={2} />
              <Line type="monotone" dataKey="errors" stroke="#e74c3c" name="エラー" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Source Distribution */}
        <ChartCard title="ソース別分布">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e2933', border: '1px solid #2f3a3f' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* HTTP Status Codes */}
        {statusData.length > 0 && (
          <ChartCard title="HTTPステータス">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3a3f" />
                <XAxis dataKey="name" stroke="#a8adb3" />
                <YAxis stroke="#a8adb3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2933', border: '1px solid #2f3a3f' }}
                />
                <Bar dataKey="value" fill="#65A637" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top Endpoints */}
        {endpointData.length > 0 && (
          <ChartCard title="トップ10エンドポイント">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={endpointData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3a3f" />
                <XAxis type="number" stroke="#a8adb3" />
                <YAxis dataKey="name" type="category" stroke="#a8adb3" width={150} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2933', border: '1px solid #2f3a3f' }}
                />
                <Bar dataKey="value" fill="#3498DB" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--splunk-green)] mb-4 uppercase tracking-wider">
          最新のイベント
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.slice(0, 20).map((log, index) => (
            <div
              key={index}
              className="p-3 bg-[var(--splunk-dark-bg)] rounded border border-[var(--splunk-border)] hover:border-[var(--splunk-green)] transition-colors"
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">
                      {format(new Date(log._time), 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                    <span className="text-xs text-[var(--splunk-green)]">{log.source}</span>
                  </div>
                  <div className="text-sm text-gray-300 font-mono truncate">{log._raw}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  iconColor = 'text-[var(--splunk-green)]',
  valueColor = 'text-white',
}: {
  icon: string;
  title: string;
  value: number;
  iconColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6 hover:border-[var(--splunk-green)] transition-colors">
      <div className="flex items-center gap-4">
        <div className={`text-4xl ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
          <div className={`text-3xl font-bold ${valueColor}`}>{value.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--splunk-navy)] rounded-lg border border-[var(--splunk-border)] p-6">
      <h3 className="text-lg font-semibold text-[var(--splunk-green)] mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}
