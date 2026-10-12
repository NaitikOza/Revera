-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordNumber" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "admittedAt" DATETIME NOT NULL,
    "acuity" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "careTeam" TEXT NOT NULL,
    "synthetic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClinicalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "evidenceJson" TEXT NOT NULL,
    CONSTRAINT "ClinicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstDocumentedAt" DATETIME NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiagnosisStatusEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "diagnosisId" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "supportingRecordIds" TEXT NOT NULL,
    CONSTRAINT "DiagnosisStatusEvent_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL,
    "sourceRecordIds" TEXT NOT NULL,
    "citedEvidence" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "uncertainty" TEXT NOT NULL,
    "provenance" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'needs_review',
    "reviewedAt" DATETIME,
    CONSTRAINT "ReviewAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewAlert_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_recordNumber_key" ON "Patient"("recordNumber");

-- CreateIndex
CREATE INDEX "Patient_admittedAt_idx" ON "Patient"("admittedAt");

-- CreateIndex
CREATE INDEX "ClinicalRecord_patientId_recordedAt_idx" ON "ClinicalRecord"("patientId", "recordedAt");

-- CreateIndex
CREATE INDEX "Diagnosis_patientId_firstDocumentedAt_idx" ON "Diagnosis"("patientId", "firstDocumentedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_patientId_code_key" ON "Diagnosis"("patientId", "code");

-- CreateIndex
CREATE INDEX "DiagnosisStatusEvent_diagnosisId_changedAt_idx" ON "DiagnosisStatusEvent"("diagnosisId", "changedAt");

-- CreateIndex
CREATE INDEX "ReviewAlert_patientId_detectedAt_idx" ON "ReviewAlert"("patientId", "detectedAt");
