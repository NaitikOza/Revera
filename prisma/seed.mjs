import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const evidence = (observations) => JSON.stringify({ observations });
const ids = (items) => JSON.stringify(items);

const patients = [
  {
    id: "patient-elena-brooks",
    recordNumber: "RV-1024",
    displayName: "Elena Brooks",
    initials: "EB",
    age: 54,
    sex: "Female",
    location: "3W · 312A",
    admittedAt: new Date("2026-10-10T12:20:00.000Z"),
    acuity: "priority",
    summary: "Dyspnea, pleuritic discomfort, and persistent tachycardia after an initial pneumonia label.",
    careTeam: "Hospital Medicine · Dr. Chen",
  },
  {
    id: "patient-marcus-lee",
    recordNumber: "RV-1031",
    displayName: "Marcus Lee",
    initials: "ML",
    age: 42,
    sex: "Male",
    location: "ED Obs · 08",
    admittedAt: new Date("2026-10-11T16:40:00.000Z"),
    acuity: "stable",
    summary: "Acute flank pain with a diagnosis supported by urinalysis and CT findings.",
    careTeam: "Emergency Medicine · Dr. Flores",
  },
  {
    id: "patient-priya-shah",
    recordNumber: "RV-1037",
    displayName: "Priya Shah",
    initials: "PS",
    age: 36,
    sex: "Female",
    location: "GI Clinic · 04",
    admittedAt: new Date("2026-10-12T13:00:00.000Z"),
    acuity: "watch",
    summary: "Intermittent abdominal symptoms with deliberately indeterminate inflammatory markers.",
    careTeam: "Gastroenterology · Dr. Adeyemi",
  },
];

