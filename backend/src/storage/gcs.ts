import { Storage } from '@google-cloud/storage';
import type { AppConfig } from '../config.js';

type GcsClient = {
  storage: Storage;
  bucket: string;
  publicBaseUrl: string;
};

export function createGcsClient(config: AppConfig): GcsClient | null {
  const projectId = config.GCS_PROJECT_ID?.trim();
  const clientEmail = config.GCS_CLIENT_EMAIL?.trim();
  const privateKeyRaw = config.GCS_PRIVATE_KEY?.trim();
  const bucket = config.GCS_BUCKET?.trim();

  const invalidValues = new Set(['', 'changeme', 'CHANGE_ME']);
  const looksConfigured =
    projectId && clientEmail && privateKeyRaw && bucket &&
    !invalidValues.has(projectId) &&
    !invalidValues.has(clientEmail) &&
    !invalidValues.has(privateKeyRaw) &&
    !invalidValues.has(bucket);

  if (!looksConfigured) return null;

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  const storage = new Storage({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey
    }
  });

  const publicBaseUrl = (config.GCS_PUBLIC_BASE_URL?.trim() || `https://storage.googleapis.com/${bucket}`).replace(/\/$/, '');

  return { storage, bucket, publicBaseUrl };
}

export const ALLOWED_IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function createSignedUploadUrl(gcs: GcsClient, input: {
  objectPath: string;
  contentType: string;
  expiresInMs?: number;
}) {
  const expiresInMs = input.expiresInMs ?? 10 * 60 * 1000;
  const file = gcs.storage.bucket(gcs.bucket).file(input.objectPath);
  const expires = Date.now() + expiresInMs;

  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires,
    contentType: input.contentType
  });

  return {
    uploadUrl,
    expiresAt: new Date(expires).toISOString(),
    publicUrl: `${gcs.publicBaseUrl}/${input.objectPath}`,
    gcsPath: input.objectPath
  };
}
