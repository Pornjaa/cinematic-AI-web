import Link from "next/link";
import { auth, signOut } from "@/auth";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

export async function Navbar() {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const session = await Promise.race([
    auth(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
  ]).catch(() => null);

  const menuLinks = [
    { href: "/showreel", label: "Showreel" },
    { href: "/ai-tools", label: "AI prompt buddy" },
    { href: "/articles", label: "บทความ" },
    { href: "/courses", label: "คอร์สที่เปิดสอน" },
    { href: "/free-tutorials", label: "Free tutorial" },
    { href: "/my-courses", label: "คอร์สของคุณ" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/45 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-3xl leading-none text-white">
          Cinematic AI
        </Link>

        <div className="hidden items-center gap-5 rounded-full border border-white/15 bg-black/40 px-5 py-2 text-sm text-zinc-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:flex">
          {menuLinks.map((item) => (
            <Link key={item.href} className="transition hover:text-white" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          <div className="hidden items-center gap-2 md:flex">
            {session?.user ? (
              <>
                <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-200">
                  {session.user.username ?? session.user.name ?? session.user.email ?? "user"}
                </span>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20"
                  >
                    Admin panel
                  </Link>
                )}
                <Link
                  href="/my-courses"
                  className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.45)] transition hover:-translate-y-0.5 hover:bg-brand-900"
                >
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-full border border-white/25 px-4 py-2 text-sm text-white transition hover:border-white/45 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </form>
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

          <details className="relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-white/40">
              <span className="sr-only">Open menu</span>
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
              </span>
            </summary>

            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/15 bg-zinc-950/95 p-2 text-sm text-zinc-100 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col">
                {menuLinks.map((item) => (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="rounded-xl px-3 py-2 transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="my-2 border-t border-white/10" />

              {session?.user ? (
                <div className="flex flex-col gap-2">
                  <span className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300">
                    {session.user.username ?? session.user.name ?? session.user.email ?? "user"}
                  </span>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20"
                    >
                      Admin panel
                    </Link>
                  )}
                  <Link
                    href="/my-courses"
                    className="rounded-xl bg-brand-700 px-3 py-2 text-center text-white transition hover:bg-brand-900"
                  >
                    Dashboard
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-white/25 px-3 py-2 text-left text-white transition hover:border-white/45 hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/register"
                    className="rounded-xl border border-white/20 px-3 py-2 text-white transition hover:border-white/40"
                  >
                    สมัครสมาชิก
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl bg-brand-700 px-3 py-2 text-center text-white transition hover:bg-brand-900"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </div>
              )}
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
