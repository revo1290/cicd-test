// Visualization functions using Chart.js

class Visualizations {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: 'rgba(102, 126, 234, 0.8)',
            success: 'rgba(76, 175, 80, 0.8)',
            warning: 'rgba(255, 152, 0, 0.8)',
            error: 'rgba(244, 67, 54, 0.8)',
            info: 'rgba(33, 150, 243, 0.8)',
            purple: 'rgba(118, 75, 162, 0.8)'
        };
    }

    // Destroy existing chart
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    // Create time series chart
    createTimeSeriesChart(canvasId, data) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Group data by time intervals (e.g., per 5 minutes)
        const timeGroups = this.groupByTimeInterval(data, 5); // 5 minutes

        const labels = Object.keys(timeGroups).sort();
        const values = labels.map(label => timeGroups[label].length);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(l => this.formatTime(l)),
                datasets: [{
                    label: 'イベント数',
                    data: values,
                    borderColor: this.chartColors.primary,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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

    // Create log level pie chart
    createLogLevelChart(canvasId, data) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Count by level or status
        const counts = {};
        data.forEach(event => {
            const key = event.level || event.status || 'Unknown';
            counts[key] = (counts[key] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const values = Object.values(counts);
        const colors = this.getColorsForLabels(labels);

        this.charts[canvasId] = new Chart(ctx, {
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

    // Create bar chart from aggregated data
    createBarChart(canvasId, data) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (!data || data.length === 0) {
            return;
        }

        // Get first non-numeric field as label, first numeric field as value
        const fields = Object.keys(data[0]);
        const labelField = fields.find(f => isNaN(data[0][f])) || fields[0];
        const valueField = fields.find(f => !isNaN(data[0][f]) && f !== labelField) || fields[1];

        const labels = data.map(item => String(item[labelField]));
        const values = data.map(item => Number(item[valueField]) || 0);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: valueField,
                    data: values,
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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

    // Create line chart for stats over time
    createStatsLineChart(canvasId, data) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (!data || data.length === 0) {
            return;
        }

        // Assume first field is label (x-axis), others are values (y-axis)
        const fields = Object.keys(data[0]);
        const labelField = fields[0];
        const valueFields = fields.slice(1);

        const labels = data.map(item => String(item[labelField]));
        const datasets = valueFields.map((field, index) => {
            const colors = Object.values(this.chartColors);
            return {
                label: field,
                data: data.map(item => Number(item[field]) || 0),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace('0.8', '0.1'),
                tension: 0.4,
                fill: true
            };
        });

        this.charts[canvasId] = new Chart(ctx, {
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
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Helper: Group data by time interval (in minutes)
    groupByTimeInterval(data, intervalMinutes) {
        const groups = {};

        data.forEach(event => {
            const timestamp = new Date(event._time);
            const roundedTime = new Date(
                Math.floor(timestamp.getTime() / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000)
            );

            const key = roundedTime.toISOString();
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(event);
        });

        return groups;
    }

    // Helper: Format time for display
    formatTime(isoString) {
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Helper: Get colors for labels
    getColorsForLabels(labels) {
        const colorMap = {
            'INFO': this.chartColors.info,
            'WARN': this.chartColors.warning,
            'WARNING': this.chartColors.warning,
            'ERROR': this.chartColors.error,
            '200': this.chartColors.success,
            '201': this.chartColors.success,
            '204': this.chartColors.success,
            '301': this.chartColors.info,
            '302': this.chartColors.info,
            '400': this.chartColors.warning,
            '401': this.chartColors.warning,
            '403': this.chartColors.warning,
            '404': this.chartColors.warning,
            '500': this.chartColors.error,
            '502': this.chartColors.error,
            '503': this.chartColors.error
        };

        const defaultColors = Object.values(this.chartColors);
        return labels.map((label, index) => {
            return colorMap[label] || defaultColors[index % defaultColors.length];
        });
    }
}

// Create global instance
const visualizations = new Visualizations();
