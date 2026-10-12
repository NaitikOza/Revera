import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { formatClinicalDate } from "@/lib/format";
import { checkLocalModel } from "@/lib/local-model";
import { getPatientSummaries } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [patients, model] = await Promise.all([getPatientSummaries(), checkLocalModel()]);
  const openReviews = patients.reduce((sum, patient) => sum + patient.openAlertCount, 0);
  const priority = patients.filter((patient) => patient.openAlertCount > 0);

  return (
    <AppShell title="Home" eyebrow="Diagnostic review">
      <section className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold text-moss">Good afternoon, Dr. Chen</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-ink">What needs a second look?</h2>
        </div>
        <Link href="/patients" className="inline-flex w-fit items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[10px] font-semibold text-ink shadow-sm transition hover:border-moss/40">
          View all patients <Icon name="arrow" className="h-3.5 w-3.5" />
        </Link>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Patients", value: patients.length, icon: "people" as const },
          { label: "Open reviews", value: openReviews, icon: "alert" as const },
          { label: "Local AI", value: model.status === "available" ? "Ready" : "Off", icon: "brain" as const },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <strong className="text-2xl font-semibold tracking-tight text-ink">{item.value}</strong>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint text-moss"><Icon name={item.icon} className="h-4 w-4" /></span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[22px] border border-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Needs attention</h3>
            <p className="mt-0.5 text-[10px] text-slate-400">Start with the clearest change</p>
          </div>
          <span className="rounded-full bg-[#f9e5df] px-2.5 py-1 text-[9px] font-semibold text-[#a84d39]">{priority.length} {priority.length === 1 ? "case" : "cases"}</span>
        </div>
        {priority.map((patient) => (
          <Link key={patient.id} href={`/patients/${patient.id}`} className="group flex flex-col gap-4 p-5 transition hover:bg-[#f8faf7] sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest text-xs font-bold text-white">{patient.initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{patient.displayName}</span>
              <span className="mt-1 block truncate text-[10px] text-slate-500">{patient.summary}</span>
              <span className="mt-2 block text-[9px] text-slate-400">Latest evidence {patient.latestEvidenceAt ? formatClinicalDate(patient.latestEvidenceAt) : "—"}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-moss">
              Open profile <Icon name="chevron" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
        {priority.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="check" className="mx-auto h-5 w-5 text-moss" />
            <p className="mt-2 text-xs font-semibold text-ink">Queue is clear</p>
          </div>
        )}
      </section>

      <p className="mt-5 text-center text-[9px] text-slate-400">Synthetic research demo · Not a diagnostic device</p>
    </AppShell>
  );
}
