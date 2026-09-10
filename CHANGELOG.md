# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-10

### Added
- Complete professional bilingual documentation (English + Persian)
- AI_GUIDE.md for machine-readable project summary
- Full docs/ folder: Getting Started, API, Architecture, Performance, Deployment, Troubleshooting
- SECURITY.md with vulnerability reporting policy
- CONTRIBUTING.md with Conventional Commits standards
- GitHub issue templates (bug report, feature request, question)
- GitHub pull request template
- GitHub Actions CI workflow (lint, typecheck, build)
- GitHub FUNDING.yml for sponsors
- CODEOWNERS file
- Custom SVG logo with gradient design
- Enhanced Guide page with quick-start, glossary, anti-detection, multi-account, best practices
- Browser session multi-account support with account names
- Token extraction tutorials for ChatGPT, Gemini, and Claude
- Session expiry warnings (expiring soon, expired)
- Edge function session CRUD (POST, PUT, DELETE)
- Real session rotation logic in edge function

### Changed
- Updated README.md with badges, diagrams, and professional structure
- Updated README.fa.md with complete Persian translation
- Version bumped to 1.2.0

### Fixed
- Edge function session rotation now properly expires old session and activates next
- Session management now supports full CRUD operations

## [1.1.0] - 2026-09-10

### Added
- Full streaming support with SSE (Server-Sent Events)
- 4x speed improvement over direct API calls
- Smart path routing with automatic failover
- Professional documentation
- Security improvements (RLS, JWT, input validation)

### Fixed
- Edge Function boot error on cold start
- JWT demo key replaced with secure key
- Import conflict with @supabase/server resolved

## [1.0.0] - 2026-09-08

### Added
- Initial release
- ArvanCloud (DeepSeek-V4-Flash) provider support
- Monitoring dashboard with real-time analytics
- Supabase authentication and Row Level Security
- Modern UI with React 18, Vite, TypeScript, and Tailwind CSS
- Bilingual support (English / Persian)
- Dark and light theme
- Command palette
- Risk monitor with provider scoring
- Cost analysis with budget tracking
- Audit logs
- User management
