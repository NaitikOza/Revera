import type { AnalysisCase, AlertValidationResult } from "@/lib/domain";
import {
  type ModelAlertProposal,
  reviewAlertSchema,
} from "@/lib/schemas";

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function recordContainsQuote(
  record: AnalysisCase["records"][number],
  quote: string,
): boolean {
  const haystack = normalize(
    [
      record.title,
      record.summary,
      ...record.observations.flatMap((item) => [item.label, item.value]),
    ].join(" "),
  );
  return haystack.includes(normalize(quote));
}

export function validateAlert(
  candidate: unknown,
  analysisCase: AnalysisCase,
): AlertValidationResult {
  const parsed = reviewAlertSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const alert = parsed.data;
  const errors: string[] = [];
  const recordMap = new Map(
    analysisCase.records.map((record) => [record.id, record]),
  );
  const diagnosis = analysisCase.diagnoses.find(
    (item) => item.id === alert.diagnosisId,
  );

  if (alert.patientId !== analysisCase.patientId) {
    errors.push("Alert patient does not match the analyzed case.");
  }
  if (!diagnosis) {
    errors.push("Alert references an unknown diagnosis.");
  } else if (diagnosis.name !== alert.diagnosisName) {
    errors.push("Alert diagnosis name does not match its identifier.");
  }

  for (const recordId of alert.sourceRecordIds) {
    const record = recordMap.get(recordId);
    if (!record) {
      errors.push(`Unknown source record: ${recordId}.`);
    } else if (record.recordedAt > alert.detectedAt) {
      errors.push(`Source record ${recordId} occurs after the alert.`);
    }
  }

  for (const citation of alert.citedEvidence) {
    const record = recordMap.get(citation.recordId);
    if (!record) {
      errors.push(`Citation references unknown record: ${citation.recordId}.`);
      continue;
    }
    if (!alert.sourceRecordIds.includes(citation.recordId)) {
      errors.push(`Citation record ${citation.recordId} is not a declared source.`);
    }
    if (record.recordedAt > alert.detectedAt) {
      errors.push(`Citation ${citation.recordId} occurs after the alert.`);
    }
    if (!recordContainsQuote(record, citation.quote)) {
      errors.push(`Citation text is not present in ${citation.recordId}.`);
    }
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true, errors: [], alert };
}

export function proposalToAlert(
  proposal: ModelAlertProposal,
  analysisCase: AnalysisCase,
  index: number,
): AlertValidationResult {
  const diagnosis = analysisCase.diagnoses.find(
    (item) => item.id === proposal.diagnosisId,
  );
  return validateAlert(
    {
      ...proposal,
      id: `local-model-${index}-${proposal.diagnosisId}`,
      patientId: analysisCase.patientId,
      diagnosisName: diagnosis?.name ?? "Unknown diagnosis",
      provenance: "local_model",
      reviewStatus: "needs_review",
    },
    analysisCase,
  );
}
