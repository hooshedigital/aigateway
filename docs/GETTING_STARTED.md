# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([install](https://docs.docker.com/get-docker/))
- **Supabase CLI** ([install](https://supabase.com/docs/guides/cli))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hooshedigital/aigateway.git
cd aigateway
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ACCESS_CODE=your-secure-access-code
```

### 4. Set Up the Database

Run the SQL migrations in your Supabase SQL editor in order:

1. `supabase/migrations/20260903221500_create_ai_gateway_schema.sql`
2. `supabase/migrations/20260904110318_add_users_audit_notifications.sql`
3. `supabase/migrations/20260904113333_add_browser_api_management_tables.sql`
4. `supabase/migrations/20260904133831_add_cost_tracking_tables.sql`
5. `supabase/migrations/20260908214152_add_account_name_to_browser_sessions.sql`

### 5. Deploy the Edge Function

```bash
supabase functions deploy ai-gateway --no-verify-jwt
```

### 6. Build the Frontend

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 7. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Configuration

### Adding Your First Provider

1. Navigate to the **Providers** page in the dashboard.
2. Click **Add Provider**.
3. Enter the provider name, type, base URL, and API key.
4. Add supported models (comma-separated).
5. Set the priority (lower number = higher priority).
6. Save.

### Setting Your Access Code

1. Go to the **Settings** page.
2. Set your access code in the access code field.
3. This code is used as the Bearer token for all API calls.
4. Save.

### Making Your First Request

```bash
curl -X POST https://your-supabase-url/functions/v1/ai-gateway/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## Next Steps

- [API Reference](API.md) - Learn the full API
- [Architecture](ARCHITECTURE.md) - Understand the system design
- [Deployment](DEPLOYMENT.md) - Deploy to production
- [Performance](PERFORMANCE.md) - Benchmark your setup
