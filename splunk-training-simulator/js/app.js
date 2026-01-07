// Main application logic for Splunk Training Simulator - Enterprise Edition

class SplunkSimulator {
    constructor() {
        this.currentView = 'dashboard';
        this.allLogs = [];
        this.currentTimeRange = '1h';
        this.currentSearchResults = [];
        this.searchHistory = this.loadSearchHistory();

        // Initialize managers with error handling
        try {
            this.sourceFilterManager = new SourceFilterManager();
            this.savedSearchManager = new SavedSearchManager();
        } catch (error) {
            console.error('Error initializing managers:', error);
            // Fallback to basic initialization
            this.sourceFilterManager = {
                availableSources: [],
                filterLogs: (logs) => logs,
                toggleAllSources: () => {},
                selectSource: () => {},
                deselectSource: () => {}
            };
            this.savedSearchManager = {
                getAllSearches: () => [],
                saveSearch: () => {},
                getSearch: () => null,
                deleteSearch: () => {},
                incrementRunCount: () => {}
            };
        }

        this.init();
    }

    init() {
        // Generate initial data
        this.refreshData();

        // Setup sidebar
        this.setupSourceFilters();
        this.setupSavedSearches();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize dashboard
        this.updateDashboard();
        this.updateSidebarStats();
    }

    setupEventListeners() {
        try {
            // Sidebar toggle (for mobile)
            const sidebarToggleOpen = document.getElementById('sidebarToggleOpen');
            const sidebarToggleClose = document.getElementById('sidebarToggleClose');
            const sidebar = document.getElementById('sidebar');

            if (sidebarToggleOpen && sidebar) {
                sidebarToggleOpen.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sidebar.classList.add('open');
                });
            }

            if (sidebarToggleClose && sidebar) {
                sidebarToggleClose.addEventListener('click', () => {
                    sidebar.classList.remove('open');
                });
            }

            // Close sidebar when clicking outside (mobile)
            if (sidebar) {
                document.addEventListener('click', (e) => {
                    if (window.innerWidth <= 1024 &&
                        sidebar.classList.contains('open') &&
                        !sidebar.contains(e.target) &&
                        (!sidebarToggleOpen || !sidebarToggleOpen.contains(e.target))) {
                        sidebar.classList.remove('open');
                    }
                });
            }

            // Navigation - with error handling
            const dashboardBtn = document.getElementById('dashboardBtn');
            const searchBtn = document.getElementById('searchBtn');
            const customDashboardBtn = document.getElementById('customDashboardBtn');
            const tutorialBtn = document.getElementById('tutorialBtn');

