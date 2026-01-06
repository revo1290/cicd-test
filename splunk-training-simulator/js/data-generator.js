// Sample log data generator for Splunk Training Simulator

class DataGenerator {
    constructor() {
        this.hosts = ['web-server-01', 'web-server-02', 'app-server-01', 'app-server-02', 'db-server-01'];
        this.users = ['user001', 'user002', 'user003', 'admin', 'guest', 'user004', 'user005'];
        this.paths = ['/api/users', '/api/products', '/api/orders', '/home', '/dashboard', '/login', '/logout', '/api/search'];
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ];
        this.appMessages = [
            'User authentication successful',
            'Database connection established',
            'Cache hit for key',
            'Processing payment transaction',
            'Email notification sent',
            'API rate limit reached',
            'Invalid input validation',
            'Session timeout occurred',
            'File upload completed',
            'Background job started'
        ];
        this.errorMessages = [
            'Database connection failed',
            'Null pointer exception in service',
            'Authentication token expired',
            'Out of memory error',
            'Failed to process request',
            'Network timeout',
            'Permission denied'
        ];
    }

    // Generate web access logs
    generateWebAccessLog(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const status = this.getRandomStatus();
            const responseTime = status >= 400 ?
                Math.floor(Math.random() * 2000) + 500 :
                Math.floor(Math.random() * 500) + 50;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: this.formatWebAccessRaw(timestamp, status, responseTime),
                source: 'web_access',
                host: this.getRandomElement(this.hosts),
                status: status,
                method: this.getRandomMethod(),
                path: this.getRandomElement(this.paths),
                user: this.getRandomElement(this.users),
                response_time: responseTime,
                bytes: Math.floor(Math.random() * 50000) + 500,
                user_agent: this.getRandomElement(this.userAgents),
                ip: this.getRandomIP()
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate application logs
    generateAppLog(count = 100, timeRangeMinutes = 60) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRangeMinutes * 60 * 1000);
            const level = this.getRandomLogLevel();
            const message = level === 'ERROR' ?
                this.getRandomElement(this.errorMessages) :
                this.getRandomElement(this.appMessages);

            logs.push({
                _time: timestamp.toISOString(),
                _raw: this.formatAppLogRaw(timestamp, level, message),
                source: 'app_log',
                host: this.getRandomElement(this.hosts),
                level: level,
                message: message,
                thread: `thread-${Math.floor(Math.random() * 10)}`,
                class: `com.example.service.${this.getRandomService()}`
            });
        }

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Generate all logs
    generateAllLogs(webCount = 200, appCount = 150, timeRangeMinutes = 60) {
        const webLogs = this.generateWebAccessLog(webCount, timeRangeMinutes);
        const appLogs = this.generateAppLog(appCount, timeRangeMinutes);
        return [...webLogs, ...appLogs].sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Helper methods
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomStatus() {
        const statuses = [200, 200, 200, 200, 200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502, 503];
        return this.getRandomElement(statuses);
    }

    getRandomMethod() {
        const methods = ['GET', 'GET', 'GET', 'GET', 'POST', 'POST', 'PUT', 'DELETE'];
        return this.getRandomElement(methods);
    }

    getRandomLogLevel() {
        const levels = ['INFO', 'INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'WARN', 'ERROR'];
        return this.getRandomElement(levels);
    }

    getRandomService() {
        const services = ['UserService', 'OrderService', 'PaymentService', 'NotificationService', 'AuthService'];
        return this.getRandomElement(services);
    }

    getRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    formatWebAccessRaw(timestamp, status, responseTime) {
        const timeStr = timestamp.toISOString();
        const ip = this.getRandomIP();
        const method = this.getRandomMethod();
        const path = this.getRandomElement(this.paths);
        return `${timeStr} ${ip} "${method} ${path} HTTP/1.1" ${status} ${responseTime}ms`;
    }

    formatAppLogRaw(timestamp, level, message) {
        const timeStr = timestamp.toISOString();
        const thread = `thread-${Math.floor(Math.random() * 10)}`;
        const className = `com.example.service.${this.getRandomService()}`;
        return `${timeStr} [${thread}] ${level} ${className} - ${message}`;
    }

    // Get time range in minutes
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
