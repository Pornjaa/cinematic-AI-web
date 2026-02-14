import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

async function updateSettings(formData: FormData) {
  "use server";
  const data = {
    appNameTh: String(formData.get("appNameTh") || "Cinematic AI"),
    appNameEn: String(formData.get("appNameEn") || "Cinematic AI"),
    facebookUrl: String(formData.get("facebookUrl") || ""),
    tiktokUrl: String(formData.get("tiktokUrl") || ""),
    youtubeUrl: String(formData.get("youtubeUrl") || ""),
    bankNameTh: String(formData.get("bankNameTh") || ""),
    bankNameEn: String(formData.get("bankNameEn") || ""),
    bankAccountNameTh: String(formData.get("bankAccountNameTh") || ""),
    bankAccountNameEn: String(formData.get("bankAccountNameEn") || ""),
    bankAccountNumber: String(formData.get("bankAccountNumber") || ""),
    bankTransferNoteTh: String(formData.get("bankTransferNoteTh") || ""),
    bankTransferNoteEn: String(formData.get("bankTransferNoteEn") || "")
  };

  await db.siteSetting.upsert({
    where: { id: "default-site" },
    update: data,
    create: { id: "default-site", ...data }
  });

  revalidatePath("/");
}

export default async function AdminSettingsPage() {
  const setting = await db.siteSetting.findUnique({ where: { id: "default-site" } });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form action={updateSettings} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-2">
        <input name="appNameTh" defaultValue={setting?.appNameTh} placeholder="App name TH" className="rounded-xl border border-white/15 p-2" />
        <input name="appNameEn" defaultValue={setting?.appNameEn} placeholder="App name EN" className="rounded-xl border border-white/15 p-2" />
        <input name="facebookUrl" defaultValue={setting?.facebookUrl ?? ""} placeholder="Facebook URL" className="rounded-xl border border-white/15 p-2" />
        <input name="tiktokUrl" defaultValue={setting?.tiktokUrl ?? ""} placeholder="TikTok URL" className="rounded-xl border border-white/15 p-2" />
        <input name="youtubeUrl" defaultValue={setting?.youtubeUrl ?? ""} placeholder="YouTube URL" className="rounded-xl border border-white/15 p-2" />
        <input name="bankNameTh" defaultValue={setting?.bankNameTh ?? ""} placeholder="Bank TH" className="rounded-xl border border-white/15 p-2" />
        <input name="bankNameEn" defaultValue={setting?.bankNameEn ?? ""} placeholder="Bank EN" className="rounded-xl border border-white/15 p-2" />
        <input name="bankAccountNameTh" defaultValue={setting?.bankAccountNameTh ?? ""} placeholder="Account Name TH" className="rounded-xl border border-white/15 p-2" />
        <input name="bankAccountNameEn" defaultValue={setting?.bankAccountNameEn ?? ""} placeholder="Account Name EN" className="rounded-xl border border-white/15 p-2" />
        <input name="bankAccountNumber" defaultValue={setting?.bankAccountNumber ?? ""} placeholder="Account Number" className="rounded-xl border border-white/15 p-2" />
        <textarea name="bankTransferNoteTh" defaultValue={setting?.bankTransferNoteTh ?? ""} placeholder="Transfer note TH" className="rounded-xl border border-white/15 p-2 md:col-span-2" />
        <textarea name="bankTransferNoteEn" defaultValue={setting?.bankTransferNoteEn ?? ""} placeholder="Transfer note EN" className="rounded-xl border border-white/15 p-2 md:col-span-2" />
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white md:col-span-2">Save settings</button>
      </form>
    </div>
  );
}
