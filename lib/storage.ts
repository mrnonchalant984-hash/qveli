import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let client: S3Client | null = null;

export function getStorageClient() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  if (!client) {
    client = new S3Client({
      endpoint,
      region: process.env.S3_REGION || 'auto',
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: false,
    });
  }
  return client;
}

export async function createUploadUrl(key: string, contentType: string, expiresIn = 900) {
  const s3 = getStorageClient();
  const bucket = process.env.S3_BUCKET;
  if (!s3 || !bucket) return null;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn });
}

export function publicMediaUrl(key: string) {
  const base = process.env.CDN_BASE_URL?.replace(/\/$/, '');
  return base ? `${base}/${key.split('/').map(encodeURIComponent).join('/')}` : null;
}
