# Troubleshooting

## Common Issues

### Gateway Not Responding

**Symptom**: Requests to the gateway return no response or timeout.

**Solution**:
1. Check that the edge function is deployed: `supabase functions list`
2. Verify at least one provider is active in the Providers page.
3. Check that the provider has a valid API key set.
4. Verify your access code is correct in the Settings page.
5. Check the Supabase dashboard for function logs.

### Error 429 (Rate Limit)

**Symptom**: Gateway returns HTTP 429 Too Many Requests.

**Solution**:
1. Increase the rate limit in the Settings page.
2. Activate more providers to distribute load.
3. Add multiple browser sessions for token-free providers.
4. Check if the upstream provider is rate-limiting your API key.

### Error 401 (Unauthorized)

**Symptom**: Gateway returns HTTP 401 Unauthorized.

**Solution**:
1. Verify you are sending the `Authorization: Bearer YOUR_ACCESS_CODE` header.
2. Check that the access code in Settings matches what you are sending.
3. Ensure there are no extra spaces or newlines in the access code.

### Browser Session Expired

**Symptom**: Token-free provider returns errors or 403 Forbidden.

**Solution**:
1. Go to the Sessions page and check the session status.
2. If expired, log into the provider website and extract a new token.
3. Update the session with the new token.
4. Set an expiry date to track when to refresh next time.
5. Add multiple sessions to avoid downtime during token refresh.

### Provider Quarantined

**Symptom**: A provider shows "Quarantined" status on the Risk Monitor page.

**Solution**:
1. Check the provider's risk score on the Risk Monitor page.
2. If the score is above 80, the provider was auto-quarantined.
3. Rotate browser sessions or update the API key.
4. Once the issue is resolved, click "Unquarantine" to re-enable.
5. Monitor the risk score after unquarantining.

### Costs Not Showing

**Symptom**: The Cost Analysis page shows no data.

**Solution**:
1. Ensure model pricing is configured in the Cost Analysis page.
2. Verify that requests are being logged (check the Logs page).
3. Make sure the `cost_tracking` table has entries.

### Streaming Not Working

**Symptom**: Streaming requests return the full response instead of chunks.

**Solution**:
1. Ensure you are sending `"stream": true` in the request body.
2. Check that your client supports Server-Sent Events (SSE).
3. Verify the provider supports streaming for the requested model.

### Build Fails

**Symptom**: `npm run build` returns errors.

**Solution**:
1. Run `npm run typecheck` to see TypeScript errors.
2. Run `npm run lint` to see lint errors.
3. Ensure all imports use the `@/` path alias (e.g. `@/components/Foo`).
4. Check that all imported icons exist in `lucide-react`.
5. Delete `node_modules/` and run `npm install` again.

### Edge Function Cold Start

**Symptom**: First request after idle period is slow.

**Solution**: This is normal for serverless functions. The Deno runtime needs to "warm up" after being idle. Subsequent requests will be fast. If this is a problem, consider setting up a health check ping every few minutes.

## Getting More Help

- [Documentation](../docs/)
- [GitHub Issues](https://github.com/hooshedigital/aigateway/issues)
- Email: [info@hooshedigital.ir](mailto:info@hooshedigital.ir)
