import { z } from "zod";

export const diagnosisStatusSchema = z.enum([
  "possible",
  "suspected",
  "confirmed",
  "ruled_out",
]);

export const interpretationSchema = z.enum([
  "supports",
  "conflicts",
  "neutral",
  "ambiguous",
]);

export const evidenceObservationSchema = z.object({
  label: z.string().min(1).max(180),
  value: z.string().min(1).max(240),
  interpretation: interpretationSchema,
  diagnosisIds: z.array(z.string().min(1)).max(12),
  strength: z.enum(["low", "moderate", "high"]),
});

export const evidencePayloadSchema = z.object({
  observations: z.array(evidenceObservationSchema).max(30),
});

export const citationSchema = z.object({
  recordId: z.string().min(1),
  quote: z.string().min(3).max(320),
  role: z.enum([
    "supporting_evidence",
    "conflicting_evidence",
    "status_change",
  ]),
});

export const reviewAlertSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  diagnosisId: z.string().min(1),
  diagnosisName: z.string().min(1),
  kind: z.enum(["evidence_conflict", "unsupported_confirmation"]),
  severity: z.enum(["moderate", "high"]),
  detectedAt: z.coerce.date(),
  sourceRecordIds: z.array(z.string().min(1)).min(1),
  citedEvidence: z.array(citationSchema).min(1),
  explanation: z.string().min(20).max(1200),
  uncertainty: z.string().min(20).max(800),
  provenance: z.enum(["precomputed_demo", "live_rules", "local_model"]),
  reviewStatus: z.enum(["needs_review", "reviewed"]),
});

export const modelAlertProposalSchema = z.object({
  diagnosisId: z.string().min(1),
  kind: z.enum(["evidence_conflict", "unsupported_confirmation"]),
  severity: z.enum(["moderate", "high"]),
  detectedAt: z.string().datetime(),
  sourceRecordIds: z.array(z.string().min(1)).min(1).max(8),
  citedEvidence: z.array(citationSchema).min(1).max(8),
  explanation: z.string().min(20).max(1200),
  uncertainty: z.string().min(20).max(800),
});

export const modelResponseSchema = z.object({
  alerts: z.array(modelAlertProposalSchema).max(8),
});

export const alertUpdateSchema = z.object({
  reviewStatus: z.enum(["needs_review", "reviewed"]),
});

export const reviewContextSchema = z.object({
  reason: z.enum(["new_evidence", "uncertain_diagnosis", "routine_review"]),
  confidence: z.enum(["low", "mixed", "high"]),
});

export const reviewRequestSchema = z.object({
  context: reviewContextSchema.optional(),
});

export const completedReviewSchema = z.object({
  patientId: z.string().min(1),
  context: reviewContextSchema,
  outcome: z.enum(["needs_clinician_review", "insufficient_evidence"]),
  findingCount: z.number().int().min(0).max(20),
  modelStatus: z.enum(["available", "unavailable", "invalid", "not_needed"]),
  feedback: z.enum(["yes", "no"]).nullable(),
});

export type CompletedReview = z.infer<typeof completedReviewSchema>;

export type EvidenceObservation = z.infer<typeof evidenceObservationSchema>;
export type EvidencePayload = z.infer<typeof evidencePayloadSchema>;
export type Citation = z.infer<typeof citationSchema>;
export type ReviewAlert = z.infer<typeof reviewAlertSchema>;
export type ModelAlertProposal = z.infer<typeof modelAlertProposalSchema>;
export type ReviewContext = z.infer<typeof reviewContextSchema>;
