/**
 * Defensive, dependency-free request handler for the Supabase Edge Function.
 * This is the React/Supabase AI Gateway, not the separate unverified FastAPI v3.4 service.
 */
export interface GatewayConfig {
  gatewayAccessToken?: string;
  providerApiKey?: string;
  allowedOrigin?: string;
  providerUrl?: string;
}

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const UPSTREAM_URL = "https://api.arvancloudai.ir/v1/chat/completions";
const DEFAULT_MODEL = "DeepSeek-V4-Flash";
const MAX_REQUEST_CHARS = 1_000_000;

function safeEqual(a: string, b: string): boolean {
  // The digest comparison prevents length-dependent character-by-character exits.
  // A gateway access token should be a high-entropy randomly generated secret.
  const enc = new TextEncoder();
  const left = enc.encode(a);
  const right = enc.encode(b);
  const len = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < len; i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

function json(data: unknown, status: number, headers: Headers): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

function routeOf(url: string): string {
  const path = new URL(url).pathname;
  const marker = "/ai-gateway";
  const at = path.lastIndexOf(marker);
  return at >= 0 ? path.slice(at + marker.length) || "/" : path;
}

export function createGatewayHandler(
  config: GatewayConfig,
  fetchImpl: FetchLike = fetch,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    const cors = new Headers({
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
      "Vary": "Origin",
    });

    // No permissive wildcard for authenticated responses. The optional CORS
    // origin must be an exact trusted origin; CLI clients do not require CORS.
    if (origin && config.allowedOrigin && origin === config.allowedOrigin) {
      cors.set("Access-Control-Allow-Origin", origin);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const route = routeOf(request.url);
    if (route === "/api/status" && request.method === "GET") {
      return json({ status: "ok" }, 200, cors);
    }

    const supported = (route === "/v1/models" && request.method === "GET") ||
      (route === "/v1/chat/completions" && request.method === "POST");
    if (!supported) return json({ error: "Not found" }, 404, cors);

    if (!config.gatewayAccessToken || !config.providerApiKey) {
      return json({ error: "Gateway is not configured" }, 503, cors);
    }

    const match = /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "");
    if (!match || !safeEqual(match[1], config.gatewayAccessToken)) {
      return json({ error: "Unauthorized" }, 401, cors);
    }

    if (route === "/v1/models") {
      return json({
        object: "list",
        data: [{ id: DEFAULT_MODEL, object: "model", owned_by: "arvancloud" }],
      }, 200, cors);
    }

    let payload: Record<string, unknown>;
    try {
      const raw = await request.text();
      if (raw.length > MAX_REQUEST_CHARS) return json({ error: "Request too large" }, 413, cors);
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return json({ error: "Invalid request body" }, 400, cors);
      }
      payload = parsed as Record<string, unknown>;
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    const messages = payload.messages;
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 200 ||
        !messages.every((item) => item && typeof item === "object" &&
          typeof item.role === "string" && (typeof item.content === "string" || Array.isArray(item.content)))) {
      return json({ error: "Invalid messages" }, 400, cors);
    }
    const model = payload.model ?? DEFAULT_MODEL;
    const temperature = payload.temperature ?? 0.7;
    const maxTokens = payload.max_tokens ?? 1000;
    const stream = payload.stream === true;
    if (typeof model !== "string" || !model.trim() || model.length > 128 ||
      typeof temperature !== "number" || !Number.isFinite(temperature) || temperature < 0 || temperature > 2 ||
      typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 32000 ||
      (payload.stream !== undefined && typeof payload.stream !== "boolean")) {
      return json({ error: "Invalid completion options" }, 400, cors);
    }

    try {
      const upstream = await fetchImpl(config.providerUrl ?? UPSTREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.providerApiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!upstream.ok) {
        // Do not return provider error bodies: they may contain internal details.
        return json({ error: "Upstream provider error", status: upstream.status }, 502, cors);
      }
      if (stream) {
        if (!upstream.body) return json({ error: "Empty provider stream" }, 502, cors);
        const headers = new Headers(cors);
        headers.set("Content-Type", "text/event-stream");
        headers.set("Cache-Control", "no-cache");
        headers.set("X-Content-Type-Options", "nosniff");
        return new Response(upstream.body, { status: 200, headers });
      }
      const data = await upstream.text();
      const headers = new Headers(cors);
      headers.set("Content-Type", "application/json");
      headers.set("Cache-Control", "no-store");
      return new Response(data, { status: 200, headers });
    } catch {
      return json({ error: "Provider is unavailable" }, 502, cors);
    }
  };
}
