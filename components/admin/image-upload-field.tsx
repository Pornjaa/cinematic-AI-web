"use client";

import { useState } from "react";

export function ImageUploadField({ name = "imageUrl" }: { name?: string }) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const signRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "image/jpeg",
          folder: "images"
        })
      });
      const sign = await signRes.json();
      if (!signRes.ok) {
        alert(sign.error ?? "Sign URL failed");
        return;
      }

      const putRes = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file
      });

      if (!putRes.ok) {
        alert("Upload failed");
        return;
      }

      setValue(sign.fileUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
        className="w-full rounded-xl border border-white/15 p-2"
      />
      <input
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Image URL (or upload above)"
        className="w-full rounded-xl border border-white/15 p-2"
        required
      />
      {uploading && <p className="text-xs text-zinc-300">Uploading...</p>}
    </div>
  );
}
