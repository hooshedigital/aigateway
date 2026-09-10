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
