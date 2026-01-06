// Enhanced log data generator with diverse formats

class DataGenerator {
    constructor() {
        this.hosts = ['web-server-01', 'web-server-02', 'app-server-01', 'app-server-02', 'db-server-01', 'api-gateway-01', 'lb-server-01'];
        this.users = ['user001', 'user002', 'user003', 'admin', 'guest', 'john.doe', 'jane.smith', 'developer', 'operator'];
        this.paths = ['/api/users', '/api/products', '/api/orders', '/home', '/dashboard', '/login', '/logout', '/api/search', '/api/checkout', '/admin', '/api/inventory'];
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Firefox/121.0',
            'PostmanRuntime/7.36.0',
            'okhttp/4.9.0'
        ];
        this.countries = ['US', 'JP', 'UK', 'DE', 'FR', 'CN', 'IN', 'BR'];
        this.cities = ['Tokyo', 'New York', 'London', 'Paris', 'Berlin', 'Shanghai', 'Mumbai', 'São Paulo'];
        this.sqlQueries = [
            'SELECT * FROM users WHERE id = ?',
            'UPDATE orders SET status = ? WHERE id = ?',
            'INSERT INTO products (name, price) VALUES (?, ?)',
            'DELETE FROM cart WHERE user_id = ?',
            'SELECT COUNT(*) FROM transactions'
        ];
        this.securityEvents = [
            'Failed login attempt',
            'Successful authentication',
            'Password changed',
            'Suspicious activity detected',
            'Account locked',
            'Privilege escalation attempt',
            'Malware detected',
            'Firewall rule triggered'
        ];
    }

    // Generate Apache access logs
    generateApacheLogs(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const status = this.getRandomStatus();
            const bytes = status >= 400 ? '-' : Math.floor(Math.random() * 50000) + 500;
            const ip = this.getRandomIP();
            const method = this.getRandomMethod();
            const path = this.getRandomElement(this.paths);
            const referer = Math.random() > 0.3 ? `https://example.com${this.getRandomElement(this.paths)}` : '-';
            const userAgent = this.getRandomElement(this.userAgents);

            const raw = `${ip} - - [${this.formatApacheTime(timestamp)}] "${method} ${path} HTTP/1.1" ${status} ${bytes} "${referer}" "${userAgent}"`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'apache_access',
                sourcetype: 'access_combined',
                host: this.getRandomElement(this.hosts),
                clientip: ip,
                method: method,
                uri: path,
                status: status,
                bytes: bytes === '-' ? 0 : bytes,
                referer: referer,
                useragent: userAgent
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate Nginx logs
    generateNginxLogs(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const status = this.getRandomStatus();
            const responseTime = status >= 400 ? (Math.random() * 2).toFixed(3) : (Math.random() * 0.5).toFixed(3);
            const bytes = Math.floor(Math.random() * 50000) + 500;
            const ip = this.getRandomIP();
            const method = this.getRandomMethod();
            const path = this.getRandomElement(this.paths);

            const raw = `${ip} - - [${this.formatApacheTime(timestamp)}] "${method} ${path} HTTP/1.1" ${status} ${bytes} "-" "${this.getRandomElement(this.userAgents)}" ${responseTime}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'nginx_access',
                sourcetype: 'nginx:plus:access',
                host: this.getRandomElement(this.hosts),
                clientip: ip,
                method: method,
                uri: path,
                status: status,
                bytes_sent: bytes,
                request_time: parseFloat(responseTime)
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate Syslog messages
    generateSyslogMessages(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();
        const facilities = ['auth', 'daemon', 'kern', 'mail', 'syslog', 'user'];
        const severities = ['info', 'notice', 'warning', 'err', 'crit'];
        const processes = ['sshd', 'systemd', 'kernel', 'cron', 'apache2', 'mysqld'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const facility = this.getRandomElement(facilities);
            const severity = this.getRandomElement(severities);
            const process = this.getRandomElement(processes);
            const pid = Math.floor(Math.random() * 50000) + 1000;
            const messages = {
                'sshd': ['Accepted password for user from 192.168.1.100', 'Failed password for invalid user', 'Connection closed by authenticating user'],
                'systemd': ['Started session', 'Stopped target', 'Reached target'],
                'kernel': ['Out of memory: Kill process', 'segfault at', 'TCP: time wait bucket table overflow'],
                'cron': ['(root) CMD (run-parts /etc/cron.hourly)', 'pam_unix(cron:session): session opened'],
                'apache2': ['Server configured -- resuming normal operations', 'caught SIGTERM, shutting down'],
                'mysqld': ['InnoDB: Buffer pool size', 'ready for connections']
            };
            const message = this.getRandomElement(messages[process] || ['System message']);

            const raw = `${this.formatSyslogTime(timestamp)} ${this.getRandomElement(this.hosts)} ${process}[${pid}]: ${message}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'syslog',
                sourcetype: 'syslog',
                host: this.getRandomElement(this.hosts),
                facility: facility,
                severity: severity,
                process: process,
                pid: pid,
                message: message
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate JSON formatted logs
    generateJSONLogs(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const level = this.getRandomLogLevel();
            const eventTypes = ['api_call', 'database_query', 'cache_operation', 'user_action', 'system_event'];
            const eventType = this.getRandomElement(eventTypes);

            const logObject = {
                timestamp: timestamp.toISOString(),
                level: level,
                service: this.getRandomElement(['auth-service', 'payment-service', 'order-service', 'notification-service']),
                event_type: eventType,
                user_id: `user_${Math.floor(Math.random() * 1000)}`,
                session_id: this.generateUUID(),
                duration_ms: Math.floor(Math.random() * 1000),
                status: level === 'ERROR' ? 'failed' : 'success',
                message: `${eventType} completed`,
                metadata: {
                    ip: this.getRandomIP(),
                    country: this.getRandomElement(this.countries),
                    city: this.getRandomElement(this.cities)
                }
            };

            const raw = JSON.stringify(logObject);

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'json_logs',
                sourcetype: 'json',
                host: this.getRandomElement(this.hosts),
                level: level,
                service: logObject.service,
                event_type: eventType,
                user_id: logObject.user_id,
                duration_ms: logObject.duration_ms,
                status: logObject.status,
                country: logObject.metadata.country,
                city: logObject.metadata.city
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate Database logs
    generateDatabaseLogs(count = 80, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const query = this.getRandomElement(this.sqlQueries);
            const duration = Math.floor(Math.random() * 500) + 10;
            const rowsAffected = Math.floor(Math.random() * 1000);
            const database = this.getRandomElement(['production', 'staging', 'analytics']);

            const raw = `${timestamp.toISOString()} [${database}] Query: ${query} | Duration: ${duration}ms | Rows: ${rowsAffected}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'database',
                sourcetype: 'mysql',
                host: 'db-server-01',
                database: database,
                query_type: query.split(' ')[0],
                duration_ms: duration,
                rows_affected: rowsAffected,
                query: query
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate Security logs
    generateSecurityLogs(count = 60, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const event = this.getRandomElement(this.securityEvents);
            const severity = event.includes('Failed') || event.includes('Suspicious') || event.includes('attempt') || event.includes('detected')
                ? 'high' : event.includes('locked') ? 'medium' : 'low';
            const srcIp = this.getRandomIP();
            const user = this.getRandomElement(this.users);

            const raw = `${timestamp.toISOString()} SECURITY [${severity.toUpperCase()}] User: ${user} | Event: ${event} | Source IP: ${srcIp}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'security',
                sourcetype: 'security:auth',
                host: this.getRandomElement(this.hosts),
                event_type: event,
                severity: severity,
                user: user,
                src_ip: srcIp,
                dest_ip: this.getRandomIP()
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate API Gateway logs
    generateAPIGatewayLogs(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const status = this.getRandomStatus();
            const latency = status >= 400 ? Math.floor(Math.random() * 3000) + 500 : Math.floor(Math.random() * 500) + 50;
            const apiKey = `key_${Math.random().toString(36).substring(7)}`;
            const endpoint = this.getRandomElement(this.paths);

            const raw = `${timestamp.toISOString()} [API-Gateway] ${endpoint} | Status: ${status} | Latency: ${latency}ms | API Key: ${apiKey}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'api_gateway',
                sourcetype: 'aws:apigateway',
                host: 'api-gateway-01',
                endpoint: endpoint,
                status: status,
                latency_ms: latency,
                api_key: apiKey,
                request_id: this.generateUUID()
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate all logs with diverse formats
    generateAllLogs(countPerType = 80, timeRangeMinutes = 60) {
        const apacheLogs = this.generateApacheLogs(countPerType, timeRangeMinutes);
        const nginxLogs = this.generateNginxLogs(countPerType, timeRangeMinutes);
        const syslogMessages = this.generateSyslogMessages(countPerType, timeRangeMinutes);
        const jsonLogs = this.generateJSONLogs(countPerType, timeRangeMinutes);
        const dbLogs = this.generateDatabaseLogs(Math.floor(countPerType * 0.8), timeRangeMinutes);
        const securityLogs = this.generateSecurityLogs(Math.floor(countPerType * 0.6), timeRangeMinutes);
        const apiLogs = this.generateAPIGatewayLogs(countPerType, timeRangeMinutes);

        return [...apacheLogs, ...nginxLogs, ...syslogMessages, ...jsonLogs, ...dbLogs, ...securityLogs, ...apiLogs]
            .sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Helper methods
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomStatus() {
        const statuses = [200, 200, 200, 200, 200, 200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 500, 502, 503];
        return this.getRandomElement(statuses);
    }

    getRandomMethod() {
        const methods = ['GET', 'GET', 'GET', 'GET', 'GET', 'POST', 'POST', 'PUT', 'DELETE', 'PATCH'];
        return this.getRandomElement(methods);
    }

    getRandomLogLevel() {
        const levels = ['INFO', 'INFO', 'INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'WARN', 'ERROR'];
        return this.getRandomElement(levels);
    }

    getRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    formatApacheTime(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} +0000`;
    }

    formatSyslogTime(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = String(date.getDate()).padStart(2, ' ');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${month} ${day} ${hours}:${minutes}:${seconds}`;
    }

    getTimeRangeMinutes(range) {
        const ranges = {
            '15m': 15,
            '1h': 60,
            '24h': 1440,
            '7d': 10080
        };
        return ranges[range] || 60;
    }
}

// Create global instance
const dataGenerator = new DataGenerator();
