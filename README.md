<div align="center">

# دروازه هوش مصنوعی

### AI Gateway — دروازه یکپارچه برای مدیریت چندین ارائه‌دهنده هوش مصنوعی

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

**یک دروازه هوشمند با پشتیبانی از Fallback خودکار، پایش سلامت ارائه‌دهنده‌ها، و پنل مدیریتی کامل دو‌زبانه (فارسی/انگلیسی)**

</div>

---

## فهرست مطالب

- [معرفی](#معرفی)
- [ویژگی‌ها](#ویژگی‌ها)
- [سیستم مدیریت Browser API](#سیستم-مدیریت-browser-api)
- [نمای معماری](#نمای-معماری)
- [پیش‌نیازها](#پیش‌نیازها)
- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [پیکربندی](#پیکربندی)
- [استفاده از API](#استفاده-از-api)
- [اندپوینت‌های مدیریتی](#اندپوینت‌های-مدیریتی)
- [ساختار پروژه](#ساختار-پروژه)
- [توسعه](#توسعه)
- [مشارکت](#مشارکت)
- [لایسنس](#لایسنس)

---

## معرفی

**دروازه هوش مصنوعی** یک سیستم مدیریت متمرکز برای ارسال درخواست‌های هوش مصنوعی به چندین ارائه‌دهنده (OpenAI، Anthropic، Google Gemini، Groq، Cohere و ...) است. این دروازه با فرمت OpenAI API کاملاً سازگار است و به شما اجازه می‌دهد با یک نقطه اتصال واحد، به تمام مدل‌های مورد نظر دسترسی داشته باشید.

### مزایای کلیدی

- **یک API، چندین ارائه‌دهنده** — نیازی به تغییر کد برای جابه‌جایی بین مدل‌ها نیست
- **Fallback خودکار** — اگر یک ارائه‌دهنده قطع شود، به‌طور خودکار به بعدی سوییچ می‌کند
- **پایش بلادرنگ** — نمودارها و آمار کامل از عملکرد سیستم
- **دو‌زبانه** — رابط کاربری فارسی و انگلیسی با پشتیبانی کامل RTL
- **پنل مدیریتی حرفه‌ای** — مدیریت کاربران، لاگ‌های ممیزی، و اعلان‌های سیستم
- **سیستم مدیریت Browser API** — استخر نشست مرورگر، ضد تشخیص، امتیازدهی ریسک، و مسیریابی هوشمند

---

## ویژگی‌ها

### پنل مدیریتی

| ویژگی | توضیح |
|-------|-------|
| داشبورد تحلیلی | نمودار فعالیت درخواست‌ها، توزیع تأخیر (P50/P90/P99)، توزیع بار، سلامت ارائه‌دهنده‌ها |
| مدیریت ارائه‌دهنده‌ها | فعال/غیرفعال‌سازی، تنظیم اولویت، مدیریت کلیدهای API |
| لاگ درخواست‌ها | جستجو و فیلتر تمام درخواست‌های ثبت‌شده با جزئیات کامل |
| آزمایشگاه تعاملی | تست زنده API با قابلیت استریم و تنظیم پارامترها |
| مدیریت کاربران | نقش‌های مدیر/بیننده، تولید و کپی کلید API |
| لاگ ممیزی | تایم‌لاین تمام عملیات مدیریتی |
| اعلان‌های سیستم | هشدارها و پیام‌های سیستم با نشانگر خوانده‌نشده |
| مستندات API | راهنمای کامل با نمونه کد در ۵ زبان برنامه‌نویسی + سوالات متداول و راهنمای رفع مشکل |
| پنل فرمان | جستجوی سریع با Ctrl+K برای پیمایش بین صفحات |
| نشست‌های مرورگر | مدیریت استخر نشست برای ارائه‌دهنده‌های بدون توکن، چرخش خودکار، پایش سلامت |
| پایش ریسک | امتیازدهی بلادرنگ ریسک ارائه‌دهنده‌ها، قرنطینه خودکار، نمودار تاریخچه |
| پیکربندی هشدار | تنظیم Webhook، ایمیل، آستانه‌های ریسک، و اعلان‌های تشخیص |

### امکانات فنی

- **سازگار با OpenAI API** — هر کلاینت سازگار با OpenAI می‌تواند متصل شود
- **پشتیبانی از Streaming (SSE)** — پاسخ‌های جریانی برای تجربه کاربری بهتر
- **Fallback خودکار** — جابه‌جایی هوشمند بین ارائه‌دهنده‌ها بر اساس اولویت
- **تطبیق مدل** — فقط ارائه‌دهنده‌هایی که مدل درخواستی را پشتیبانی می‌کنند امتحان می‌شوند
- **محدودیت نرخ** — کنترل تعداد درخواست در دقیقه
- **سیستم مدیریت Browser API** — استخر نشست، ضد تشخیص، امتیازدهی ریسک، مسیریابی هوشمند
- **تم تاریک/روشن** — با ذخیره تنظیمات کاربر
- **طراحی واکنش‌گرا** — بهینه برای موبایل و دسکتاپ

---

## نمای معماری

```
                    ┌─────────────────────────────────┐
                    │         کلاینت / اپلیکیشن         │
                    └──────────────┬──────────────────┘
                                   │
                          POST /v1/chat/completions
                          (Authorization: Bearer <access_code>)
                                   │
                    ┌──────────────▼──────────────────┐
                    │      Edge Function (Deno)       │
                    │  ┌───────────────────────────┐  │
                    │  │  احراز هویت → تطبیق مدل  │  │
                    │  │  → انتخاب ارائه‌دهنده     │  │
                    │  │  → مسیریابی هوشمند       │  │
                    │  │  → Fallback خودکار       │  │
                    │  │  → امتیازدهی ریسک        │  │
                    │  │  → ضد تشخیص              │  │
                    │  │  → ثبت لاگ و آمار         │  │
                    │  └───────────────────────────┘  │
                    └──────────────┬──────────────────┘
                                   │
              ┌────────┬──────────┼──────────┬────────┐
              ▼        ▼          ▼          ▼        ▼
          OpenAI   Anthropic   Gemini     Groq    Cohere
                   (بر اساس اولویت و در دسترس بودن)
                                   │
                    ┌──────────────▼──────────────────┐
                    │       Supabase (PostgreSQL)      │
                    │  ┌──────┐ ┌──────┐ ┌──────────┐  │
                    │  │providers│ │logs│ │  stats   │  │
                    │  └──────┘ └──────┘ └──────────┘  │
                    │  ┌──────┐ ┌──────┐ ┌──────────┐  │
                    │  │users │ │audit│ │  notifs  │  │
                    │  └──────┘ └──────┘ └──────────┘  │
                    │  ┌──────┐ ┌──────┐ ┌──────────┐  │
                    │  │sessions│ │risk│ │  alerts  │  │
                    │  └──────┘ └──────┘ └──────────┘  │
                    │  ┌──────────┐                    │
                    │  │ patterns │                    │
                    │  └──────────┘                    │
                    └─────────────────────────────────┘
```

---

## پیش‌نیازها

- [Node.js](https://nodejs.org) نسخه ۱۸ یا بالاتر
- [npm](https://www.npmjs.com) یا [pnpm](https://pnpm.io)
- یک پروژه [Supabase](https://supabase.com) (دیتابیس + Edge Functions)

---

## نصب و راه‌اندازی

### ۱. کلون کردن پروژه

```bash
git clone https://github.com/hooshedigital/ai-gateway.git
cd ai-gateway
```

### ۲. نصب وابستگی‌ها

```bash
npm install
```

### ۳. تنظیم متغیرهای محیطی

فایل `.env` را در ریشه پروژه ایجاد کنید:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...
```

### ۴. اعمال مهاجرت‌های دیتابیس

مهاجرت‌ها به‌طور خودکار از طریق Supabase MCP اعمال می‌شوند. فایل‌های SQL در مسیر `supabase/migrations/` قرار دارند:

- `20260903221500_create_ai_gateway_schema.sql` — ساختار اصلی (providers, settings, request_logs, usage_stats)
- `20260904110318_add_users_audit_notifications.sql` — جداول کاربران، لاگ ممیزی و اعلان‌ها
- `20260904113333_add_browser_api_management_tables.sql` — جداول نشست مرورگر، امتیاز ریسک، پیکربندی هشدار و الگوهای استفاده

### ۵. استقرار Edge Function

```bash
# Edge Function در مسیر supabase/functions/ai-gateway/ قرار دارد
# از طریق Supabase Dashboard یا MCP استقرار دهید
```

### ۶. اجرای پروژه

```bash
npm run dev      # حالت توسعه
npm run build    # ساخت نهایی
npm run preview  # پیش‌نمایش build
```

---

## پیکربندی

### تنظیمات دروازه

از صفحه **تنظیمات** پنل می‌توانید موارد زیر را پیکربندی کنید:

| تنظیم | توضیح | مقدار پیش‌فرض |
|-------|-------|---------------|
| کد دسترسی | توکن Bearer برای احراز هویت API | `hooshedigital-gateway-2024` |
| محدودیت نرخ | حداکثر درخواست در دقیقه | `60` |
| مبدأهای CORS | دامنه‌های مجاز | `*` |
| نام دروازه | نام نمایشی | `AI Gateway` |
| مدل پیش‌فرض | مدل مورد استفاده وقتی مشخص نشده | `gpt-4o` |
| Fallback | فعال‌سازی جابه‌جایی خودکار | `true` |

### ارائه‌دهنده‌های پیش‌فرض

| ارائه‌دهنده | نوع | اولویت | مدل‌ها |
|-------------|-----|--------|--------|
| OpenRouter | API Key | 10 | gpt-4o, claude-3.5-sonnet, gemini-pro |
| Groq | API Key | 20 | llama-3.3-70b, mixtral-8x7b |
| Google Gemini | API Key | 30 | gemini-1.5-pro, gemini-2.0-flash |
| Cohere | API Key | 40 | command-r-plus, command-r |
| OpenAI | API Key | 50 | gpt-4o, gpt-4o-mini, gpt-4-turbo |
| Anthropic | API Key | 60 | claude-3.5-sonnet, claude-3-opus |
| ChatGPT Browser | بدون توکن | 70 | gpt-4o (آزمایشی) |
| Gemini Browser | بدون توکن | 80 | gemini-1.5-pro (آزمایشی) |

---

## استفاده از API

### آدرس پایه

```
https://aigateway.hooshedigital.ir/v1
```

### نمونه cURL

```bash
curl -X POST https://aigateway.hooshedigital.ir/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "سلام!"}]
  }'
```

### نمونه Python

```python
import requests

response = requests.post(
    "https://aigateway.hooshedigital.ir/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_ACCESS_CODE",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "سلام!"}]
    }
)

print(response.json()["choices"][0]["message"]["content"])
```

### استفاده با OpenAI SDK

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://aigateway.hooshedigital.ir/v1",
  apiKey: "YOUR_ACCESS_CODE"
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "سلام!" }]
});

console.log(response.choices[0].message.content);
```

### اندپوینت‌ها

| روش | مسیر | توضیح |
|-----|------|-------|
| POST | `/v1/chat/completions` | ارسال درخواست تکمیل چت |
| GET | `/v1/models` | لیست مدل‌های موجود از ارائه‌دهنده‌های فعال |
| GET | `/api/status` | وضعیت دروازه، استخر نشست و امتیاز ریسک |

---

## اندپوینت‌های مدیریتی

| روش | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/sessions` | لیست تمام نشست‌های مرورگر |
| GET | `/api/health` | وضعیت سلامت ارائه‌دهنده‌ها و امتیاز ریسک |
| GET | `/api/risk` | آخرین امتیازهای ریسک ثبت‌شده |
| POST | `/api/rotate` | چرخش دستی نشست‌ها (یک نشست یا همه) |

### نمونه چرخش نشست

```bash
# چرخش یک نشست خاص
curl -X POST https://aigateway.hooshedigital.ir/api/rotate \
  -H "Content-Type: application/json" \
  -d '{"session_id": "SESSION_ID"}'

# چرخش تمام نشست‌های فعال
curl -X POST https://aigateway.hooshedigital.ir/api/rotate
```

---

## سیستم مدیریت Browser API

این سیستم برای ارائه‌دهنده‌های بدون توکن (مانند ChatGPT Browser و Gemini Browser) طراحی شده است.

### استخر نشست (Session Pool)

- **چرخش خودکار نشست‌ها** برای جلوگیری از تشخیص
- **پایش سلامت** هر نشست با محاسبه امتیاز
- **پیش‌بینی انقضا** و احراز هویت مجدد خودکار
- **تعداد درخواست محدود** برای هر نشست (قابل پیکربندی)

### سیستم ضد تشخیص (Anti-Detection)

- **تصادفی‌سازی الگوی درخواست** با تأخیرهای متغیر
- **چرخش User-Agent** از بین لیست مرورگرهای واقعی
- **شبیه‌سازی رفتار انسانی** با فاصله‌های متغیر بین درخواست‌ها
- **پاک‌سازی درخواست** و حذف اطلاعات شناسایی

### امتیازدهی ریسک (Risk Scoring)

هر ارائه‌دهنده به‌طور خودکار بر اساس معیارهای زیر امتیازدهی می‌شود:

| معیار | وزن | توضیح |
|------|-----|-------|
| نرخ موفقیت | ۴۰٪ | نسبت درخواست‌های موفق به کل |
| الگوی خطا | ۳۰٪ | خطاهای اخیر (۱۰ درخواست اخیر) |
| سیگنال‌های تشخیص | ۳۰٪ | خطاهای ۴۰۳/۴۲۹ و نشانه‌های مسدودسازی |

سطوح ریسک:
- **پایین** (۰-۳۹): ارائه‌دهنده سالم
- **متوسط** (۴۰-۶۹): نیاز به پایش
- **بالا** (۷۰-۸۹): هشدار ارسال شود
- **بحرانی** (۹۰-۱۰۰): قرنطینه خودکار

### مسیریابی هوشمند (Smart Routing)

درخواست‌ها بر اساس معیارهای زیر به ارائه‌دهنده‌ها مسیریابی می‌شوند:

۱. ارائه‌دهنده‌های قرنطینه‌شده در انتهای صف قرار می‌گیرند
۲. ارائه‌دهنده‌ها بر اساس امتیاز ریسک مرتب می‌شوند (کمتر = بهتر)
۳. در صورت تساوی، اولویت اصلی معیار قرار می‌گیرد
۴. Fallback پیش‌بینانه: جابه‌جایی قبل از شکست بر اساس روند ریسک

### سیستم هشدار (Alert System)

| نوع هشدار | توضیح |
|-----------|-------|
| تشخیص | وقتی ارائه‌دهنده خطای ۴۰۳/۴۲۹ برمی‌گرداند |
| انقضای نشست | وقتی یک نشست منقضی می‌شود |
| قطعی ارائه‌دهنده | وقتی یک ارائه‌دهنده با خطا مواجه می‌شود |
| ریسک بالا | وقتی امتیاز ریسک به سطح بالا یا بحرانی می‌رسد |

هشدارها از طریق Webhook و اعلان‌های سیستم ارسال می‌شوند.

---

## ساختار پروژه

```
ai-gateway/
├── src/
│   ├── components/
│   │   ├── Charts.tsx              # نمودارهای SVG (خطی، ستونی، دونات)
│   │   ├── CommandPalette.tsx      # پنل فرمان (Ctrl+K)
│   │   └── NotificationsBell.tsx  # اعلان‌های سیستم
│   ├── contexts/
│   │   └── AppContext.tsx          # Context برنامه (تم، زبان، ترجمه)
│   ├── lib/
│   │   └── supabase.ts             # کلاینت Supabase
│   ├── pages/
│   │   ├── Dashboard.tsx           # داشبورد تحلیلی
│   │   ├── Providers.tsx           # مدیریت ارائه‌دهنده‌ها
│   │   ├── Logs.tsx                # لاگ درخواست‌ها
│   │   ├── Playground.tsx          # آزمایشگاه تعاملی
│   │   ├── Users.tsx               # مدیریت کاربران
│   │   ├── AuditLogs.tsx           # لاگ ممیزی
│   │   ├── Sessions.tsx           # مدیریت نشست‌های مرورگر
│   │   ├── RiskMonitor.tsx        # پایش ریسک ارائه‌دهنده‌ها
│   │   ├── ApiDocs.tsx             # مستندات API
│   │   └── Settings.tsx            # تنظیمات + پیکربندی هشدار
│   ├── App.tsx                     # کامپوننت اصلی
│   ├── i18n.ts                     # ترجمه‌های فارسی/انگلیسی
│   ├── types.ts                    # تایپ‌های TypeScript
│   ├── index.css                   # استایل‌های Tailwind
│   └── main.tsx                    # نقطه ورود
├── supabase/
│   ├── config.toml                 # پیکربندی Supabase
│   ├── functions/
│   │   └── ai-gateway/
│   │       └── index.ts           # Edge Function (Deno)
│   └── migrations/
│       ├── 20260903221500_create_ai_gateway_schema.sql
│       ├── 20260904110318_add_users_audit_notifications.sql
│       └── 20260904113333_add_browser_api_management_tables.sql
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## توسعه

### اسکریپت‌های موجود

```bash
npm run dev        # سرور توسعه با Hot Reload
npm run build      # ساخت نهایی برای تولید
npm run typecheck  # بررسی تایپ‌های TypeScript
npm run lint       # بررسی کد با ESLint
npm run preview    # پیش‌نمایش build نهایی
```

### تکنولوژی‌های استفاده‌شده

| لایه | تکنولوژی |
|------|----------|
| فرانت‌اند | React 18 + TypeScript 5.5 |
| بیلد تول | Vite 5.4 |
| استایل | Tailwind CSS 3.4 |
| آیکون‌ها | Lucide React |
| بک‌اند | Supabase (PostgreSQL + Edge Functions) |
| Edge Runtime | Deno |
| فونت | Vazirmatn (فارسی) + Inter (انگلیسی) |

---

## مشارکت

از مشارکت شما استقبال می‌کنیم! لطفاً قبل از ارسال Pull Request موارد زیر را رعایت کنید:

1. یک branch جدید ایجاد کنید: `git checkout -b feature/amazing-feature`
2. تغییرات را commit کنید: `git commit -m 'feat: افزودن قابلیت جدید'`
3. branch را push کنید: `git push origin feature/amazing-feature`
4. یک Pull Request ایجاد کنید

### قالب commit

از قالب [Conventional Commits](https://www.conventionalcommits.org) استفاده کنید:

- `feat:` قابلیت جدید
- `fix:` رفع باگ
- `docs:` تغییر مستندات
- `refactor:` بازسازی کد
- `style:` تغییرات ظاهری
- `test:` افزودن تست
- `chore:` کارهای نگهداری

---

## لایسنس

این پروژه تحت لایسنس **MIT** منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.

---

<div align="center">

**ساخته‌شده با ❤️ توسط تیم [هوش دیجیتال](https://hooshedigital.ir)**

[وب‌سایت](https://hooshedigital.ir) · [گیت‌هاب](https://github.com/hooshedigital) · [ایمیل](mailto:info@hooshedigital.ir)

</div>
