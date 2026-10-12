import type { Citation, EvidenceObservation, ReviewAlert } from "@/lib/schemas";

export interface DomainRecord {
  id: string;
  patientId: string;
  recordedAt: Date;
  kind: string;
  title: string;
  summary: string;
  source: string;
  author: string;
  observations: EvidenceObservation[];
}

export interface DomainStatusEvent {
  id: string;
  diagnosisId: string;
  changedAt: Date;
  status: string;
  note: string;
  author: string;
  sourceRecordId: string | null;
  supportingRecordIds: string[];
}

export interface DomainDiagnosis {
  id: string;
  patientId: string;
  name: string;
  code: string;
  firstDocumentedAt: Date;
  currentStatus: string;
  description: string;
  history: DomainStatusEvent[];
}

export interface AnalysisCase {
  patientId: string;
  records: DomainRecord[];
  diagnoses: DomainDiagnosis[];
}

export interface AlertValidationResult {
  valid: boolean;
  errors: string[];
  alert?: ReviewAlert;
}

export interface StoredAlertShape {
  id: string;
  patientId: string;
  diagnosisId: string;
  diagnosisName: string;
  kind: string;
  severity: string;
  detectedAt: Date;
  sourceRecordIds: string[];
  citedEvidence: Citation[];
  explanation: string;
  uncertainty: string;
  provenance: string;
  reviewStatus: string;
}
