const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

console.log("🚀 AI Gateway with streaming support loaded");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fullPath = url.pathname;
    console.log(`[AI Gateway] ${req.method} ${fullPath}`);

    // Status endpoint
    if (fullPath.includes("/api/status") && req.method === "GET") {
      return new Response(
        JSON.stringify({ 
          status: "ok", 
          message: "AI Gateway is running with streaming!",
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test ArvanCloud directly
    if (fullPath.includes("/test-arvan") && req.method === "POST") {
      const r = await fetch("https://api.arvancloudai.ir/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 47385367-8fb7-5fe2-ad21-c9302a35cbd1"
        },
        body: JSON.stringify({
          model: "DeepSeek-V4-Flash",
          messages: [{ role: "user", content: "Say OK" }],
          stream: false
        })
      });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // List models
    if (fullPath.includes("/v1/models") && req.method === "GET") {
      return new Response(
        JSON.stringify({
          object: "list",
          data: [{ id: "DeepSeek-V4-Flash", object: "model", owned_by: "arvancloud" }]
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chat completions with streaming support
    if (fullPath.includes("/v1/chat/completions") && req.method === "POST") {
      try {
        const body = await req.json();
        const stream = body.stream === true;
        
        console.log(`[AI Gateway] Chat request - Model: ${body.model}, Stream: ${stream}`);

        const arvanResponse = await fetch("https://api.arvancloudai.ir/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 47385367-8fb7-5fe2-ad21-c9302a35cbd1"
          },
          body: JSON.stringify({
            model: body.model || "DeepSeek-V4-Flash",
            messages: body.messages || [],
            temperature: body.temperature || 0.7,
            max_tokens: body.max_tokens || 1000,
            stream: stream
          })
        });

        // اگر streaming درخواست شده، مستقیماً stream را برگردان
        if (stream) {
          console.log("[AI Gateway] Returning streaming response");
          return new Response(arvanResponse.body, {
            status: arvanResponse.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
            }
          });
        }

        // در غیر این صورت، پاسخ JSON را برگردان
        const data = await arvanResponse.text();
        return new Response(data, {
          status: arvanResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("[AI Gateway] Chat error:", err);
        return new Response(
          JSON.stringify({ error: "Chat failed", details: String(err) }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Default 404
    return new Response(
      JSON.stringify({ error: "Not found", fullPath }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[AI Gateway] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
