import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katsuyo Coach · Japanese Conjugation Trainer",
  description: "Practice Japanese conjugations across verbs, adjectives, and nouns.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-md">
          <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-slate-900">
              Katsuyo Coach 🇯🇵
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100">Practice</Link>
              <Link href="/guide" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100">Conjugation Guide</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
