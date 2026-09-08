import { useState } from "react";
import { Copy, Check, Terminal, Code2, Zap, HelpCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function ApiDocs() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const endpoints = [
    { method: "POST", path: "/v1/chat/completions", desc: "Send a chat completion request" },
    { method: "GET", path: "/v1/models", desc: "List all available models from active providers" },
    { method: "GET", path: "/api/status", desc: "Get gateway status and active provider list" },
  ];

  const examples: Record<string, string> = {
    curl: `curl -X POST https://aigateway.hooshedigital.ir/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
    python: `import requests

response = requests.post(
    "https://aigateway.hooshedigital.ir/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_ACCESS_CODE",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)

print(response.json()["choices"][0]["message"]["content"])`,
    javascript: `const response = await fetch(
  "https://aigateway.hooshedigital.ir/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_ACCESS_CODE",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello!" }]
    })
  }
);

const data = await response.json();
console.log(data.choices[0].message.content);`,
    openai: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://aigateway.hooshedigital.ir/v1",
  apiKey: "YOUR_ACCESS_CODE"
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }]
});

console.log(response.choices[0].message.content);`,
    php: `<?php
$ch = curl_init("https://aigateway.hooshedigital.ir/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer YOUR_ACCESS_CODE",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "gpt-4o",
    "messages" => [["role" => "user", "content" => "Hello!"]]
]));

$response = json_decode(curl_exec($ch), true);
echo $response["choices"][0]["message"]["content"];`,
  };

  const [activeTab, setActiveTab] = useState<string>("curl");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openIssue, setOpenIssue] = useState<number | null>(0);

  const faqItems = [
    { q: "How do I get an access code?", a: "The access code is configured in the Settings page. The default code is set during gateway initialization and can be changed anytime." },
    { q: "Which models are supported?", a: "The gateway supports any model offered by the configured providers. This includes GPT-4o, Claude 3.5, Gemini, Llama, and more. See the Providers page for the full list." },
    { q: "Is the API compatible with the OpenAI SDK?", a: "Yes. The gateway implements the OpenAI Chat Completions API format. Any OpenAI-compatible client can connect by setting the base URL and using the access code as the API key." },
    { q: "What happens when a provider fails?", a: "If a provider returns an error or hits a rate limit, the gateway automatically falls back to the next provider in priority order that supports the requested model." },
    { q: "Can I use streaming responses?", a: "Yes, the gateway supports Server-Sent Events (SSE) streaming. Set \"stream\": true in your request body to receive streamed chunks." },
    { q: "How is usage tracked?", a: "Every request is logged with provider, model, response time, token count, and status. Daily aggregated statistics are available on the Dashboard." },
  ];

  const troubleshootingItems = [
    { problem: "401 Unauthorized", solution: "Check that your Authorization header includes a valid Bearer token matching the access code in Settings." },
    { problem: "503 No provider available", solution: "No active provider supports the requested model. Activate a provider that offers this model, or try a different model." },
    { problem: "429 Rate limit exceeded", solution: "You have exceeded the per-minute rate limit configured in Settings. Wait a moment and retry, or increase the limit." },
    { problem: "Timeout errors", solution: "If a provider takes too long, the gateway falls back to the next one. Check provider health on the Dashboard." },
    { problem: "Model not found", solution: "The requested model is not in any active provider's model list. Check the Providers page to see which models are available." },
  ];

  const fallbackSteps = [
    { step: "1", titleKey: "priorityOrder", descKey: "priorityOrderDesc" },
    { step: "2", titleKey: "modelMatching", descKey: "modelMatchingDesc" },
    { step: "3", titleKey: "automaticFallback", descKey: "automaticFallbackDesc" },
    { step: "4", titleKey: "logging", descKey: "loggingDesc" },
  ] as const;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("apiDocsTitle")}</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("apiDocsSubtitle")}</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-cyan-500" />
          <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("quickStart")}</h2>
        </div>
        <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{t("quickStartDesc")}</p>
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white/60 border-slate-200"} border font-mono text-sm`}>
          <span className="text-slate-500">Base URL:</span>
          <span className="text-cyan-500">https://aigateway.hooshedigital.ir/v1</span>
          <button onClick={() => copy("https://aigateway.hooshedigital.ir/v1", "baseurl")} className="ms-auto">
            {copied === "baseurl" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500 hover:text-slate-300" />}
          </button>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
        <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <h2 className={`font-semibold text-lg flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}><Terminal className="w-5 h-5 text-slate-500" />{t("endpoints")}</h2>
        </div>
        <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
          {endpoints.map((ep) => (
            <div key={ep.path} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${ep.method === "GET" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"}`}>{ep.method}</span>
              <code className="text-sm text-slate-700 dark:text-slate-200 font-mono flex-1">{ep.path}</code>
              <span className="text-sm text-slate-500 hidden sm:block">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
        <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <h2 className={`font-semibold text-lg flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}><Code2 className="w-5 h-5 text-slate-500" />{t("codeExamples")}</h2>
        </div>
        <div className={`flex items-center gap-1 px-4 pt-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"} pb-px overflow-x-auto scrollbar-thin`}>
          {Object.keys(examples).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab ? `bg-slate-100 dark:bg-slate-800 ${isDark ? "text-slate-100" : "text-slate-900"} border-b-2 border-cyan-500` : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>
              {tab === "openai" ? "OpenAI SDK" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <pre className={`p-6 text-sm font-mono overflow-x-auto scrollbar-thin leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}><code>{examples[activeTab]}</code></pre>
          <button onClick={() => copy(examples[activeTab], activeTab)} className="absolute top-4 end-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {copied === activeTab ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
          <div className={`px-6 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}><h3 className={`font-semibold text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("requestBody")}</h3></div>
          <pre className="p-6 text-xs text-slate-500 font-mono overflow-x-auto scrollbar-thin leading-relaxed">{`{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}`}</pre>
        </div>
        <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
          <div className={`px-6 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}><h3 className={`font-semibold text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("responseFormat")}</h3></div>
          <pre className="p-6 text-xs text-slate-500 font-mono overflow-x-auto scrollbar-thin leading-relaxed">{`{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "Hello!"},
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}`}</pre>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl`}>
        <h2 className={`font-semibold text-lg mb-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("howFallbackWorks")}</h2>
        <div className="space-y-3">
          {fallbackSteps.map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{item.step}</div>
              <div>
                <h4 className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t(item.titleKey)}</h4>
                <p className={`text-sm mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className={`${cardBg} rounded-xl border backdrop-blur-xl overflow-hidden`}>
        <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-500" />
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("faq")}</h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("faqDesc")}</p>
        </div>
        <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
          {faqItems.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-start hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className={`px-6 pb-4 animate-fade-in`}>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className={`${cardBg} rounded-xl border backdrop-blur-xl overflow-hidden`}>
        <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("troubleshooting")}</h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("troubleshootingDesc")}</p>
        </div>
        <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
          {troubleshootingItems.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIssue(openIssue === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-start hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <span className={`text-sm font-medium font-mono ${isDark ? "text-amber-400" : "text-amber-600"}`}>{item.problem}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openIssue === i ? "rotate-180" : ""}`} />
              </button>
              {openIssue === i && (
                <div className={`px-6 pb-4 animate-fade-in`}>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.solution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
