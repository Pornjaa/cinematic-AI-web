import Link from "next/link";
import { auth } from "@/auth";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

export async function Navbar() {
  const session = await Promise.race([
    auth(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
  ]).catch(() => null);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/45 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-3xl leading-none text-white">
          Cinematic AI
        </Link>
        <div className="hidden items-center gap-5 rounded-full border border-white/15 bg-black/40 px-5 py-2 text-sm text-zinc-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:flex">
          <Link className="transition hover:text-white" href="/showreel">Showreel</Link>
          <Link className="transition hover:text-white" href="/ai-tools">AI prompt buddy</Link>
          <Link className="transition hover:text-white" href="/articles">บทความ</Link>
          <Link className="transition hover:text-white" href="/courses">คอร์สที่เปิดสอน</Link>
          <Link className="transition hover:text-white" href="/free-tutorials">Free tutorial</Link>
          <Link className="transition hover:text-white" href="/my-courses">คอร์สของคุณ</Link>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {session?.user ? (
            <>
              <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-200 md:inline">
                {session.user.username ?? session.user.name ?? session.user.email ?? "user"}
              </span>
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/my-courses"}
                className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.45)] transition hover:-translate-y-0.5 hover:bg-brand-900"
              >
                {session.user.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.45)] transition hover:-translate-y-0.5 hover:bg-brand-900"
              >
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
