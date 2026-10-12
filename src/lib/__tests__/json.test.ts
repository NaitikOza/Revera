import { describe, expect, it } from "vitest";
import { parseJson, parseStringArray } from "@/lib/json";
import { completedReviewSchema, evidencePayloadSchema, reviewRequestSchema } from "@/lib/schemas";

describe("stored JSON validation", () => {
  it("parses a valid evidence payload", () => {
    expect(parseJson('{"observations":[]}', evidencePayloadSchema, "fixture")).toEqual({ observations: [] });
  });

  it("rejects malformed and structurally invalid evidence", () => {
    expect(() => parseJson("not-json", evidencePayloadSchema, "fixture")).toThrow("invalid JSON");
    expect(() => parseJson('{"observations":"invented"}', evidencePayloadSchema, "fixture")).toThrow("failed validation");
  });

  it("rejects non-string source identifiers", () => {
    expect(() => parseStringArray('["record-1", 3]', "fixture")).toThrow("failed validation");
  });

  it("validates guided-review context and completed sessions", () => {
    const context = { reason: "new_evidence", confidence: "mixed" };
    expect(reviewRequestSchema.safeParse({ context }).success).toBe(true);
    expect(completedReviewSchema.safeParse({
      patientId: "patient-1",
      context,
      outcome: "needs_clinician_review",
      findingCount: 2,
      modelStatus: "unavailable",
      feedback: "yes",
    }).success).toBe(true);
  });

  it("rejects unrecognized guided-review values", () => {
    expect(reviewRequestSchema.safeParse({ context: { reason: "other", confidence: "certain" } }).success).toBe(false);
  });
});
