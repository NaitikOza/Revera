import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { PatientHeader } from "@/components/patient-header";
import { PatientTabs } from "@/components/patient-tabs";
import { formatClinicalDate } from "@/lib/format";
import { getPatientDetail } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function PatientPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const patient = await getPatientDetail(patientId);
  if (!patient) notFound();

  const recentRecords = [...patient.records].reverse().slice(0, 3);
  const openAlerts = patient.alerts.filter((alert) => alert.reviewStatus === "needs_review");

  return (
    <AppShell title={patient.displayName} eyebrow="Patient profile">
      <PatientHeader patient={patient} />
      <PatientTabs patientId={patient.id} active="overview" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)]">
        <section className="rounded-[22px] border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent evidence</h3>
            <Link href={`/patients/${patient.id}/timeline`} className="text-[10px] font-semibold text-moss">View all</Link>
          </div>
          <div className="divide-y divide-line">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas text-moss"><Icon name={record.kind === "imaging" ? "image" : record.kind === "laboratory" ? "flask" : "document"} className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">{record.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">{record.summary}</p>
                  <p className="mt-1 text-[9px] text-slate-400">{formatClinicalDate(record.recordedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-[22px] border border-line bg-white p-5 shadow-card">
            <h3 className="text-sm font-semibold text-ink">Diagnoses</h3>
            <div className="mt-3 space-y-3">
              {patient.diagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="flex items-center gap-3 rounded-xl bg-canvas p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-moss"><Icon name="activity" className="h-3.5 w-3.5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-ink">{diagnosis.name}</p>
                    <p className="mt-0.5 text-[9px] capitalize text-slate-400">{diagnosis.currentStatus.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-[22px] border p-5 shadow-card ${openAlerts.length > 0 ? "border-[#efd0c7] bg-[#fffaf8]" : "border-line bg-white"}`}>
            <div className="flex items-start gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${openAlerts.length > 0 ? "bg-[#f8e2dc] text-[#b04c36]" : "bg-mint text-moss"}`}>
                <Icon name={openAlerts.length > 0 ? "alert" : "check"} className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{openAlerts.length > 0 ? `${openAlerts.length} item${openAlerts.length > 1 ? "s" : ""} to review` : "No open review"}</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{openAlerts.length > 0 ? "Answer two questions, then compare the evidence." : "You can still run a routine evidence check."}</p>
              </div>
            </div>
            <Link href={`/patients/${patient.id}/review`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-[10px] font-semibold text-white">
              Start review <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
