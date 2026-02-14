export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-56 rounded-2xl bg-white/10" />
      <div className="h-64 rounded-3xl bg-white/10" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-3xl bg-white/10" />
        <div className="h-40 rounded-3xl bg-white/10" />
      </div>
    </div>
  );
}
