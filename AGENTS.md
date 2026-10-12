# AGENTS.md — Revera

## Project
- **Purpose:** Local-only hackathon prototype that helps clinicians review possible diagnostic anchoring by comparing evolving synthetic patient evidence with documented diagnoses.
- **Stack:** Next.js (App Router), TypeScript (strict), Tailwind CSS, Next.js Route Handlers, SQLite + Prisma, and `llama.cpp` running Gemma 4 E2B Instruct (GGUF Q4_0).
- **Scope:** A clinician dashboard with a longitudinal evidence timeline, diagnosis-status history, and explainable alerts. This is a research/demo tool, **not** a validated diagnostic device.

## Local Setup & Checks
- Use **pnpm** only. Do not introduce cloud hosting, paid APIs, or services requiring purchased credits.
- Install: `pnpm install`.
- Copy `.env.example` to `.env`; configure `DATABASE_URL` for local SQLite and `LLAMA_BASE_URL=http://127.0.0.1:8080/v1`. Keep `.env` untracked. Ensure `prisma.config.ts` reads `DATABASE_URL`.
- Initialize/update the database: `pnpm exec prisma migrate dev`, then `pnpm exec prisma generate`.
- Start the local model in a separate terminal (after downloading the GGUF):
  `llama-server -m ./models/gemma-4-E2B-it-Q4_0.gguf --host 127.0.0.1 --port 8080 -c 2048`
- Start the site: `pnpm dev` → `http://localhost:3000`.
- Define and run the project scripts `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`; do not assume a script exists until it is added to `package.json`.

## Code Organization & Conventions
- `src/app/` — UI routes; `src/app/api/` — server-side endpoints; `src/components/` — reusable UI.
- `src/lib/` — data access, local LLM client, evidence validation, and drift logic; `prisma/` — schema/migrations; `models/` — ignored GGUF files.
- Use strict TypeScript, Zod for external/model responses, Tailwind for styling, and `@/` imports mapped to `src/`. Keep modules small and focused.
- Keep LLM calls server-side via `LLAMA_BASE_URL` and `/v1/chat/completions`. Return consistent JSON: `{ success, data?, error? }`.
- Prefer Next.js built-ins and React local state; add dependencies only when necessary.

## Revera Rules
- **Synthetic/de-identified demo records only.** Never ingest actual patient-identifiable data, send clinical records to remote services, or log sensitive record contents.
- Detect two core patterns: **new evidence conflicts with a documented diagnosis** and **an uncertain diagnosis becomes "confirmed" without supporting evidence**.
- Require every alert to include a time, the relevant diagnosis, source record IDs, cited evidence, and a clear explanation of uncertainty. Verify cited IDs and chronology in code before displaying an alert.
- Treat LLM output as untrusted suggestions: validate its JSON, do not invent findings, and never silently change diagnosis status or recommend autonomous treatment. Show "needs clinician review," not a definitive diagnosis.
- When the LLM is unavailable or evidence is insufficient, show an honest error/insufficient-evidence state. Any precomputed demo alerts must be labeled as such.
- Test normal, contradictory, ambiguous, and unsupported-alert cases using synthetic fixtures.

## Agent Autonomy
- **Always:** Keep all processing local, write tests for drift rules and evidence validation, and run available typecheck/lint/tests after changes.
- **Ask first:** Before adding dependencies, making destructive database changes, changing security boundaries, or introducing external integrations.
- **Never:** Commit `.env`, secrets, real patient data, database files, or model weights; bypass failing tests; force-push protected branches; or claim clinical validation/compliance without evidence.

## Git
- Branches: `feat/short-description` or `fix/short-description`.
- Commits: Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`).
- Before a PR: check types, lint, tests, build, and any Prisma migration files. Ignore `models/`, local SQLite files, and `.env` in `.gitignore`.
