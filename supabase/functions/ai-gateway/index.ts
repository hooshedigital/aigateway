import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Provider {
  id: string;
  name: string;
  type: "token_free" | "api_key";
  status: "active" | "inactive";
  api_key: string | null;
  base_url: string | null;
  models: string[];
  priority: number;
  config: Record<string, unknown>;
}

interface BrowserSession {
  id: string;
  provider: string;
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
}

interface RiskScore {
  id: string;
  provider: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  success_rate: number;
  avg_response_time: number;
  error_pattern_score: number;
  detection_signals: number;
  quarantined: boolean;
}

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ─── Settings & Config ───────────────────────────────────────────

async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

async function getAlertConfig(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("alert_config")
    .select("value, enabled")
    .eq("key", key)
    .maybeSingle();
  if (!data || !data.enabled) return null;
  return data.value ?? null;
}

async function getActiveProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("status", "active")
    .order("priority", { ascending: true });
  if (error) return [];
  return (data as Provider[]) ?? [];
}

async function verifyAccess(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  const accessCode = await getSetting("access_code");
  return token === accessCode;
}

// ─── Logging & Stats ─────────────────────────────────────────────

async function logRequest(
  provider: string,
  model: string,
  status: "success" | "error",
  responseTime: number,
  tokensUsed: number,
  errorMessage?: string
) {
  await supabase.from("request_logs").insert({
    provider,
    model,
    status,
    response_time: responseTime,
    tokens_used: tokensUsed,
    error_message: errorMessage ?? null,
  });

  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("usage_stats")
    .select("*")
    .eq("provider", provider)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    const updates = status === "success"
      ? { requests_count: existing.requests_count + 1, success_count: existing.success_count + 1, tokens_used: existing.tokens_used + tokensUsed }
      : { requests_count: existing.requests_count + 1, error_count: existing.error_count + 1 };
    await supabase.from("usage_stats").update(updates).eq("id", existing.id);
  } else {
    await supabase.from("usage_stats").insert({
      provider,
      date: today,
      requests_count: 1,
      success_count: status === "success" ? 1 : 0,
      error_count: status === "error" ? 1 : 0,
      tokens_used: status === "success" ? tokensUsed : 0,
    });
  }

  // Update usage patterns (hourly bucket)
  const hourBucket = new Date().toISOString().slice(0, 13) + ":00:00";
  const { data: patternExisting } = await supabase
    .from("usage_patterns")
    .select("*")
    .eq("provider", provider)
    .eq("hour_bucket", hourBucket)
    .maybeSingle();

  if (patternExisting) {
    const newCount = patternExisting.request_count + 1;
    const newSuccess = patternExisting.success_count + (status === "success" ? 1 : 0);
    const newAvgRt = (patternExisting.avg_response_time * patternExisting.request_count + responseTime) / newCount;
    await supabase.from("usage_patterns").update({
      request_count: newCount,
      success_count: newSuccess,
      avg_response_time: newAvgRt,
    }).eq("id", patternExisting.id);
  } else {
    await supabase.from("usage_patterns").insert({
      provider,
      hour_bucket: hourBucket,
      request_count: 1,
      success_count: status === "success" ? 1 : 0,
      avg_response_time: responseTime,
    });
  }
}

// ─── Risk Scoring ─────────────────────────────────────────────────

