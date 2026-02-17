import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.AWS_S3_BUCKET ?? "";
const region = process.env.AWS_REGION ?? "ap-southeast-1";

const s3 = new S3Client({
  region,
  endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(process.env.AWS_S3_ENDPOINT),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
  }
});

export async function createSignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  return {
    uploadUrl,
    fileUrl: toPublicFileUrl(key)
  };
}

export async function uploadObject(params: {
  key: string;
  contentType: string;
  body: Uint8Array;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
    Body: params.body
  });

  await s3.send(command);
  return { fileUrl: toPublicFileUrl(params.key) };
}

function toPublicFileUrl(key: string) {
  const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL ?? "";
  return `${publicBase}/${key}`;
}
