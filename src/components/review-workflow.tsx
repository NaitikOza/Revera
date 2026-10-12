"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import type { PatientDetail } from "@/lib/repository";
import type { ReviewContext } from "@/lib/schemas";

type DisplayAlert = PatientDetail["alerts"][number];
type Step = "questions" | "running" | "results" | "complete";

interface AnalysisPayload {
  alerts: DisplayAlert[];
  modelSuggestions: DisplayAlert[];
  outcome: "needs_clinician_review" | "insufficient_evidence";
  model: { status: "available" | "unavailable" | "invalid" | "not_needed"; message: string };
}

const reasonOptions: Array<{ value: ReviewContext["reason"]; label: string; note: string }> = [
  { value: "new_evidence", label: "New evidence arrived", note: "A result or note changed" },
  { value: "uncertain_diagnosis", label: "Diagnosis feels uncertain", note: "The current label may not fit" },
  { value: "routine_review", label: "Routine check", note: "No specific concern" },
];

const confidenceOptions: Array<{ value: ReviewContext["confidence"]; label: string }> = [
  { value: "low", label: "Low" },
  { value: "mixed", label: "Mixed" },
  { value: "high", label: "High" },
];

function ResultCard({ alert }: { alert: DisplayAlert }) {
  const conflict = alert.kind === "evidence_conflict";
  const quote = alert.citedEvidence[0]?.quote;
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${conflict ? "bg-[#f8e2dc] text-[#b04c36]" : "bg-[#f8ecd7] text-[#a66b23]"}`}>
          <Icon name="alert" className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">{alert.diagnosisName}</p>
          <h3 className="mt-1 text-sm font-semibold tracking-tight text-ink">
            {conflict ? "New evidence may not fit" : "Confirmation needs another look"}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-600">
        {conflict
          ? `The latest record says “${quote}.” This may weaken support for the current diagnosis.`
          : "The diagnosis was changed from uncertain to confirmed without newer supporting evidence in the record."}
      </p>
      <div className="mt-4 rounded-xl bg-[#f6f8f5] p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-moss">Next step</p>
        <p className="mt-1 text-[10px] text-slate-600">Review the source record and decide whether the documented status still fits.</p>
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-[10px] font-semibold text-moss">View source and limits</summary>
        <div className="mt-3 border-t border-line pt-3 text-[10px] leading-relaxed text-slate-500">
          <p>Source: {alert.sourceRecordIds.join(", ")}</p>
          <p className="mt-2">{alert.uncertainty}</p>
        </div>
      </details>
    </article>
  );
}

export function ReviewWorkflow({ patient }: { patient: PatientDetail }) {
  const [step, setStep] = useState<Step>("questions");
  const [reason, setReason] = useState<ReviewContext["reason"] | null>(null);
  const [confidence, setConfidence] = useState<ReviewContext["confidence"] | null>(null);
  const [result, setResult] = useState<AnalysisPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  async function runReview() {
    if (!reason || !confidence) return;
    setStep("running");
    setError(null);
    try {
      const response = await fetch(`/api/patients/${patient.id}/analysis`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ context: { reason, confidence } }),
      });
      const payload = (await response.json()) as { success: boolean; data?: AnalysisPayload; error?: string };
      if (!response.ok || !payload.success || !payload.data) throw new Error(payload.error ?? "Review failed.");
      setResult(payload.data);
      setStep("results");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review failed.");
      setStep("questions");
    }
  }

  async function completeReview() {
    const openAlerts = patient.alerts.filter((alert) => alert.reviewStatus === "needs_review");
    if (!result || !reason || !confidence) return;
    try {
      await Promise.all([
        ...openAlerts.map(async (alert) => {
          const response = await fetch(`/api/alerts/${alert.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ reviewStatus: "reviewed" }),
          });
          if (!response.ok) throw new Error("Could not save review state.");
        }),
        (async () => {
          const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              patientId: patient.id,
              context: { reason, confidence },
              outcome: result.outcome,
              findingCount: displayAlerts.length,
              modelStatus: result.model.status,
              feedback,
            }),
          });
          if (!response.ok) throw new Error("Could not save review history.");
        })(),
      ]);
      setStep("complete");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save review state.");
    }
  }

  const displayAlerts = result?.modelSuggestions.length ? result.modelSuggestions : result?.alerts ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-2" aria-label="Review progress">
        {["Context", "Review", "Result"].map((label, index) => {
          const activeIndex = step === "questions" ? 0 : step === "running" ? 1 : 2;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold ${index <= activeIndex ? "bg-forest text-white" : "bg-[#e8ece8] text-slate-400"}`}>{index + 1}</span>
              <span className={`hidden text-[9px] font-semibold sm:inline ${index <= activeIndex ? "text-ink" : "text-slate-400"}`}>{label}</span>
              {index < 2 && <span className="h-px flex-1 bg-line" />}
            </div>
          );
        })}
      </div>

      {step === "questions" && (
        <section className="rounded-[24px] border border-line bg-white p-5 shadow-card md:p-7">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">Before we review</h2>
          <p className="mt-1 text-xs text-slate-500">Two quick questions help frame the result.</p>

          <fieldset className="mt-7">
            <legend className="text-xs font-semibold text-ink">Why are you reviewing this case?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {reasonOptions.map((option) => (
                <button key={option.value} type="button" onClick={() => setReason(option.value)} className={`rounded-xl border p-3 text-left transition ${reason === option.value ? "border-moss bg-[#edf5f1] ring-1 ring-moss/20" : "border-line hover:border-moss/40"}`}>
                  <span className="block text-[10px] font-semibold text-ink">{option.label}</span>
                  <span className="mt-1 block text-[9px] text-slate-400">{option.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-semibold text-ink">How confident are you in the current diagnosis?</legend>
            <div className="mt-3 flex gap-2">
              {confidenceOptions.map((option) => (
                <button key={option.value} type="button" onClick={() => setConfidence(option.value)} className={`flex-1 rounded-xl border px-3 py-2.5 text-[10px] font-semibold transition ${confidence === option.value ? "border-moss bg-[#edf5f1] text-forest ring-1 ring-moss/20" : "border-line text-slate-500 hover:border-moss/40"}`}>{option.label}</button>
              ))}
            </div>
          </fieldset>

          {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] p-3 text-[10px] text-[#a84d39]">{error}</p>}
          <button onClick={runReview} disabled={!reason || !confidence} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-[11px] font-semibold text-white transition hover:bg-[#214d43] disabled:cursor-not-allowed disabled:opacity-35">
            Review evidence <Icon name="arrow" className="h-4 w-4" />
          </button>
        </section>
      )}

      {step === "running" && (
        <section className="rounded-[24px] border border-line bg-white p-10 text-center shadow-card">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest"><Icon name="brain" className="h-6 w-6 animate-pulse" /></span>
          <h2 className="mt-4 text-base font-semibold text-ink">Comparing the timeline…</h2>
          <p className="mt-1 text-[10px] text-slate-400">Checking evidence, status changes, and sources.</p>
        </section>
      )}

      {step === "results" && result && (
        <div>
          <section className="mb-4 rounded-[22px] bg-forest p-5 text-white shadow-float">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">Review result</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{displayAlerts.length > 0 ? `${displayAlerts.length} thing${displayAlerts.length > 1 ? "s" : ""} to look at` : "No clear drift found"}</h2>
            <p className="mt-2 text-[10px] text-white/60">{result.model.status === "available" ? "Local AI explanation validated." : result.model.status === "not_needed" ? "No AI review was needed." : "Local AI is off. Verified rules were used."}</p>
          </section>

          <div className="space-y-3">
            {displayAlerts.map((alert) => <ResultCard key={alert.id} alert={alert} />)}
            {displayAlerts.length === 0 && (
              <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-card">
                <Icon name="check" className="mx-auto h-5 w-5 text-moss" />
                <p className="mt-2 text-xs font-semibold text-ink">Nothing met the review threshold</p>
                <p className="mt-1 text-[10px] text-slate-400">This does not confirm the diagnosis.</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">
            <p className="text-[10px] font-medium text-slate-500">Was this useful?</p>
            <div className="flex gap-2">
              {(["yes", "no"] as const).map((value) => (
                <button key={value} onClick={() => setFeedback(value)} className={`rounded-lg border px-3 py-1.5 text-[9px] font-semibold capitalize ${feedback === value ? "border-moss bg-mint text-forest" : "border-line text-slate-500"}`}>{value}</button>
              ))}
            </div>
            <button onClick={completeReview} className="rounded-xl bg-forest px-4 py-2.5 text-[10px] font-semibold text-white sm:ml-auto">Complete review</button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <section className="rounded-[24px] border border-line bg-white p-8 text-center shadow-card">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint text-forest"><Icon name="check" className="h-5 w-5" /></span>
          <h2 className="mt-4 text-lg font-semibold text-ink">Review complete</h2>
          <p className="mt-1 text-[10px] text-slate-500">The review state was saved locally.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href={`/patients/${patient.id}`} className="rounded-xl border border-line px-4 py-2.5 text-[10px] font-semibold text-ink">Patient profile</Link>
            <Link href="/reviews" className="rounded-xl bg-forest px-4 py-2.5 text-[10px] font-semibold text-white">Review history</Link>
          </div>
        </section>
      )}
    </div>
  );
}
