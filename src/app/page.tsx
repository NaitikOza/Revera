import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { checkLocalModel } from "@/lib/local-model";
import { getPatientDetail, getPatientSummaries } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const patients = await getPatientSummaries();
  const firstPatient = patients[0];
  if (!firstPatient) notFound();

  const [patient, modelStatus] = await Promise.all([
    getPatientDetail(firstPatient.id),
    checkLocalModel(),
  ]);
  if (!patient) notFound();

  return <Dashboard patients={patients} patient={patient} modelStatus={modelStatus} />;
}
