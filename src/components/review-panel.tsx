"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import type { PatientDetail } from "@/lib/repository";

type DisplayAlert = PatientDetail["alerts"][number];

interface AnalysisPayload {
  outcome: "needs_clinician_review" | "insufficient_evidence";
  analyzedAt: string;
  alerts: DisplayAlert[];
  modelSuggestions: DisplayAlert[];
  validation: { ruleAlertsRejected: number; modelAlertsRejected: number };
  model: {
    status: "available" | "unavailable" | "invalid" | "not_needed";
    name: string;
    message: string;
  };
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function alertTitle(alert: DisplayAlert) {
  return alert.kind === "evidence_conflict"
    ? "New evidence conflicts"
    : "Confirmation lacks new support";
}

function alertTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(date));
}

function AlertCard({
  alert,
  onReviewed,
  busy,
}: {
  alert: DisplayAlert;
  onReviewed?: (id: string) => void;
  busy?: boolean;
}) {
  const isHigh = alert.severity === "high";
  const isReviewed = alert.reviewStatus === "reviewed";
  return (
    <article className={`rounded-2xl border p-4 ${isReviewed ? "border-line bg-[#f7f8f6] opacity-70" : isHigh ? "border-[#f0c8bd] bg-[#fffaf8]" : "border-[#ead8b7] bg-[#fffdf7]"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${isHigh ? "bg-[#f8dfd8] text-[#b84f37]" : "bg-[#f8ecd4] text-[#a56b26]"}`}>
          <Icon name={isReviewed ? "check" : "alert"} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-[9px] font-bold uppercase tracking-[0.13em] ${isHigh ? "text-[#b84f37]" : "text-[#a56b26]"}`}>
              {isReviewed ? "Reviewed" : alert.severity}
            </p>
            <time className="ml-auto text-[9px] text-slate-400">{alertTime(alert.detectedAt)}</time>
          </div>
          <h3 className="mt-1 text-[13px] font-semibold tracking-tight text-ink">{alertTitle(alert)}</h3>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500">{alert.diagnosisName}</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-[1.65] text-slate-600">{alert.explanation}</p>

      <div className="mt-3 rounded-xl border border-black/[0.05] bg-white/70 p-3">
        <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Cited evidence</p>
        {alert.citedEvidence.map((citation) => (
          <blockquote key={`${citation.recordId}-${citation.quote}`} className="border-l-2 border-moss/40 pl-2 text-[10px] leading-relaxed text-slate-600">
            “{citation.quote}”
            <span className="mt-1 block font-mono text-[8px] text-slate-400">{citation.recordId}</span>
          </blockquote>
        ))}
      </div>

      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-[9px] font-semibold text-moss">
          Why this remains uncertain <span className="inline-block transition group-open:rotate-90">›</span>
        </summary>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{alert.uncertainty}</p>
      </details>

      <div className="mt-3 flex items-center gap-2 border-t border-black/[0.05] pt-3">
        <span className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-slate-400 ring-1 ring-black/[0.05]">
          {alert.provenance === "precomputed_demo" ? "Precomputed demo" : alert.provenance === "local_model" ? "Local AI · validated" : "Live rules"}
        </span>
        {onReviewed && !isReviewed && (
          <button
            onClick={() => onReviewed(alert.id)}
            disabled={busy}
            className="ml-auto rounded-lg px-2.5 py-1.5 text-[9px] font-semibold text-moss transition hover:bg-white disabled:opacity-50"
          >
            Mark reviewed
          </button>
        )}
      </div>
    </article>
  );
}

export function ReviewPanel({
  patientId,
  initialAlerts,
  initialModelStatus,
}: {
  patientId: string;
  initialAlerts: PatientDetail["alerts"];
  initialModelStatus: {
    status: "available" | "unavailable" | "misconfigured";
    model: string;
    message: string;
  };
}) {
  const [storedAlerts, setStoredAlerts] = useState(initialAlerts);
  const [liveResult, setLiveResult] = useState<AnalysisPayload | null>(null);
  const [running, setRunning] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openAlerts = useMemo(
    () => storedAlerts.filter((alert) => alert.reviewStatus === "needs_review"),
    [storedAlerts],
  );

  async function runReview() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch(`/api/patients/${patientId}/analysis`, { method: "POST" });
      const envelope = (await response.json()) as Envelope<AnalysisPayload>;
      if (!response.ok || !envelope.success || !envelope.data) {
        throw new Error(envelope.error ?? "Review could not be completed.");
      }
      setLiveResult(envelope.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review could not be completed.");
    } finally {
      setRunning(false);
    }
  }

  async function markReviewed(alertId: string) {
    setUpdating(alertId);
    setError(null);
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviewStatus: "reviewed" }),
      });
      const envelope = (await response.json()) as Envelope<{ id: string; reviewStatus: "reviewed" }>;
      if (!response.ok || !envelope.success) throw new Error(envelope.error ?? "Could not update review state.");
      setStoredAlerts((items) => items.map((item) => item.id === alertId ? { ...item, reviewStatus: "reviewed" } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update review state.");
    } finally {
      setUpdating(null);
    }
  }

  const shownAlerts = liveResult?.alerts ?? openAlerts;
  const modelState = liveResult?.model ?? {
    status: initialModelStatus.status === "available" ? "available" as const : "unavailable" as const,
    name: initialModelStatus.model,
    message: initialModelStatus.message,
  };

  return (
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f2ee] text-forest">
          <Icon name="brain" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">Review signals</h2>
            {shownAlerts.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#f7ded7] px-1 text-[9px] font-bold text-[#b04c36]">{shownAlerts.length}</span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Evidence for clinician review—not a diagnosis</p>
        </div>
      </div>

      <button
        onClick={runReview}
        disabled={running}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-[11px] font-semibold text-white shadow-lg shadow-forest/10 transition hover:bg-[#204c42] disabled:cursor-wait disabled:opacity-75"
      >
        <Icon name={running ? "pulse" : "sparkle"} className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
        {running ? "Reviewing evidence locally…" : "Run local evidence review"}
      </button>

      <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[9px] ${modelState.status === "available" ? "bg-[#edf5f1] text-[#3b6d5e]" : "bg-[#f5f3ed] text-[#7b7464]"}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${modelState.status === "available" ? "bg-emerald-500" : modelState.status === "not_needed" ? "bg-slate-400" : "bg-amber-500"}`} />
        <span className="leading-relaxed">{modelState.message}</span>
      </div>

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-[#fff0ec] p-3 text-[10px] leading-relaxed text-[#9f4937]">{error}</div>
      )}

      {liveResult && liveResult.model.status === "invalid" && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800">
          Invalid model output was rejected. Only deterministic, code-validated signals appear below.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {shownAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onReviewed={alert.provenance === "precomputed_demo" ? markReviewed : undefined}
            busy={updating === alert.id}
          />
        ))}
        {shownAlerts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cfdad4] bg-[#f8faf7] p-5 text-center">
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#e6f0eb] text-moss">
              <Icon name="check" className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-semibold text-ink">No supported review signal</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Current evidence is normal, ambiguous, or insufficient for the configured drift rules.</p>
          </div>
        )}
      </div>

      {liveResult && liveResult.modelSuggestions.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Validated local AI explanation</p>
          {liveResult.modelSuggestions.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
        </div>
      )}
    </section>
  );
}
