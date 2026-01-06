// Source Filter Manager

class SourceFilterManager {
    constructor() {
        this.selectedSources = new Set();
        this.availableSources = [
            { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', color: '#326CE5' },
            { id: 'docker', name: 'Docker', icon: '🐳', color: '#2496ED' },
            { id: 'aws:cloudwatch', name: 'AWS CloudWatch', icon: '☁️', color: '#FF9900' },
            { id: 'azure:monitor', name: 'Azure Monitor', icon: '⛅', color: '#0078D4' },
            { id: 'windows:event', name: 'Windows Event', icon: '🪟', color: '#0078D6' },
            { id: 'firewall', name: 'Firewall', icon: '🔥', color: '#DC143C' },
            { id: 'load_balancer', name: 'Load Balancer', icon: '⚖️', color: '#4CAF50' },
            { id: 'redis', name: 'Redis', icon: '🔴', color: '#DC382D' },
            { id: 'mongodb', name: 'MongoDB', icon: '🍃', color: '#47A248' },
            { id: 'elasticsearch', name: 'Elasticsearch', icon: '🔍', color: '#005571' },
            { id: 'kafka', name: 'Kafka', icon: '📨', color: '#231F20' },
            { id: 'prometheus', name: 'Prometheus', icon: '📊', color: '#E6522C' },
            { id: 'nginx', name: 'Nginx', icon: '🌐', color: '#009639' },
            { id: 'apache', name: 'Apache', icon: '🪶', color: '#D22128' },
            { id: 'application', name: 'Application', icon: '💻', color: '#667EEA' }
        ];
    }

    // Toggle source selection
    toggleSource(sourceId) {
        if (this.selectedSources.has(sourceId)) {
            this.selectedSources.delete(sourceId);
        } else {
            this.selectedSources.add(sourceId);
        }
        this.persist();
    }

    // Select all sources
    selectAll() {
        this.availableSources.forEach(source => {
            this.selectedSources.add(source.id);
        });
        this.persist();
    }

    // Deselect all sources
    deselectAll() {
        this.selectedSources.clear();
        this.persist();
    }

    // Check if source is selected
    isSelected(sourceId) {
        // If nothing is selected, show all
        if (this.selectedSources.size === 0) return true;
        return this.selectedSources.has(sourceId);
    }

    // Get selected sources
    getSelectedSources() {
        return Array.from(this.selectedSources);
    }

    // Get available sources
    getAvailableSources() {
        return this.availableSources;
    }

    // Filter logs by selected sources
    filterLogs(logs) {
        if (this.selectedSources.size === 0) return logs;

        return logs.filter(log => this.isSelected(log.source));
    }

    // Get source counts
    getSourceCounts(logs) {
        const counts = {};
        this.availableSources.forEach(source => {
            counts[source.id] = 0;
        });

        logs.forEach(log => {
            if (counts[log.source] !== undefined) {
                counts[log.source]++;
            }
        });

        return counts;
    }

    // Persistence
    persist() {
        localStorage.setItem('splunk_selected_sources', JSON.stringify(Array.from(this.selectedSources)));
    }

    load() {
        const stored = localStorage.getItem('splunk_selected_sources');
        if (stored) {
            this.selectedSources = new Set(JSON.parse(stored));
        }
    }
}

// Create global instance
const sourceFilterManager = new SourceFilterManager();
// Load saved selections
sourceFilterManager.load();
