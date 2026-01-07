import type { Log, LogLevel } from '../types/logs';

export class DataGenerator {
  private hosts: string[];
  private users: string[];
  private ips: string[];
  private countries: string[];
  private cities: string[];
  private k8sNamespaces: string[];
  private k8sPods: string[];
  private k8sContainers: string[];
  private awsRegions: string[];
  private awsServices: string[];
  private azureResources: string[];
  private services: string[];
  private endpoints: string[];
  private httpMethods: string[];
  private statusCodes: number[];

  constructor() {
    this.hosts = ['web-01', 'web-02', 'app-01', 'app-02', 'db-01', 'api-gateway', 'lb-01', 'cache-01'];
    this.users = ['admin', 'john.doe', 'jane.smith', 'developer', 'operator', 'user001', 'user002', 'system'];
    this.ips = Array.from({ length: 20 }, () => this.getRandomIP());
    this.countries = ['US', 'JP', 'UK', 'DE', 'FR', 'CN', 'IN', 'BR', 'CA', 'AU'];
    this.cities = ['Tokyo', 'New York', 'London', 'Paris', 'Berlin', 'Shanghai', 'Mumbai', 'Toronto'];

    this.k8sNamespaces = ['default', 'kube-system', 'production', 'staging', 'monitoring'];
    this.k8sPods = ['nginx-', 'redis-', 'postgres-', 'api-', 'worker-', 'scheduler-'];
    this.k8sContainers = ['app', 'sidecar', 'init', 'proxy'];

    this.awsRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-northeast-1'];
    this.awsServices = ['EC2', 'Lambda', 'RDS', 'S3', 'DynamoDB', 'ECS'];
    this.azureResources = ['VirtualMachine', 'FunctionApp', 'SQLDatabase', 'StorageAccount'];

    this.services = ['auth-service', 'payment-service', 'order-service', 'notification-service', 'user-service'];
    this.endpoints = ['/api/v1/users', '/api/v1/orders', '/api/v1/products', '/api/v1/auth', '/api/v1/payments'];
    this.httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    this.statusCodes = [200, 200, 200, 200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503];
  }

  generateAllLogs(countPerType = 30, timeRangeMinutes = 60): Log[] {
    const logs: Log[] = [
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
      ...this.generateApplicationLogs(countPerType, timeRangeMinutes),
    ];

    return logs.sort((a, b) => new Date(b._time).getTime() - new Date(a._time).getTime());
  }

