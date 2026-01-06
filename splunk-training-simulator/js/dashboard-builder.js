// Custom Dashboard Builder

class DashboardBuilder {
    constructor() {
        this.panels = [];
        this.nextPanelId = 1;
        this.init();
    }

    init() {
        // Load saved dashboard from localStorage
        const savedPanels = localStorage.getItem('customDashboardPanels');
        if (savedPanels) {
            this.panels = JSON.parse(savedPanels);
            this.nextPanelId = this.panels.length > 0 ? Math.max(...this.panels.map(p => p.id)) + 1 : 1;
            this.renderPanels();
        }
    }

    addPanel(title, query, vizType) {
        const panel = {
            id: this.nextPanelId++,
            title: title,
            query: query,
            vizType: vizType
        };

        this.panels.push(panel);
        this.savePanels();
        this.renderPanels();
        return panel;
    }

    removePanel(panelId) {
        this.panels = this.panels.filter(p => p.id !== panelId);
        this.savePanels();
        this.renderPanels();
    }

    savePanels() {
        localStorage.setItem('customDashboardPanels', JSON.stringify(this.panels));
    }

    renderPanels() {
        const container = document.getElementById('customDashboardPanels');

        if (this.panels.length === 0) {
            container.innerHTML = `
                <div class="empty-dashboard">
                    <p>「+ パネルを追加」をクリックして、独自のダッシュボードを作成しましょう</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        this.panels.forEach(panel => {
            const panelEl = document.createElement('div');
            panelEl.className = 'custom-panel';
            panelEl.innerHTML = `
                <div class="panel-header">
                    <h3>${this.escapeHtml(panel.title)}</h3>
                    <button class="remove-panel-btn" data-panel-id="${panel.id}">×</button>
                </div>
                <div class="panel-body" id="panel-${panel.id}">
                    <div class="panel-loading">データを読み込み中...</div>
                </div>
            `;
            container.appendChild(panelEl);

            // Add remove event listener
            panelEl.querySelector('.remove-panel-btn').addEventListener('click', (e) => {
                const panelId = parseInt(e.target.getAttribute('data-panel-id'));
                if (confirm('このパネルを削除しますか？')) {
                    this.removePanel(panelId);
                }
            });

            // Execute query and render result
            this.renderPanelContent(panel);
        });
    }

    renderPanelContent(panel) {
        const panelBody = document.getElementById(`panel-${panel.id}`);

        // Execute query
        const result = queryParser.executeQuery(panel.query);

        if (!result.success) {
            panelBody.innerHTML = `<div class="panel-error">エラー: ${this.escapeHtml(result.error)}</div>`;
            return;
        }

        if (result.results.length === 0) {
            panelBody.innerHTML = `<div class="panel-no-data">データがありません</div>`;
            return;
        }

        // Render based on visualization type
        panelBody.innerHTML = '';

        switch (panel.vizType) {
            case 'metric':
                this.renderMetric(panelBody, result.results);
                break;
            case 'table':
                this.renderTable(panelBody, result.results);
                break;
            case 'bar':
                this.renderBarChart(panelBody, result.results, panel.id);
                break;
            case 'line':
                this.renderLineChart(panelBody, result.results, panel.id);
                break;
            case 'pie':
                this.renderPieChart(panelBody, result.results, panel.id);
                break;
        }
    }

    renderMetric(container, data) {
        let value = 0;

        if (data.length > 0) {
            const firstResult = data[0];
            const keys = Object.keys(firstResult);
            const numericKey = keys.find(k => !isNaN(firstResult[k])) || keys[0];
            value = firstResult[numericKey] || data.length;
        } else {
            value = data.length;
        }

        container.innerHTML = `<div class="panel-metric">${value.toLocaleString()}</div>`;
    }

    renderTable(container, data) {
        if (data.length === 0) return;

        const fields = Object.keys(data[0]).filter(k => !k.startsWith('_'));

        let html = '<div class="panel-table"><table>';
        html += '<thead><tr>';
        fields.forEach(field => {
            html += `<th>${this.escapeHtml(field)}</th>`;
        });
        html += '</tr></thead><tbody>';

        data.slice(0, 10).forEach(row => {
            html += '<tr>';
            fields.forEach(field => {
                const value = row[field] !== undefined ? row[field] : '';
                html += `<td>${this.escapeHtml(String(value))}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';

        if (data.length > 10) {
            html += `<div class="panel-note">最初の10件を表示（全${data.length}件）</div>`;
        }

        container.innerHTML = html;
    }

    renderBarChart(container, data, panelId) {
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${panelId}`;
        container.appendChild(canvas);

        const fields = Object.keys(data[0]);
        const labelField = fields.find(f => isNaN(data[0][f])) || fields[0];
        const valueField = fields.find(f => !isNaN(data[0][f]) && f !== labelField) || fields[1];

        const labels = data.map(item => String(item[labelField]));
        const values = data.map(item => Number(item[valueField]) || 0);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: valueField,
                    data: values,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
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
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderLineChart(container, data, panelId) {
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${panelId}`;
        container.appendChild(canvas);

        const fields = Object.keys(data[0]);
        const labelField = fields[0];
        const valueFields = fields.slice(1);

        const labels = data.map(item => String(item[labelField]));
        const datasets = valueFields.map((field, index) => {
            const colors = [
                'rgba(102, 126, 234, 0.8)',
                'rgba(76, 175, 80, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(244, 67, 54, 0.8)'
            ];
            return {
                label: field,
                data: data.map(item => Number(item[field]) || 0),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace('0.8', '0.1'),
                tension: 0.4,
                fill: true
            };
        });

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    renderPieChart(container, data, panelId) {
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${panelId}`;
        container.appendChild(canvas);

        const fields = Object.keys(data[0]);
        const labelField = fields.find(f => isNaN(data[0][f])) || fields[0];
        const valueField = fields.find(f => !isNaN(data[0][f]) && f !== labelField) || fields[1];

        const labels = data.map(item => String(item[labelField]));
        const values = data.map(item => Number(item[valueField]) || 0);

        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(244, 67, 54, 0.8)',
            'rgba(33, 150, 243, 0.8)',
            'rgba(118, 75, 162, 0.8)'
        ];

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
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

    refreshPanels() {
        this.panels.forEach(panel => {
            this.renderPanelContent(panel);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
const dashboardBuilder = new DashboardBuilder();
