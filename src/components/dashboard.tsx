import Link from "next/link";
import { DiagnosisThread } from "@/components/diagnosis-thread";
import { EvidenceTimeline } from "@/components/timeline";
import { Icon } from "@/components/icons";
import { PatientQueue } from "@/components/patient-queue";
import { ReviewPanel } from "@/components/review-panel";
import { Sidebar } from "@/components/sidebar";
import type { PatientDetail, PatientSummary } from "@/lib/repository";

function currentDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date());
}

export function Dashboard({
  patients,
  patient,
  modelStatus,
}: {
  patients: PatientSummary[];
  patient: PatientDetail;
  modelStatus: {
    status: "available" | "unavailable" | "misconfigured";
    model: string;
    message: string;
  };
}) {
  const openSignals = patients.reduce((sum, item) => sum + item.openAlertCount, 0);
  const quietCases = patients.filter((item) => item.openAlertCount === 0).length;

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <main className="min-h-screen lg:ml-[246px]">
        <header className="border-b border-line/80 bg-white/75 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-moss">Diagnostic review workspace</p>
              <p className="mt-0.5 text-xs text-slate-400">{currentDate()}</p>
            </div>
            <div className="ml-auto hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-[9px] font-medium text-slate-500 sm:flex">
              <Icon name="shield" className="h-3.5 w-3.5 text-moss" />
              Synthetic data only
            </div>
            <button aria-label="Search" className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-slate-400">
              <Icon name="search" className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-8 md:py-8">
          <div className="enter mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold text-moss">Welcome back, Dr. Chen</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-ink md:text-[34px]">Review what changed.</h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
                Revera traces new evidence against the diagnostic record so unsupported certainty is easier to notice.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Cases", value: patients.length, icon: "people" as const },
                { label: "Open signals", value: openSignals, icon: "alert" as const },
                { label: "On track", value: quietCases, icon: "check" as const },
              ].map((metric) => (
                <div key={metric.label} className="min-w-0 rounded-2xl border border-line bg-white px-4 py-3 shadow-card sm:min-w-[120px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl font-semibold tracking-tight text-ink">{metric.value}</span>
                    <Icon name={metric.icon} className="h-4 w-4 text-moss" />
                  </div>
                  <span className="mt-1 block text-[9px] font-medium text-slate-400">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#dce5df] bg-[#edf3ef] px-4 py-3 text-[10px] leading-relaxed text-[#4c665d]">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
            <p><strong className="font-semibold text-forest">Research demonstration.</strong> Revera is not a validated diagnostic device. It never changes a diagnosis or recommends treatment; every signal requires clinician review.</p>
          </div>

          <section className="mb-5 overflow-hidden rounded-[24px] bg-forest text-white shadow-float">
            <div className="soft-grid relative grid gap-5 px-6 py-6 md:grid-cols-[1fr_auto] md:items-center md:px-7">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#87b8a8]/15 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-base font-bold ring-1 ring-white/10">{patient.initials}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-[-0.025em]">{patient.displayName}</h2>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#d7e8e2]">Synthetic</span>
                  </div>
                  <p className="mt-1 text-[10px] text-white/55">{patient.recordNumber} · {patient.age} years · {patient.sex} · {patient.location}</p>
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/70">{patient.summary}</p>
                </div>
              </div>
              <div className="relative flex gap-2 md:flex-col md:items-end">
                <span className="rounded-xl bg-white/10 px-3 py-2 text-[9px] text-white/60 ring-1 ring-white/10">{patient.careTeam}</span>
                <Link href="#timeline" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-[9px] font-semibold text-forest">
                  View evidence <Icon name="arrow" className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>

          <div className="grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)_350px]">
            <div className="xl:sticky xl:top-5">
              <PatientQueue patients={patients} activeId={patient.id} />
            </div>
            <div id="timeline" className="min-w-0">
              <EvidenceTimeline records={patient.records} />
            </div>
            <div className="space-y-5 xl:sticky xl:top-5">
              <ReviewPanel patientId={patient.id} initialAlerts={patient.alerts} initialModelStatus={modelStatus} />
              <DiagnosisThread diagnoses={patient.diagnoses} />
            </div>
          </div>

          <footer className="mt-8 flex flex-col gap-2 border-t border-line py-5 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Revera · local diagnostic drift research prototype</p>
            <p>All people and records shown are synthetic.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
