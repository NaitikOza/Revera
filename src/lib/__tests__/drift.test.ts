import { describe, expect, it } from "vitest";
import { detectDiagnosticDrift } from "@/lib/drift";
import { analysisCase, event, observation, record } from "@/lib/__tests__/fixtures";

describe("detectDiagnosticDrift", () => {
  it("does not alert when confirmation has new, strong supporting evidence", () => {
    const records = [
      record("status-possible", "2026-01-01T09:00:00.000Z", [], "Synthetic syndrome is suspected."),
      record("support", "2026-01-01T10:00:00.000Z", [observation()]),
      record("status-confirmed", "2026-01-01T11:00:00.000Z", [], "Synthetic syndrome is confirmed after the positive test."),
    ];
    const history = [
      event("history-1", "suspected", "2026-01-01T09:00:00.000Z", "status-possible", []),
      event("history-2", "confirmed", "2026-01-01T11:00:00.000Z", "status-confirmed", ["support"]),
    ];

    expect(detectDiagnosticDrift(analysisCase(records, history))).toEqual({ alerts: [], rejected: [] });
  });

  it("alerts when newer evidence conflicts with the documented diagnosis", () => {
    const records = [
      record("initial", "2026-01-01T09:00:00.000Z", [observation()]),
      record(
        "conflict",
        "2026-01-02T09:00:00.000Z",
        [observation({ label: "Target finding absent", value: "Not detected", interpretation: "conflicts" })],
        "Target finding absent on definitive testing.",
      ),
    ];
    const history = [event("history-1", "confirmed", "2026-01-01T10:00:00.000Z", "initial", ["initial"])];
    const result = detectDiagnosticDrift(analysisCase(records, history));

    expect(result.rejected).toHaveLength(0);
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0]).toMatchObject({
      kind: "evidence_conflict",
      diagnosisId: "dx-1",
      sourceRecordIds: ["conflict"],
    });
  });

  it("does not promote ambiguous or low-strength evidence to an alert", () => {
    const records = [
      record(
        "ambiguous",
        "2026-01-02T09:00:00.000Z",
        [observation({ label: "Borderline marker", value: "Indeterminate", interpretation: "ambiguous", strength: "low" })],
        "Borderline marker is indeterminate.",
      ),
    ];

    expect(detectDiagnosticDrift(analysisCase(records, []))).toEqual({ alerts: [], rejected: [] });
  });

  it("alerts when uncertainty becomes confirmed without new supporting evidence", () => {
    const records = [
      record("old-support", "2026-01-01T08:00:00.000Z", [observation()]),
      record("status-possible", "2026-01-01T09:00:00.000Z", [], "Synthetic syndrome is suspected."),
      record("status-confirmed", "2026-01-01T11:00:00.000Z", [], "Synthetic syndrome is now confirmed. No new study is cited."),
    ];
    const history = [
      event("history-1", "suspected", "2026-01-01T09:00:00.000Z", "status-possible", ["old-support"]),
      event("history-2", "confirmed", "2026-01-01T11:00:00.000Z", "status-confirmed", ["old-support"]),
    ];
    const result = detectDiagnosticDrift(analysisCase(records, history));

    expect(result.rejected).toHaveLength(0);
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0]).toMatchObject({
      kind: "unsupported_confirmation",
      sourceRecordIds: ["status-confirmed"],
    });
  });
});
