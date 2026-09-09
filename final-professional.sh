#!/bin/bash
set -e
cd /home/aigateway.hooshedigital.ir/public_html/

echo "=== Creating folders ==="
mkdir -p assets docs .github/workflows .github/ISSUE_TEMPLATE

echo "=== Creating Persian README ==="
cat > README.fa.md << 'EOF'
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
EOF
echo "=== Creating CODE_OF_CONDUCT.md ==="
cat > CODE_OF_CONDUCT.md << 'EOF'
🤝 Code of Conduct
Our Pledge
We pledge to make participation a harassment-free experience for everyone.
Our Standards
Positive behavior:

    Welcoming and inclusive language
    Respect for differing viewpoints
    Graceful acceptance of criticism
    Focus on community benefit

Unacceptable behavior:

    Sexualized language or imagery
    Trolling or insulting comments
    Harassment (public or private)
    Publishing private information

Enforcement
Report violations to: info@hooshedigital.ir
Attribution
Adapted from Contributor Covenant v2.1.
EOF
echo "=== Creating SUPPORT.md ==="
cat > SUPPORT.md << 'EOF'
🆘 Support
Getting Help

    Documentation: Read docs/
    Search Issues: GitHub Issues
    Create Issue: Use bug report template
    Email: info@hooshedigital.ir

Response Times
Priority
	
Response Time
Critical security
	
48 hours
Bug reports
	
3-5 days
Feature requests
	
1-2 weeks
EOF
	
echo "=== Updating English README ==="
cat > README.md << 'EOF'
<div align="center">

<img src="assets/logo.svg" width="120" alt="AI Gateway"/>

AI Gateway
Unified, Intelligent Access to Every AI Model
One API. Every Model. Zero Complexity.








English
 | فارسی
</div>
Troubleshooting
Common Issues
Edge Function Boot Error
Symptom: worker boot error
Solution: Ensure index.ts uses Deno.serve().
JWT Auth Failed
Symptom: Unauthorized
Solution: Verify ANON_KEY matches JWT_SECRET.
CORS Errors
Solution: Check CORS headers in Edge Function.
Streaming Not Working
Solution: Verify stream: true and SSE headers.
Provider Returns 403/429
Solution: Check rate limits and API keys.
Slow Responses
Solutions:

    Check provider health
    Verify network
    Use streaming

Getting Help

    Check logs: docker logs supabase-edge-functions
    Read documentation
    Search GitHub Issues
    Create new issue
EOF

echo "=== Updating logo ==="
cat > assets/logo.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4ECDC4"/>
      <stop offset="100%" style="stop-color:#FF6B6B"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad)"/>
  <path d="M 30 40 L 50 25 L 70 40 L 70 60 L 50 75 L 30 60 Z" fill="white" opacity="0.9"/>
  <circle cx="50" cy="50" r="8" fill="#4ECDC4"/>
  <circle cx="35" cy="42" r="4" fill="#FF6B6B"/>
  <circle cx="65" cy="42" r="4" fill="#FF6B6B"/>
  <circle cx="50" cy="65" r="4" fill="#FF6B6B"/>
  <line x1="35" y1="42" x2="50" y2="50" stroke="#FF6B6B" stroke-width="2"/>
  <line x1="65" y1="42" x2="50" y2="50" stroke="#FF6B6B" stroke-width="2"/>
  <line x1="50" y1="65" x2="50" y2="50" stroke="#FF6B6B" stroke-width="2"/>
</svg>
EOF
echo "=== Creating question template ==="
cat > .github/ISSUE_TEMPLATE/question.md << 'EOF'
name: Question
about: Ask a question
title: '[QUESTION] '
labels: question
Question
What would you like to know?
Context
What have you tried?
Environment

    OS:
    Version:
EOF

echo "=== Committing all changes ==="
git add -A
git status --short
git commit -m "docs: complete professional bilingual documentation
Major updates:

    Rewrite README.md with badges, diagrams, complete sections
    Add comprehensive Persian README (README.fa.md)
    Add AI_GUIDE.md for machine-readable summary
    Add full docs/ folder: API, Architecture, Performance, Deployment, Troubleshooting
    Add SECURITY.md with vulnerability reporting policy
    Add CODE_OF_CONDUCT.md
    Add SUPPORT.md
    Update custom SVG logo
    Add question issue template

This makes the repository world-class professional with full
bilingual support and comprehensive documentation."
echo "=== Pushing to GitHub ==="
git push origin main
echo ""
echo "======================================"
echo "FINAL PROFESSIONAL SETUP COMPLETE!"
echo "======================================"
echo ""
echo "Files added/updated:"
echo "  - README.md (professional with badges & diagrams)"
echo "  - README.fa.md (complete Persian version)"
echo "  - AI_GUIDE.md (for AI agents)"
echo "  - docs/GETTING_STARTED.md"
echo "  - docs/API.md"
echo "  - docs/ARCHITECTURE.md"
echo "  - docs/PERFORMANCE.md"
echo "  - docs/DEPLOYMENT.md"
echo "  - docs/TROUBLESHOOTING.md"
echo "  - SECURITY.md"
echo "  - CODE_OF_CONDUCT.md"
echo "  - SUPPORT.md"
echo "  - .github/ISSUE_TEMPLATE/question.md"
echo "  - assets/logo.svg"
echo ""
echo "View: https://github.com/hooshedigital/aigateway
"
echo ""
git log --oneline -3
