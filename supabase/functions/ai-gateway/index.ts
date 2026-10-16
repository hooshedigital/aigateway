import { createGatewayHandler } from "./handler.ts";

// The public /api/status endpoint remains unauthenticated; all model access
// fails closed unless both secrets are configured in the Edge Function runtime.
const handler = createGatewayHandler({
  gatewayAccessToken: Deno.env.get("ACCESS_CODE"),
  providerApiKey: Deno.env.get("ARVANCLOUD_API_KEY"),
  allowedOrigin: Deno.env.get("GATEWAY_ALLOWED_ORIGIN"),
});

Deno.serve(handler);
