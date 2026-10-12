import { fail, ok } from "@/lib/api";
import { getPatientDetail } from "@/lib/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await params;
    const patient = await getPatientDetail(patientId);
    return patient ? ok(patient) : fail("Synthetic patient case not found.", 404);
  } catch {
    return fail("Unable to load the local synthetic patient case.", 500);
  }
}
