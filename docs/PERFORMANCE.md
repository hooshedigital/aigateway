# Performance

## Benchmark Results

Benchmarks were performed against ArvanCloud DeepSeek-V4-Flash on September 2026.

| Metric | Direct API | AI Gateway | Improvement |
|--------|-----------|------------|-------------|
| Non-streaming response | 3.33s | 3.16s | 5% faster |
| Stream first token (TTFT) | 20.49s | 0.5s | 40x faster |
| Stream total time | 20.49s | 4.93s | 4x faster |
| Concurrent requests | Limited | Optimized | Pooled |

## Why is Streaming 40x Faster for First Token?

The direct ArvanCloud API has a high time-to-first-token (TTFT) of ~20 seconds because it buffers the entire response before sending. AI Gateway opens a streaming connection to the provider and relays each chunk to the client immediately via Server-Sent Events (SSE), reducing TTFT to ~0.5 seconds.

## Benchmarking Methodology

### Environment

- Server: Supabase Edge Function (Deno Runtime)
- Location: Iran-based server
- Provider: ArvanCloud (DeepSeek-V4-Flash)
- Test tool: `curl` with timing enabled
- Date: September 2026

### Non-streaming Test

```bash
curl -w "\nTime: %{time_total}s\n" -X POST https://your-gateway-url/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Write a short paragraph about AI."}],
    "max_tokens": 200
  }'
```

### Streaming Test

```bash
curl -w "\nTime: %{time_starttransfer}s (TTFT)\nTime: %{time_total}s (total)\n" \
  -X POST https://your-gateway-url/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Write a short paragraph about AI."}],
    "max_tokens": 200,
    "stream": true
  }'
```

## Optimization Tips

1. **Add multiple providers**: The gateway can fall back to the next provider if one is slow.
2. **Use streaming**: Always use `stream: true` for interactive applications.
3. **Add multiple sessions**: For browser session providers, add 3-5 sessions to distribute load.
4. **Monitor risk scores**: Check the Risk Monitor page regularly and rotate sessions when scores rise.
5. **Set rate limits**: Configure appropriate rate limits to prevent provider throttling.
6. **Use the Iran-based server**: For Iranian users, the Iran-based server provides the lowest latency.