async function calculateRiskScore(providerName: string): Promise<RiskScore | null> {
  // Get last 100 requests for this provider
  const { data: logs } = await supabase
    .from("request_logs")
    .select("status, response_time, created_at")
    .eq("provider", providerName)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!logs || logs.length === 0) return null;

  const total = logs.length;
  const successes = logs.filter((l: { status: string }) => l.status === "success").length;
  const errors = total - successes;
  const successRate = (successes / total) * 100;

  const responseTimes = logs
    .filter((l: { response_time: number | null }) => l.response_time !== null)
    .map((l: { response_time: number | null }) => l.response_time as number);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
    : 0;

  // Error pattern score: recent errors weighted more heavily
  const recentErrors = logs.slice(0, 10).filter((l: { status: string }) => l.status === "error").length;
  const errorPatternScore = (recentErrors / 10) * 100;

  // Detection signals: count of 429/403-like errors
  const detectionSignals = logs.filter((l: { status: string }) => l.status === "error").slice(0, 20).length;

  // Risk score formula: weighted combination
  const riskScore = Math.min(100, Math.round(
    (100 - successRate) * 0.4 +
    errorPatternScore * 0.3 +
    Math.min(detectionSignals * 5, 50) * 0.3
  ));

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (riskScore >= 90) riskLevel = "critical";
  else if (riskScore >= 70) riskLevel = "high";
  else if (riskScore >= 40) riskLevel = "medium";

  // Check if auto-quarantine is enabled
  const autoQuarantine = await getAlertConfig("auto_quarantine");
  const criticalThreshold = parseInt((await getAlertConfig("risk_threshold_critical")) ?? "90");
  const quarantined = autoQuarantine === "true" && riskScore >= criticalThreshold;

  // Insert new risk score
  const { data } = await supabase.from("risk_scores").insert({
    provider: providerName,
    risk_level: riskLevel,
    risk_score: riskScore,
    success_rate: successRate,
    avg_response_time: avgResponseTime,
    error_pattern_score: errorPatternScore,
    detection_signals: detectionSignals,
    quarantined,
    calculated_at: new Date().toISOString(),
  }).select().single();

  // Fire alert if risk is high or critical
  if (riskLevel === "high" || riskLevel === "critical") {
    await fireAlert("risk_alert", `Provider ${providerName} has ${riskLevel} risk score: ${riskScore}`);
  }

  return data as RiskScore;
}

async function getProviderRiskScore(providerName: string): Promise<RiskScore | null> {
  const { data } = await supabase
    .from("risk_scores")
    .select("*")
    .eq("provider", providerName)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as RiskScore | null;
}

// ─── Alert System ─────────────────────────────────────────────────

async function fireAlert(event: string, message: string): Promise<void> {
  const webhookUrl = await getAlertConfig("webhook_url");
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          message,
          timestamp: new Date().toISOString(),
          source: "ai-gateway",
        }),
      });
    } catch { /* ignore webhook errors */ }
  }

  // Also create a notification
  const alertType = event.includes("detection") ? "error" : event.includes("expiry") ? "warning" : "warning";
  await supabase.from("notifications").insert({
    type: alertType,
    title: event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    message,
    read: false,
  });
}

// ─── Session Pool Management ──────────────────────────────────────

async function getActiveSession(providerName: string): Promise<BrowserSession | null> {
  const { data } = await supabase
    .from("browser_sessions")
    .select("*")
    .eq("provider", providerName)
    .eq("status", "active")
    .order("last_used", { ascending: true, nullsFirst: true })
    .limit(1)
    .maybeSingle();
  return data as BrowserSession | null;
}

