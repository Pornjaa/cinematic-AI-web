import { getCachedFooterSetting } from "@/lib/public-data";

export async function Footer() {
  const setting = await Promise.race([
    getCachedFooterSetting(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
  ]).catch(() => null);
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-zinc-400">
        <p>© {new Date().getFullYear()} Cinematic AI</p>
        <div className="flex gap-4">
          {setting?.facebookUrl && <a className="transition hover:text-white" href={setting.facebookUrl}>Facebook</a>}
          {setting?.tiktokUrl && <a className="transition hover:text-white" href={setting.tiktokUrl}>TikTok</a>}
          {setting?.youtubeUrl && <a className="transition hover:text-white" href={setting.youtubeUrl}>YouTube</a>}
        </div>
      </div>
    </footer>
  );
}
