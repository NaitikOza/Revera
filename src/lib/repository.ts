import type {
  ClinicalRecord,
  Diagnosis,
  DiagnosisStatusEvent,
  ReviewAlert as PrismaReviewAlert,
} from "@prisma/client";
import { db } from "@/lib/db";
import type {
  AnalysisCase,
  DomainDiagnosis,
  DomainRecord,
} from "@/lib/domain";
import { parseJson, parseStringArray } from "@/lib/json";
import {
  citationSchema,
  evidencePayloadSchema,
  type ReviewAlert,
} from "@/lib/schemas";
import { validateAlert } from "@/lib/validation";
import { z } from "zod";

type DiagnosisWithHistory = Diagnosis & { history: DiagnosisStatusEvent[] };

function toDomainRecord(record: ClinicalRecord): DomainRecord {
  const payload = parseJson(
    record.evidenceJson,
    evidencePayloadSchema,
    `Evidence for ${record.id}`,
  );
  return { ...record, observations: payload.observations };
}

function toDomainDiagnosis(diagnosis: DiagnosisWithHistory): DomainDiagnosis {
  return {
    ...diagnosis,
    history: diagnosis.history.map((event) => ({
      ...event,
      supportingRecordIds: parseStringArray(
        event.supportingRecordIds,
        `Supporting records for ${event.id}`,
      ),
    })),
  };
}

function storedAlertToCandidate(
  alert: PrismaReviewAlert & { diagnosis: Diagnosis },
): unknown {
  return {
    ...alert,
    diagnosisName: alert.diagnosis.name,
    sourceRecordIds: parseStringArray(
      alert.sourceRecordIds,
      `Sources for ${alert.id}`,
    ),
    citedEvidence: parseJson(
      alert.citedEvidence,
      z.array(citationSchema),
      `Citations for ${alert.id}`,
    ),
  };
}

export async function getAnalysisCase(
  patientId: string,
): Promise<AnalysisCase | null> {
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      records: { orderBy: { recordedAt: "asc" } },
      diagnoses: {
        orderBy: { firstDocumentedAt: "asc" },
        include: { history: { orderBy: { changedAt: "asc" } } },
      },
    },
  });
  if (!patient) return null;
  if (!patient.synthetic) {
    throw new Error("Revera refuses to analyze records not marked synthetic.");
  }
  return {
    patientId: patient.id,
    records: patient.records.map(toDomainRecord),
    diagnoses: patient.diagnoses.map(toDomainDiagnosis),
  };
}

export interface PatientSummary {
  id: string;
  recordNumber: string;
  displayName: string;
  initials: string;
  age: number;
  sex: string;
  location: string;
  admittedAt: string;
  acuity: string;
  summary: string;
  openAlertCount: number;
  latestEvidenceAt: string | null;
}

export async function getPatientSummaries(): Promise<PatientSummary[]> {
  const patients = await db.patient.findMany({
    where: { synthetic: true },
    orderBy: [{ acuity: "asc" }, { admittedAt: "desc" }],
    include: {
      alerts: { where: { reviewStatus: "needs_review" } },
      records: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });
  return patients.map((patient) => ({
    id: patient.id,
    recordNumber: patient.recordNumber,
    displayName: patient.displayName,
    initials: patient.initials,
    age: patient.age,
    sex: patient.sex,
    location: patient.location,
    admittedAt: patient.admittedAt.toISOString(),
    acuity: patient.acuity,
    summary: patient.summary,
    openAlertCount: patient.alerts.length,
    latestEvidenceAt: patient.records[0]?.recordedAt.toISOString() ?? null,
  }));
}

export interface PatientDetail {
  id: string;
  recordNumber: string;
  displayName: string;
  initials: string;
  age: number;
  sex: string;
  location: string;
  admittedAt: string;
  acuity: string;
  summary: string;
  careTeam: string;
  records: Array<{
    id: string;
    recordedAt: string;
    kind: string;
    title: string;
    summary: string;
    source: string;
    author: string;
    observations: DomainRecord["observations"];
  }>;
  diagnoses: Array<{
    id: string;
    name: string;
    code: string;
    firstDocumentedAt: string;
    currentStatus: string;
    description: string;
    history: Array<{
      id: string;
      changedAt: string;
      status: string;
      note: string;
      author: string;
      sourceRecordId: string | null;
      supportingRecordIds: string[];
    }>;
  }>;
  alerts: Array<Omit<ReviewAlert, "detectedAt"> & { detectedAt: string }>;
  rejectedAlertCount: number;
}

export async function getPatientDetail(
  patientId: string,
): Promise<PatientDetail | null> {
  const [patient, analysisCase] = await Promise.all([
    db.patient.findUnique({
      where: { id: patientId },
      include: {
        records: { orderBy: { recordedAt: "asc" } },
        diagnoses: {
          orderBy: { firstDocumentedAt: "asc" },
          include: { history: { orderBy: { changedAt: "asc" } } },
        },
        alerts: {
          orderBy: { detectedAt: "desc" },
          include: { diagnosis: true },
        },
      },
    }),
    getAnalysisCase(patientId),
  ]);
  if (!patient || !analysisCase || !patient.synthetic) return null;

  const validAlerts: ReviewAlert[] = [];
  let rejectedAlertCount = 0;
  for (const stored of patient.alerts) {
    const result = validateAlert(storedAlertToCandidate(stored), analysisCase);
    if (result.valid && result.alert) validAlerts.push(result.alert);
    else rejectedAlertCount += 1;
  }

  const domainRecords = patient.records.map(toDomainRecord);
  const domainDiagnoses = patient.diagnoses.map(toDomainDiagnosis);
  return {
    id: patient.id,
    recordNumber: patient.recordNumber,
    displayName: patient.displayName,
    initials: patient.initials,
    age: patient.age,
    sex: patient.sex,
    location: patient.location,
    admittedAt: patient.admittedAt.toISOString(),
    acuity: patient.acuity,
    summary: patient.summary,
    careTeam: patient.careTeam,
    records: domainRecords.map((record) => ({
      ...record,
      recordedAt: record.recordedAt.toISOString(),
    })),
    diagnoses: domainDiagnoses.map((diagnosis) => ({
      ...diagnosis,
      firstDocumentedAt: diagnosis.firstDocumentedAt.toISOString(),
      history: diagnosis.history.map((event) => ({
        ...event,
        changedAt: event.changedAt.toISOString(),
      })),
    })),
    alerts: validAlerts.map((alert) => ({
      ...alert,
      detectedAt: alert.detectedAt.toISOString(),
    })),
    rejectedAlertCount,
  };
}

export async function updateAlertReviewStatus(
  alertId: string,
  reviewStatus: "needs_review" | "reviewed",
) {
  const existing = await db.reviewAlert.findUnique({ where: { id: alertId } });
  if (!existing) return null;
  return db.reviewAlert.update({
    where: { id: alertId },
    data: {
      reviewStatus,
      reviewedAt: reviewStatus === "reviewed" ? new Date() : null,
    },
    select: { id: true, reviewStatus: true, reviewedAt: true },
  });
}
