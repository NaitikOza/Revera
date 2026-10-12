import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <div className="max-w-sm rounded-3xl border border-line bg-white p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest"><Icon name="search" className="h-5 w-5" /></span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">Case not found</h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">This synthetic case is not available in the local demo database.</p>
        <Link href="/" className="mt-5 inline-flex rounded-xl bg-forest px-4 py-2.5 text-xs font-semibold text-white">Return to workspace</Link>
      </div>
    </main>
  );
}
