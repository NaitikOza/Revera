import { afterEach, describe, expect, it, vi } from "vitest";
import { detectDiagnosticDrift } from "@/lib/drift";
import { reviewWithLocalModel } from "@/lib/local-model";
import { analysisCase, event, observation, record } from "@/lib/__tests__/fixtures";

function conflictCase() {
  const fixture = analysisCase(
    [
      record("initial", "2026-01-01T09:00:00.000Z", [observation()]),
      record(
        "conflict",
        "2026-01-02T09:00:00.000Z",
        [observation({ label: "Target finding absent", value: "Not detected", interpretation: "conflicts" })],
        "Target finding absent on definitive testing.",
      ),
    ],
    [event("history-1", "confirmed", "2026-01-01T10:00:00.000Z", "initial", ["initial"])],
  );
  return { fixture, rules: detectDiagnosticDrift(fixture).alerts };
}

function completion(alerts: unknown[]) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: JSON.stringify({ alerts }) } }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

const baseProposal = {
  diagnosisId: "dx-1",
  kind: "evidence_conflict",
  severity: "high",
  detectedAt: "2026-01-02T09:00:00.000Z",
  sourceRecordIds: ["conflict"],
  citedEvidence: [{ recordId: "conflict", quote: "Target finding absent", role: "conflicting_evidence" }],
  explanation: "The newer definitive synthetic test conflicts with the documented diagnostic support.",
  uncertainty: "This explanation cannot account for undocumented context and requires clinician review.",
};

afterEach(() => vi.unstubAllGlobals());

describe("reviewWithLocalModel", () => {
  it("accepts a schema-valid proposal only when it matches a code-detected candidate", async () => {
    const { fixture, rules } = conflictCase();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(completion([baseProposal])));

    const result = await reviewWithLocalModel(fixture, rules);
    expect(result.status).toBe("available");
    expect(result.alerts).toHaveLength(1);
    expect(result.rejectedCount).toBe(0);
  });

  it("rejects an invented diagnosis even when the JSON shape is valid", async () => {
    const { fixture, rules } = conflictCase();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(completion([{ ...baseProposal, diagnosisId: "dx-invented" }])));

    const result = await reviewWithLocalModel(fixture, rules);
    expect(result.status).toBe("invalid");
    expect(result.alerts).toHaveLength(0);
    expect(result.rejectedCount).toBe(1);
  });

  it("rejects malformed model content without exposing it", async () => {
    const { fixture, rules } = conflictCase();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "not json" } }] }), { status: 200 }),
    ));

    const result = await reviewWithLocalModel(fixture, rules);
    expect(result.status).toBe("invalid");
    expect(result.alerts).toHaveLength(0);
  });
});
