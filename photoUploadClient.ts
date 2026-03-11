import { apiFetch } from './apiClient';

function isDataUrl(value: string) {
  return /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value);
}

function getContentType(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,/i);
  return (match?.[1] || 'image/jpeg').toLowerCase();
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function uploadProfileImagesWithSignedUrl(images: string[]) {
  const uploaded: string[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const current = images[index];
    if (!current) continue;

    if (!isDataUrl(current)) {
      uploaded.push(current);
      continue;
    }

    const contentType = getContentType(current);
    const fileExt = extensionFromContentType(contentType);

    const signedRes = await apiFetch('/v1/profile/photos/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType,
        fileName: `profile-${Date.now()}-${index}.${fileExt}`
      })
    });

    if (!signedRes.ok) {
      throw new Error('signed_url_failed');
    }

    const signedPayload = (await signedRes.json()) as {
      uploadUrl: string;
      publicUrl: string;
    };

    const blob = await dataUrlToBlob(current);
    const uploadRes = await fetch(signedPayload.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType
      },
      body: blob
    });

    if (!uploadRes.ok) {
      throw new Error('upload_failed');
    }

    uploaded.push(signedPayload.publicUrl);
  }

  return uploaded;
}
