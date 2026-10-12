import { alertUpdateSchema } from "@/lib/schemas";
import { fail, ok } from "@/lib/api";
import { updateAlertReviewStatus } from "@/lib/repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ alertId: string }> }) {
  try {
    const payload = alertUpdateSchema.safeParse(await request.json());
    if (!payload.success) return fail("Invalid review status.", 422);
    const { alertId } = await params;
    const updated = await updateAlertReviewStatus(alertId, payload.data.reviewStatus);
    return updated ? ok(updated) : fail("Review alert not found.", 404);
  } catch {
    return fail("Unable to update the local review status.", 500);
  }
}
