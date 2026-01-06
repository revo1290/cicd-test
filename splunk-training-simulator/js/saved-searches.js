// Saved Searches and Search History Manager

class SavedSearchManager {
    constructor() {
        this.savedSearches = this.loadSavedSearches();
        this.searchHistory = this.loadSearchHistory();
    }

    // Save a search
    saveSearch(name, query, description = '') {
        const search = {
            id: Date.now(),
            name: name,
            query: query,
            description: description,
            createdAt: new Date().toISOString(),
            lastRun: null,
            runCount: 0
        };

        this.savedSearches.push(search);
        this.persistSavedSearches();
        return search;
    }

    // Get all saved searches
    getSavedSearches() {
        return this.savedSearches;
    }

    // Delete a saved search
    deleteSearch(searchId) {
        this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
        this.persistSavedSearches();
    }

    // Update last run info
    updateSearchRun(searchId) {
        const search = this.savedSearches.find(s => s.id === searchId);
        if (search) {
            search.lastRun = new Date().toISOString();
            search.runCount++;
            this.persistSavedSearches();
        }
    }

    // Add to search history
    addToHistory(query) {
        if (!query || query.trim() === '') return;

        const historyEntry = {
            query: query,
            timestamp: new Date().toISOString()
        };

        // Remove duplicates
        this.searchHistory = this.searchHistory.filter(h => h.query !== query);

        // Add to beginning
        this.searchHistory.unshift(historyEntry);

        // Keep only last 50
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }

        this.persistSearchHistory();
    }

    // Get search history
    getSearchHistory() {
        return this.searchHistory;
    }

    // Clear history
    clearHistory() {
        this.searchHistory = [];
        this.persistSearchHistory();
    }

    // Persistence
    loadSavedSearches() {
        const stored = localStorage.getItem('splunk_saved_searches');
        return stored ? JSON.parse(stored) : [];
    }

    persistSavedSearches() {
        localStorage.setItem('splunk_saved_searches', JSON.stringify(this.savedSearches));
    }

    loadSearchHistory() {
        const stored = localStorage.getItem('splunk_search_history');
        return stored ? JSON.parse(stored) : [];
    }

    persistSearchHistory() {
        localStorage.setItem('splunk_search_history', JSON.stringify(this.searchHistory));
    }
}

// Export Manager
class ExportManager {
    // Export to CSV
    exportToCSV(data, filename = 'splunk_export.csv') {
        if (!data || data.length === 0) {
            alert('データがありません');
            return;
        }

        // Get all unique fields
        const fields = new Set();
        data.forEach(row => {
            Object.keys(row).forEach(key => {
                if (!key.startsWith('_')) {
                    fields.add(key);
                }
            });
        });

        const fieldArray = Array.from(fields);

        // Create CSV header
        let csv = fieldArray.map(f => this.escapeCSV(f)).join(',') + '\n';

        // Create CSV rows
        data.forEach(row => {
            const values = fieldArray.map(field => {
                const value = row[field] !== undefined ? row[field] : '';
                return this.escapeCSV(String(value));
            });
            csv += values.join(',') + '\n';
        });

        this.downloadFile(csv, filename, 'text/csv');
    }

    // Export to JSON
    exportToJSON(data, filename = 'splunk_export.json') {
        if (!data || data.length === 0) {
            alert('データがありません');
            return;
        }

        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    }

    // Export raw logs
    exportRawLogs(data, filename = 'splunk_raw.txt') {
        if (!data || data.length === 0) {
            alert('データがありません');
            return;
        }

        const raw = data.map(log => log._raw || JSON.stringify(log)).join('\n');
        this.downloadFile(raw, filename, 'text/plain');
    }

    // Helper to escape CSV fields
    escapeCSV(field) {
        if (field == null) return '';
        field = String(field);
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return '"' + field.replace(/"/g, '""') + '"';
        }
        return field;
    }

    // Helper to download file
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
}

// Create global instances
const savedSearchManager = new SavedSearchManager();
const exportManager = new ExportManager();
