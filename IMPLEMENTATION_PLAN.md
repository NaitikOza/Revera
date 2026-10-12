# Revera implementation plan

- [x] Read the project specification and inspect the repository.
- [x] Verify the local model, inference API, privacy boundary, and toolchain assumptions.
- [x] Initialize the Next.js, strict TypeScript, Tailwind, Prisma, and test toolchain.
- [x] Model and seed synthetic longitudinal records, diagnoses, status history, and review state.
- [x] Implement deterministic drift detection and strict citation/chronology validation.
- [x] Integrate optional local Gemma 4 review with validated, server-only structured output.
- [x] Build the clinician dashboard, evidence timeline, diagnosis history, and explainable alerts.
- [x] Add route handlers with consistent response envelopes and honest degraded states.
- [x] Test normal, contradictory, ambiguous, unsupported-alert, and invalid-model-output cases.
- [x] Verify migrations, types, lint, tests, production build, and core browser flows.
- [x] Finish setup, safety, architecture, and demo documentation; commit milestones.

## Usability redesign

- [x] Replace decorative navigation with working Home, Patients, and Reviews routes.
- [x] Split the all-in-one dashboard into focused patient profile, evidence, and review screens.
- [x] Add a short clinician-context questionnaire before analysis.
- [x] Rewrite review results in plain language with source details hidden by default.
- [x] Persist completed review sessions and feedback in local SQLite.

## Verified assumptions

- Gemma 4 E2B Instruct is a current Google open-weight model. Current `llama.cpp` builds support the `gemma4` architecture and expose `/v1/chat/completions` through `llama-server`.
- The maintained GGUF repository is `ggml-org/gemma-4-E2B-it-GGUF`. The exact local filename can vary by quantization/release, so Revera reads model details from environment variables and documents the Q4 download/start command rather than downloading weights automatically.
- Revera does not require the model to serve the deterministic safety rules. If the local server is absent, the UI reports that AI enrichment is unavailable and retains only code-validated rule findings.
- The repository contained only `AGENTS.md`. The surrounding home-directory Git repository is unrelated, so this directory uses its own Git repository and never stages parent files.

## Limitations to retain

- This is a synthetic-record research demonstration, not a diagnostic device or clinical decision support system validated for care.
- No model weights, SQLite database, environment secrets, or real patient data belong in Git.
- This workstation does not currently have `llama-server` or a Gemma GGUF installed. The model boundary is covered by accepted/rejected response tests and the browser-verified offline fallback, but live generation requires the operator setup in `README.md`.
