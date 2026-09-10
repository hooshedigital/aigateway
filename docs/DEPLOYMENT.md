# Deployment

## Prerequisites

- Docker and Docker Compose installed
- A Supabase instance (self-hosted or cloud)
- Domain name with DNS access (optional)

## Option 1: Deploy with Supabase Cloud

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your project URL and anon key.

### 2. Run Migrations

Go to the SQL Editor in your Supabase dashboard and run the migration files in order:

1. `supabase/migrations/20260903221500_create_ai_gateway_schema.sql`
2. `supabase/migrations/20260904110318_add_users_audit_notifications.sql`
3. `supabase/migrations/20260904113333_add_browser_api_management_tables.sql`
4. `supabase/migrations/20260904133831_add_cost_tracking_tables.sql`
5. `supabase/migrations/20260908214152_add_account_name_to_browser_sessions.sql`

### 3. Deploy the Edge Function

```bash
npm install
supabase functions deploy ai-gateway --no-verify-jwt
```

### 4. Build and Host the Frontend

```bash
npm run build
```

Upload the `dist/` directory to your hosting provider (Netlify, Vercel, Cloudflare Pages, or any static host).

### 5. Configure Environment

Set the following environment variables in your hosting provider:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Option 2: Self-Hosted with Docker

### 1. Clone and Configure

```bash
git clone https://github.com/hooshedigital/aigateway.git
cd aigateway
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 2. Start Supabase Self-Hosted

Follow the [Supabase self-hosting guide](https://supabase.com/docs/guides/self-hosting) to start Supabase with Docker Compose.

### 3. Run Migrations

```bash
supabase db push
```

### 4. Deploy the Edge Function

```bash
supabase functions deploy ai-gateway --no-verify-jwt
```

### 5. Build the Frontend

```bash
npm run build
```

Serve the `dist/` directory with nginx, Caddy, or any static file server.

## Production Checklist

- [ ] Set a strong access code (minimum 32 characters)
- [ ] Enable RLS on all database tables
- [ ] Configure CORS origins (avoid `*` in production)
- [ ] Set up rate limiting
- [ ] Add at least 2 providers per model
- [ ] Add 3-5 browser sessions per token-free provider
- [ ] Set monthly budget in Cost Analysis
- [ ] Configure alert webhooks (Slack/Discord)
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting
- [ ] Regularly rotate API keys and access codes

## Updating

To update to a new version:

```bash
git pull origin main
npm install
npm run build
supabase functions deploy ai-gateway --no-verify-jwt
```

Check the [CHANGELOG](../CHANGELOG.md) for breaking changes before updating.
