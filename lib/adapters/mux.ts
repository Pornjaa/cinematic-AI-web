import Mux from "@mux/mux-node";
import { getBaseUrl } from "@/lib/base-url";

const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

function getMuxClient() {
  if (!tokenId || !tokenSecret) return null;
  return new Mux({ tokenId, tokenSecret });
}

export async function createMuxAsset(inputUrl: string) {
  const mux = getMuxClient();
  if (!mux) return null;

  const asset = await mux.video.assets.create({
    input: [{ url: inputUrl }],
    playback_policy: ["public"],
    test: process.env.NODE_ENV !== "production"
  });

  return {
    assetId: asset.id,
    playbackId: asset.playback_ids?.[0]?.id ?? null
  };
}

export async function createMuxDirectUpload() {
  const mux = getMuxClient();
  if (!mux) return null;

  const upload = await mux.video.uploads.create({
    cors_origin: getBaseUrl(),
    new_asset_settings: {
      playback_policy: ["public"],
      test: process.env.NODE_ENV !== "production"
    }
  });

  return {
    uploadId: upload.id,
    uploadUrl: upload.url
  };
}

export async function getMuxUploadPlayback(uploadId: string) {
  const mux = getMuxClient();
  if (!mux) return null;

  const upload = await mux.video.uploads.retrieve(uploadId);
  if (!upload.asset_id) {
    return {
      status: upload.status ?? "waiting",
      playbackId: null,
      videoUrl: null
    };
  }

  const asset = await mux.video.assets.retrieve(upload.asset_id);
  const playbackId = asset.playback_ids?.[0]?.id ?? null;

  return {
    status: asset.status ?? "preparing",
    playbackId,
    videoUrl: playbackId ? `https://stream.mux.com/${playbackId}/medium.mp4` : null
  };
}
