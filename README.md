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
