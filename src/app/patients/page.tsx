import { AppShell } from "@/components/app-shell";
import { PatientDirectory } from "@/components/patient-directory";
import { getPatientSummaries } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const patients = await getPatientSummaries();
  return (
    <AppShell title="Patients" eyebrow="Review queue">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Choose a patient</h2>
        <p className="mt-1 text-xs text-slate-500">Open a profile before starting a review.</p>
      </div>
      <PatientDirectory patients={patients} />
    </AppShell>
  );
}
