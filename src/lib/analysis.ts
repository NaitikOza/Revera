import { detectDiagnosticDrift } from "@/lib/drift";
import { reviewWithLocalModel } from "@/lib/local-model";
import { getAnalysisCase } from "@/lib/repository";

export async function analyzePatient(patientId: string) {
  const analysisCase = await getAnalysisCase(patientId);
  if (!analysisCase) return null;

  const rules = detectDiagnosticDrift(analysisCase);
  const model = await reviewWithLocalModel(analysisCase, rules.alerts);

  return {
    analyzedAt: new Date().toISOString(),
    outcome: rules.alerts.length > 0 ? "needs_clinician_review" : "insufficient_evidence",
    alerts: rules.alerts.map((alert) => ({
      ...alert,
      detectedAt: alert.detectedAt.toISOString(),
    })),
    modelSuggestions: model.alerts.map((alert) => ({
      ...alert,
      detectedAt: alert.detectedAt.toISOString(),
    })),
    validation: {
      ruleAlertsRejected: rules.rejected.length,
      modelAlertsRejected: model.rejectedCount,
    },
    model: {
      status: model.status,
      name: model.model,
      message: model.message,
    },
  };
}
