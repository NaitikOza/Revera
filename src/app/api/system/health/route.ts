import { ok } from "@/lib/api";
import { checkLocalModel } from "@/lib/local-model";

export async function GET() {
  const model = await checkLocalModel();
  return ok({ model, privacy: "local_only", dataMode: "synthetic_only" });
}