  private generateKubernetesLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
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
        'Readiness probe succeeded',
      ];

      const message = this.getRandomElement(messages);
      const raw = `${timestamp.toISOString()} ${level} ${namespace}/${podName}/${container}: ${message}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'kubernetes',
        sourcetype: 'kube:container:log',
        namespace,
        pod: podName,
        container,
        level,
        message,
        cluster: 'production-cluster',
      });
    }

    return logs;
  }

  private generateDockerLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const containerId = this.randomString(12);
      const containerName = this.getRandomElement(['nginx', 'redis', 'postgres', 'app', 'worker']);
      const image = `${containerName}:latest`;
      const level = this.getRandomLogLevel();
      const message = 'Application event';

      const raw = `${timestamp.toISOString()} [${containerId}] ${containerName}: ${level} - ${message}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'docker',
        sourcetype: 'docker:container:log',
        container_id: containerId,
        container_name: containerName,
        image,
        level,
        message,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generateAWSCloudWatchLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const service = this.getRandomElement(this.awsServices);
      const region = this.getRandomElement(this.awsRegions);
      const level = this.getRandomLogLevel();
      const message = `${service} operation completed`;

      const raw = JSON.stringify({
        timestamp: timestamp.toISOString(),
        service,
        region,
        level,
        message,
        requestId: this.generateUUID(),
        accountId: `${Math.floor(Math.random() * 1000000000000)}`,
      });

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'aws:cloudwatch',
        sourcetype: 'aws:cloudwatch:log',
        aws_service: service,
        aws_region: region,
        log_group: `/aws/${service.toLowerCase()}`,
        log_stream: `${region}/${this.randomString(8)}`,
        level,
        message,
      });
    }

    return logs;
  }

  private generateAzureMonitorLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const resource = this.getRandomElement(this.azureResources);
      const level = this.getRandomLogLevel();
      const message = `${resource} operation`;

      const raw = JSON.stringify({
        time: timestamp.toISOString(),
        resourceType: resource,
        level,
        category: 'Administrative',
        operationName: `Microsoft.Compute/${resource}/action`,
        resultType: level === 'ERROR' ? 'Failed' : 'Success',
      });

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'azure:monitor',
        sourcetype: 'azure:monitor:log',
        subscription_id: this.generateUUID(),
        resource_group: 'production-rg',
        resource_type: resource,
        resource_name: `${resource.toLowerCase()}-${this.randomString(6)}`,
        level,
        message,
      });
    }

    return logs;
  }

  private generateWindowsEventLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const taskCategories = ['Application', 'Security', 'System'];
    const eventIds = [1000, 1001, 4624, 4625, 4672, 7036, 7040];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const taskCategory = this.getRandomElement(taskCategories);
      const eventId = this.getRandomElement(eventIds);
      const level = Math.random() > 0.8 ? 'ERROR' : 'INFO';
      const computer = this.getRandomElement(this.hosts);
      const user = this.getRandomElement(this.users);
      const message = `Event ${eventId} occurred`;

      const raw = `EventType: ${taskCategory} EventID: ${eventId} Level: ${level} Source: ${computer} User: ${user}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'windows:event',
        sourcetype: 'WinEventLog',
        event_id: eventId,
        task_category: taskCategory,
        keywords: taskCategory === 'Security' ? 'Audit Success' : 'Classic',
        computer,
        level,
        message,
        host: computer,
      });
    }

    return logs;
  }

  private generateFirewallLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
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
      const bytesSent = Math.floor(Math.random() * 10000);
      const bytesReceived = Math.floor(Math.random() * 10000);

      const raw = `${timestamp.toISOString()} firewall: src=${srcIp}:${srcPort} dst=${dstIp}:${dstPort} protocol=${protocol} action=${action}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'firewall',
        sourcetype: 'firewall:log',
        action,
        src_ip: srcIp,
        dst_ip: dstIp,
        src_port: srcPort,
        dst_port: dstPort,
        protocol,
        bytes_sent: bytesSent,
        bytes_received: bytesReceived,
        level: action === 'ALLOW' ? 'INFO' : 'WARN',
        message: `Firewall ${action} ${protocol} connection`,
      });
    }

    return logs;
  }

  private generateLoadBalancerLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'curl/7.68.0',
    ];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const clientIp = this.getRandomIP();
      const backendIp = this.getRandomIP();
      const status = this.getRandomElement(this.statusCodes);
      const method = this.getRandomElement(this.httpMethods);
      const uri = this.getRandomElement(this.endpoints);
      const requestTime = Math.random() * 100;
      const responseTime = status >= 500 ? Math.random() * 3000 : Math.random() * 500;
      const userAgent = this.getRandomElement(userAgents);

      const raw = `${timestamp.toISOString()} ${clientIp} -> ${backendIp} ${method} ${uri} ${status} ${responseTime.toFixed(3)}ms`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'loadbalancer',
        sourcetype: 'lb:access',
        client_ip: clientIp,
        backend_ip: backendIp,
        request_time: requestTime,
        response_time: responseTime,
        status,
        method,
        uri,
        user_agent: userAgent,
        level: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO',
        message: `${method} ${uri} returned ${status}`,
      });
    }

    return logs;
  }

  private generateRedisLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const commands = ['GET', 'SET', 'DEL', 'HGET', 'HSET', 'LPUSH', 'RPOP', 'ZADD'];
    const roles = ['master', 'slave'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const role = this.getRandomElement(roles);
      const command = this.getRandomElement(commands);
      const pid = Math.floor(Math.random() * 10000);
      const level = Math.random() > 0.9 ? 'WARN' : 'INFO';
      const message = `${command} executed`;

      const raw = `${timestamp.toISOString()} # ${role} ${pid}: ${command}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'redis',
        sourcetype: 'redis:log',
        role,
        pid,
        command,
        level,
        message,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generateMongoDBLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const components = ['COMMAND', 'QUERY', 'WRITE', 'NETWORK', 'STORAGE'];
    const operations = ['find', 'insert', 'update', 'delete', 'aggregate'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const component = this.getRandomElement(components);
      const operation = this.getRandomElement(operations);
      const context = `conn${Math.floor(Math.random() * 100)}`;
      const durationMs = Math.random() * 500;
      const level = durationMs > 100 ? 'WARN' : 'INFO';
      const message = `${operation} operation completed`;

      const raw = `${timestamp.toISOString()} ${level}  [${component}] [${context}] ${operation} ${durationMs.toFixed(2)}ms`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'mongodb',
        sourcetype: 'mongodb:log',
        component,
        context,
        operation,
        duration_ms: durationMs,
        level,
        message,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generateElasticsearchLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const indices = ['users', 'orders', 'products', 'logs', 'metrics'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const nodeName = `node-${Math.floor(Math.random() * 3)}`;
      const index = this.getRandomElement(indices);
      const level = Math.random() > 0.85 ? 'WARN' : 'INFO';
      const message = `Indexing operation on ${index}`;

      const raw = `${timestamp.toISOString()} [${level}] [${nodeName}] ${message}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'elasticsearch',
        sourcetype: 'elasticsearch:log',
        node_name: nodeName,
        cluster_name: 'production-cluster',
        index,
        level,
        message,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generateKafkaLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const topics = ['user-events', 'order-events', 'payment-events', 'notification-events'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const brokerId = Math.floor(Math.random() * 3);
      const topic = this.getRandomElement(topics);
      const partition = Math.floor(Math.random() * 3);
      const level = Math.random() > 0.9 ? 'WARN' : 'INFO';
      const message = `Message produced to ${topic}`;

      const raw = `${timestamp.toISOString()} [${level}] [broker-${brokerId}] ${topic}-${partition}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'kafka',
        sourcetype: 'kafka:log',
        broker_id: brokerId,
        topic,
        partition,
        level,
        message,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generatePrometheusMetrics(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const metrics = ['cpu_usage', 'memory_usage', 'disk_io', 'network_bytes', 'http_requests_total'];
    const jobs = ['api-server', 'database', 'cache', 'worker'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const metricName = this.getRandomElement(metrics);
      const value = Math.random() * 100;
      const job = this.getRandomElement(jobs);
      const instance = this.getRandomElement(this.hosts);
      const message = `${metricName}=${value.toFixed(2)}`;

      const raw = `${timestamp.toISOString()} ${metricName}{job="${job}",instance="${instance}"} ${value.toFixed(2)}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'prometheus',
        sourcetype: 'prometheus:metric',
        metric_name: metricName,
        value,
        job,
        instance,
        level: 'INFO',
        message,
        host: instance,
      });
    }

    return logs;
  }

  private generateNginxLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'curl/7.68.0',
    ];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const remoteAddr = this.getRandomIP();
      const method = this.getRandomElement(this.httpMethods);
      const uri = this.getRandomElement(this.endpoints);
      const status = this.getRandomElement(this.statusCodes);
      const bodyBytesSent = Math.floor(Math.random() * 50000);
      const requestTime = Math.random() * 1;
      const httpReferer = '-';
      const httpUserAgent = this.getRandomElement(userAgents);
      const request = `${method} ${uri} HTTP/1.1`;

      const raw = `${remoteAddr} - - [${timestamp.toISOString()}] "${request}" ${status} ${bodyBytesSent} "${httpReferer}" "${httpUserAgent}"`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'nginx',
        sourcetype: 'nginx:access',
        remote_addr: remoteAddr,
        request,
        status,
        body_bytes_sent: bodyBytesSent,
        http_referer: httpReferer,
        http_user_agent: httpUserAgent,
        request_time: requestTime,
        level: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO',
        message: `${method} ${uri} ${status}`,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generateApacheLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const remoteAddr = this.getRandomIP();
      const method = this.getRandomElement(this.httpMethods);
      const uri = this.getRandomElement(this.endpoints);
      const status = this.getRandomElement(this.statusCodes);
      const bytesSent = Math.floor(Math.random() * 50000);
      const request = `${method} ${uri} HTTP/1.1`;

      const raw = `${remoteAddr} - - [${timestamp.toISOString()}] "${request}" ${status} ${bytesSent}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'apache',
        sourcetype: 'apache:access',
        remote_addr: remoteAddr,
        request,
        status,
        bytes_sent: bytesSent,
        level: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO',
        message: `${method} ${uri} ${status}`,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  private generateApplicationLogs(count: number, timeRange: number): Log[] {
    const logs: Log[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - Math.random() * timeRange * 60 * 1000);
      const service = this.getRandomElement(this.services);
      const traceId = this.generateUUID();
      const spanId = this.randomString(16);
      const level = this.getRandomLogLevel();
      const method = this.getRandomElement(this.httpMethods);
      const endpoint = this.getRandomElement(this.endpoints);
      const statusCode = this.getRandomElement(this.statusCodes);
      const durationMs = Math.random() * 500;
      const userId = `user-${Math.floor(Math.random() * 1000)}`;
      const message = `${method} ${endpoint} completed`;

      const raw = `${timestamp.toISOString()} ${level} [${service}] [${traceId}] ${message} status=${statusCode} duration=${durationMs.toFixed(2)}ms user=${userId}`;

      logs.push({
        _time: timestamp.toISOString(),
        _raw: raw,
        source: 'application',
        sourcetype: 'app:log',
        service,
        trace_id: traceId,
        span_id: spanId,
        user_id: userId,
        method,
        endpoint,
        status_code: statusCode,
        duration_ms: durationMs,
        level,
        message,
        host: this.getRandomElement(this.hosts),
      });
    }

    return logs;
  }

  // Utility functions
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomLogLevel(): LogLevel {
    const rand = Math.random();
    if (rand < 0.6) return 'INFO';
    if (rand < 0.75) return 'DEBUG';
    if (rand < 0.85) return 'WARN';
    if (rand < 0.95) return 'ERROR';
    return 'TRACE';
  }

  private getRandomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  private randomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Export singleton instance
export const dataGenerator = new DataGenerator();
