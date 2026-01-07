'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Log, LogSource } from '../types/logs';
import { dataGenerator } from '../utils/data-generator';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  description?: string;
  createdAt: string;
  runCount: number;
}

interface SplunkContextType {
  logs: Log[];
  filteredLogs: Log[];
  selectedSources: LogSource[];
  searchQuery: string;
  searchResults: Log[];
  savedSearches: SavedSearch[];
  searchHistory: string[];
  currentView: 'dashboard' | 'search' | 'custom' | 'tutorial';
  timeRange: string;

  // Actions
  setLogs: (logs: Log[]) => void;
  setSelectedSources: (sources: LogSource[]) => void;
  toggleSource: (source: LogSource) => void;
  setSearchQuery: (query: string) => void;
  executeSearch: (query: string) => void;
  saveSearch: (name: string, query: string, description?: string) => void;
  deleteSearch: (id: string) => void;
  loadSearch: (id: string) => void;
  setCurrentView: (view: 'dashboard' | 'search' | 'custom' | 'tutorial') => void;
  setTimeRange: (range: string) => void;
  refreshData: () => void;
}

const SplunkContext = createContext<SplunkContextType | undefined>(undefined);

const ALL_SOURCES: LogSource[] = [
  'kubernetes',
  'docker',
  'aws:cloudwatch',
  'azure:monitor',
  'windows:event',
  'firewall',
  'loadbalancer',
  'redis',
  'mongodb',
  'elasticsearch',
  'kafka',
  'prometheus',
  'nginx',
  'apache',
  'application',
];

export function SplunkProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedSources, setSelectedSources] = useState<LogSource[]>(ALL_SOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Log[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'search' | 'custom' | 'tutorial'>('dashboard');
  const [timeRange, setTimeRange] = useState('1h');

  // Initialize data on mount
  useEffect(() => {
    refreshData();
    loadSavedSearches();
    loadSearchHistory();
  }, []);

  // Filter logs by selected sources
  const filteredLogs = logs.filter((log) => selectedSources.includes(log.source as LogSource));

  const refreshData = useCallback(() => {
    const timeRangeMap: Record<string, number> = {
      '5m': 5,
      '15m': 15,
      '1h': 60,
      '4h': 240,
      '24h': 1440,
      '7d': 10080,
    };

    const minutes = timeRangeMap[timeRange] || 60;
    const newLogs = dataGenerator.generateAllLogs(30, minutes);
    setLogs(newLogs);
  }, [timeRange]);

  const toggleSource = useCallback((source: LogSource) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  }, []);

  const executeSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Add to search history
    setSearchHistory((prev) => {
      const newHistory = [query, ...prev.filter((q) => q !== query)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });

    // Simple SPL-like query parser
    const results = parseAndFilterLogs(query, filteredLogs);
    setSearchResults(results);
  }, [filteredLogs]);

  const saveSearch = useCallback((name: string, query: string, description?: string) => {
    const newSearch: SavedSearch = {
      id: Math.random().toString(36).substring(7),
      name,
      query,
      description,
      createdAt: new Date().toISOString(),
      runCount: 0,
    };

    setSavedSearches((prev) => {
      const updated = [...prev, newSearch];
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadSearch = useCallback((id: string) => {
    const search = savedSearches.find((s) => s.id === id);
    if (search) {
      setSearchQuery(search.query);
      executeSearch(search.query);
      setCurrentView('search');

      // Increment run count
      setSavedSearches((prev) => {
        const updated = prev.map((s) =>
          s.id === id ? { ...s, runCount: s.runCount + 1 } : s
        );
        localStorage.setItem('savedSearches', JSON.stringify(updated));
        return updated;
      });
    }
  }, [savedSearches, executeSearch]);

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const value: SplunkContextType = {
    logs,
    filteredLogs,
    selectedSources,
    searchQuery,
    searchResults,
    savedSearches,
    searchHistory,
    currentView,
    timeRange,
    setLogs,
    setSelectedSources,
    toggleSource,
    setSearchQuery,
    executeSearch,
    saveSearch,
    deleteSearch,
    loadSearch,
    setCurrentView,
    setTimeRange,
    refreshData,
  };

  return <SplunkContext.Provider value={value}>{children}</SplunkContext.Provider>;
}

export function useSplunk() {
  const context = useContext(SplunkContext);
  if (context === undefined) {
    throw new Error('useSplunk must be used within a SplunkProvider');
  }
  return context;
}

// Simple SPL-like query parser
function parseAndFilterLogs(query: string, logs: Log[]): Log[] {
  const parts = query.toLowerCase().split('|').map((p) => p.trim());
  let results = [...logs];

  // Parse first part (search filters)
  const searchPart = parts[0];
  if (searchPart) {
    const filters = searchPart.split(/\s+(?=\w+=)/).map((f) => f.trim());

    filters.forEach((filter) => {
      if (filter.includes('=')) {
        const [key, value] = filter.split('=').map((s) => s.trim());
        results = results.filter((log: any) => {
          const logValue = log[key];
          if (logValue === undefined) return false;

          // Handle comparison operators
          if (value.startsWith('>=')) {
            const compareValue = parseFloat(value.substring(2));
            return parseFloat(logValue) >= compareValue;
          }
          if (value.startsWith('<=')) {
            const compareValue = parseFloat(value.substring(2));
            return parseFloat(logValue) <= compareValue;
          }
          if (value.startsWith('>')) {
            const compareValue = parseFloat(value.substring(1));
            return parseFloat(logValue) > compareValue;
          }
          if (value.startsWith('<')) {
            const compareValue = parseFloat(value.substring(1));
            return parseFloat(logValue) < compareValue;
          }

          // Exact match
          return String(logValue).toLowerCase().includes(value.toLowerCase());
        });
      } else {
        // Text search across all fields
        results = results.filter((log: any) =>
          Object.values(log).some((val) =>
            String(val).toLowerCase().includes(filter.toLowerCase())
          )
        );
      }
    });
  }

  // Parse pipe commands (stats, etc.)
  // For now, just return filtered results
  // TODO: Implement stats, top, rare, etc.

  return results;
}
