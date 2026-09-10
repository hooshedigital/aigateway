# Architecture

## Overview

AI Gateway is built as a serverless edge function running on the Deno runtime, backed by a Supabase (PostgreSQL) database. The frontend is a React SPA that communicates with the edge function for all API operations.

## System Diagram

```
+----------------------------------------------------------+
|                    Client Layer                          |
|       (bolt.diy / Custom UI / Any OpenAI client)         |
+--------------------------+-------------------------------+
                           | HTTPS + SSE
                           v
+----------------------------------------------------------+
|              Supabase Edge Function                      |
|            (Deno Runtime + Smart Routing)                |
|                                                          |
|  +------------+  +------------+  +----------------+     |
|  | Auth & RLS |  | Smart      |  | Stream         |     |
|  |            |  | Router     |  | Handler        |     |
|  +------------+  +------------+  +----------------+     |
|  +------------+  +------------+  +----------------+     |
|  | Risk Score |  | Token      |  | Logging &      |     |
|  | System     |  | Rotation   |  | Analytics      |     |
|  +------------+  +------------+  +----------------+     |
+--------------------------+-------------------------------+
                           |
            +---------+----+----+----------+----------+
            v         v       v          v          v
        ArvanCloud  OpenRouter  Anthropic  OpenAI  Gemini
```

## Components

### 1. Edge Function (Deno Runtime)

The core of the gateway. Runs on Supabase Edge Functions using the Deno runtime. Handles:

- **Request routing**: Parses incoming requests and routes to the appropriate handler.
- **Authentication**: Validates the Bearer token (access code) against the database.
- **Smart routing**: Selects the best provider based on priority, health score, and model support.
- **Streaming**: Manages Server-Sent Events (SSE) for real-time streaming responses.
- **Fallback**: Automatically retries with the next provider if one fails.
- **Logging**: Records every request with timing, tokens, and status.

### 2. Smart Router

The smart router selects a provider for each request using the following criteria:

1. **Model match**: Only providers that support the requested model are considered.
2. **Priority**: Lower priority numbers are tried first.
3. **Health score**: Providers with better health scores are preferred.
4. **Risk score**: Providers with high risk scores are deprioritized or quarantined.
5. **Active status**: Only active providers are considered.

If the selected provider fails (returns an error or times out), the router automatically falls back to the next provider in priority order.

### 3. Risk Scoring System

Each provider has a risk score from 0 to 100:

| Score Range | Level | Behavior |
|------------|-------|----------|
| 0-30 | Low | Normal routing |
| 31-60 | Medium | Reduced priority |
| 61-79 | High | Warning alerts |
| 80-100 | Critical | Auto-quarantine |

The score is calculated based on:
- Error rate over recent requests
- Response time trends
- Rate limit (429) occurrences
- Detection (403) occurrences

### 4. Token Rotation

For browser session providers (token-free), the gateway maintains a pool of sessions:

1. Each session has a token, expiry date, and health score.
2. Requests are distributed across sessions using least-recently-used selection.
3. When a session expires or is quarantined, the next session is activated.
4. Anti-detection features include User-Agent rotation, random delays, and request sanitization.

### 5. Database (PostgreSQL / Supabase)

All data is stored in PostgreSQL with Row Level Security (RLS) enabled on every table:

| Table | Purpose |
|-------|---------|
| `providers` | AI provider configurations |
| `browser_sessions` | Browser session tokens for token-free providers |
| `request_logs` | Request history and metrics |
| `gateway_settings` | Gateway configuration |
| `api_users` | API user management |
| `audit_logs` | Administrative action logs |
| `notifications` | System notifications |
| `risk_scores` | Provider risk scoring history |
| `cost_tracking` | Cost per request tracking |
| `model_pricing` | Model pricing configuration |
| `budgets` | Monthly budget tracking |

### 6. Frontend (React SPA)

The dashboard is a React 18 SPA built with Vite and Tailwind CSS:

- **Dashboard**: Overview charts and metrics
- **Providers**: Provider management
- **Sessions**: Browser session management
- **Logs**: Request log viewer
- **Risk Monitor**: Provider risk scoring
- **Cost Analysis**: Cost tracking and budgets
- **Settings**: Gateway configuration
- **Users**: User management
- **API Docs**: Interactive API documentation
- **Playground**: Test the gateway interactively
- **Guide**: Tutorials and onboarding

## Request Flow

1. Client sends a request to the gateway with `Authorization: Bearer ACCESS_CODE`.
2. The edge function validates the access code.
3. The smart router selects the best provider for the requested model.
4. The request is forwarded to the selected provider.
5. If streaming, SSE chunks are relayed to the client in real-time.
6. If the provider fails, the router falls back to the next provider.
7. The request is logged with timing, token usage, and status.
8. Risk scores and health metrics are updated.

## Security Model

- **Row Level Security**: Every database table has RLS enabled with per-user ownership policies.
- **JWT Authentication**: The access code is validated as a Bearer token.
- **No Hardcoded Keys**: All API keys are stored in the database, never in source code.
- **CORS**: Configurable allowed origins.
- **Rate Limiting**: Configurable per-client rate limits.