const records = [
  {
    id: "rec-el-001",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-10T12:20:00.000Z"),
    kind: "encounter",
    title: "Emergency assessment",
    summary: "Three days of cough and dyspnea with temperature 38.1 °C, heart rate 112, and oxygen saturation 94% on room air.",
    source: "Emergency department note",
    author: "A. Patel, MD",
    evidenceJson: evidence([
      { label: "Fever", value: "38.1 °C", interpretation: "supports", diagnosisIds: ["dx-el-pneumonia"], strength: "low" },
      { label: "Tachycardia", value: "112 bpm", interpretation: "ambiguous", diagnosisIds: ["dx-el-pneumonia", "dx-el-pe"], strength: "low" },
    ]),
  },
  {
    id: "rec-el-002",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-10T14:05:00.000Z"),
    kind: "imaging",
    title: "Portable chest radiograph",
    summary: "Patchy right basilar opacity may represent subsegmental atelectasis or an early infiltrate. No pleural effusion.",
    source: "Radiology report",
    author: "L. Morgan, MD",
    evidenceJson: evidence([
      { label: "Right basilar opacity", value: "Atelectasis versus early infiltrate", interpretation: "supports", diagnosisIds: ["dx-el-pneumonia"], strength: "moderate" },
    ]),
  },
  {
    id: "rec-el-003",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-10T15:00:00.000Z"),
    kind: "diagnosis",
    title: "Working diagnosis documented",
    summary: "Community-acquired pneumonia is documented as suspected. The radiograph remains equivocal; response to therapy and additional evidence are pending.",
    source: "Admission note",
    author: "J. Chen, MD",
    evidenceJson: evidence([]),
  },
  {
    id: "rec-el-004",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-11T11:45:00.000Z"),
    kind: "diagnosis",
    title: "Diagnosis status updated",
    summary: "Community-acquired pneumonia is now listed as confirmed. No new supporting study is cited; persistent tachycardia is noted.",
    source: "Morning progress note",
    author: "J. Chen, MD",
    evidenceJson: evidence([
      { label: "Persistent tachycardia", value: "108–118 bpm", interpretation: "ambiguous", diagnosisIds: ["dx-el-pneumonia", "dx-el-pe"], strength: "low" },
    ]),
  },
  {
    id: "rec-el-005",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-11T17:20:00.000Z"),
    kind: "laboratory",
    title: "D-dimer",
    summary: "D-dimer is elevated at 2.1 mg/L FEU. The result is nonspecific and prompted further imaging because tachycardia persisted.",
    source: "Laboratory result",
    author: "Core laboratory",
    evidenceJson: evidence([
      { label: "Elevated D-dimer", value: "2.1 mg/L FEU", interpretation: "supports", diagnosisIds: ["dx-el-pe"], strength: "moderate" },
    ]),
  },
  {
    id: "rec-el-006",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-11T19:10:00.000Z"),
    kind: "imaging",
    title: "CT pulmonary angiogram",
    summary: "CTA chest shows a segmental pulmonary embolus in the right lower lobe. No focal airspace consolidation; trace right pleural effusion.",
    source: "Final radiology report",
    author: "S. Rivera, MD",
    evidenceJson: evidence([
      { label: "No focal airspace consolidation", value: "Negative for focal consolidation", interpretation: "conflicts", diagnosisIds: ["dx-el-pneumonia"], strength: "high" },
      { label: "Segmental pulmonary embolus", value: "Right lower lobe", interpretation: "supports", diagnosisIds: ["dx-el-pe"], strength: "high" },
    ]),
  },
  {
    id: "rec-el-007",
    patientId: "patient-elena-brooks",
    recordedAt: new Date("2026-10-11T20:00:00.000Z"),
    kind: "diagnosis",
    title: "Pulmonary embolism confirmed",
    summary: "Pulmonary embolism status updated from suspected to confirmed after review of the CT pulmonary angiogram.",
    source: "Hospital medicine note",
    author: "J. Chen, MD",
    evidenceJson: evidence([]),
  },
  {
    id: "rec-ml-001",
    patientId: "patient-marcus-lee",
    recordedAt: new Date("2026-10-11T16:40:00.000Z"),
    kind: "encounter",
    title: "Emergency assessment",
    summary: "Abrupt left flank pain radiating to the groin with microscopic hematuria and no fever.",
    source: "Emergency department note",
    author: "M. Flores, MD",
    evidenceJson: evidence([
      { label: "Flank pain and hematuria", value: "Classic renal colic pattern", interpretation: "supports", diagnosisIds: ["dx-ml-stone"], strength: "moderate" },
    ]),
  },
  {
    id: "rec-ml-002",
    patientId: "patient-marcus-lee",
    recordedAt: new Date("2026-10-11T18:10:00.000Z"),
    kind: "imaging",
    title: "Noncontrast CT abdomen/pelvis",
    summary: "A 4 mm calculus is present in the left distal ureter with mild upstream hydroureter. No alternate acute process.",
    source: "Radiology report",
    author: "K. Wu, MD",
    evidenceJson: evidence([
      { label: "Distal ureteral calculus", value: "4 mm with mild hydroureter", interpretation: "supports", diagnosisIds: ["dx-ml-stone"], strength: "high" },
    ]),
  },
  {
    id: "rec-ml-003",
    patientId: "patient-marcus-lee",
    recordedAt: new Date("2026-10-11T18:30:00.000Z"),
    kind: "diagnosis",
    title: "Diagnosis confirmed",
    summary: "Left ureterolithiasis confirmed after the CT demonstrated a distal ureteral calculus.",
    source: "Emergency department note",
    author: "M. Flores, MD",
    evidenceJson: evidence([]),
  },
  {
    id: "rec-ps-001",
    patientId: "patient-priya-shah",
    recordedAt: new Date("2026-10-12T13:00:00.000Z"),
    kind: "encounter",
    title: "Gastroenterology consultation",
    summary: "Six weeks of intermittent cramping and loose stool without weight loss, bleeding, nocturnal symptoms, or fever.",
    source: "Clinic consultation",
    author: "T. Adeyemi, MD",
    evidenceJson: evidence([
      { label: "Intermittent bowel symptoms", value: "No alarm features", interpretation: "ambiguous", diagnosisIds: ["dx-ps-ibd"], strength: "low" },
    ]),
  },
  {
    id: "rec-ps-002",
    patientId: "patient-priya-shah",
    recordedAt: new Date("2026-10-12T15:20:00.000Z"),
    kind: "laboratory",
    title: "Fecal calprotectin",
    summary: "Fecal calprotectin is borderline at 86 µg/g. This result is indeterminate and does not establish inflammatory bowel disease.",
    source: "Laboratory result",
    author: "Reference laboratory",
    evidenceJson: evidence([
      { label: "Borderline fecal calprotectin", value: "86 µg/g", interpretation: "ambiguous", diagnosisIds: ["dx-ps-ibd"], strength: "low" },
    ]),
  },
];

