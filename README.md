# AI Gateway - Unified AI Model Access

A smart gateway for unified access to AI models with multi-provider support, intelligent routing, and real-time streaming.

## Features

- Multi-provider: ArvanCloud, OpenRouter, Anthropic, OpenAI, Gemini, Groq
- Real-time streaming (4x faster than direct API)
- Smart routing with automatic provider selection
- Risk scoring system for provider health
- Automatic token rotation
- Comprehensive monitoring dashboard
- Iran-based server for low latency

## Quick Start

    git clone https://github.com/hooshedigital/aigateway.git
    cd aigateway
    npm install
    cp .env.example .env.local
    nano .env.local
    npm run build

## Architecture

    Client -> Supabase Edge Function -> Smart Router -> Providers
                                            |
                                  ArvanCloud, OpenRouter,
                                  Anthropic, OpenAI, etc.

## API Usage

    curl -X POST https://supabase.hooshedigital.ir/functions/v1/ai-gateway/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_ANON_KEY" \
      -d '{"model":"DeepSeek-V4-Flash","messages":[{"role":"user","content":"Hello!"}],"stream":true}'

## Performance

| Metric | Value |
|--------|-------|
| Non-stream response | ~3.2s |
| Stream TTFT | ~0.5s |
| Speed vs direct API | 4x faster |

## Supported Providers

| Provider | Models | Status |
|----------|--------|--------|
| ArvanCloud | DeepSeek-V4-Flash | Active |
| OpenRouter | GPT-4, Claude, Gemini | Ready |
| Anthropic | Claude 3.5 Sonnet | Ready |
| OpenAI | GPT-4o, GPT-4-turbo | Ready |
| Google | Gemini 1.5 Pro/Flash | Ready |
| Groq | Llama 3.3 70B | Ready |

## License

MIT License - see [LICENSE](LICENSE) file.

## Team

Hoosh Digital - https://hooshedigital.ir
