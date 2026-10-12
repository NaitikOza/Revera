-- CreateTable
CREATE TABLE "ReviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "findingCount" INTEGER NOT NULL,
    "modelStatus" TEXT NOT NULL,
    "feedback" TEXT,
    CONSTRAINT "ReviewSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReviewSession_patientId_completedAt_idx" ON "ReviewSession"("patientId", "completedAt");
