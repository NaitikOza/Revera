import { analyzePatient } from "@/lib/analysis";
import { fail, ok } from "@/lib/api";

export async function POST(_request: Request, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await params;
    const analysis = await analyzePatient(patientId);
    return analysis ? ok(analysis) : fail("Synthetic patient case not found.", 404);
  } catch {
    return fail("The local review could not be completed safely.", 500);
  }
}
