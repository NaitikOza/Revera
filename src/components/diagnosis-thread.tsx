import { Icon } from "@/components/icons";
import type { PatientDetail } from "@/lib/repository";

const statusStyle: Record<string, string> = {
  confirmed: "bg-[#e4f0ea] text-[#326556]",
  suspected: "bg-[#f6eedf] text-[#9b682b]",
  possible: "bg-[#eef0f5] text-[#626b7a]",
  ruled_out: "bg-[#f5e7e4] text-[#9e5648]",
};

function shortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(date));
}

export function DiagnosisThread({ diagnoses }: { diagnoses: PatientDetail["diagnoses"] }) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint text-forest">
          <Icon name="activity" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">Diagnosis thread</h2>
          <p className="text-[10px] text-slate-400">Status history remains clinician-owned</p>
        </div>
      </div>

      <div className="space-y-5">
        {diagnoses.map((diagnosis) => (
          <article key={diagnosis.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <h3 className="text-xs font-semibold leading-snug text-ink">{diagnosis.name}</h3>
                  <span className="ml-auto shrink-0 font-mono text-[9px] text-slate-400">{diagnosis.code}</span>
                </div>
                <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold capitalize ${statusStyle[diagnosis.currentStatus] ?? statusStyle.possible}`}>
                  {diagnosis.currentStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="ml-1 mt-4 border-l border-dashed border-[#d9e1dc] pl-4">
              {diagnosis.history.map((event, index) => (
                <div key={event.id} className="relative pb-4 last:pb-0">
                  <span className={`absolute -left-[19px] top-1 h-2 w-2 rounded-full ring-4 ring-white ${index === diagnosis.history.length - 1 ? "bg-moss" : "bg-slate-300"}`} />
                  <div className="flex items-center gap-2 text-[9px]">
                    <span className="font-bold uppercase tracking-wide text-slate-500">{event.status.replace("_", " ")}</span>
                    <span className="text-slate-300">•</span>
                    <time className="text-slate-400">{shortDate(event.changedAt)}</time>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{event.note}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
