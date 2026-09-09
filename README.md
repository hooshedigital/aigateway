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
