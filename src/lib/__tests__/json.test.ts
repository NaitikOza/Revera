import { describe, expect, it } from "vitest";
import { parseJson, parseStringArray } from "@/lib/json";
import { evidencePayloadSchema } from "@/lib/schemas";

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
});
