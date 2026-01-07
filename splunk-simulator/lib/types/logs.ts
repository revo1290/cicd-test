// Log type definitions for Splunk Training Simulator

export interface BaseLog {
  _time: string;
  _raw: string;
  source: string;
  sourcetype: string;
  level?: string;
  message?: string;
  host?: string;
}

export interface KubernetesLog extends BaseLog {
  source: 'kubernetes';
  sourcetype: 'kube:container:log';
  namespace: string;
  pod: string;
  container: string;
  cluster: string;
}

export interface DockerLog extends BaseLog {
  source: 'docker';
  sourcetype: 'docker:container:log';
  container_id: string;
  container_name: string;
  image: string;
}

export interface AWSLog extends BaseLog {
  source: 'aws:cloudwatch';
  sourcetype: 'aws:cloudwatch:log';
  aws_region: string;
  aws_service: string;
  log_group: string;
  log_stream: string;
}

export interface AzureLog extends BaseLog {
  source: 'azure:monitor';
  sourcetype: 'azure:monitor:log';
  subscription_id: string;
  resource_group: string;
  resource_type: string;
  resource_name: string;
}

export interface WindowsEventLog extends BaseLog {
  source: 'windows:event';
  sourcetype: 'WinEventLog';
  event_id: number;
  task_category: string;
  keywords: string;
  computer: string;
}

export interface FirewallLog extends BaseLog {
  source: 'firewall';
  sourcetype: 'firewall:log';
  action: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  bytes_sent: number;
  bytes_received: number;
}

export interface LoadBalancerLog extends BaseLog {
  source: 'loadbalancer';
  sourcetype: 'lb:access';
  client_ip: string;
  backend_ip: string;
  request_time: number;
  response_time: number;
  status: number;
  method: string;
  uri: string;
  user_agent: string;
}

export interface RedisLog extends BaseLog {
  source: 'redis';
  sourcetype: 'redis:log';
  role: string;
  pid: number;
  command: string;
}

export interface MongoDBLog extends BaseLog {
  source: 'mongodb';
  sourcetype: 'mongodb:log';
  component: string;
  context: string;
  operation?: string;
  duration_ms?: number;
}

export interface ElasticsearchLog extends BaseLog {
  source: 'elasticsearch';
  sourcetype: 'elasticsearch:log';
  node_name: string;
  cluster_name: string;
  index?: string;
}

export interface KafkaLog extends BaseLog {
  source: 'kafka';
  sourcetype: 'kafka:log';
  broker_id: number;
  topic?: string;
  partition?: number;
}

export interface PrometheusMetric extends BaseLog {
  source: 'prometheus';
  sourcetype: 'prometheus:metric';
  metric_name: string;
  value: number;
  job: string;
  instance: string;
}

export interface NginxLog extends BaseLog {
  source: 'nginx';
  sourcetype: 'nginx:access';
  remote_addr: string;
  request: string;
  status: number;
  body_bytes_sent: number;
  http_referer: string;
  http_user_agent: string;
  request_time: number;
}

export interface ApacheLog extends BaseLog {
  source: 'apache';
  sourcetype: 'apache:access';
  remote_addr: string;
  request: string;
  status: number;
  bytes_sent: number;
}

export interface ApplicationLog extends BaseLog {
  source: 'application';
  sourcetype: 'app:log';
  service: string;
  trace_id: string;
  span_id: string;
  user_id?: string;
  method?: string;
  endpoint?: string;
  status_code?: number;
  duration_ms?: number;
}

export type Log =
  | KubernetesLog
  | DockerLog
  | AWSLog
  | AzureLog
  | WindowsEventLog
  | FirewallLog
  | LoadBalancerLog
  | RedisLog
  | MongoDBLog
  | ElasticsearchLog
  | KafkaLog
  | PrometheusMetric
  | NginxLog
  | ApacheLog
  | ApplicationLog;

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';

export type LogSource =
  | 'kubernetes'
  | 'docker'
  | 'aws:cloudwatch'
  | 'azure:monitor'
  | 'windows:event'
  | 'firewall'
  | 'loadbalancer'
  | 'redis'
  | 'mongodb'
  | 'elasticsearch'
  | 'kafka'
  | 'prometheus'
  | 'nginx'
  | 'apache'
  | 'application';
