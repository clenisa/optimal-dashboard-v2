# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, and server components.
- `components/` & `hooks/`: Reusable UI primitives and React utilities shared across views.
- `services/`, `lib/`, `store/`: API clients, data helpers, and Zustand stores supporting dashboard logic.
- `database/` & `scripts/`: Seed data, SQL, and operational scripts (e.g., AI chat harness).
- `public/`, `styles/`, `docs/`: Static assets, Tailwind layers, and user-facing documentation.

## Build, Test, and Development Commands
- `npm run dev` (or `pnpm dev`): Start the local Next.js dev server with hot reloading.
- `npm run build`: Produce an optimized production build; run before deploying.
- `npm run start`: Serve the build output locally to verify runtime behavior.
- `npm run lint`: Execute `next lint` with the configured ESLint and TypeScript rules.
- `scripts/test-ai-chat.sh`: Bash harness for validating the AI chat workflow end-to-end.
- `tests/`: Comprehensive Playwright test suite with Page Object Model and utilities.

## Coding Style & Naming Conventions
- TypeScript-first codebase; prefer `.tsx` for components and `.ts` for server utilities.
- Keep imports absolute from `@/` aliases defined in `tsconfig.json` for clarity.
- Follow Tailwind utility-first styling; centralize tokens in `tailwind.config.ts` and `styles/`.
- Use 2-space indentation, camelCase for functions/variables, PascalCase for components, and kebab-case for filenames in `app/` routes.
- Run `npm run lint` before submitting to ensure ESLint, TypeScript, and formatting checks pass.

## Testing Guidelines
- **E2E Testing**: Comprehensive Playwright test suite with 135+ tests across 6 browsers
- **Test Coverage**: Complete feature coverage map in `tests/test-coverage-map.md`
- **Test Structure**: Page Object Model with reusable utilities in `tests/` directory
- **Test Commands**: Use `npm run test:*` commands for different testing scenarios
- **Test Data**: Centralized test fixtures and environment configuration
- **CI/CD Ready**: Tests configured for continuous integration with retry logic and reporting

## Commit & Pull Request Guidelines
- Write concise commits in imperative mood (`feat: add payment notes column`, `fix: handle null session`).
- Squash trivial fixes locally; keep history focused on meaningful units of work.
- PRs should include: context summary, screenshots for UI changes, linked Linear/GitHub issues, and testing notes.
- Request review from domain owners of touched areas (`app/`, `services/`, etc.) and respond to feedback promptly.

## Environment & Configuration
- Store secrets in `.env.local`; copy from `.env.example` if available and never commit credentials.
- Stripe and Supabase keys drive most integrations—recycle keys when rotating environments.
- Docker Compose targets local dependencies; run `docker compose up database` when hacking on Supabase migrations.

# Refactor Guardrails (Non-Breaking)
- Do NOT change public APIs or externally visible behavior.
- Keep exported function/class names and prop shapes used by other modules.
- Prefer composition over inheritance; keep functions under ~60 lines.
- Add/keep TypeScript types & JSDoc where unclear.
- Remove dead code and duplicate utilities; centralize helpers in /lib.
- Fix ESLint/formatting issues as part of the refactor.
- Update or add tests only to lock current behavior (no new features).
- Always run: pnpm lint && pnpm typecheck && pnpm -s test || echo "no tests" before proposing final patch.