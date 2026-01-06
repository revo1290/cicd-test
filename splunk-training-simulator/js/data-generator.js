// Enhanced Data Generator with 15+ log formats
// Version 2.0 - Enterprise-ready log simulation

class DataGenerator {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Common data
        this.hosts = ['web-01', 'web-02', 'app-01', 'app-02', 'db-01', 'api-gateway', 'lb-01', 'cache-01'];
        this.users = ['admin', 'john.doe', 'jane.smith', 'developer', 'operator', 'user001', 'user002', 'system'];
        this.ips = Array.from({length: 20}, () => this.getRandomIP());
        this.countries = ['US', 'JP', 'UK', 'DE', 'FR', 'CN', 'IN', 'BR', 'CA', 'AU'];
        this.cities = ['Tokyo', 'New York', 'London', 'Paris', 'Berlin', 'Shanghai', 'Mumbai', 'Toronto'];

        // K8s data
        this.k8sNamespaces = ['default', 'kube-system', 'production', 'staging', 'monitoring'];
        this.k8sPods = ['nginx-', 'redis-', 'postgres-', 'api-', 'worker-', 'scheduler-'];
        this.k8sContainers = ['app', 'sidecar', 'init', 'proxy'];

        // Cloud providers
        this.awsRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-northeast-1'];
        this.awsServices = ['EC2', 'Lambda', 'RDS', 'S3', 'DynamoDB', 'ECS'];
        this.azureResources = ['VirtualMachine', 'FunctionApp', 'SQLDatabase', 'StorageAccount'];

