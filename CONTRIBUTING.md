# Contributing to AI Gateway

Thank you for your interest in contributing to AI Gateway! This document outlines the process for contributing to the project.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aigateway.git
   cd aigateway
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

1. Make your changes.
2. Ensure the code lints and type-checks:
   ```bash
   npm run lint
   npm run typecheck
   ```
3. Ensure the project builds:
   ```bash
   npm run build
   ```
4. Commit your changes following our commit message standards (below).
5. Push to your fork and open a Pull Request.

## Commit Message Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding or correcting tests |
| `chore` | Changes to the build process or auxiliary tools |

### Examples

```
feat: add Groq provider support
fix: resolve streaming timeout on large responses
docs: update API reference with new endpoints
perf: optimize token rotation interval
```

## Pull Request Process

1. Update the documentation if your changes affect the API or architecture.
2. Ensure all checks pass (lint, typecheck, build).
3. Link any relevant issues in your PR description.
4. A maintainer will review your PR and may request changes.
5. Once approved, your PR will be merged.

### PR Template

When opening a PR, please include:

- **Summary**: What does this PR do?
- **Related Issue**: Links to any related issues.
- **Changes**: List of key changes.
- **Testing**: How you tested the changes.
- **Breaking Changes**: Any breaking changes (if applicable).

## Code Standards

- **Language**: TypeScript for all frontend code. Deno-compatible TypeScript for Edge Functions.
- **Formatting**: Follow the existing code style in the repository.
- **Naming**: Use descriptive names. Components are PascalCase, functions are camelCase.
- **Imports**: Use the `@/` path alias for project imports (maps to `src/`).
- **Icons**: Use `lucide-react` for all icons.
- **Styling**: Use Tailwind CSS classes. Follow the existing design system.
- **No Emojis**: Do not use emojis in code or comments.

## Project Structure

- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/contexts/` - React context providers
- `src/lib/` - Utility libraries
- `supabase/functions/` - Deno Edge Functions
- `supabase/migrations/` - SQL migration files
- `docs/` - Documentation

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) to report bugs. Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)

## Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) to suggest new features. Include:

- Clear description of the proposed feature
- Use case and motivation
- Possible implementation approach

## Questions

For questions, use the [question template](.github/ISSUE_TEMPLATE/question.md) or email info@hooshedigital.ir.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
