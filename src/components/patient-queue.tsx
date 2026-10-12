import Link from "next/link";
import type { PatientSummary } from "@/lib/repository";
import { Icon } from "@/components/icons";

function relativeTime(value: string | null) {
  if (!value) return "No records";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(value));
}

export function PatientQueue({ patients, activeId }: { patients: PatientSummary[]; activeId: string }) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-3 shadow-card">
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <div>
          <p className="text-sm font-semibold tracking-tight text-ink">Review queue</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Synthetic training cases</p>
        </div>
        <button aria-label="Search patient queue" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-slate-400">
          <Icon name="search" className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        {patients.map((patient) => {
          const active = patient.id === activeId;
          return (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className={`group flex gap-3 rounded-2xl border p-3 transition ${
                active
                  ? "border-[#b9d5cb] bg-[#edf5f1]"
                  : "border-transparent hover:border-line hover:bg-canvas"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${active ? "bg-forest text-white" : "bg-[#eef1ed] text-moss"}`}>
                {patient.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-xs font-semibold text-ink">{patient.displayName}</span>
                  {patient.openAlertCount > 0 && (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#f8e2dc] px-1 text-[9px] font-bold text-[#b04c36]">
                      {patient.openAlertCount}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  {patient.recordNumber} · {patient.location}
                </span>
                <span className="mt-2 flex items-center gap-1 text-[9px] text-slate-400">
                  <Icon name="clock" className="h-3 w-3" />
                  Evidence {relativeTime(patient.latestEvidenceAt)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
