// SPL Query Parser and Executor for Splunk Training Simulator

class QueryParser {
    constructor() {
        this.data = [];
    }

    setData(data) {
        this.data = data;
    }

    // Main query execution method
    executeQuery(query) {
        try {
            // Split query by pipe (|) to get commands
            const commands = query.split('|').map(cmd => cmd.trim());

            // Start with search command
            let results = this.executeSearch(commands[0]);

            // Execute subsequent commands
            for (let i = 1; i < commands.length; i++) {
                results = this.executeCommand(commands[i], results);
            }

            return {
                success: true,
                results: results,
                count: results.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    // Execute search (filter) command
    executeSearch(searchStr) {
        let results = [...this.data];

        // Parse search terms
        const terms = this.parseSearchTerms(searchStr);

        // Apply filters
        for (const term of terms) {
            results = results.filter(event => this.matchesTerm(event, term));
        }

        return results;
    }

    // Parse search terms from search string
    parseSearchTerms(searchStr) {
        const terms = [];
        const tokens = searchStr.match(/(\w+)([><=!]+)?("?[^"\s]+"?|\S+)?/g) || [];

        for (const token of tokens) {
            const match = token.match(/(\w+)([><=!]+)?("?[^"\s]+"?|\S+)?/);
            if (match) {
                const field = match[1];
                const operator = match[2] || '=';
                const value = match[3] ? match[3].replace(/"/g, '') : null;

                if (value !== null) {
                    terms.push({ field, operator, value });
                }
            }
        }

        return terms;
    }

    // Check if event matches a search term
    matchesTerm(event, term) {
        const fieldValue = event[term.field];

        if (fieldValue === undefined) {
            return false;
        }

        const value = String(fieldValue);
        const searchValue = term.value;

        // Handle different operators
        switch (term.operator) {
            case '=':
            case '==':
                return value === searchValue;
            case '!=':
                return value !== searchValue;
            case '>':
                return Number(value) > Number(searchValue);
            case '>=':
                return Number(value) >= Number(searchValue);
            case '<':
                return Number(value) < Number(searchValue);
            case '<=':
                return Number(value) <= Number(searchValue);
            default:
                return value.includes(searchValue);
        }
    }

    // Execute pipeline command
    executeCommand(cmdStr, results) {
        const cmd = cmdStr.trim();

        if (cmd.startsWith('stats')) {
            return this.executeStats(cmd, results);
        } else if (cmd.startsWith('sort')) {
            return this.executeSort(cmd, results);
        } else if (cmd.startsWith('head')) {
            return this.executeHead(cmd, results);
        } else if (cmd.startsWith('tail')) {
            return this.executeTail(cmd, results);
        } else if (cmd.startsWith('fields')) {
            return this.executeFields(cmd, results);
        }

        return results;
    }

    // Execute stats command
    executeStats(cmdStr, results) {
        // Parse: stats count, avg(field), sum(field) by groupfield
        const match = cmdStr.match(/stats\s+(.+?)(?:\s+by\s+(.+))?$/);
        if (!match) return results;

        const statsStr = match[1];
        const groupBy = match[2] ? match[2].trim().split(',').map(f => f.trim()) : null;

        // Parse stat functions
        const statFuncs = this.parseStatFunctions(statsStr);

        if (groupBy) {
            return this.groupAndAggregate(results, groupBy, statFuncs);
        } else {
            return [this.aggregate(results, statFuncs)];
        }
    }

    // Parse stat functions from stats string
    parseStatFunctions(statsStr) {
        const funcs = [];
        const parts = statsStr.split(',').map(p => p.trim());

        for (const part of parts) {
            // Match: count, avg(field), sum(field), max(field), min(field)
            const funcMatch = part.match(/(\w+)\((\w+)\)/);
            if (funcMatch) {
                funcs.push({
                    func: funcMatch[1],
                    field: funcMatch[2],
                    outputName: part
                });
            } else if (part === 'count') {
                funcs.push({
                    func: 'count',
                    field: null,
                    outputName: 'count'
                });
            }
        }

        return funcs;
    }

    // Group and aggregate results
    groupAndAggregate(results, groupFields, statFuncs) {
        const groups = {};

        // Group events
        for (const event of results) {
            const key = groupFields.map(field => event[field]).join('|');

            if (!groups[key]) {
                groups[key] = {
                    events: [],
                    groupValues: {}
                };
                groupFields.forEach(field => {
                    groups[key].groupValues[field] = event[field];
                });
            }

            groups[key].events.push(event);
        }

        // Aggregate each group
        const aggregated = [];
        for (const key in groups) {
            const group = groups[key];
            const result = { ...group.groupValues };

            for (const stat of statFuncs) {
                const value = this.calculateStat(group.events, stat);
                result[stat.outputName] = value;
            }

            aggregated.push(result);
        }

        return aggregated;
    }

    // Aggregate all results
    aggregate(results, statFuncs) {
        const result = {};

        for (const stat of statFuncs) {
            const value = this.calculateStat(results, stat);
            result[stat.outputName] = value;
        }

        return result;
    }

    // Calculate stat value
    calculateStat(events, stat) {
        switch (stat.func) {
            case 'count':
                return events.length;
            case 'avg':
                return this.average(events, stat.field);
            case 'sum':
                return this.sum(events, stat.field);
            case 'max':
                return this.max(events, stat.field);
            case 'min':
                return this.min(events, stat.field);
            default:
                return 0;
        }
    }

    // Statistical functions
    average(events, field) {
        const values = events.map(e => Number(e[field])).filter(v => !isNaN(v));
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) / 100;
    }

    sum(events, field) {
        return events.map(e => Number(e[field])).filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
    }

    max(events, field) {
        const values = events.map(e => Number(e[field])).filter(v => !isNaN(v));
        return values.length > 0 ? Math.max(...values) : 0;
    }

    min(events, field) {
        const values = events.map(e => Number(e[field])).filter(v => !isNaN(v));
        return values.length > 0 ? Math.min(...values) : 0;
    }

    // Execute sort command
    executeSort(cmdStr, results) {
        // Parse: sort field or sort -field (descending)
        const match = cmdStr.match(/sort\s+(-)?(\w+)/);
        if (!match) return results;

        const descending = match[1] === '-';
        const field = match[2];

        return [...results].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            // Try numeric comparison first
            const aNum = Number(aVal);
            const bNum = Number(bVal);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return descending ? bNum - aNum : aNum - bNum;
            }

            // String comparison
            const comparison = String(aVal).localeCompare(String(bVal));
            return descending ? -comparison : comparison;
        });
    }

    // Execute head command
    executeHead(cmdStr, results) {
        const match = cmdStr.match(/head\s+(\d+)/);
        const limit = match ? parseInt(match[1]) : 10;
        return results.slice(0, limit);
    }

    // Execute tail command
    executeTail(cmdStr, results) {
        const match = cmdStr.match(/tail\s+(\d+)/);
        const limit = match ? parseInt(match[1]) : 10;
        return results.slice(-limit);
    }

    // Execute fields command
    executeFields(cmdStr, results) {
        const match = cmdStr.match(/fields\s+(.+)/);
        if (!match) return results;

        const fields = match[1].split(',').map(f => f.trim());

        return results.map(event => {
            const filtered = {};
            fields.forEach(field => {
                if (event[field] !== undefined) {
                    filtered[field] = event[field];
                }
            });
            return filtered;
        });
    }
}

// Create global instance
const queryParser = new QueryParser();
