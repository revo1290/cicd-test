// Main application logic for Splunk Training Simulator

class SplunkSimulator {
    constructor() {
        this.currentView = 'dashboard';
        this.allLogs = [];
        this.currentTimeRange = '1h';
        this.init();
    }

    init() {
        // Generate initial data
        this.refreshData();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize dashboard
        this.updateDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('dashboardBtn').addEventListener('click', () => this.switchView('dashboard'));
        document.getElementById('searchBtn').addEventListener('click', () => this.switchView('search'));
        document.getElementById('customDashboardBtn').addEventListener('click', () => this.switchView('customDashboard'));
        document.getElementById('tutorialBtn').addEventListener('click', () => this.switchView('tutorial'));

        // Dashboard
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.currentTimeRange = e.target.value;
            this.refreshData();
        });

        // Search
        document.getElementById('searchButton').addEventListener('click', () => this.executeSearch());
        document.getElementById('queryInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeSearch();
            }
        });

        // Search view options
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchSearchView('table'));
        document.getElementById('rawViewBtn').addEventListener('click', () => this.switchSearchView('raw'));
        document.getElementById('chartViewBtn').addEventListener('click', () => this.switchSearchView('chart'));

        // Example queries
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                document.getElementById('queryInput').value = query;
                this.switchView('search');
                this.executeSearch();
            });
        });

        // Tutorial try buttons
        document.querySelectorAll('.try-btn, .solution-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                document.getElementById('queryInput').value = query;
                this.switchView('search');
                this.executeSearch();
            });
        });

        // Custom Dashboard
        document.getElementById('addPanelBtn').addEventListener('click', () => this.showPanelModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hidePanelModal());
        document.getElementById('cancelPanelBtn').addEventListener('click', () => this.hidePanelModal());
        document.getElementById('createPanelBtn').addEventListener('click', () => this.createPanel());
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}Btn`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');

        this.currentView = view;

        // Refresh view-specific data
        if (view === 'dashboard') {
            this.updateDashboard();
        } else if (view === 'customDashboard') {
            dashboardBuilder.refreshPanels();
        }
    }

    refreshData() {
        const timeRangeMinutes = dataGenerator.getTimeRangeMinutes(this.currentTimeRange);
        this.allLogs = dataGenerator.generateAllLogs(50, timeRangeMinutes);
        queryParser.setData(this.allLogs);

        if (this.currentView === 'dashboard') {
            this.updateDashboard();
        } else if (this.currentView === 'customDashboard') {
            dashboardBuilder.refreshPanels();
        }
    }

    updateDashboard() {
        // Calculate metrics
        const totalEvents = this.allLogs.length;
        const errorEvents = this.allLogs.filter(e =>
            e.level === 'ERROR' || (e.status && e.status >= 500) || e.severity === 'err' || e.severity === 'crit'
        );
        const warningEvents = this.allLogs.filter(e =>
            e.level === 'WARN' || e.severity === 'warning' || (e.status && e.status >= 400 && e.status < 500)
        );
        const securityEvents = this.allLogs.filter(e => e.source === 'security');

        // Update metrics
        document.getElementById('totalEvents').textContent = totalEvents.toLocaleString();
        document.getElementById('errorCount').textContent = errorEvents.length.toLocaleString();
        document.getElementById('warningCount').textContent = warningEvents.length.toLocaleString();
        document.getElementById('securityEvents').textContent = securityEvents.length.toLocaleString();

        // Update charts
        visualizations.createTimeSeriesChart('timeSeriesChart', this.allLogs);
        this.createSourceChart();
        this.createStatusChart();
        this.createEndpointChart();

        // Update recent events
        this.displayRecentEvents();
    }

    createSourceChart() {
        const counts = {};
        this.allLogs.forEach(log => {
            const source = log.source || 'unknown';
            counts[source] = (counts[source] || 0) + 1;
        });

        visualizations.destroyChart('sourceChart');
        const ctx = document.getElementById('sourceChart');
        if (!ctx) return;

        const labels = Object.keys(counts);
        const data = Object.values(counts);
        const colors = visualizations.getColorsForLabels(labels);

        visualizations.charts['sourceChart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    createStatusChart() {
        const statusLogs = this.allLogs.filter(log => log.status);
        const counts = {};
        statusLogs.forEach(log => {
            const status = log.status;
            counts[status] = (counts[status] || 0) + 1;
        });

        visualizations.destroyChart('statusChart');
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        const labels = Object.keys(counts).sort();
        const data = labels.map(l => counts[l]);
        const colors = visualizations.getColorsForLabels(labels);

        visualizations.charts['statusChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'リクエスト数',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    createEndpointChart() {
        const endpointLogs = this.allLogs.filter(log => log.uri || log.path || log.endpoint);
        const counts = {};
        endpointLogs.forEach(log => {
            const endpoint = log.uri || log.path || log.endpoint;
            counts[endpoint] = (counts[endpoint] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

        visualizations.destroyChart('endpointChart');
        const ctx = document.getElementById('endpointChart');
        if (!ctx) return;

        const labels = sorted.map(s => s[0]);
        const data = sorted.map(s => s[1]);

        visualizations.charts['endpointChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'アクセス数',
                    data: data,
                    backgroundColor: visualizations.chartColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    displayRecentEvents() {
        const container = document.getElementById('recentEvents');
        const recentLogs = this.allLogs.slice(0, 15);

        if (recentLogs.length === 0) {
            container.innerHTML = '<div class="no-results">イベントがありません</div>';
            return;
        }

        let html = '';
        recentLogs.forEach(log => {
            const time = new Date(log._time).toLocaleString('ja-JP');
            const level = log.level || log.severity || `Status ${log.status}` || 'INFO';
            const message = log.message || log._raw || '';
            const source = log.source || 'unknown';

            html += `
                <div class="event-row">
                    <div class="event-time">${time}</div>
                    <div class="event-level ${log.level || 'INFO'}">${this.escapeHtml(level)}</div>
                    <div class="event-source" style="color: #667eea; font-weight: 600;">${this.escapeHtml(source)}</div>
                    <div class="event-message">${this.escapeHtml(message.substring(0, 150))}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    executeSearch() {
        const query = document.getElementById('queryInput').value.trim();

        if (!query) {
            this.showSearchResults([], 'クエリを入力してください');
            return;
        }

        const result = queryParser.executeQuery(query);

        if (result.success) {
            this.showSearchResults(result.results);
        } else {
            this.showSearchResults([], `エラー: ${result.error}`);
        }
    }

    showSearchResults(results, message = null) {
        const container = document.getElementById('resultsContainer');
        const countSpan = document.getElementById('resultCount');

        if (message) {
            container.innerHTML = `<div class="no-results">${message}</div>`;
            countSpan.textContent = '';
            return;
        }

        countSpan.textContent = `(${results.length}件)`;

        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">結果が見つかりませんでした</div>';
            return;
        }

        // Store results for view switching
        this.currentSearchResults = results;

        // Show table view by default
        this.switchSearchView('table');
    }

    switchSearchView(viewType) {
        // Update buttons
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${viewType}ViewBtn`).classList.add('active');

        const resultsContainer = document.getElementById('resultsContainer');
        const chartContainer = document.getElementById('chartContainer');

        if (!this.currentSearchResults || this.currentSearchResults.length === 0) {
            return;
        }

        // Hide chart container by default
        chartContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        if (viewType === 'table') {
            this.showTableView();
        } else if (viewType === 'raw') {
            this.showRawView();
        } else if (viewType === 'chart') {
            this.showChartView();
        }
    }

    showTableView() {
        const results = this.currentSearchResults;
        const container = document.getElementById('resultsContainer');

        // Get all unique fields
        const fields = new Set();
        results.forEach(r => Object.keys(r).forEach(k => {
            if (!k.startsWith('_') || k === '_time') {
                fields.add(k);
            }
        }));

        const fieldArray = Array.from(fields);

        let html = '<div class="results-table"><table>';

        // Header
        html += '<tr>';
        fieldArray.forEach(field => {
            html += `<th>${this.escapeHtml(field)}</th>`;
        });
        html += '</tr>';

        // Rows
        results.slice(0, 100).forEach(result => {
            html += '<tr>';
            fieldArray.forEach(field => {
                const value = result[field] !== undefined ? result[field] : '';
                const displayValue = field === '_time' ?
                    new Date(value).toLocaleString('ja-JP') :
                    String(value);
                html += `<td>${this.escapeHtml(displayValue)}</td>`;
            });
            html += '</tr>';
        });

        html += '</table></div>';

        if (results.length > 100) {
            html += `<p style="text-align: center; color: #999; margin-top: 15px;">最初の100件を表示（全${results.length}件）</p>`;
        }

        container.innerHTML = html;
    }

    showRawView() {
        const results = this.currentSearchResults;
        const container = document.getElementById('resultsContainer');

        let html = '<div class="raw-results">';

        results.slice(0, 100).forEach(result => {
            html += '<div class="raw-event">';
            html += `<div style="color: #6a9fb5;">${new Date(result._time).toISOString()}</div>`;

            Object.keys(result).forEach(key => {
                if (!key.startsWith('_')) {
                    html += `<div><span style="color: #9cdcfe;">${this.escapeHtml(key)}</span>=<span style="color: #ce9178;">${this.escapeHtml(String(result[key]))}</span></div>`;
                }
            });

            html += '</div>';
        });

        html += '</div>';

        if (results.length > 100) {
            html += `<p style="text-align: center; color: #999; margin-top: 15px;">最初の100件を表示（全${results.length}件）</p>`;
        }

        container.innerHTML = html;
    }

    showChartView() {
        const results = this.currentSearchResults;
        const chartContainer = document.getElementById('chartContainer');
        const resultsContainer = document.getElementById('resultsContainer');

        resultsContainer.style.display = 'none';
        chartContainer.style.display = 'block';

        // Determine chart type based on data
        if (results.length > 0 && typeof results[0] === 'object') {
            const fields = Object.keys(results[0]);
            const hasNumericField = fields.some(f => !isNaN(results[0][f]));

            if (hasNumericField) {
                visualizations.createBarChart('searchChart', results);
            } else {
                visualizations.createTimeSeriesChart('searchChart', results);
            }
        }
    }

    // Custom Dashboard Modal
    showPanelModal() {
        document.getElementById('panelModal').style.display = 'flex';
        document.getElementById('panelTitle').value = '';
        document.getElementById('panelQuery').value = '';
        document.getElementById('panelVizType').value = 'metric';
    }

    hidePanelModal() {
        document.getElementById('panelModal').style.display = 'none';
    }

    createPanel() {
        const title = document.getElementById('panelTitle').value.trim();
        const query = document.getElementById('panelQuery').value.trim();
        const vizType = document.getElementById('panelVizType').value;

        if (!title || !query) {
            alert('タイトルとクエリを入力してください');
            return;
        }

        dashboardBuilder.addPanel(title, query, vizType);
        this.hidePanelModal();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.splunkSimulator = new SplunkSimulator();
});
