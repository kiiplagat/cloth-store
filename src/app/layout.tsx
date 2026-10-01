import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CATEGORIES, STORE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: STORE_NAME,
  description: "Browse our clothing and order through WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-stone-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-serif text-xl">{STORE_NAME}</Link>
            <nav className="flex gap-5 text-sm">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/${c.slug}`} className="hover:underline">{c.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
          <Link href="/admin">Admin</Link>
        </footer>
      </body>
    </html>
  );
}
