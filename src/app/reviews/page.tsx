import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { formatClinicalDate } from "@/lib/format";
import { getReviewActivity } from "@/lib/repository";

export const dynamic = "force-dynamic";

function Empty({ children }: { children: string }) {
  return <p className="p-8 text-center text-[10px] text-slate-400">{children}</p>;
}

export default async function ReviewsPage() {
  const { open, completed } = await getReviewActivity();

  return (
    <AppShell title="Reviews" eyebrow="Review history">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Review activity</h2>
        <p className="mt-1 text-xs text-slate-500">Open items and completed checks.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="text-sm font-semibold text-ink">Open</h3>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-canvas px-1 text-[9px] font-bold text-slate-500">{open.length}</span>
          </div>
          <div className="divide-y divide-line">
            {open.map(({ alert, patient }) => (
              <Link key={alert.id} href={`/patients/${patient.id}/review`} className="group flex items-start gap-3 p-4 transition hover:bg-[#f8faf7]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-[10px] font-bold text-forest">{patient.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-ink">{patient.displayName}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-500">{alert.kind === "evidence_conflict" ? "New evidence may not fit" : "Confirmation needs support"}</span>
                  <span className="mt-1 block text-[9px] text-slate-400">{formatClinicalDate(alert.detectedAt)}</span>
                </span>
                <Icon name="chevron" className="mt-2 h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-moss" />
              </Link>
            ))}
            {open.length === 0 && <Empty>No open reviews.</Empty>}
          </div>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="text-sm font-semibold text-ink">Completed</h3>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-canvas px-1 text-[9px] font-bold text-slate-500">{completed.length}</span>
          </div>
          <div className="divide-y divide-line">
            {completed.map((review) => (
              <Link key={review.id} href={`/patients/${review.patient.id}`} className="group flex items-start gap-3 p-4 transition hover:bg-[#f8faf7]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e6f0eb] text-forest"><Icon name="check" className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-ink">{review.patient.displayName}</span>
                  <span className="mt-0.5 block text-[10px] capitalize text-slate-500">{review.findingCount} {review.findingCount === 1 ? "finding" : "findings"} · {review.confidence} confidence</span>
                  <span className="mt-1 block text-[9px] text-slate-400">{formatClinicalDate(review.completedAt)}</span>
                </span>
                <Icon name="chevron" className="mt-2 h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-moss" />
              </Link>
            ))}
            {completed.length === 0 && <Empty>Completed reviews will appear here.</Empty>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
