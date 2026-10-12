# Revera

Revera is a local-only research prototype that helps clinicians notice when a documented diagnosis may no longer be supported by the evolving record. It places the evidence timeline, diagnosis-status history, and explainable review signals in one workspace.

The included people, encounters, results, and diagnoses are entirely synthetic. Revera is **not a validated diagnostic device**, does not decide what diagnosis is correct, never changes diagnosis status, and does not recommend treatment.

## What works

- A responsive clinician workspace with a patient review queue, longitudinal evidence timeline, diagnosis thread, and review state.
- Two deterministic drift rules:
  - newer, diagnosis-linked evidence conflicts with a documented diagnosis;
  - an uncertain diagnosis becomes confirmed without new supporting evidence in the intervening chronology.
- Strict alert validation: every displayed alert must reference an existing diagnosis, known source record IDs, verbatim cited evidence, and records at or before the alert time.
- Optional Gemma 4 E2B explanations through a loopback-only `llama.cpp` server. The model may restate only code-detected candidates; invented candidates and malformed output are rejected.
- Honest degraded behavior when the local model is stopped, output is invalid, or evidence is insufficient.
- Persistent clinician review state in local SQLite.
- Three seeded trajectories: contradictory/unsupported, normally confirmed, and ambiguous.

## Quick start

Prerequisites: Node.js 20.9 or newer, pnpm 10, and SQLite. A local model is optional.

```bash
corepack enable
cp .env.example .env
pnpm install
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

If an older Corepack build rejects pnpm's current signing key, update Corepack through your system's Node installation, then rerun `corepack enable`. Do not switch this project to npm or yarn.

## Optional local AI

Gemma 4 E2B Instruct is available as an open-weight Google model. Recent `llama.cpp` releases implement the `gemma4` architecture and publish a maintained GGUF repository at [`ggml-org/gemma-4-E2B-it-GGUF`](https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF). Use a recent `llama.cpp` build—older builds predate Gemma 4 support.

Either let a current `llama-server` resolve the maintained repository:

```bash
llama-server \
  -hf ggml-org/gemma-4-E2B-it-GGUF \
  --host 127.0.0.1 \
  --port 8080 \
  -c 2048
```

Or download a compatible Q4 GGUF manually, name it `gemma-4-E2B-it-Q4_0.gguf`, keep it in the ignored `models/` directory, and run:

```bash
llama-server \
  -m ./models/gemma-4-E2B-it-Q4_0.gguf \
  --host 127.0.0.1 \
  --port 8080 \
  -c 2048
```

Revera calls only `http://127.0.0.1:8080/v1/chat/completions`. The server-side client refuses non-loopback `LLAMA_BASE_URL` values. Model weights are never downloaded by the application and must not be committed.

The `-hf` flow can download weights from Hugging Face, so complete any Gemma license acceptance directly with the model distributor. Once downloaded, record inference remains local. Gemma is used for constrained explanation—not for the underlying drift decision.

## How review works

```text
Synthetic SQLite record
        │
        ├── structured observations + diagnosis history
        │                     │
        │              deterministic rules
        │                     │
        │              validated candidates
        │                     │
        ├────────────── citation + chronology checks ──────► clinician UI
        │                     │
        │               optional local Gemma
        │             (candidate restatement only)
        │                     │
        └────────────── same validation gate ───────────────► clinician UI
```

For an unsupported confirmation, support must be diagnosis-linked, at least moderate strength, and recorded after the previous uncertain status but no later than the confirmation. For conflicting evidence, the structured observation must explicitly target that diagnosis and have at least moderate strength.

An LLM proposal is displayed only if it:

1. passes the Zod response schema;
2. matches a candidate already found by deterministic code;
3. uses only known source record IDs;
4. cites text present in the referenced record or structured observation; and
5. respects the event chronology.

The application sends no request to the model when deterministic rules find no review candidate.

## Project structure

```text
src/app/                 Next.js pages and local route handlers
src/components/          clinician workspace UI
src/lib/drift.ts         deterministic drift rules
src/lib/validation.ts    citation, identity, and chronology gate
src/lib/local-model.ts   loopback-only llama.cpp client
src/lib/repository.ts    validated data access and view models
src/lib/__tests__/       synthetic normal/adverse/ambiguous fixtures
prisma/                  SQLite schema, migration, and synthetic seed
models/                  ignored local GGUF files
```

API responses use a consistent envelope:

```json
{ "success": true, "data": {} }
```

or:

```json
{ "success": false, "error": "Safe public error message" }
```

Available routes:

- `GET /api/patients`
- `GET /api/patients/:patientId`
- `POST /api/patients/:patientId/analysis`
- `PATCH /api/alerts/:alertId`
- `GET /api/system/health`

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test` covers normal confirmation, contradictory evidence, ambiguous evidence, unsupported confirmation, invalid/future citations, malformed stored JSON, invented model diagnoses, and malformed model responses.

To recreate the demo records, rerun `pnpm exec prisma db seed`. This resets only the local synthetic Revera database contents.

## Privacy and limitations

- Do not enter or import real patient information. The app deliberately has no patient-ingestion workflow.
- `.env`, local SQLite databases, model weights, and logs are ignored by Git.
- Clinical record content is not logged by the application.
- All inference is server-side and restricted to loopback. No cloud AI, analytics, or external integration is configured.
- The deterministic rules operate only on explicit structured demo evidence. They do not understand the full clinical context and can miss or overstate discrepancies.
- "Needs clinician review" is a workflow state, not a diagnostic conclusion.

## Model assumption references

- [Google Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)
- [`llama.cpp` Gemma 4 multimodal model listing](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md)
- [`llama.cpp` OpenAI-compatible server](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
