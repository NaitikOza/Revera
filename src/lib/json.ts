import { z } from "zod";

export function parseJson<T>(value: string, schema: z.ZodType<T>, label: string): T {
  let decoded: unknown;
  try {
    decoded = JSON.parse(value);
  } catch {
    throw new Error(`${label} contains invalid JSON.`);
  }

  const result = schema.safeParse(decoded);
  if (!result.success) {
    throw new Error(`${label} failed validation: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export function parseStringArray(value: string, label: string): string[] {
  return parseJson(value, z.array(z.string().min(1)).max(50), label);
}
