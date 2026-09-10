<div align="center">

<img src="assets/logo.svg" width="120" alt="AI Gateway"/>

# AI Gateway

### Unified, Intelligent Access to Every AI Model

**One API. Every Model. Zero Complexity.**

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/hooshedigital/aigateway/releases)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Self--Hosted-3ECF8E?logo=supabase)](https://supabase.com)
[![Status](https://img.shields.io/badge/Status-Production-success.svg)](https://aigateway.hooshedigital.ir)

[![Live Demo](https://img.shields.io/badge/-Live_Demo-FF6B6B?style=for-the-badge)](https://aigateway.hooshedigital.ir)
[![Documentation](https://img.shields.io/badge/-Docs-4ECDC4?style=for-the-badge)](docs/)
[![AI Guide](https://img.shields.io/badge/-AI_Guide-9B59B6?style=for-the-badge)](AI_GUIDE.md)
[![API Reference](https://img.shields.io/badge/-API_Reference-F39C12?style=for-the-badge)](docs/API.md)

[English](README.md) | [فارسی](README.fa.md)

</div>

---

## 🎯 What is AI Gateway?

**AI Gateway** is an open-source, self-hosted intelligent proxy that provides **unified access to multiple AI providers** through a single, OpenAI-compatible API. It features smart routing, real-time streaming, and automatic failover.

Built for performance: **4x faster responses** than direct API calls.

```mermaid
graph LR
    A[Your App] --> B[AI Gateway]
    B --> C{Smart Router}
    C --> D[ArvanCloud]
    C --> E[OpenRouter]
    C --> F[Anthropic]
    C --> G[OpenAI]
    C --> H[Gemini]
    C --> I[Groq]
    
    style B fill:#4ECDC4,stroke:#333,stroke-width:3px
    style C fill:#FF6B6B,stroke:#333,stroke-width:2px

✨ Key Features
Feature	Description	Status
🌐 Multi-Provider	ArvanCloud, OpenRouter, Anthropic, OpenAI, Gemini, Groq	✅ Active
⚡ Real-time Streaming	Server-Sent Events with 4x speed	✅ Active
🎯 Smart Routing	Auto-select best provider by health/cost	✅ Active
🛡️ Risk Scoring	Detect unhealthy providers	✅ Active
🔄 Token Rotation	Auto-replace expired tokens	✅ Active
📊 Analytics Dashboard	Real-time monitoring	✅ Active
🇮🇷 Iran-Based	Low latency for Iranian users	✅ Active
🔒 Secure	RLS, JWT, no hardcoded keys	✅ Active
📊 Performance Benchmarks
Metric	Direct API	AI Gateway	Improvement
Non-stream	3.33s	3.16s	5% faster
Stream TTFT	20.49s	0.5s	40x faster
Stream total	20.49s	4.93s	4x faster
Concurrent	Limited	Optimized	Pooled
🚀 Quick Start
Prerequisites

    Node.js 18+

    Docker & Docker Compose

    Supabase (Self-hosted or Cloud)

Installation
bash

git clone https://github.com/hooshedigital/aigateway.git
cd aigateway
npm install
cp .env.example .env.local
nano .env.local
npm run build
supabase functions deploy ai-gateway --no-verify-jwt

First Request
bash

curl -X POST https://supabase.hooshedigital.ir/functions/v1/ai-gateway/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'

🏗️ Architecture
text

┌────────────────────────────────────────────────────────┐
│                  Client Layer                           │
│       (bolt.diy / Custom UI / Any OpenAI client)      │
└──────────────────────┬─────────────────────────────────┘
                       │ HTTPS + SSE
                       ▼
┌────────────────────────────────────────────────────────┐
│            Supabase Edge Function                       │
│          (Deno Runtime + Smart Routing)                 │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │ Auth & RLS │  │ Smart      │  │ Stream         │   │
│  │            │  │ Router     │  │ Handler        │   │
│  └────────────┘  └────────────┘  └────────────────┘   │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │ Risk Score │  │ Token      │  │ Logging &      │   │
│  │ System     │  │ Rotation   │  │ Analytics      │   │
│  └────────────┘  └────────────┘  └────────────────┘   │
└──────────────────────┬─────────────────────────────────┘
                       │
         ┌─────────┬───┴───┬──────────┬──────────┐
         ▼         ▼       ▼          ▼          ▼
     ArvanCloud OpenRouter Anthropic  OpenAI  Gemini

Details: docs/ARCHITECTURE.md
🌐 Supported Providers
Provider	Models	Base URL	Status
🇮🇷 ArvanCloud	DeepSeek-V4-Flash	api.arvancloudai.ir	✅ Active
🌍 OpenRouter	GPT-4, Claude, Gemini, Llama	openrouter.ai	✅ Ready
🤖 Anthropic	Claude 3.5 Sonnet/Opus/Haiku	api.anthropic.com	✅ Ready
🧠 OpenAI	GPT-4o, GPT-4-turbo	api.openai.com	✅ Ready
💎 Google	Gemini 1.5 Pro/Flash	generativelanguage.googleapis.com	✅ Ready
⚡ Groq	Llama 3.3 70B	api.groq.com	✅ Ready
📚 Documentation
Document	Description
🚀 Getting Started	Installation guide
🔌 API Reference	Full API docs
🏗️ Architecture	System design
⚡ Performance	Benchmarks
🛠️ Deployment	Production setup
🐛 Troubleshooting	Common issues
🤖 AI Guide	For AI agents
🤖 For AI Agents

Reading this as an AI? See AI_GUIDE.md for a machine-readable summary.
🤝 Contributing

Contributions welcome! See CONTRIBUTING.md.
📄 License

MIT License - see LICENSE.
👥 Team

Hoosh Digital - https://hooshedigital.ir
📞 Support

    📧 Email: info@hooshedigital.ir

    💬 Issues: GitHub Issues

    💖 Sponsor: GitHub Sponsors

<div align="center">

Built with ❤️ in Iran

Report Bug · Request Feature

⭐ Star this repo if you find it useful!
</div> ```
📄 متن کامل README.fa.md (فارسی)
markdown

<div align="center">

# 🤖 درگاه هوش مصنوعی (AI Gateway)

### دسترسی یکپارچه و هوشمند به تمام مدل‌های هوش مصنوعی

**یک API. تمام مدل‌ها. بدون پیچیدگی.**

[![نسخه](https://img.shields.io/badge/نسخه-1.1.0-blue.svg)](https://github.com/hooshedigital/aigateway/releases)
[![لایسنس](https://img.shields.io/badge/لایسنس-MIT-green.svg)](LICENSE)
[![وضعیت](https://img.shields.io/badge/وضعیت-آماده_تولید-success.svg)](https://aigateway.hooshedigital.ir)

[![دمو زنده](https://img.shields.io/badge/-دمو_زنده-FF6B6B?style=for-the-badge)](https://aigateway.hooshedigital.ir)
[![مستندات](https://img.shields.io/badge/-مستندات-4ECDC4?style=for-the-badge)](docs/)
[![API](https://img.shields.io/badge/-API_Reference-F39C12?style=for-the-badge)](docs/API.md)

[English](README.md) | فارسی

</div>

---

## 📖 درباره پروژه

**درگاه هوش مصنوعی** یک پراکسی هوشمند متن‌باز و خودمیزبان است که **دسترسی یکپارچه به چندین ارائه‌دهنده هوش مصنوعی** را از طریق یک API واحد و سازگار با OpenAI فراهم می‌کند.

این پروژه با تمرکز بر عملکرد، **۴ برابر سریع‌تر** از فراخوانی مستقیم API پاسخ می‌دهد.

---

## ✨ ویژگی‌های اصلی

| ویژگی | توضیح | وضعیت |
|-------|-------|-------|
| 🌐 **چند ارائه‌دهنده** | ابراروان، OpenRouter، Anthropic، OpenAI، Gemini، Groq | ✅ فعال |
| ⚡ **استریمینگ بلادرنگ** | بهبود سرعت ۴ برابری | ✅ فعال |
| 🎯 **مسیریابی هوشمند** | انتخاب خودکار بهترین ارائه‌دهنده | ✅ فعال |
| 🛡️ **سیستم امتیازدهی ریسک** | تشخیص ارائه‌دهندگان مشکل‌دار | ✅ فعال |
| 🔄 **چرخش توکن** | جایگزینی خودکار توکن‌های منقضی | ✅ فعال |
| 📊 **داشبورد تحلیلی** | مانیتورینگ بلادرنگ | ✅ فعال |
| 🇮🇷 **سرور ایران** | تأخیر پایین | ✅ فعال |
| 🔒 **امن** | RLS، JWT، بدون کلید در کد | ✅ فعال |

---

## 🚀 شروع سریع

```bash
git clone https://github.com/hooshedigital/aigateway.git
cd aigateway
npm install
cp .env.example .env.local
nano .env.local
npm run build
supabase functions deploy ai-gateway --no-verify-jwt

اولین درخواست
bash

curl -X POST https://supabase.hooshedigital.ir/functions/v1/ai-gateway/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "سلام!"}],
    "stream": true
  }'

🏗️ معماری
text

┌──────────────┐     ┌─────────────────┐     ┌────────────────┐
│   کلاینت     │────▶│  Edge Function  │────▶│  Smart Router  │
│  (هر برنامه) │     │  (Supabase)     │     │                │
└──────────────┘     └─────────────────┘     └────────────────┘
                                                   │
                              ┌─────────┬──────────┼──────────┬─────────┐
                              ▼         ▼          ▼          ▼         ▼
                          ArvanCloud  OpenRouter  Anthropic  OpenAI  Gemini

📊 عملکرد
معیار	مقدار
پاسخ غیر استریم	~۳.۲ ثانیه
اولین توکن در استریم	~۰.۵ ثانیه
بهبود سرعت	۴ برابر
🌐 ارائه‌دهندگان پشتیبانی شده
ارائه‌دهنده	مدل‌ها	وضعیت
🇮🇷 ابراروان	DeepSeek-V4-Flash	✅ فعال
🌍 OpenRouter	GPT-4، Claude، Gemini	✅ آماده
🤖 Anthropic	Claude 3.5 Sonnet	✅ آماده
🧠 OpenAI	GPT-4o، GPT-4-turbo	✅ آماده
💎 Google Gemini	Gemini 1.5 Pro/Flash	✅ آماده
⚡ Groq	Llama 3.3 70B	✅ آماده
📚 مستندات
سند	توضیح
🚀 شروع	راهنمای نصب
🔌 API	مرجع API
🏗️ معماری	طراحی سیستم
⚡ عملکرد	بنچمارک
🛠️ استقرار	Production
🐛 عیب‌یابی	مشکلات رایج
🤝 مشارکت

از مشارکت شما استقبال می‌کنیم! راهنمای مشارکت را ببینید.
📄 لایسنس

MIT - فایل LICENSE.
👥 تیم

هوش دیجیتال - https://hooshedigital.ir
📞 تماس

    📧 ایمیل: info@hooshedigital.ir

    💬 مشکلات: GitHub Issues

<div align="center">

ساخته شده با ❤️ در ایران

⭐ اگر این پروژه برایتان مفید بود، ستاره بدهید!
</div> ```
