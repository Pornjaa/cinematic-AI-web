"use client";

import { useState } from "react";
import { normalizeMuxVideoUrl } from "@/lib/video";

type Props = {
  name?: string;
  placeholder?: string;
};

export function MuxVideoUploadField({ name = "videoUrl", placeholder = "video url" }: Props) {
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    setStatus("Creating upload link...");

    try {
      const createRes = await fetch("/api/admin/mux/direct-upload", { method: "POST" });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error ?? "Cannot create upload url");

      setStatus("Uploading video file...");
      const putRes = await fetch(createJson.uploadUrl as string, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });
      if (!putRes.ok) throw new Error("Upload failed");

      setStatus("Processing video on Mux...");
      const uploadId = createJson.uploadId as string;

      for (let attempt = 0; attempt < 45; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const statusRes = await fetch(`/api/admin/mux/direct-upload?uploadId=${uploadId}`);
        const statusJson = await statusRes.json();
        if (!statusRes.ok) throw new Error(statusJson.error ?? "Cannot check video status");

        if (statusJson.videoUrl) {
          setVideoUrl(normalizeMuxVideoUrl(statusJson.videoUrl as string) ?? (statusJson.videoUrl as string));
          setStatus("Ready: inserted video url for this lesson block.");
          setUploading(false);
          return;
        }
      }

      throw new Error("Mux is still processing. Please wait a minute and upload again.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload error");
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2 md:col-span-3">
      <input
        name={name}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 p-2"
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-xl border border-white/20 px-3 py-2 text-sm">
          Upload video file
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
        </label>
        {status ? <p className="text-xs text-zinc-300">{status}</p> : null}
      </div>
    </div>
  );
}