        // Application data
        this.services = ['auth-service', 'payment-service', 'order-service', 'notification-service', 'user-service'];
        this.endpoints = ['/api/v1/users', '/api/v1/orders', '/api/v1/products', '/api/v1/auth', '/api/v1/payments'];
        this.httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        this.statusCodes = [200, 200, 200, 200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503];
    }

    // Main generator - creates all log types
    generateAllLogs(countPerType = 30, timeRangeMinutes = 60) {
        const logs = [
            ...this.generateKubernetesLogs(countPerType, timeRangeMinutes),
            ...this.generateDockerLogs(countPerType, timeRangeMinutes),
            ...this.generateAWSCloudWatchLogs(countPerType, timeRangeMinutes),
            ...this.generateAzureMonitorLogs(countPerType, timeRangeMinutes),
            ...this.generateWindowsEventLogs(countPerType, timeRangeMinutes),
            ...this.generateFirewallLogs(countPerType, timeRangeMinutes),
            ...this.generateLoadBalancerLogs(countPerType, timeRangeMinutes),
            ...this.generateRedisLogs(countPerType, timeRangeMinutes),
            ...this.generateMongoDBLogs(countPerType, timeRangeMinutes),
            ...this.generateElasticsearchLogs(countPerType, timeRangeMinutes),
            ...this.generateKafkaLogs(countPerType, timeRangeMinutes),
            ...this.generatePrometheusMetrics(countPerType, timeRangeMinutes),
            ...this.generateNginxLogs(countPerType, timeRangeMinutes),
            ...this.generateApacheLogs(countPerType, timeRangeMinutes),
            ...this.generateApplicationLogs(countPerType, timeRangeMinutes)
        ];

        return logs.sort((a, b) => new Date(b._time) - new Date(a._time));
    }

    // Kubernetes logs
    generateKubernetesLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const namespace = this.getRandomElement(this.k8sNamespaces);
            const podPrefix = this.getRandomElement(this.k8sPods);
            const podName = `${podPrefix}${this.randomString(8)}`;
            const container = this.getRandomElement(this.k8sContainers);
            const level = this.getRandomLogLevel();

            const messages = [
                'Container started',
                'Health check passed',
                'Received SIGTERM, gracefully shutting down',
                'Successfully pulled image',
                'Created container',
                'Started container',
                'Liveness probe failed',
                'Readiness probe succeeded'
            ];

            const message = this.getRandomElement(messages);
            const raw = `${timestamp.toISOString()} ${level} ${namespace}/${podName}/${container}: ${message}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'kubernetes',
                sourcetype: 'kube:container:log',
                namespace: namespace,
                pod: podName,
                container: container,
                level: level,
                message: message,
                cluster: 'production-cluster'
            });
        }

        return logs;
    }

    // Docker logs
    generateDockerLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const containerId = this.randomString(12);
            const containerName = this.getRandomElement(['nginx', 'redis', 'postgres', 'app', 'worker']);
            const level = this.getRandomLogLevel();

            const raw = `${timestamp.toISOString()} [${containerId}] ${containerName}: ${level} - Application event`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'docker',
                sourcetype: 'docker:container',
                container_id: containerId,
                container_name: containerName,
                level: level,
                host: this.getRandomElement(this.hosts)
            });
        }

        return logs;
    }

    // AWS CloudWatch logs
    generateAWSCloudWatchLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const service = this.getRandomElement(this.awsServices);
            const region = this.getRandomElement(this.awsRegions);
            const level = this.getRandomLogLevel();

            const raw = JSON.stringify({
                timestamp: timestamp.toISOString(),
                service: service,
                region: region,
                level: level,
                message: `${service} operation completed`,
                requestId: this.generateUUID(),
                accountId: `${Math.floor(Math.random() * 1000000000000)}`
            });

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'aws:cloudwatch',
                sourcetype: 'aws:cloudwatch:logs',
                aws_service: service,
                aws_region: region,
                level: level,
                request_id: this.generateUUID()
            });
        }

        return logs;
    }

    // Azure Monitor logs
    generateAzureMonitorLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const resource = this.getRandomElement(this.azureResources);
            const level = this.getRandomLogLevel();

            const raw = JSON.stringify({
                time: timestamp.toISOString(),
                resourceType: resource,
                level: level,
                category: 'Administrative',
                operationName: `Microsoft.Compute/${resource}/action`,
                resultType: level === 'ERROR' ? 'Failed' : 'Success'
            });

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'azure:monitor',
                sourcetype: 'azure:monitor:log',
                resource_type: resource,
                level: level,
                subscription_id: this.generateUUID()
            });
        }

        return logs;
    }

    // Windows Event logs
    generateWindowsEventLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const eventTypes = ['Application', 'Security', 'System'];
        const eventIds = [1000, 1001, 4624, 4625, 4672, 7036, 7040];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const eventType = this.getRandomElement(eventTypes);
            const eventId = this.getRandomElement(eventIds);
            const level = Math.random() > 0.8 ? 'ERROR' : 'INFO';

            const raw = `EventType: ${eventType} EventID: ${eventId} Level: ${level} Source: ${this.getRandomElement(this.hosts)} User: ${this.getRandomElement(this.users)}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'windows:event',
                sourcetype: 'WinEventLog',
                event_type: eventType,
                event_id: eventId,
                level: level,
                host: this.getRandomElement(this.hosts),
                user: this.getRandomElement(this.users)
            });
        }

        return logs;
    }

    // Firewall logs
    generateFirewallLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const actions = ['ALLOW', 'ALLOW', 'ALLOW', 'DENY', 'DROP'];
        const protocols = ['TCP', 'UDP', 'ICMP'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const srcIp = this.getRandomIP();
            const dstIp = this.getRandomIP();
            const action = this.getRandomElement(actions);
            const protocol = this.getRandomElement(protocols);
            const srcPort = Math.floor(Math.random() * 65535);
            const dstPort = this.getRandomElement([80, 443, 22, 3306, 5432, 6379]);

            const raw = `${timestamp.toISOString()} firewall: src=${srcIp}:${srcPort} dst=${dstIp}:${dstPort} protocol=${protocol} action=${action}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'firewall',
                sourcetype: 'cisco:asa',
                src_ip: srcIp,
                dst_ip: dstIp,
                src_port: srcPort,
                dst_port: dstPort,
                protocol: protocol,
                action: action
            });
        }

        return logs;
    }

    // Load Balancer logs
    generateLoadBalancerLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const clientIp = this.getRandomIP();
            const backend = this.getRandomElement(this.hosts);
            const status = this.getRandomElement(this.statusCodes);
            const responseTime = status >= 500 ? Math.random() * 3000 : Math.random() * 500;

            const raw = `${timestamp.toISOString()} ${clientIp} -> ${backend} ${status} ${responseTime.toFixed(3)}ms`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'load_balancer',
                sourcetype: 'aws:elb:accesslogs',
                client_ip: clientIp,
                backend_host: backend,
                status: status,
                response_time_ms: responseTime,
                bytes_sent: Math.floor(Math.random() * 100000)
            });
        }

        return logs;
    }

    // Redis logs
    generateRedisLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const commands = ['GET', 'SET', 'DEL', 'HGET', 'HSET', 'LPUSH', 'RPOP', 'ZADD'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const command = this.getRandomElement(commands);
            const key = `key:${Math.floor(Math.random() * 10000)}`;
            const duration = Math.random() * 10;

            const raw = `${timestamp.toISOString()} [${Math.floor(Math.random() * 16)}] "${command}" "${key}" ${duration.toFixed(3)}ms`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'redis',
                sourcetype: 'redis:log',
                command: command,
                key: key,
                duration_ms: duration,
                host: 'cache-01'
            });
        }

        return logs;
    }

    // MongoDB logs
    generateMongoDBLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const operations = ['query', 'insert', 'update', 'delete', 'command'];
        const collections = ['users', 'orders', 'products', 'sessions', 'logs'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const operation = this.getRandomElement(operations);
            const collection = this.getRandomElement(collections);
            const duration = Math.random() * 200;
            const level = duration > 100 ? 'WARN' : 'INFO';

            const raw = `${timestamp.toISOString()} ${level} [conn123] ${operation} ${collection} ${duration.toFixed(0)}ms`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'mongodb',
                sourcetype: 'mongodb:log',
                operation: operation,
                collection: collection,
                duration_ms: duration,
                level: level,
                host: 'db-01'
            });
        }

        return logs;
    }

    // Elasticsearch logs
    generateElasticsearchLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const levels = ['INFO', 'INFO', 'WARN', 'ERROR'];
        const indices = ['logs-2024', 'metrics-2024', 'events-2024'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const level = this.getRandomElement(levels);
            const index = this.getRandomElement(indices);

            const raw = `[${timestamp.toISOString()}][${level}][o.e.c.m.MetadataIndexTemplateService] [node-1] ${index}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'elasticsearch',
                sourcetype: 'elasticsearch:log',
                level: level,
                index: index,
                node: 'node-1',
                cluster: 'production'
            });
        }

        return logs;
    }

    // Kafka logs
    generateKafkaLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const topics = ['user-events', 'order-events', 'payment-events', 'notifications'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const topic = this.getRandomElement(topics);
            const partition = Math.floor(Math.random() * 10);
            const offset = Math.floor(Math.random() * 1000000);

            const raw = `${timestamp.toISOString()} [Producer] Sent message to ${topic}[${partition}] offset=${offset}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'kafka',
                sourcetype: 'kafka:log',
                topic: topic,
                partition: partition,
                offset: offset,
                host: 'kafka-broker-1'
            });
        }

        return logs;
    }

    // Prometheus metrics
    generatePrometheusMetrics(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const metrics = ['http_requests_total', 'cpu_usage_percent', 'memory_usage_bytes', 'disk_io_time_seconds'];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const metric = this.getRandomElement(metrics);
            const value = Math.random() * 100;
            const job = this.getRandomElement(this.services);

            const raw = `${metric}{job="${job}",instance="${this.getRandomElement(this.hosts)}"} ${value.toFixed(2)} ${timestamp.getTime()}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'prometheus',
                sourcetype: 'prometheus:metric',
                metric_name: metric,
                metric_value: value,
                job: job,
                host: this.getRandomElement(this.hosts)
            });
        }

        return logs;
    }

    // Nginx logs (keeping existing)
    generateNginxLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const status = this.getRandomElement(this.statusCodes);
            const clientIp = this.getRandomIP();
            const method = this.getRandomElement(this.httpMethods);
            const uri = this.getRandomElement(this.endpoints);
            const responseTime = status >= 400 ? (Math.random() * 2).toFixed(3) : (Math.random() * 0.5).toFixed(3);
            const bytes = Math.floor(Math.random() * 50000) + 500;

            const raw = `${clientIp} - - [${this.formatApacheTime(timestamp)}] "${method} ${uri} HTTP/1.1" ${status} ${bytes} "-" "Mozilla/5.0" ${responseTime}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'nginx',
                sourcetype: 'nginx:access',
                clientip: clientIp,
                method: method,
                uri: uri,
                status: status,
                bytes_sent: bytes,
                request_time: parseFloat(responseTime),
                host: this.getRandomElement(this.hosts)
            });
        }

        return logs;
    }

    // Apache logs (keeping existing)
    generateApacheLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const status = this.getRandomElement(this.statusCodes);
            const clientIp = this.getRandomIP();
            const method = this.getRandomElement(this.httpMethods);
            const uri = this.getRandomElement(this.endpoints);
            const bytes = status >= 400 ? '-' : Math.floor(Math.random() * 50000) + 500;

            const raw = `${clientIp} - - [${this.formatApacheTime(timestamp)}] "${method} ${uri} HTTP/1.1" ${status} ${bytes}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'apache',
                sourcetype: 'apache:access',
                clientip: clientIp,
                method: method,
                uri: uri,
                status: status,
                bytes: bytes === '-' ? 0 : bytes,
                host: this.getRandomElement(this.hosts)
            });
        }

        return logs;
    }

    // Application logs
    generateApplicationLogs(count, timeRange) {
        const logs = [];
        const now = Date.now();
        const levels = ['INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR'];
        const messages = [
            'Request processed successfully',
            'Cache hit',
            'Database query executed',
            'External API called',
            'User session created',
            'Payment processed',
            'Email sent',
            'File uploaded',
            'Background job completed',
            'Configuration updated'
        ];

        for (let i = 0; i < count; i++) {
            const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
            const level = this.getRandomElement(levels);
            const service = this.getRandomElement(this.services);
            const message = this.getRandomElement(messages);

            const raw = `${timestamp.toISOString()} [${service}] ${level} - ${message}`;

            logs.push({
                _time: timestamp.toISOString(),
                _raw: raw,
                source: 'application',
                sourcetype: 'app:log',
                level: level,
                service: service,
                message: message,
                host: this.getRandomElement(this.hosts)
            });
        }

        return logs;
    }

    // Helper methods
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    getRandomLogLevel() {
        const levels = ['INFO', 'INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR'];
        return this.getRandomElement(levels);
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    randomString(length) {
        return Math.random().toString(36).substring(2, 2 + length);
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

    getTimeRangeMinutes(range) {
        const ranges = {
            '5m': 5,
            '15m': 15,
            '1h': 60,
            '4h': 240,
            '24h': 1440,
            '7d': 10080,
            '30d': 43200
        };
        return ranges[range] || 60;
    }
}

// Create global instance
const dataGenerator = new DataGenerator();
