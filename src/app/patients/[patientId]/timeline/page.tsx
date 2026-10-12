import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DiagnosisThread } from "@/components/diagnosis-thread";
import { PatientHeader } from "@/components/patient-header";
import { PatientTabs } from "@/components/patient-tabs";
import { EvidenceTimeline } from "@/components/timeline";
import { getPatientDetail } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function TimelinePage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const patient = await getPatientDetail(patientId);
  if (!patient) notFound();

  return (
    <AppShell title={patient.displayName} eyebrow="Evidence timeline">
      <PatientHeader patient={patient} />
      <PatientTabs patientId={patient.id} active="timeline" />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <EvidenceTimeline records={patient.records} />
        <DiagnosisThread diagnoses={patient.diagnoses} />
      </div>
    </AppShell>
  );
}