const diagnoses = [
  {
    id: "dx-el-pneumonia",
    patientId: "patient-elena-brooks",
    name: "Community-acquired pneumonia",
    code: "J18.9",
    firstDocumentedAt: new Date("2026-10-10T15:00:00.000Z"),
    currentStatus: "confirmed",
    description: "Initial working diagnosis based on symptoms and an equivocal chest radiograph.",
  },
  {
    id: "dx-el-pe",
    patientId: "patient-elena-brooks",
    name: "Pulmonary embolism",
    code: "I26.99",
    firstDocumentedAt: new Date("2026-10-11T17:20:00.000Z"),
    currentStatus: "confirmed",
    description: "Alternative explanation raised by persistent tachycardia and confirmed on CTA.",
  },
  {
    id: "dx-ml-stone",
    patientId: "patient-marcus-lee",
    name: "Left ureterolithiasis",
    code: "N20.1",
    firstDocumentedAt: new Date("2026-10-11T16:45:00.000Z"),
    currentStatus: "confirmed",
    description: "Renal colic supported by symptoms, hematuria, and definitive imaging.",
  },
  {
    id: "dx-ps-ibd",
    patientId: "patient-priya-shah",
    name: "Inflammatory bowel disease",
    code: "K52.9",
    firstDocumentedAt: new Date("2026-10-12T13:15:00.000Z"),
    currentStatus: "possible",
    description: "An intentionally unresolved possibility pending appropriate follow-up evidence.",
  },
];

const history = [
  {
    id: "hist-el-pna-1",
    diagnosisId: "dx-el-pneumonia",
    changedAt: new Date("2026-10-10T15:00:00.000Z"),
    status: "suspected",
    note: "Working diagnosis; radiograph is equivocal.",
    author: "J. Chen, MD",
    sourceRecordId: "rec-el-003",
    supportingRecordIds: ids(["rec-el-001", "rec-el-002"]),
  },
  {
    id: "hist-el-pna-2",
    diagnosisId: "dx-el-pneumonia",
    changedAt: new Date("2026-10-11T11:45:00.000Z"),
    status: "confirmed",
    note: "Status changed without newly documented supporting evidence.",
    author: "J. Chen, MD",
    sourceRecordId: "rec-el-004",
    supportingRecordIds: ids(["rec-el-002"]),
  },
  {
    id: "hist-el-pe-1",
    diagnosisId: "dx-el-pe",
    changedAt: new Date("2026-10-11T17:20:00.000Z"),
    status: "suspected",
    note: "Raised after persistent tachycardia and elevated D-dimer.",
    author: "J. Chen, MD",
    sourceRecordId: "rec-el-005",
    supportingRecordIds: ids(["rec-el-005"]),
  },
  {
    id: "hist-el-pe-2",
    diagnosisId: "dx-el-pe",
    changedAt: new Date("2026-10-11T20:00:00.000Z"),
    status: "confirmed",
    note: "CTA directly demonstrates a segmental pulmonary embolus.",
    author: "J. Chen, MD",
    sourceRecordId: "rec-el-007",
    supportingRecordIds: ids(["rec-el-006"]),
  },
  {
    id: "hist-ml-1",
    diagnosisId: "dx-ml-stone",
    changedAt: new Date("2026-10-11T16:45:00.000Z"),
    status: "suspected",
    note: "Symptoms and hematuria suggest renal colic.",
    author: "M. Flores, MD",
    sourceRecordId: "rec-ml-001",
    supportingRecordIds: ids(["rec-ml-001"]),
  },
  {
    id: "hist-ml-2",
    diagnosisId: "dx-ml-stone",
    changedAt: new Date("2026-10-11T18:30:00.000Z"),
    status: "confirmed",
    note: "CT confirms a distal ureteral calculus.",
    author: "M. Flores, MD",
    sourceRecordId: "rec-ml-003",
    supportingRecordIds: ids(["rec-ml-002"]),
  },
  {
    id: "hist-ps-1",
    diagnosisId: "dx-ps-ibd",
    changedAt: new Date("2026-10-12T13:15:00.000Z"),
    status: "possible",
    note: "Remains a possibility; current evidence is indeterminate.",
    author: "T. Adeyemi, MD",
    sourceRecordId: "rec-ps-001",
    supportingRecordIds: ids([]),
  },
];

