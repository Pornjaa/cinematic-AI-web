import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getBaseUrl } from "@/lib/base-url";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Cinematic AI",
    template: "%s | Cinematic AI"
  },
  description: "คอร์สและคอนเทนต์สายทำวิดีโอแบบ cinematic",
  openGraph: {
    title: "Cinematic AI",
    description: "Cinematic storytelling, practical tutorials, and pro workflows"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#111827_0%,#090b10_45%,#040507_100%)]" />
          <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        </div>
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
