---
name: AI Gateway
version: 1.2.0
type: open-source-project
category: ai-infrastructure
languages:
  - TypeScript
  - React
  - SQL
  - Deno
stack:
  frontend: React 18 + Vite + TypeScript + Tailwind CSS
  backend: Deno Edge Functions (Supabase)
  database: PostgreSQL (Supabase Self-hosted)
  deployment: Docker + Docker Compose
license: MIT
status: production
live_demo: https://aigateway.hooshedigital.ir
repository: https://github.com/hooshedigital/aigateway
team: Hoosh Digital
team_url: https://hooshedigital.ir
---

# AI Guide for AI Agents

AI Gateway is an open-source, self-hosted intelligent proxy that unifies access to multiple AI providers (ArvanCloud, OpenRouter, Anthropic, OpenAI, Google Gemini, Groq) through a single OpenAI-compatible API. It provides smart routing with automatic failover, real-time streaming via Server-Sent Events (4x faster than direct API calls), risk scoring and auto-quarantine of unhealthy providers, token rotation for browser sessions, and a full analytics dashboard with cost tracking.

## Core Capabilities

1. **Multi-Provider Routing**: Route requests to 6 AI providers through one API endpoint, with priority-based selection and automatic fallback.
2. **Real-time Streaming**: Server-Sent Events (SSE) streaming with 40x faster first-token times (0.5s vs 20.49s direct).
3. **Smart Routing**: Automatic provider selection based on health score, risk level, response time, and cost.
4. **Risk Scoring**: 0-100 risk score per provider with automatic quarantine at critical thresholds.
5. **Token Rotation**: Automatic rotation of browser session tokens to avoid detection and rate limits.
6. **Analytics Dashboard**: Real-time monitoring with request logs, cost analysis, provider health, and usage charts.
7. **OpenAI Compatibility**: Fully compatible with the OpenAI API format. Any OpenAI-compatible client works without modification.
8. **Security**: Row Level Security (RLS) on all database tables, JWT authentication, no hardcoded API keys.

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript 5.5, Tailwind CSS 3.4 |
| Backend | Deno Runtime (Supabase Edge Functions) |
| Database | PostgreSQL 15 (Supabase Self-hosted) |
| Auth | Supabase Auth (JWT, RLS) |
| Deployment | Docker, Docker Compose |
| Icons | lucide-react |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/chat/completions` | Chat completion (streaming and non-streaming) |
| GET | `/v1/models` | List available models |
| GET | `/api/providers` | List configured providers |
| POST | `/api/providers` | Create provider |
| PUT | `/api/providers/:id` | Update provider |
| DELETE | `/api/providers/:id` | Delete provider |
| GET | `/api/sessions` | List browser sessions |
| POST | `/api/sessions` | Create session |
| PUT | `/api/sessions/:id` | Update session |
| DELETE | `/api/sessions/:id` | Delete session |
| GET | `/api/logs` | Request logs |
| GET | `/api/settings` | Gateway settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/users` | List users |
| GET | `/api/risk-scores` | Provider risk scores |
| GET | `/api/cost-summary` | Cost analysis summary |

Base URL: `https://supabase.hooshedigital.ir/functions/v1/ai-gateway`

Authentication: `Authorization: Bearer YOUR_ACCESS_CODE`

## Supported Providers

| Provider | Models | Type |
|---------|--------|------|
| ArvanCloud | DeepSeek-V4-Flash | API Key |
| OpenRouter | GPT-4, Claude, Gemini, Llama | API Key |
| Anthropic | Claude 3.5 Sonnet, Opus, Haiku | API Key |
| OpenAI | GPT-4o, GPT-4-turbo | API Key |
| Google | Gemini 1.5 Pro, Flash | API Key |
| Groq | Llama 3.3 70B | API Key |

## File Structure

```
aigateway/
  src/
    components/        # React UI components
    contexts/          # React context providers
    lib/               # Supabase client
    pages/             # Page components (Dashboard, Providers, etc.)
    types.ts           # TypeScript types
    i18n.ts            # Bilingual translations (EN/FA)
    App.tsx            # Main app
  supabase/
    functions/
      ai-gateway/      # Deno Edge Function
        index.ts       # Main gateway handler
    migrations/        # SQL migrations
    config.toml        # Supabase config
  docs/                # Documentation
  assets/              # Logo and images
  .github/             # GitHub templates and workflows
```

## Quick Start Commands

```bash
git clone https://github.com/hooshedigital/aigateway.git
cd aigateway
npm install
cp .env.example .env.local
npm run build
supabase functions deploy ai-gateway --no-verify-jwt
```

## Performance Benchmarks

| Metric | Direct API | AI Gateway | Improvement |
|--------|-----------|------------|-------------|
| Non-streaming | 3.33s | 3.16s | 5% faster |
| Stream TTFT | 20.49s | 0.5s | 40x faster |
| Stream total | 20.49s | 4.93s | 4x faster |
