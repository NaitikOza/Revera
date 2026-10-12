import type { AnalysisCase, DomainDiagnosis, DomainRecord, DomainStatusEvent } from "@/lib/domain";
import type { EvidenceObservation } from "@/lib/schemas";

export function observation(
  overrides: Partial<EvidenceObservation> = {},
): EvidenceObservation {
  return {
    label: "Positive test",
    value: "Detected",
    interpretation: "supports",
    diagnosisIds: ["dx-1"],
    strength: "high",
    ...overrides,
  };
}

export function record(
  id: string,
  recordedAt: string,
  observations: EvidenceObservation[],
  summary = "Positive test was detected in the synthetic record.",
): DomainRecord {
  return {
    id,
    patientId: "patient-1",
    recordedAt: new Date(recordedAt),
    kind: "laboratory",
    title: `Record ${id}`,
    summary,
    source: "Synthetic test fixture",
    author: "Test clinician",
    observations,
  };
}

export function event(
  id: string,
  status: string,
  changedAt: string,
  sourceRecordId: string,
  supportingRecordIds: string[],
): DomainStatusEvent {
  return {
    id,
    diagnosisId: "dx-1",
    changedAt: new Date(changedAt),
    status,
    note: `Status is ${status}.`,
    author: "Test clinician",
    sourceRecordId,
    supportingRecordIds,
  };
}

export function diagnosis(history: DomainStatusEvent[]): DomainDiagnosis {
  return {
    id: "dx-1",
    patientId: "patient-1",
    name: "Synthetic syndrome",
    code: "DEMO.1",
    firstDocumentedAt: new Date("2026-01-01T09:00:00.000Z"),
    currentStatus: history.at(-1)?.status ?? "possible",
    description: "Synthetic fixture only.",
    history,
  };
}

export function analysisCase(
  records: DomainRecord[],
  history: DomainStatusEvent[],
): AnalysisCase {
  return {
    patientId: "patient-1",
    records,
    diagnoses: [diagnosis(history)],
  };
}
