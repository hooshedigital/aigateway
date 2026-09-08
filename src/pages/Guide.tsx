import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Server,
  Code2,
  Users,
  BarChart3,
  Settings,
  DollarSign,
  Globe,
  HelpCircle,
  AlertCircle,
  Terminal,
  Copy,
  Check,
  Clock,
  Rocket,
  Shield,
  Layers,
  Lightbulb,
  BookMarked,
  RotateCw,
  Lock,
  Zap,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function Guide() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const textSecondary = isDark ? "text-slate-500" : "text-slate-500";
  const [openSection, setOpenSection] = useState<string | null>("quick-start");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function toggleSection(id: string) {
    setOpenSection(openSection === id ? null : id);
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const tutorials = [
    { id: "connect-providers", icon: Server, title: t("tutorialConnectProviders"), desc: t("tutorialConnectProvidersDesc"), steps: [
      lang === "fa" ? "به صفحه ارائه‌دهندگان بروید." : "Navigate to the Providers page from the sidebar.",
      lang === "fa" ? "روی دکمه «افزودن ارائه‌دهنده» کلیک کنید." : "Click the \"Add Provider\" button.",
      lang === "fa" ? "نام، نوع (کلید API یا بدون توکن)، آدرس پایه و کلید API را وارد کنید." : "Enter the name, type (API Key or Token-Free), base URL, and API key.",
      lang === "fa" ? "مدل‌های پشتیبانی شده را با کاما جدا کنید." : "Add supported models, comma-separated.",
      lang === "fa" ? "اولویت را تنظیم کنید (عدد کمتر = اولویت بالاتر)." : "Set the priority (lower number = higher priority).",
      lang === "fa" ? "ذخیره کنید. ارائه‌دهنده فعال می‌شود." : "Save. The provider is now active.",
    ]},
    { id: "use-gateway", icon: Code2, title: t("tutorialUseGateway"), desc: t("tutorialUseGatewayDesc"), steps: [
      lang === "fa" ? "کد دسترسی را از صفحه تنظیمات دریافت کنید." : "Get your access code from the Settings page.",
      lang === "fa" ? "هر کلاینت سازگار با OpenAI را به آدرس دروازه指向 کنید." : "Point any OpenAI-compatible client to the gateway URL.",
      lang === "fa" ? "کد دسترسی را به عنوان کلید API استفاده کنید." : "Use the access code as the API key.",
      lang === "fa" ? "درخواست‌ها بر اساس اولویت و مدل به ارائه‌دهنده‌ها ارسال می‌شوند." : "Requests are routed to providers based on priority and model matching.",
      lang === "fa" ? "اگر ارائه‌دهنده خطا دهد، به صورت خودکار به ارائه‌دهنده بعدی سوییچ می‌شود." : "If a provider fails, the gateway automatically falls back to the next provider.",
    ]},
    { id: "manage-users", icon: Users, title: t("tutorialManageUsers"), desc: t("tutorialManageUsersDesc"), steps: [
      lang === "fa" ? "به صفحه کاربران بروید." : "Go to the Users page from the sidebar.",
      lang === "fa" ? "روی «افزودن کاربر» کلیک کنید." : "Click \"Add User\".",
      lang === "fa" ? "نام، ایمیل و نقش (مدیر یا بیننده) را وارد کنید." : "Enter name, email, and role (Admin or Viewer).",
      lang === "fa" ? "کلید API به صورت خودکار تولید می‌شود." : "An API key is automatically generated.",
      lang === "fa" ? "کاربران را می‌توان فعال یا غیرفعال کرد." : "Users can be enabled or disabled.",
    ]},
    { id: "view-analytics", icon: BarChart3, title: t("tutorialViewAnalytics"), desc: t("tutorialViewAnalyticsDesc"), steps: [
      lang === "fa" ? "داشبورد نمای کلی از درخواست‌ها، نرخ موفقیت و زمان پاسخ نشان می‌دهد." : "The Dashboard shows an overview of requests, success rate, and response times.",
      lang === "fa" ? "نمودارهای فعالیت درخواست و استفاده توکن در ۷ روز اخیر." : "Charts show request activity and token usage over the last 7 days.",
      lang === "fa" ? "سلامت ارائه‌دهنده و توزیع بار را بررسی کنید." : "Check provider health and load balancing.",
      lang === "fa" ? "صفحه لاگ‌ها تمام درخواست‌ها را با جزئیات نشان می‌دهد." : "The Logs page shows all requests with full details.",
    ]},
    { id: "configure-settings", icon: Settings, title: t("tutorialConfigureSettings"), desc: t("tutorialConfigureSettingsDesc"), steps: [
      lang === "fa" ? "به صفحه تنظیمات بروید." : "Go to the Settings page.",
      lang === "fa" ? "کد دسترسی را تنظیم کنید (توکن Bearer برای API)." : "Set the access code (Bearer token for API calls).",
      lang === "fa" ? "محدودیت نرخ درخواست در دقیقه را تنظیم کنید." : "Configure rate limit per minute.",
      lang === "fa" ? "مبدأهای CORS مجاز را مشخص کنید." : "Set allowed CORS origins.",
      lang === "fa" ? "مدل پیش‌فرض و فعال‌سازی fallback را پیکربندی کنید." : "Configure default model and fallback behavior.",
    ]},
    { id: "cost-analysis", icon: DollarSign, title: t("tutorialCostAnalysis"), desc: t("tutorialCostAnalysisDesc"), steps: [
      lang === "fa" ? "به صفحه تحلیل هزینه بروید." : "Navigate to the Cost Analysis page.",
      lang === "fa" ? "هزینه کل، هزینه ماه جاری و هزینه میانگین هر درخواست را ببینید." : "View total cost, this month's spend, and average cost per request.",
      lang === "fa" ? "نمودارهای هزینه بر اساس ارائه‌دهنده و مدل." : "Charts show cost by provider and model.",
      lang === "fa" ? "بودجه ماهانه تنظیم کنید و هشدار دریافت کنید." : "Set a monthly budget and receive alerts.",
      lang === "fa" ? "داده هزینه را به CSV خروجی بگیرید." : "Export cost data to CSV.",
      lang === "fa" ? "قیمت‌گذاری مدل‌ها را ویرایش کنید." : "Edit model pricing rates.",
    ]},
    { id: "browser-sessions", icon: Globe, title: t("tutorialBrowserSessions"), desc: t("tutorialBrowserSessionsDesc"), steps: [
      lang === "fa" ? "به صفحه نشست‌ها بروید." : "Go to the Sessions page from the sidebar.",
      lang === "fa" ? "روی «افزودن نشست» کلیک کنید." : "Click \"Add Session\".",
      lang === "fa" ? "ارائه‌دهنده را انتخاب کنید (ChatGPT، Gemini یا Claude)." : "Select a provider (ChatGPT, Gemini, or Claude).",
      lang === "fa" ? "نام حساب را وارد کنید (مثلاً «حساب ChatGPT #۱») برای مدیریت چند حساب." : "Enter an account name (e.g. \"ChatGPT Account #1\") to manage multiple accounts.",
      lang === "fa" ? "روی «چگونه توکن بگیریم» کلیک کنید تا راهنمای استخراج توکن را ببینید." : "Click \"How to get a token\" to see extraction instructions.",
      lang === "fa" ? "برای ChatGPT: به chatgpt.com بروید، F12 بزنید، Application → Local Storage → accessToken را کپی کنید." : "For ChatGPT: go to chatgpt.com, press F12, Application → Local Storage → copy the accessToken value.",
      lang === "fa" ? "برای Gemini: به gemini.google.com بروید، F12 بزنید، Application → Cookies → __Secure-1PSID را کپی کنید." : "For Gemini: go to gemini.google.com, press F12, Application → Cookies → copy __Secure-1PSID value.",
      lang === "fa" ? "برای Claude: به claude.ai بروید، F12 بزنید، Application → Cookies → sessionKey را کپی کنید." : "For Claude: go to claude.ai, press F12, Application → Cookies → copy the sessionKey value.",
      lang === "fa" ? "توکن را در فرم جای‌گذاری کنید." : "Paste the token into the form.",
      lang === "fa" ? "تاریخ انقضا را تنظیم کنید (مثلاً ۷ روز بعد)." : "Set an expiry date (e.g. 7 days later).",
      lang === "fa" ? "ذخیره کنید. نشست فعال می‌شود." : "Save. The session is now active.",
      lang === "fa" ? "برای هر ارائه‌دهنده چند حساب اضافه کنید تا بار بین آن‌ها توزیع شود." : "Add multiple accounts per provider to distribute load and avoid detection.",
      lang === "fa" ? "نشست‌ها را به صورت دستی یا خودکار چرخش دهید." : "Rotate sessions manually or automatically when they expire.",
    ]},
  ];

  const faqs = [
    { q: lang === "fa" ? "دروازه با فرمت OpenAI API سازگار است؟" : "Is the gateway compatible with the OpenAI API format?", a: lang === "fa" ? "بله، دروازه کاملاً با فرمت OpenAI API سازگار است. هر کلاینت سازگار با OpenAI را می‌توانید به دروازه متصل کنید." : "Yes, the gateway is fully compatible with the OpenAI API format. You can connect any OpenAI-compatible client." },
    { q: lang === "fa" ? "Fallback چگونه کار می‌کند؟" : "How does fallback work?", a: lang === "fa" ? "اگر یک ارائه‌دهنده خطا دهد یا محدودیت نرخ بخورد، دروازه به صورت خودکار به ارائه‌دهنده بعدی با اولویت پایین‌تر سوییچ می‌کند." : "If a provider returns an error or hits a rate limit, the gateway automatically switches to the next provider in priority order." },
    { q: lang === "fa" ? "ارائه‌دهنده‌های بدون توکن چه هستند؟" : "What are token-free providers?", a: lang === "fa" ? "ارائه‌دهنده‌های بدون توکن از نشست‌های مرورگر برای دسترسی به مدل‌های هوش مصنوعی استفاده می‌کنند و نیازی به کلید API ندارند." : "Token-free providers use browser sessions to access AI models without requiring an API key." },
    { q: lang === "fa" ? "چگونه هزینه‌ها را ردیابی کنم؟" : "How do I track costs?", a: lang === "fa" ? "صفحه تحلیل هزینه هزینه‌ها را بر اساس ارائه‌دهنده، مدل و زمان نشان می‌دهد. می‌توانید بودجه تنظیم کنید و داده‌ها را به CSV خروجی بگیرید." : "The Cost Analysis page shows costs by provider, model, and time. You can set budgets and export data to CSV." },
    { q: lang === "fa" ? "آیا داده‌ها امن هستند؟" : "Is my data secure?", a: lang === "fa" ? "دروازه از Row Level Security در Supabase استفاده می‌کند. کلیدهای API به صورت رمزگذاری شده ذخیره می‌شوند." : "The gateway uses Row Level Security in Supabase. API keys are stored encrypted." },
    { q: lang === "fa" ? "توکن مرورگر چقدر دوام دارد؟" : "How long do browser tokens last?", a: lang === "fa" ? "بسته به سرویس متفاوت است — معمولاً بین چند روز تا چند هفته. پیشنهاد می‌کنیم تاریخ انقضا را ۷ روز تنظیم کنید و قبل از انقضا توکن را تمدید کنید." : "It varies by service — typically a few days to a few weeks. We recommend setting the expiry to 7 days and refreshing before it expires." },
    { q: lang === "fa" ? "چند حساب می‌توانم اضافه کنم؟" : "How many accounts can I add?", a: lang === "fa" ? "هر تعداد که بخواهید. پیشنهاد می‌کنیم حداقل ۳ تا ۵ حساب برای هر ارائه‌دهنده اضافه کنید تا بار به‌خوبی توزیع شود." : "As many as you want. We recommend at least 3-5 accounts per provider for good load distribution." },
  ];

  const troubleshooting = [
    { issue: lang === "fa" ? "دروازه پاسخ نمی‌دهد" : "Gateway not responding", solution: lang === "fa" ? "بررسی کنید که حداقل یک ارائه‌دهنده فعال باشد و کلید API آن تنظیم شده باشد." : "Check that at least one provider is active and has an API key set." },
    { issue: lang === "fa" ? "خطای ۴۲۹ (محدودیت نرخ)" : "Error 429 (Rate limit)", solution: lang === "fa" ? "محدودیت نرخ را در تنظیمات افزایش دهید یا ارائه‌دهنده‌های بیشتری فعال کنید." : "Increase the rate limit in Settings or activate more providers." },
    { issue: lang === "fa" ? "نشست مرورگر منقضی شده" : "Browser session expired", solution: lang === "fa" ? "نشست را چرخش دهید یا توکن/کوکی جدید وارد کنید." : "Rotate the session or paste a new token/cookie." },
    { issue: lang === "fa" ? "هزینه‌ها نشان داده نمی‌شوند" : "Costs not showing", solution: lang === "fa" ? "اطمینان حاصل کنید که قیمت‌گذاری مدل‌ها در صفحه تحلیل هزینه تنظیم شده باشد." : "Make sure model pricing is configured in the Cost Analysis page." },
    { issue: lang === "fa" ? "ارائه‌دهنده قرنطینه شده" : "Provider quarantined", solution: lang === "fa" ? "امتیاز ریسک ارائه‌دهنده بحرانی شده است. نشست‌های مرورگر را چرخش دهید یا ارائه‌دهنده جدید اضافه کنید." : "The provider's risk score has reached critical. Rotate browser sessions or add a new provider." },
  ];

  const codeExamples = [
    { id: "curl", lang: "cURL", code: `curl https://your-gateway-url.supabase.co/functions/v1/ai-gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'` },
    { id: "python", lang: "Python", code: `import openai

client = openai.OpenAI(
    base_url="https://your-gateway-url.supabase.co/functions/v1/ai-gateway/v1",
    api_key="YOUR_ACCESS_CODE"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=100
)

print(response.choices[0].message.content)` },
    { id: "javascript", lang: "JavaScript", code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://your-gateway-url.supabase.co/functions/v1/ai-gateway/v1",
  apiKey: "YOUR_ACCESS_CODE",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
  max_tokens: 100,
});

console.log(response.choices[0].message.content);` },
    { id: "php", lang: "PHP", code: `<?php
require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();
$response = $client->post('https://your-gateway-url.supabase.co/functions/v1/ai-gateway/v1/chat/completions', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_ACCESS_CODE',
        'Content-Type' => 'application/json',
    ],
    'json' => [
        'model' => 'gpt-4o',
        'messages' => [['role' => 'user', 'content' => 'Hello!']],
        'max_tokens' => 100,
    ],
]);

