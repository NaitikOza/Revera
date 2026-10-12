import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Sidebar } from "@/components/sidebar";

export function AppShell({
  children,
  title,
  eyebrow,
  actions,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen lg:ml-[232px]">
        <header className="sticky top-0 z-10 border-b border-line/80 bg-white/85 px-5 py-3.5 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-[1280px] items-center gap-4">
            <div className="min-w-0">
              {eyebrow && <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-moss">{eyebrow}</p>}
              <h1 className="truncate text-base font-semibold tracking-[-0.02em] text-ink">{title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {actions}
              <span className="hidden items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[9px] font-medium text-slate-500 sm:flex">
                <Icon name="shield" className="h-3 w-3 text-moss" />
                Local only
              </span>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1280px] px-5 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