async function updateSessionUsage(sessionId: string): Promise<void> {
  const { data: session } = await supabase
    .from("browser_sessions")
    .select("requests_count")
    .eq("id", sessionId)
    .maybeSingle();

  if (session) {
    const newCount = session.requests_count + 1;
    const maxRequests = parseInt((await getAlertConfig("max_requests_per_session")) ?? "100");

    if (newCount >= maxRequests) {
      // Auto-rotate: mark as rotating, then expired
      await supabase.from("browser_sessions").update({
        status: "expired",
        requests_count: newCount,
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);

      if ((await getAlertConfig("alert_on_session_expiry")) !== null) {
        await fireAlert("session_expiry", `Session ${sessionId} expired after ${newCount} requests`);
      }
    } else {
      await supabase.from("browser_sessions").update({
        requests_count: newCount,
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);
    }
  }
}

async function checkSessionHealth(session: BrowserSession): Promise<boolean> {
  // Check if expired by time
  if (session.expires_at) {
    const expiry = new Date(session.expires_at).getTime();
    if (Date.now() > expiry) {
      await supabase.from("browser_sessions").update({
        status: "expired",
        updated_at: new Date().toISOString(),
      }).eq("id", session.id);
      return false;
    }
  }

  // Check health score threshold
  if (session.health_score < 30) {
    await supabase.from("browser_sessions").update({
      status: "failed",
      updated_at: new Date().toISOString(),
    }).eq("id", session.id);
    return false;
  }

  return true;
}

// ─── Anti-Detection ───────────────────────────────────────────────

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getRandomDelay(min: number = 100, max: number = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sanitizeRequest(body: ChatRequest): ChatRequest {
  // Remove any identifying metadata, normalize patterns
  return {
    model: body.model,
    messages: body.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: body.temperature ?? 0.7,
    max_tokens: body.max_tokens ?? 4096,
    stream: body.stream ?? false,
  };
}

// ─── Provider Calling ─────────────────────────────────────────────

function buildHeaders(provider: Provider, session?: BrowserSession | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.type === "token_free" && session) {
    // Browser session: use token as cookie or auth
    headers["Authorization"] = `Bearer ${session.token}`;
    headers["User-Agent"] = session.user_agent || getRandomUserAgent();
    if (session.ip_address) {
      headers["X-Forwarded-For"] = session.ip_address;
    }
  } else {
    headers["Authorization"] = `Bearer ${provider.api_key}`;
  }

  if (provider.name === "OpenRouter") {
    headers["HTTP-Referer"] = "https://aigateway.hooshedigital.ir";
    headers["X-Title"] = "AI Gateway";
  }

  return headers;
}

async function callProvider(
  provider: Provider,
  body: ChatRequest,
  session?: BrowserSession | null
): Promise<{ ok: boolean; data?: unknown; error?: string; tokens?: number; stream?: ReadableStream<Uint8Array> }> {
  if (provider.type === "token_free") {
    if (!session) {
      return { ok: false, error: "No active browser session available for token-free provider" };
    }
    const isHealthy = await checkSessionHealth(session);
    if (!isHealthy) {
      return { ok: false, error: "Browser session is expired or unhealthy" };
    }
  }

  if (provider.type === "api_key" && !provider.api_key) {
    return { ok: false, error: "No API key configured" };
  }

  const baseUrl = provider.base_url || "https://api.openai.com/v1";
  const url = `${baseUrl}/chat/completions`;

  try {
    // Anti-detection: random delay before request
    if (provider.type === "token_free") {
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
    }

    const headers = buildHeaders(provider, session);
    const sanitizedBody = sanitizeRequest(body);
    const requestBody = {
      model: sanitizedBody.model,
      messages: sanitizedBody.messages,
      temperature: sanitizedBody.temperature,
      max_tokens: sanitizedBody.max_tokens,
      stream: sanitizedBody.stream,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Detection signals: 403, 429 indicate possible detection
      if (response.status === 403 || response.status === 429) {
        if (session) {
          await supabase.from("browser_sessions").update({
            health_score: Math.max(0, session.health_score - 20),
            updated_at: new Date().toISOString(),
          }).eq("id", session.id);
        }

        const alertOnDetection = await getAlertConfig("alert_on_detection");
        if (alertOnDetection !== null) {
          await fireAlert("detection", `Provider ${provider.name} returned ${response.status} - possible detection`);
        }
      }

      return { ok: false, error: `Provider error (${response.status}): ${errorText}` };
    }

    // Update session usage for token-free providers
    if (provider.type === "token_free" && session) {
      await updateSessionUsage(session.id);
    }

    if (body.stream && response.body) {
      return { ok: true, stream: response.body, tokens: 0 };
    }

    const data = await response.json();
    const tokens = data.usage?.total_tokens ?? 0;
    return { ok: true, data, tokens };
  } catch (err) {
    return { ok: false, error: `Network error: ${(err as Error).message}` };
  }
}

// ─── Smart Routing ────────────────────────────────────────────────

async function getSortedProviders(providers: Provider[], model: string): Promise<Provider[]> {
  // Filter providers that support the model
  const compatible = providers.filter(
    (p) => p.models.includes(model) || p.models.includes("*")
  );

  if (compatible.length === 0) return [];

  // Get risk scores for all compatible providers
  const riskScores = new Map<string, RiskScore>();
  for (const p of compatible) {
    const score = await getProviderRiskScore(p.name);
    if (score) riskScores.set(p.name, score);
  }

  // Sort by: quarantined last, then by risk score (lower = better), then by priority
  const sorted = [...compatible].sort((a, b) => {
    const ra = riskScores.get(a.name);
    const rb = riskScores.get(b.name);

    // Quarantined providers go last
    if (ra?.quarantined && !rb?.quarantined) return 1;
    if (!ra?.quarantined && rb?.quarantined) return -1;

    // Then by risk score (lower is better)
    const riskA = ra?.risk_score ?? 0;
    const riskB = rb?.risk_score ?? 0;
    if (riskA !== riskB) return riskA - riskB;

    // Then by original priority
    return a.priority - b.priority;
  });

  return sorted;
}

// ─── Handlers ─────────────────────────────────────────────────────

async function handleChatCompletions(body: ChatRequest): Promise<Response> {
  const providers = await getActiveProviders();

  if (providers.length === 0) {
    return new Response(
      JSON.stringify({ error: "No active providers configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Smart routing: sort providers by risk score and health
  const sortedProviders = await getSortedProviders(providers, body.model);

  if (sortedProviders.length === 0) {
    return new Response(
      JSON.stringify({ error: `No provider supports model: ${body.model}` }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const errors: string[] = [];

  for (const provider of sortedProviders) {
    // Get browser session for token-free providers
    let session: BrowserSession | null = null;
    if (provider.type === "token_free") {
      session = await getActiveSession(provider.name);
      if (!session) {
        errors.push(`${provider.name}: No active browser session`);
        continue;
      }
    }

    const startTime = Date.now();
    const result = await callProvider(provider, body, session);
    const elapsed = (Date.now() - startTime) / 1000;

    if (result.ok) {
      await logRequest(provider.name, body.model, "success", elapsed, result.tokens ?? 0);

      // Periodically recalculate risk score (every 10 requests)
      const { count } = await supabase
        .from("request_logs")
        .select("*", { count: "exact", head: true })
        .eq("provider", provider.name);
      if (count !== null && count % 10 === 0) {
        await calculateRiskScore(provider.name);
      }

      if (result.stream) {
        const stream = new ReadableStream({
          async start(controller) {
            const reader = result.stream!.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
            } finally {
              controller.close();
            }
          },
        });
        return new Response(stream, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    errors.push(`${provider.name}: ${result.error}`);
    await logRequest(provider.name, body.model, "error", elapsed, 0, result.error);

    // Recalculate risk score on error
    await calculateRiskScore(provider.name);

    // Fire alert if provider down
    const alertOnDown = await getAlertConfig("alert_on_provider_down");
    if (alertOnDown !== null) {
      await fireAlert("provider_down", `Provider ${provider.name} failed: ${result.error}`);
    }
  }

  return new Response(
    JSON.stringify({
      error: "All providers failed",
      details: errors,
    }),
    { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleModels(): Promise<Response> {
  const providers = await getActiveProviders();
  const modelSet = new Set<string>();

  for (const p of providers) {
    for (const m of p.models) {
      if (m !== "*") modelSet.add(m);
    }
  }

  const models = Array.from(modelSet).map((id) => ({
    id,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: "ai-gateway",
  }));

  return new Response(JSON.stringify({ object: "list", data: models }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleStatus(): Promise<Response> {
  const providers = await getActiveProviders();
  const { count: totalRequests } = await supabase
    .from("request_logs")
    .select("*", { count: "exact", head: true });

  const { count: totalErrors } = await supabase
    .from("request_logs")
    .select("*", { count: "exact", head: true })
    .eq("status", "error");

  // Get session pool stats
  const { count: activeSessions } = await supabase
    .from("browser_sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: quarantinedSessions } = await supabase
    .from("browser_sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "quarantined");

  // Get risk stats
  const { data: riskData } = await supabase
    .from("risk_scores")
    .select("provider, risk_level, risk_score, quarantined")
    .order("calculated_at", { ascending: false })
    .limit(20);

  // Deduplicate by provider (keep latest)
  const latestRisk = new Map<string, { risk_level: string; risk_score: number; quarantined: boolean }>();
  for (const r of riskData ?? []) {
    if (!latestRisk.has(r.provider)) {
      latestRisk.set(r.provider, { risk_level: r.risk_level, risk_score: r.risk_score, quarantined: r.quarantined });
    }
  }

  return new Response(
    JSON.stringify({
      status: "operational",
      active_providers: providers.length,
      total_requests: totalRequests ?? 0,
      total_errors: totalErrors ?? 0,
      streaming_enabled: true,
      session_pool: {
        active: activeSessions ?? 0,
        quarantined: quarantinedSessions ?? 0,
      },
      risk_monitoring: {
        providers: Array.from(latestRisk.entries()).map(([name, r]) => ({
          provider: name,
          risk_level: r.risk_level,
          risk_score: r.risk_score,
          quarantined: r.quarantined,
        })),
      },
      providers: providers.map((p) => ({
        name: p.name,
        type: p.type,
        priority: p.priority,
        models: p.models,
      })),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSessions(): Promise<Response> {
  const { data } = await supabase
    .from("browser_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  return new Response(JSON.stringify({ sessions: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleHealth(): Promise<Response> {
  const providers = await getActiveProviders();
  const healthPromises = providers.map(async (p) => {
    const risk = await getProviderRiskScore(p.name);
    return {
      provider: p.name,
      status: risk?.quarantined ? "quarantined" : "healthy",
      risk_level: risk?.risk_level ?? "low",
      risk_score: risk?.risk_score ?? 0,
      success_rate: risk?.success_rate ?? 100,
    };
  });
  const health = await Promise.all(healthPromises);

  return new Response(JSON.stringify({ providers: health }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleRisk(): Promise<Response> {
  const { data } = await supabase
    .from("risk_scores")
    .select("*")
    .order("calculated_at", { ascending: false })
    .limit(50);

  return new Response(JSON.stringify({ risk_scores: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleRotate(req: Request): Promise<Response> {
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.session_id;

    if (sessionId) {
      // Rotate specific session
      await supabase.from("browser_sessions").update({
        status: "rotating",
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);

      setTimeout(async () => {
        await supabase.from("browser_sessions").update({
          status: "active",
          requests_count: 0,
          updated_at: new Date().toISOString(),
        }).eq("id", sessionId);
      }, 1000);

      return new Response(JSON.stringify({ message: "Session rotation initiated", session_id: sessionId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rotate all active sessions
    await supabase.from("browser_sessions")
      .update({ status: "rotating", updated_at: new Date().toISOString() })
      .eq("status", "active");

    setTimeout(async () => {
      await supabase.from("browser_sessions")
        .update({ status: "active", requests_count: 0, updated_at: new Date().toISOString() })
        .eq("status", "rotating");
    }, 1000);

    return new Response(JSON.stringify({ message: "All sessions rotation initiated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── Main Server ──────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/ai-gateway", "");

    const isGatewayEndpoint = path.startsWith("/v1/");
    if (isGatewayEndpoint) {
      const authHeader = req.headers.get("Authorization");
      if (!(await verifyAccess(authHeader))) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: invalid or missing access code" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (path === "/v1/chat/completions" && req.method === "POST") {
      const body = (await req.json()) as ChatRequest;
      return await handleChatCompletions(body);
    }

    if (path === "/v1/models" && req.method === "GET") {
      return await handleModels();
    }

    if (path === "/api/status" && req.method === "GET") {
      return await handleStatus();
    }

    if (path === "/api/sessions" && req.method === "GET") {
      return await handleSessions();
    }

    if (path === "/api/health" && req.method === "GET") {
      return await handleHealth();
    }

    if (path === "/api/risk" && req.method === "GET") {
      return await handleRisk();
    }

    if (path === "/api/rotate" && req.method === "POST") {
      return await handleRotate(req);
    }

    return new Response(
      JSON.stringify({ error: "Not found", path }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
