import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PatientTabs } from "@/components/patient-tabs";
import { ReviewWorkflow } from "@/components/review-workflow";
import { getPatientDetail } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const patient = await getPatientDetail(patientId);
  if (!patient) notFound();

  return (
    <AppShell title={`Review · ${patient.displayName}`} eyebrow="Guided evidence check">
      <PatientTabs patientId={patient.id} active="review" />
      <ReviewWorkflow patient={patient} />
      <p className="mt-5 text-center text-[9px] text-slate-400">Clinician review required · No diagnosis is changed automatically</p>
    </AppShell>
  );
}
