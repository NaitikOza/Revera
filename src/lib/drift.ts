import type { AnalysisCase } from "@/lib/domain";
import type { ReviewAlert } from "@/lib/schemas";
import { validateAlert } from "@/lib/validation";

const uncertainStatuses = new Set(["possible", "suspected"]);

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export interface DriftResult {
  alerts: ReviewAlert[];
  rejected: string[];
}

export function detectDiagnosticDrift(analysisCase: AnalysisCase): DriftResult {
  const candidates: unknown[] = [];

  for (const diagnosis of analysisCase.diagnoses) {
    const relevantConflicts = analysisCase.records.filter(
      (record) =>
        record.recordedAt >= diagnosis.firstDocumentedAt &&
        record.observations.some(
          (observation) =>
            observation.interpretation === "conflicts" &&
            observation.diagnosisIds.includes(diagnosis.id) &&
            observation.strength !== "low",
        ),
    );

    for (const record of relevantConflicts) {
      const conflicts = record.observations.filter(
        (observation) =>
          observation.interpretation === "conflicts" &&
          observation.diagnosisIds.includes(diagnosis.id) &&
          observation.strength !== "low",
      );
      candidates.push({
        id: `rule-conflict-${diagnosis.id}-${record.id}`,
        patientId: analysisCase.patientId,
        diagnosisId: diagnosis.id,
        diagnosisName: diagnosis.name,
        kind: "evidence_conflict",
        severity: conflicts.some((item) => item.strength === "high")
          ? "high"
          : "moderate",
        detectedAt: record.recordedAt,
        sourceRecordIds: [record.id],
        citedEvidence: conflicts.map((item) => ({
          recordId: record.id,
          quote: item.label,
          role: "conflicting_evidence",
        })),
        explanation: `Newer evidence conflicts with support for ${diagnosis.name}. The documented diagnosis has not been changed automatically and needs clinician review.`,
        uncertainty:
          "This rule compares structured evidence labels and chronology; it cannot account for undocumented context or determine the correct diagnosis.",
        provenance: "live_rules",
        reviewStatus: "needs_review",
      });
    }

    const sortedHistory = [...diagnosis.history].sort(
      (left, right) => left.changedAt.getTime() - right.changedAt.getTime(),
    );
    for (let index = 1; index < sortedHistory.length; index += 1) {
      const previous = sortedHistory[index - 1];
      const current = sortedHistory[index];
      if (
        current.status !== "confirmed" ||
        !uncertainStatuses.has(previous.status)
      ) {
        continue;
      }

      const validNewSupport = current.supportingRecordIds.filter((recordId) => {
        const record = analysisCase.records.find((item) => item.id === recordId);
        return (
          record !== undefined &&
          record.recordedAt > previous.changedAt &&
          record.recordedAt <= current.changedAt &&
          record.observations.some(
            (observation) =>
              observation.interpretation === "supports" &&
              observation.diagnosisIds.includes(diagnosis.id) &&
              observation.strength !== "low",
          )
        );
      });
      if (validNewSupport.length > 0 || !current.sourceRecordId) continue;

      const sourceRecord = analysisCase.records.find(
        (record) => record.id === current.sourceRecordId,
      );
      if (!sourceRecord) continue;
      const confirmationPhrase = sourceRecord.summary.split(".")[0];

      candidates.push({
        id: `rule-confirmation-${diagnosis.id}-${current.id}`,
        patientId: analysisCase.patientId,
        diagnosisId: diagnosis.id,
        diagnosisName: diagnosis.name,
        kind: "unsupported_confirmation",
        severity: "moderate",
        detectedAt: current.changedAt,
        sourceRecordIds: unique([current.sourceRecordId]),
        citedEvidence: [
          {
            recordId: current.sourceRecordId,
            quote: confirmationPhrase,
            role: "status_change",
          },
        ],
        explanation: `${diagnosis.name} changed from ${previous.status} to confirmed without new, diagnosis-supporting evidence documented between those status events.`,
        uncertainty:
          "The record may omit valid clinical reasoning or evidence from another system. This signal requests review and does not reverse the status.",
        provenance: "live_rules",
        reviewStatus: "needs_review",
      });
    }
  }

  const alerts: ReviewAlert[] = [];
  const rejected: string[] = [];
  for (const candidate of candidates) {
    const validation = validateAlert(candidate, analysisCase);
    if (validation.valid && validation.alert) alerts.push(validation.alert);
    else rejected.push(...validation.errors);
  }

  return { alerts, rejected };
}
