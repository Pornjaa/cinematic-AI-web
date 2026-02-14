import Link from "next/link";

const links = [
  ["Overview", "/admin"],
  ["Home", "/admin/home"],
  ["Showreel", "/admin/showreel"],
  ["AI Tools", "/admin/ai-tools"],
  ["Articles", "/admin/articles"],
  ["Courses", "/admin/courses"],
  ["Free Tutorials", "/admin/free-tutorials"],
  ["Orders", "/admin/orders"],
  ["Settings", "/admin/settings"]
];

export function AdminSidebar() {
  return (
    <aside className="rounded-3xl border border-white/15 bg-black/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-100">Admin</p>
      <div className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-zinc-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