const alerts = [
  {
    id: "alert-el-unsupported-pna",
    patientId: "patient-elena-brooks",
    diagnosisId: "dx-el-pneumonia",
    kind: "unsupported_confirmation",
    severity: "moderate",
    detectedAt: new Date("2026-10-11T11:45:00.000Z"),
    sourceRecordIds: ids(["rec-el-004"]),
    citedEvidence: JSON.stringify([
      { recordId: "rec-el-004", quote: "Community-acquired pneumonia is now listed as confirmed", role: "status_change" },
    ]),
    explanation: "The diagnosis moved from suspected to confirmed, but the cited radiograph predates the suspected status and no new supporting evidence was documented in between.",
    uncertainty: "The earlier radiograph may have influenced the clinician, but its wording was equivocal and this rule cannot assess undocumented bedside reasoning.",
    provenance: "precomputed_demo",
  },
  {
    id: "alert-el-conflict-pna",
    patientId: "patient-elena-brooks",
    diagnosisId: "dx-el-pneumonia",
    kind: "evidence_conflict",
    severity: "high",
    detectedAt: new Date("2026-10-11T19:10:00.000Z"),
    sourceRecordIds: ids(["rec-el-006"]),
    citedEvidence: JSON.stringify([
      { recordId: "rec-el-006", quote: "No focal airspace consolidation", role: "conflicting_evidence" },
    ]),
    explanation: "Later definitive chest imaging does not show the focal consolidation expected to support the documented pneumonia diagnosis and identifies an alternate explanation for the presentation.",
    uncertainty: "A negative CTA does not exclude every form or stage of infection. The discrepancy warrants clinician review rather than an automatic diagnosis change.",
    provenance: "precomputed_demo",
  },
];

async function main() {
  await prisma.reviewSession.deleteMany();
  await prisma.reviewAlert.deleteMany();
  await prisma.diagnosisStatusEvent.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.clinicalRecord.deleteMany();
  await prisma.patient.deleteMany();

  for (const patient of patients) await prisma.patient.create({ data: patient });
  for (const record of records) await prisma.clinicalRecord.create({ data: record });
  for (const diagnosis of diagnoses) await prisma.diagnosis.create({ data: diagnosis });
  for (const event of history) await prisma.diagnosisStatusEvent.create({ data: event });
  for (const alert of alerts) await prisma.reviewAlert.create({ data: alert });

  console.info(`Seeded ${patients.length} synthetic patients, ${records.length} records, and ${alerts.length} demo alerts.`);
}

main()
  .catch((error) => {
    console.error("Unable to seed the synthetic demo database.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