$data = json_decode($response->getBody(), true);
echo $data['choices'][0]['message']['content'];` },
  ];

  const quickStartSteps = lang === "fa" ? [
    { icon: Server, text: "به صفحه ارائه‌دهندگان بروید و حداقل یک ارائه‌دهنده اضافه کنید (مثلاً OpenAI با کلید API، یا ChatGPT Browser با توکن)." },
    { icon: Globe, text: "اگر از ارائه‌دهنده بدون توکن استفاده می‌کنید، به صفحه نشست‌ها بروید و یک نشست مرورگر اضافه کنید (راهنمای استخراج توکن داخل فرم هست)." },
    { icon: Settings, text: "به صفحه تنظیمات بروید و کد دسترسی خود را تنظیم کنید — این کد به عنوان کلید API استفاده می‌شود." },
    { icon: Code2, text: "کلاینت خود (مثلاً برنامه پایتون یا cURL) را به آدرس دروازه متصل کنید و از کد دسترسی به عنوان کلید API استفاده کنید." },
    { icon: BarChart3, text: "داشبورد را بررسی کنید تا مطمئن شوید درخواست‌ها با موفقیت پردازش می‌شوند." },
  ] : [
    { icon: Server, text: "Go to the Providers page and add at least one provider (e.g. OpenAI with an API key, or ChatGPT Browser with a token)." },
    { icon: Globe, text: "If using a token-free provider, go to the Sessions page and add a browser session (token extraction guide is inside the form)." },
    { icon: Settings, text: "Go to Settings and set your access code — this code is used as your API key." },
    { icon: Code2, text: "Connect your client (e.g. Python app or cURL) to the gateway URL and use the access code as the API key." },
    { icon: BarChart3, text: "Check the Dashboard to confirm requests are being processed successfully." },
  ];

  const glossaryItems = [
    { term: t("glossaryProvider"), def: t("glossaryProviderDef"), icon: Server },
    { term: t("glossaryToken"), def: t("glossaryTokenDef"), icon: Zap },
    { term: t("glossarySession"), def: t("glossarySessionDef"), icon: Globe },
    { term: t("glossaryFallback"), def: t("glossaryFallbackDef"), icon: Layers },
    { term: t("glossaryRiskScore"), def: t("glossaryRiskScoreDef"), icon: Shield },
    { term: t("glossaryRotation"), def: t("glossaryRotationDef"), icon: RotateCw },
    { term: t("glossaryQuarantine"), def: t("glossaryQuarantineDef"), icon: Lock },
    { term: t("glossaryAccessCode"), def: t("glossaryAccessCodeDef"), icon: Lock },
    { term: t("glossaryPriority"), def: t("glossaryPriorityDef"), icon: Layers },
  ];

  const bestPractices = [
    { icon: Server, text: t("bestPractice1") },
    { icon: Globe, text: t("bestPractice2") },
    { icon: Clock, text: t("bestPractice3") },
    { icon: Shield, text: t("bestPractice4") },
    { icon: DollarSign, text: t("bestPractice5") },
    { icon: Lock, text: t("bestPractice6") },
    { icon: Code2, text: t("bestPractice7") },
    { icon: BarChart3, text: t("bestPractice8") },
  ];

  const antiDetectionFeatures = [
    { icon: Globe, text: t("antiDetection1") },
    { icon: Clock, text: t("antiDetection2") },
    { icon: Shield, text: t("antiDetection3") },
    { icon: AlertCircle, text: t("antiDetection4") },
    { icon: Lock, text: t("antiDetection5") },
    { icon: Layers, text: t("antiDetection6") },
  ];

  const multiAccountSteps = [
    { icon: Users, text: t("multiAccount1") },
    { icon: Globe, text: t("multiAccount2") },
    { icon: Server, text: t("multiAccount3") },
    { icon: RotateCw, text: t("multiAccount4") },
    { icon: Shield, text: t("multiAccount5") },
    { icon: Clock, text: t("multiAccount6") },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("guideTitle")}</h1>
        <p className={`text-sm mt-1 ${textSecondary}`}>{t("guideSubtitle")}</p>
      </div>

      {/* Quick Start */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <button onClick={() => toggleSection("quick-start")} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("guideQuickStart")}</h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("guideQuickStartDesc")}</p>
            </div>
          </div>
          {openSection === "quick-start" ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>
        {openSection === "quick-start" && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {quickStartSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <div className="flex items-start gap-2 flex-1">
                    <Icon className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Getting Started Overview */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <button onClick={() => toggleSection("getting-started")} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("gettingStarted")}</h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("gettingStartedDesc")}</p>
            </div>
          </div>
          {openSection === "getting-started" ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>
        {openSection === "getting-started" && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {[
              lang === "fa" ? "دروازه هوش مصنوعی را راه‌اندازی کنید." : "Set up the AI Gateway.",
              lang === "fa" ? "ارائه‌دهنده‌ها را اضافه و فعال کنید." : "Add and activate providers.",
              lang === "fa" ? "کد دسترسی را از تنظیمات دریافت کنید." : "Get your access code from Settings.",
              lang === "fa" ? "کلاینت خود را به دروازه متصل کنید." : "Connect your client to the gateway.",
              lang === "fa" ? "تحلیل‌ها و هزینه‌ها را پایش کنید." : "Monitor analytics and costs.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tutorials */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-violet-500" />
          <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("tutorials")}</h2>
        </div>
        <div className="space-y-2">
          {tutorials.map((tutorial) => {
            const Icon = tutorial.icon;
            return (
              <div key={tutorial.id} className={`rounded-lg border ${isDark ? "border-slate-800" : "border-slate-200"} overflow-hidden`}>
                <button onClick={() => toggleSection(tutorial.id)} className="flex items-center justify-between w-full p-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-start">
                      <h3 className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{tutorial.title}</h3>
                      <p className={`text-xs mt-0.5 ${textSecondary}`}>{tutorial.desc}</p>
                    </div>
                  </div>
                  {openSection === tutorial.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {openSection === tutorial.id && (
                  <div className="px-4 pb-4 space-y-2 animate-slide-up">
                    {tutorial.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 text-xs font-mono text-slate-400 mt-0.5">{t("step")} {i + 1}</span>
                        <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Account Strategy */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <button onClick={() => toggleSection("multi-account")} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("guideMultiAccount")}</h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("guideMultiAccountDesc")}</p>
            </div>
          </div>
          {openSection === "multi-account" ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>
        {openSection === "multi-account" && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {multiAccountSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <div className="flex items-start gap-2 flex-1">
                    <Icon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Anti-Detection Guide */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <button onClick={() => toggleSection("anti-detection")} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("guideAntiDetection")}</h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("guideAntiDetectionDesc")}</p>
            </div>
          </div>
          {openSection === "anti-detection" ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>
        {openSection === "anti-detection" && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3 animate-slide-up">
            {antiDetectionFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? "bg-slate-800/30" : "bg-slate-100/50"}`}>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{feature.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Best Practices */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <button onClick={() => toggleSection("best-practices")} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("guideBestPractices")}</h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("guideBestPracticesDesc")}</p>
            </div>
          </div>
          {openSection === "best-practices" ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>
        {openSection === "best-practices" && (
          <div className="mt-4 space-y-2.5 animate-slide-up">
            {bestPractices.map((bp, i) => {
              const Icon = bp.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{bp.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Glossary */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <button onClick={() => toggleSection("glossary")} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <BookMarked className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("guideGlossary")}</h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("guideGlossaryDesc")}</p>
            </div>
          </div>
          {openSection === "glossary" ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>
        {openSection === "glossary" && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3 animate-slide-up">
            {glossaryItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`p-4 rounded-lg ${isDark ? "bg-slate-800/30" : "bg-slate-100/50"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.term}</h3>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.def}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Code Examples */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-cyan-500" />
          <div>
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("codeExamplesTitle")}</h2>
            <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("codeExamplesTitleDesc")}</p>
          </div>
        </div>
        <div className="space-y-3">
          {codeExamples.map((example) => (
            <div key={example.id} className={`rounded-lg border ${isDark ? "border-slate-800" : "border-slate-200"} overflow-hidden`}>
              <div className={`flex items-center justify-between px-4 py-2 ${isDark ? "bg-slate-800/50" : "bg-slate-100"} border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>{example.lang}</span>
                <button onClick={() => copyCode(example.code, example.id)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-500 transition-colors">
                  {copiedCode === example.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === example.id ? t("copied") : t("copyKey")}
                </button>
              </div>
              <pre className={`p-4 text-xs overflow-x-auto scrollbar-thin ${isDark ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-700"}`}>
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("faqTitle")}</h2>
            <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("faqTitleDesc")}</p>
          </div>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-lg border ${isDark ? "border-slate-800" : "border-slate-200"} overflow-hidden`}>
              <button onClick={() => toggleSection(`faq-${i}`)} className="flex items-center justify-between w-full p-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                <span className={`text-sm font-medium text-start ${isDark ? "text-slate-200" : "text-slate-800"}`}>{faq.q}</span>
                {openSection === `faq-${i}` ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openSection === `faq-${i}` && (
                <p className={`px-4 pb-4 text-sm ${textSecondary} animate-slide-up`}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div>
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("troubleshootingTitle")}</h2>
            <p className={`text-xs mt-0.5 ${textSecondary}`}>{t("troubleshootingTitleDesc")}</p>
          </div>
        </div>
        <div className="space-y-2">
          {troubleshooting.map((item, i) => (
            <div key={i} className={`p-4 rounded-lg ${isDark ? "bg-slate-800/30" : "bg-slate-100/50"}`}>
              <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.issue}</p>
              <p className={`text-sm mt-1 ${textSecondary}`}>{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
