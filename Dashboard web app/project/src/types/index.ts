export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'observer';
  active: boolean;
  createdAt: string;
}

export interface MonitoringEvent {
  id: string;
  type: 'error' | 'change' | 'sensitive_data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  filePath?: string;
  timestamp: string;
  resolved: boolean;
}

export interface MonitoringConfig {
  watchPaths: string[];
  excludePatterns: string[];
  emailNotifications: boolean;
  sensitiveDataPatterns: string[];
  notificationRoles: ('admin' | 'developer' | 'observer')[];
}

export interface SystemStats {
  totalEvents: number;
  activeAlerts: number;
  resolvedIssues: number;
  monitoredFiles: number;
  uptime: string;
  lastUpdate: string;
}