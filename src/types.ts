export interface Provider {
  id: string;
  name: string;
  type: "token_free" | "api_key";
  status: "active" | "inactive";
  api_key: string | null;
  base_url: string | null;
  models: string[];
  priority: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestLog {
  id: string;
  provider: string;
  model: string | null;
  status: "success" | "error";
  response_time: number | null;
  tokens_used: number;
  error_message: string | null;
  created_at: string;
}

export interface UsageStat {
  id: string;
  provider: string;
  date: string;
  requests_count: number;
  success_count: number;
  error_count: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface GatewayUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "viewer";
  status: "active" | "disabled";
  api_key: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  details: string | null;
  performed_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export interface BrowserSession {
  id: string;
  provider: string;
  account_name: string | null;
  token: string;
  status: "active" | "expired" | "rotating" | "quarantined" | "failed";
  health_score: number;
  requests_count: number;
  last_used: string | null;
  last_checked: string;
  expires_at: string | null;
  user_agent: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RiskScore {
  id: string;
  provider: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  success_rate: number;
  avg_response_time: number;
  error_pattern_score: number;
  detection_signals: number;
  quarantined: boolean;
  calculated_at: string;
  created_at: string;
}

export interface AlertConfig {
  id: string;
  key: string;
  value: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsagePattern {
  id: string;
  provider: string;
  hour_bucket: string;
  request_count: number;
  success_count: number;
  avg_response_time: number;
  unique_models: number;
  uniqueness_score: number;
  created_at: string;
}

export interface ModelPricing {
  id: string;
  provider: string;
  model: string;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostLog {
  id: string;
  provider: string;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  is_free: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  month: string;
  budget_amount: number;
  alert_threshold: number;
  current_spend: number;
  alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type Page = "dashboard" | "providers" | "requestLogs" | "settings" | "apiDocs" | "playground" | "users" | "auditLogs" | "sessions" | "riskMonitor" | "costAnalysis" | "guide";
