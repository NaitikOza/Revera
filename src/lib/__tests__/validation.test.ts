import { describe, expect, it } from "vitest";
import { analysisCase, diagnosis, observation, record } from "@/lib/__tests__/fixtures";
import { validateAlert } from "@/lib/validation";

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "alert-1",
    patientId: "patient-1",
    diagnosisId: "dx-1",
    diagnosisName: diagnosis([]).name,
    kind: "evidence_conflict",
    severity: "high",
    detectedAt: new Date("2026-01-02T10:00:00.000Z"),
    sourceRecordIds: ["record-1"],
    citedEvidence: [
      { recordId: "record-1", quote: "Target finding absent", role: "conflicting_evidence" },
    ],
    explanation: "New definitive evidence conflicts with the diagnosis and needs clinician review.",
    uncertainty: "The rule cannot account for undocumented context and never changes the diagnosis.",
    provenance: "live_rules",
    reviewStatus: "needs_review",
    ...overrides,
  };
}

const fixture = analysisCase(
  [
    record(
      "record-1",
      "2026-01-02T09:00:00.000Z",
      [observation({ label: "Target finding absent", interpretation: "conflicts" })],
      "Target finding absent on definitive testing.",
    ),
  ],
  [],
);

describe("validateAlert", () => {
  it("accepts an exact citation with valid chronology", () => {
    expect(validateAlert(candidate(), fixture)).toMatchObject({ valid: true, errors: [] });
  });

  it("rejects invented source IDs", () => {
    const result = validateAlert(
      candidate({ sourceRecordIds: ["invented"], citedEvidence: [{ recordId: "invented", quote: "Made up", role: "conflicting_evidence" }] }),
      fixture,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Unknown source record");
  });

  it("rejects quotes that are not in the source", () => {
    const result = validateAlert(
      candidate({ citedEvidence: [{ recordId: "record-1", quote: "Hallucinated finding", role: "conflicting_evidence" }] }),
      fixture,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("not present");
  });

  it("rejects future evidence", () => {
    const result = validateAlert(candidate({ detectedAt: new Date("2026-01-02T08:00:00.000Z") }), fixture);
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("after the alert");
  });
});
