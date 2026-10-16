import test from "node:test";
import assert from "node:assert/strict";
import { createGatewayHandler } from "../supabase/functions/ai-gateway/handler.ts";

const request = (path, init = {}) =>
  new Request(`https://example.test/functions/v1/ai-gateway${path}`, init);
const config = {
  gatewayAccessToken: "test-gateway-secret",
  providerApiKey: "test-provider-secret",
  allowedOrigin: "https://app.example.test",
};
const auth = { Authorization: "Bearer test-gateway-secret" };
const message = { messages: [{ role: "user", content: "Hello" }] };

test("unauthenticated status is deliberately minimal", async () => {
  const res = await createGatewayHandler(config)(request("/api/status"));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("unknown routes deny without exposing upstream information", async () => {
  const res = await createGatewayHandler(config)(request("/anything"));
  assert.equal(res.status, 404);
});

test("gateway refuses unconfigured deployment", async () => {
  const res = await createGatewayHandler({})(request("/v1/models", { headers: auth }));
  assert.equal(res.status, 503);
});

test("protected model route rejects missing, malformed and wrong bearer credentials", async () => {
  for (const headers of [{}, { Authorization: "Basic test" }, { Authorization: "Bearer wrong" }]) {
    const res = await createGatewayHandler(config)(request("/v1/models", { headers }));
    assert.equal(res.status, 401);
  }
});

test("model list is returned to authorized clients", async () => {
  const res = await createGatewayHandler(config)(request("/v1/models", { headers: auth }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).object, "list");
});

test("allowed origin is explicit and wildcard origin never emitted", async () => {
  const handler = createGatewayHandler(config);
  const good = await handler(request("/v1/models", { headers: { ...auth, Origin: config.allowedOrigin } }));
  const bad = await handler(request("/v1/models", { headers: { ...auth, Origin: "https://untrusted.test" } }));
  assert.equal(good.headers.get("access-control-allow-origin"), config.allowedOrigin);
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

test("valid nonstream request proxies to provider using only configured credential", async () => {
  let called = 0;
  const handler = createGatewayHandler(config, async (_input, init) => {
    called++;
    assert.equal(init.headers.Authorization, "Bearer test-provider-secret");
    const body = JSON.parse(init.body);
    assert.equal(body.temperature, 0);
    assert.equal(body.max_tokens, 128);
    assert.equal(body.model, "DeepSeek-V4-Flash");
    return new Response(JSON.stringify({ choices: [] }), { status: 200 });
  });
  const res = await handler(request("/v1/chat/completions", {
    method: "POST", headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ ...message, temperature: 0, max_tokens: 128 }),
  }));
  assert.equal(res.status, 200);
  assert.equal(called, 1);
});

test("malformed and oversized input never reaches upstream", async () => {
  const handler = createGatewayHandler(config, async () => { throw Error("should not fetch"); });
  for (const input of ["not json", "[]", "{}", JSON.stringify({ ...message, max_tokens: 0 })]) {
    const res = await handler(request("/v1/chat/completions", {
      method: "POST", headers: auth, body: input,
    }));
    assert.equal(res.status, 400);
  }
  const oversized = await handler(request("/v1/chat/completions", {
    method: "POST", headers: auth, body: " ".repeat(1_000_001),
  }));
  assert.equal(oversized.status, 413);
});

test("upstream errors do not return private provider error bodies", async () => {
  const handler = createGatewayHandler(config, async () =>
    new Response("private-upstream-token-should-not-leak", { status: 429 }));
  const res = await handler(request("/v1/chat/completions", {
    method: "POST", headers: auth, body: JSON.stringify(message),
  }));
  assert.equal(res.status, 502);
  assert.doesNotMatch(await res.text(), /private-upstream-token/);
});

test("stream response is passed through only on upstream success", async () => {
  const handler = createGatewayHandler(config, async () =>
    new Response("data: {\"ok\":true}\n\n", {
      status: 200, headers: { "Content-Type": "text/event-stream" },
    }));
  const res = await handler(request("/v1/chat/completions", {
    method: "POST", headers: auth, body: JSON.stringify({ ...message, stream: true }),
  }));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/event-stream/);
  assert.match(await res.text(), /data:/);
});
