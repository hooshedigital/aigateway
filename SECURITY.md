# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.2.x   | Yes       |
| 1.1.x   | Yes       |
| 1.0.x   | No        |
| < 1.0   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public GitHub issue.**
2. Email **info@hooshedigital.ir** with a detailed description of the vulnerability.
3. Include steps to reproduce, potential impact, and any suggested fixes.
4. You will receive an acknowledgment within 48 hours.
5. We will investigate and provide a fix in the next release or a hotpatch.

## Security Features

AI Gateway implements the following security measures:

- **Row Level Security (RLS)**: All database tables have RLS enabled with per-user ownership policies.
- **JWT Authentication**: API access requires a valid Bearer token (access code).
- **No Hardcoded Keys**: API keys are stored in the database, never in source code.
- **CORS Configuration**: Configurable allowed origins to prevent unauthorized cross-origin requests.
- **Rate Limiting**: Configurable rate limits per client to prevent abuse.
- **Input Validation**: All API inputs are validated before processing.
- **Audit Logging**: All administrative actions are logged for traceability.

## Best Practices for Deployment

- Use a strong, unique access code (minimum 32 characters).
- Enable RLS on all database tables.
- Regularly rotate API keys and access codes.
- Set restrictive CORS origins (avoid `*` in production).
- Keep your Supabase instance updated.
- Monitor the Audit Logs page for suspicious activity.
- Use HTTPS exclusively in production.
