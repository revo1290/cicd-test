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
        }
    }

    refreshData() {
        const timeRangeMinutes = dataGenerator.getTimeRangeMinutes(this.currentTimeRange);
        this.allLogs = dataGenerator.generateAllLogs(300, 200, timeRangeMinutes);
        queryParser.setData(this.allLogs);

        if (this.currentView === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        // Calculate metrics
        const totalEvents = this.allLogs.length;
        const errorEvents = this.allLogs.filter(e =>
            e.level === 'ERROR' || (e.status && e.status >= 500)
        );
        const warningEvents = this.allLogs.filter(e =>
            e.level === 'WARN' || (e.status && e.status >= 400 && e.status < 500)
        );
        const uniqueUsers = new Set(this.allLogs.filter(e => e.user).map(e => e.user));

        // Update metrics
        document.getElementById('totalEvents').textContent = totalEvents.toLocaleString();
        document.getElementById('errorCount').textContent = errorEvents.length.toLocaleString();
        document.getElementById('warningCount').textContent = warningEvents.length.toLocaleString();
        document.getElementById('activeUsers').textContent = uniqueUsers.size.toLocaleString();

        // Update charts
        visualizations.createTimeSeriesChart('timeSeriesChart', this.allLogs);
        visualizations.createLogLevelChart('levelChart', this.allLogs);

        // Update recent events
        this.displayRecentEvents();
    }

    displayRecentEvents() {
        const container = document.getElementById('recentEvents');
        const recentLogs = this.allLogs.slice(0, 10);

        if (recentLogs.length === 0) {
            container.innerHTML = '<div class="no-results">イベントがありません</div>';
            return;
        }

        let html = '';
        recentLogs.forEach(log => {
            const time = new Date(log._time).toLocaleString('ja-JP');
            const level = log.level || `HTTP ${log.status}`;
            const message = log.message || log._raw;

            html += `
                <div class="event-row">
                    <div class="event-time">${time}</div>
                    <div class="event-level ${log.level || 'INFO'}">${level}</div>
                    <div class="event-message">${this.escapeHtml(message)}</div>
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
