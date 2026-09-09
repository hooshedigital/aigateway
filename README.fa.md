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
	
❌
Reporting Vulnerabilities
DO NOT open public issues for security vulnerabilities.
📧 Email: info@hooshedigital.ir
Response time: Within 48 hours for critical issues.
Security Features

    ✅ JWT authentication
    ✅ Row Level Security (RLS)
    ✅ No hardcoded API keys
    ✅ HTTPS everywhere
    ✅ CORS properly configured
    ✅ Environment variables for secrets

Best Practices

    Never commit .env files
    Rotate API keys regularly
    Enable 2FA on all accounts
    Use strong JWT secrets
    Monitor access logs

Responsible Disclosure
We follow responsible disclosure. Report vulnerabilities privately first.
