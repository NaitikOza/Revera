import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Revera · Diagnostic review workspace",
  description:
    "A local-only research prototype for reviewing diagnostic anchoring in synthetic clinical records.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