            if (dashboardBtn) {
                dashboardBtn.addEventListener('click', () => {
                    console.log('Dashboard button clicked');
                    this.switchView('dashboard');
                });
            }

            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    console.log('Search button clicked');
                    this.switchView('search');
                });
            }

            if (customDashboardBtn) {
                customDashboardBtn.addEventListener('click', () => {
                    console.log('Custom dashboard button clicked');
                    this.switchView('customDashboard');
                });
            }

            if (tutorialBtn) {
                tutorialBtn.addEventListener('click', () => {
                    console.log('Tutorial button clicked');
                    this.switchView('tutorial');
                });
            }

        // Time range and refresh
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.currentTimeRange = e.target.value;
            this.refreshData();
        });

        // Source filter toggle all
        document.getElementById('filterToggleAll').addEventListener('click', () => {
            this.sourceFilterManager.toggleAllSources();
            this.applySourceFilter();
        });

        // Search
        document.getElementById('searchButton').addEventListener('click', () => this.executeSearch());
        document.getElementById('queryInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeSearch();
            }
        });

        // Search history
        document.getElementById('searchHistoryBtn').addEventListener('click', () => {
            this.toggleSearchHistory();
        });
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearSearchHistory();
        });

        // Save search button
        document.getElementById('saveSearchBtn').addEventListener('click', () => {
            const query = document.getElementById('queryInput').value.trim();
            if (query) {
                this.showSaveSearchModal(query);
            }
        });

        // Search view switcher
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchSearchView('table'));
        document.getElementById('rawViewBtn').addEventListener('click', () => this.switchSearchView('raw'));
        document.getElementById('chartViewBtn').addEventListener('click', () => this.switchSearchView('chart'));

        // Export dropdown
        document.getElementById('exportBtn').addEventListener('click', () => {
            document.getElementById('exportMenu').style.display =
                document.getElementById('exportMenu').style.display === 'none' ? 'block' : 'none';
        });
        document.getElementById('exportCSV').addEventListener('click', () => this.exportResults('csv'));
        document.getElementById('exportJSON').addEventListener('click', () => this.exportResults('json'));
        document.getElementById('exportRaw').addEventListener('click', () => this.exportResults('raw'));

        // Close export menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-dropdown')) {
                document.getElementById('exportMenu').style.display = 'none';
            }
        });

        // Example queries
        document.querySelectorAll('.example-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                document.getElementById('queryInput').value = query;
                this.switchView('search');
                this.executeSearch();
            });
        });

        // Tutorial buttons
        document.querySelectorAll('.try-btn, .solution-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                document.getElementById('queryInput').value = query;
                this.switchView('search');
                this.executeSearch();
            });
        });

        // Custom Dashboard
        document.getElementById('addPanelBtn').addEventListener('click', () => this.showAddPanelModal());

        // Modal close buttons
        document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                if (modalId) {
                    document.getElementById(modalId).style.display = 'none';
                }
            });
        });

        // Modal overlay clicks
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.parentElement.style.display = 'none';
                }
            });
        });

        // Save search modal confirm
        document.getElementById('confirmSaveSearch').addEventListener('click', () => {
            this.saveSearchFromModal();
        });

        // Create panel button
        document.getElementById('createPanelBtn').addEventListener('click', () => {
            this.createPanel();
        });

        } catch (error) {
            console.error('Error setting up event listeners:', error);
            alert('一部の機能の初期化に失敗しました。ページを再読み込みしてください。');
        }
    }

    setupSourceFilters() {
        const container = document.getElementById('sourceFilters');
        const sources = this.sourceFilterManager.availableSources;

        let html = '';
        sources.forEach(source => {
            html += `
                <div class="source-filter-item">
                    <input type="checkbox" id="filter-${source.id}" value="${source.id}" checked>
                    <span class="source-icon">${source.icon}</span>
                    <span class="source-name">${source.name}</span>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add event listeners
        sources.forEach(source => {
            document.getElementById(`filter-${source.id}`).addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.sourceFilterManager.selectSource(source.id);
                } else {
                    this.sourceFilterManager.deselectSource(source.id);
                }
                this.applySourceFilter();
            });
        });
    }

    setupSavedSearches() {
        this.renderSavedSearches();
    }

    renderSavedSearches() {
        const container = document.getElementById('savedSearchesList');
        const searches = this.savedSearchManager.getAllSearches();

        if (searches.length === 0) {
            container.innerHTML = '<p class="empty-message">保存された検索がありません</p>';
            return;
        }

        let html = '';
        searches.forEach(search => {
            html += `
                <div class="saved-search-item" data-id="${search.id}">
                    <div class="saved-search-name">${this.escapeHtml(search.name)}</div>
                    <div class="saved-search-query">${this.escapeHtml(search.query)}</div>
                    <div class="saved-search-actions">
                        <button onclick="splunkSimulator.runSavedSearch(${search.id})">実行</button>
                        <button onclick="splunkSimulator.deleteSavedSearch(${search.id})">削除</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    runSavedSearch(searchId) {
        const search = this.savedSearchManager.getSearch(searchId);
        if (search) {
            document.getElementById('queryInput').value = search.query;
            this.switchView('search');
            this.executeSearch();
            this.savedSearchManager.incrementRunCount(searchId);
        }
    }

    deleteSavedSearch(searchId) {
        if (confirm('この検索を削除しますか？')) {
            this.savedSearchManager.deleteSearch(searchId);
            this.renderSavedSearches();
        }
    }

    applySourceFilter() {
        // Re-filter current logs
        const timeRangeMinutes = dataGenerator.getTimeRangeMinutes(this.currentTimeRange);
        const allLogs = dataGenerator.generateAllLogs(30, timeRangeMinutes);
        this.allLogs = this.sourceFilterManager.filterLogs(allLogs);

        queryParser.setData(this.allLogs);

        // Update current view
        if (this.currentView === 'dashboard') {
            this.updateDashboard();
        }
        this.updateSidebarStats();
    }

    updateSidebarStats() {
        const totalLogs = this.allLogs.length;
        const errorLogs = this.allLogs.filter(log =>
            log.level === 'ERROR' || (log.status && log.status >= 500)
        ).length;

        document.getElementById('sidebarTotalLogs').textContent = totalLogs.toLocaleString();
        document.getElementById('sidebarErrors').textContent = errorLogs.toLocaleString();
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}Btn`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');

        this.currentView = view;

        // Refresh view-specific data
        if (view === 'dashboard') {
            this.updateDashboard();
        } else if (view === 'customDashboard') {
            if (window.dashboardBuilder) {
                dashboardBuilder.refreshPanels();
            }
        }
    }

    refreshData() {
        const timeRangeMinutes = dataGenerator.getTimeRangeMinutes(this.currentTimeRange);
        const allLogs = dataGenerator.generateAllLogs(30, timeRangeMinutes);
        this.allLogs = this.sourceFilterManager.filterLogs(allLogs);

        queryParser.setData(this.allLogs);

        if (this.currentView === 'dashboard') {
            this.updateDashboard();
        } else if (this.currentView === 'customDashboard' && window.dashboardBuilder) {
            dashboardBuilder.refreshPanels();
        }

        this.updateSidebarStats();
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
        const securityEvents = this.allLogs.filter(e => e.source === 'firewall' || e.source === 'windows:event');

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
        const recentLogs = this.allLogs.slice(0, 10);

        if (recentLogs.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>イベントがありません</p></div>';
            return;
        }

        let html = '';
        recentLogs.forEach(log => {
            const time = new Date(log._time).toLocaleString('ja-JP');
            const level = log.level || log.severity || 'INFO';
            const message = log.message || log._raw || '';

            html += `
                <div class="event-item ${level}">
                    <strong>${time}</strong> [${this.escapeHtml(log.source)}] ${this.escapeHtml(message.substring(0, 100))}
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

        // Add to history
        this.addToSearchHistory(query);

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
            container.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
            countSpan.textContent = '';
            return;
        }

        countSpan.textContent = `(${results.length}件)`;

        if (results.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>結果が見つかりませんでした</p></div>';
            return;
        }

        // Store results
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
            html += `<div style="color: #60a5fa;">${new Date(result._time).toISOString()}</div>`;

            Object.keys(result).forEach(key => {
                if (!key.startsWith('_')) {
                    html += `<div><span style="color: #93c5fd;">${this.escapeHtml(key)}</span>=<span style="color: #fbbf24;">${this.escapeHtml(String(result[key]))}</span></div>`;
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

    // Export functionality
    exportResults(format) {
        if (!this.currentSearchResults || this.currentSearchResults.length === 0) {
            alert('エクスポートする結果がありません');
            return;
        }

        let content, filename, mimeType;

        if (format === 'csv') {
            content = this.convertToCSV(this.currentSearchResults);
            filename = `splunk_export_${Date.now()}.csv`;
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify(this.currentSearchResults, null, 2);
            filename = `splunk_export_${Date.now()}.json`;
            mimeType = 'application/json';
        } else if (format === 'raw') {
            content = this.currentSearchResults.map(r => r._raw || JSON.stringify(r)).join('\n');
            filename = `splunk_export_${Date.now()}.txt`;
            mimeType = 'text/plain';
        }

        this.downloadFile(content, filename, mimeType);
        document.getElementById('exportMenu').style.display = 'none';
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Add header
        csvRows.push(headers.join(','));

        // Add data
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] !== undefined ? String(row[header]) : '';
                return `"${value.replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Search history
    loadSearchHistory() {
        const history = localStorage.getItem('splunk_search_history');
        return history ? JSON.parse(history) : [];
    }

    saveSearchHistory() {
        localStorage.setItem('splunk_search_history', JSON.stringify(this.searchHistory));
    }

    addToSearchHistory(query) {
        // Remove duplicates
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        // Add to beginning
        this.searchHistory.unshift(query);
        // Keep only last 20
        this.searchHistory = this.searchHistory.slice(0, 20);
        this.saveSearchHistory();
    }

    toggleSearchHistory() {
        const dropdown = document.getElementById('searchHistoryDropdown');
        const isVisible = dropdown.style.display !== 'none';

        if (isVisible) {
            dropdown.style.display = 'none';
        } else {
            this.renderSearchHistory();
            dropdown.style.display = 'block';
        }
    }

    renderSearchHistory() {
        const container = document.getElementById('searchHistoryList');

        if (this.searchHistory.length === 0) {
            container.innerHTML = '<div class="dropdown-item" style="text-align: center; color: #999;">履歴がありません</div>';
            return;
        }

        let html = '';
        this.searchHistory.forEach(query => {
            html += `<div class="dropdown-item" onclick="splunkSimulator.useHistoryQuery('${this.escapeHtml(query).replace(/'/g, '&#39;')}')">${this.escapeHtml(query)}</div>`;
        });

        container.innerHTML = html;
    }

    useHistoryQuery(query) {
        document.getElementById('queryInput').value = query;
        document.getElementById('searchHistoryDropdown').style.display = 'none';
        this.executeSearch();
    }

    clearSearchHistory() {
        if (confirm('検索履歴を削除しますか？')) {
            this.searchHistory = [];
            this.saveSearchHistory();
            document.getElementById('searchHistoryDropdown').style.display = 'none';
        }
    }

    // Save search modal
    showSaveSearchModal(query) {
        document.getElementById('saveSearchModal').style.display = 'flex';
        document.getElementById('saveSearchQuery').textContent = query;
        document.getElementById('saveSearchName').value = '';
        document.getElementById('saveSearchDesc').value = '';
        document.getElementById('saveSearchName').focus();
    }

    saveSearchFromModal() {
        const name = document.getElementById('saveSearchName').value.trim();
        const description = document.getElementById('saveSearchDesc').value.trim();
        const query = document.getElementById('saveSearchQuery').textContent;

        if (!name) {
            alert('名前を入力してください');
            return;
        }

        this.savedSearchManager.saveSearch(name, query, description);
        this.renderSavedSearches();
        document.getElementById('saveSearchModal').style.display = 'none';
    }

    // Custom dashboard
    showAddPanelModal() {
        document.getElementById('panelModal').style.display = 'flex';
        document.getElementById('panelTitle').value = '';
        document.getElementById('panelQuery').value = '';
        document.getElementById('panelVizType').value = 'metric';
    }

    createPanel() {
        const title = document.getElementById('panelTitle').value.trim();
        const query = document.getElementById('panelQuery').value.trim();
        const vizType = document.getElementById('panelVizType').value;

        if (!title || !query) {
            alert('タイトルとクエリを入力してください');
            return;
        }

        if (window.dashboardBuilder) {
            dashboardBuilder.addPanel(title, query, vizType);
        }

        document.getElementById('panelModal').style.display = 'none';
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
