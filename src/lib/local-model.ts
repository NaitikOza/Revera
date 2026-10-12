import type { AnalysisCase } from "@/lib/domain";
import { modelResponseSchema, type ReviewAlert, type ReviewContext } from "@/lib/schemas";
import { proposalToAlert } from "@/lib/validation";
import { z } from "zod";

const completionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string().min(1) }),
    }),
  ).min(1),
});

const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);

function getConfig() {
  const rawBaseUrl = process.env.LLAMA_BASE_URL ?? "http://127.0.0.1:8080/v1";
  const baseUrl = new URL(rawBaseUrl);
  if (!loopbackHosts.has(baseUrl.hostname)) {
    throw new Error("LLAMA_BASE_URL must resolve to the local machine.");
  }
  return {
    baseUrl: baseUrl.toString().replace(/\/$/, ""),
    model: process.env.LLAMA_MODEL ?? "gemma-4-E2B-it-Q4_0",
    timeoutMs: Number.parseInt(process.env.LLAMA_TIMEOUT_MS ?? "18000", 10),
  };
}

function extractJson(content: string): unknown {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);
  return JSON.parse(candidate.trim());
}

function caseForPrompt(analysisCase: AnalysisCase) {
  return {
    diagnoses: analysisCase.diagnoses.map((diagnosis) => ({
      id: diagnosis.id,
      name: diagnosis.name,
      firstDocumentedAt: diagnosis.firstDocumentedAt.toISOString(),
      currentStatus: diagnosis.currentStatus,
      history: diagnosis.history.map((event) => ({
        changedAt: event.changedAt.toISOString(),
        status: event.status,
        sourceRecordId: event.sourceRecordId,
        supportingRecordIds: event.supportingRecordIds,
      })),
    })),
    records: analysisCase.records.map((record) => ({
      id: record.id,
      recordedAt: record.recordedAt.toISOString(),
      title: record.title,
      summary: record.summary,
      observations: record.observations,
    })),
  };
}

export interface ModelReviewResult {
  status: "available" | "unavailable" | "invalid" | "not_needed";
  model: string;
  alerts: ReviewAlert[];
  rejectedCount: number;
  message: string;
}

export async function reviewWithLocalModel(
  analysisCase: AnalysisCase,
  ruleAlerts: ReviewAlert[],
  context?: ReviewContext,
): Promise<ModelReviewResult> {
  const config = getConfig();
  if (ruleAlerts.length === 0) {
    return {
      status: "not_needed",
      model: config.model,
      alerts: [],
      rejectedCount: 0,
      message: "No code-verified drift candidate had enough evidence for model review.",
    };
  }

  const allowedCandidates = ruleAlerts.map((alert) => ({
    diagnosisId: alert.diagnosisId,
    kind: alert.kind,
    sourceRecordIds: alert.sourceRecordIds,
  }));
  const prompt = [
    "You are reviewing a synthetic clinical training case. This is not a request for treatment or a definitive diagnosis.",
    "Return JSON only with shape {\"alerts\": [...]}. Use only the supplied record IDs and exact short quotes found in those records.",
    "You may restate only the code-detected candidates listed below. Do not create a new diagnosis, finding, record, or candidate.",
    "Each alert needs diagnosisId, kind, severity, detectedAt, sourceRecordIds, citedEvidence, explanation, and uncertainty.",
    `Allowed candidates: ${JSON.stringify(allowedCandidates)}`,
    context ? `Clinician review context: ${JSON.stringify(context)}` : "No review context was supplied.",
    `Synthetic case: ${JSON.stringify(caseForPrompt(analysisCase))}`,
  ].join("\n\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) throw new Error(`Local model returned HTTP ${response.status}.`);

    const completion = completionSchema.parse(await response.json());
    const parsed = modelResponseSchema.parse(
      extractJson(completion.choices[0].message.content),
    );

    const accepted: ReviewAlert[] = [];
    let rejectedCount = 0;
    parsed.alerts.forEach((proposal, index) => {
      const isAllowed = ruleAlerts.some(
        (alert) =>
          alert.diagnosisId === proposal.diagnosisId &&
          alert.kind === proposal.kind &&
          proposal.sourceRecordIds.every((id) => alert.sourceRecordIds.includes(id)),
      );
      if (!isAllowed) {
        rejectedCount += 1;
        return;
      }
      const validation = proposalToAlert(proposal, analysisCase, index);
      if (validation.valid && validation.alert) accepted.push(validation.alert);
      else rejectedCount += 1;
    });

    return {
      status: rejectedCount > 0 && accepted.length === 0 ? "invalid" : "available",
      model: config.model,
      alerts: accepted,
      rejectedCount,
      message:
        accepted.length > 0
          ? "Local Gemma suggestions passed schema, source, quote, and chronology validation."
          : "The local model returned no additional validated explanation.",
    };
  } catch (error) {
    const invalid = error instanceof z.ZodError || error instanceof SyntaxError;
    return {
      status: invalid ? "invalid" : "unavailable",
      model: config.model,
      alerts: [],
      rejectedCount: invalid ? 1 : 0,
      message: invalid
        ? "The local model response did not pass validation and was not displayed."
        : "Local AI enrichment is unavailable. Code-verified review signals remain available.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkLocalModel(): Promise<{
  status: "available" | "unavailable" | "misconfigured";
  model: string;
  message: string;
}> {
  let config: ReturnType<typeof getConfig>;
  try {
    config = getConfig();
  } catch {
    return {
      status: "misconfigured",
      model: "unknown",
      message: "The local model URL must use localhost or a loopback address.",
    };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      signal: controller.signal,
      cache: "no-store",
    });
    return response.ok
      ? { status: "available", model: config.model, message: "Local model connected." }
      : { status: "unavailable", model: config.model, message: "Local model did not respond successfully." };
  } catch {
    return {
      status: "unavailable",
      model: config.model,
      message: "Start llama-server to enable optional AI explanations.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
