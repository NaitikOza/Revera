import Link from "next/link";
import { Icon } from "@/components/icons";
import type { PatientDetail } from "@/lib/repository";

export function PatientHeader({ patient }: { patient: PatientDetail }) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-forest text-sm font-bold text-white">{patient.initials}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">{patient.displayName}</h2>
            <span className="rounded-full bg-mint px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-forest">Synthetic</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">{patient.recordNumber} · {patient.age} years · {patient.sex} · {patient.location}</p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">{patient.summary}</p>
        </div>
        <Link
          href={`/patients/${patient.id}/review`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-[11px] font-semibold text-white transition hover:bg-[#214d43]"
        >
          <Icon name="sparkle" className="h-4 w-4" />
          Start review
        </Link>
      </div>
    </section>
  );
}
