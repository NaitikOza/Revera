import { ok, fail } from "@/lib/api";
import { getPatientSummaries } from "@/lib/repository";

export async function GET() {
  try {
    return ok(await getPatientSummaries());
  } catch {
    return fail("Unable to load the local synthetic patient queue.", 500);
  }
}
