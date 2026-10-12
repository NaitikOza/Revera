import { fail, ok } from "@/lib/api";
import { createCompletedReview } from "@/lib/repository";
import { completedReviewSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const parsed = completedReviewSchema.safeParse(await request.json());
    if (!parsed.success) return fail("Invalid completed review.", 422);
    const review = await createCompletedReview(parsed.data);
    return review ? ok(review, { status: 201 }) : fail("Synthetic patient case not found.", 404);
  } catch {
    return fail("Unable to save the completed review.", 500);
  }
}
