import { analyzePatient } from "@/lib/analysis";
import { fail, ok } from "@/lib/api";
import { reviewRequestSchema } from "@/lib/schemas";

export async function POST(request: Request, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await params;
    const rawBody = await request.text();
    let body: unknown = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return fail("Invalid review answers.", 422);
    }
    const parsed = reviewRequestSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid review answers.", 422);
    const analysis = await analyzePatient(patientId, parsed.data.context);
    return analysis ? ok(analysis) : fail("Synthetic patient case not found.", 404);
  } catch {
    return fail("The local review could not be completed safely.", 500);
  }
}
