import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { checkLocalModel } from "@/lib/local-model";
import { getPatientDetail, getPatientSummaries } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function PatientPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const [patients, patient, modelStatus] = await Promise.all([
    getPatientSummaries(),
    getPatientDetail(patientId),
    checkLocalModel(),
  ]);
  if (!patient) notFound();

  return <Dashboard patients={patients} patient={patient} modelStatus={modelStatus} />;
}
