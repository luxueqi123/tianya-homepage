import {
  getQqMusicPublicPreviewUrl,
  type QqMusicPreviewResult,
} from './public-preview.ts';

const MAX_PREVIEW_CACHE_MS = 60 * 60 * 1_000;

type PreviewLoader = () => Promise<QqMusicPreviewResult>;

export function createQqMusicPreviewCache(
  loadPreview: PreviewLoader,
  now: () => number = Date.now,
) {
  let cachedPreview: QqMusicPreviewResult | null = null;
  let cachedPreviewExpiresAt = 0;
  let previewRequest: Promise<QqMusicPreviewResult> | null = null;

  return async function getCachedPreview() {
    const currentTime = now();
    if (cachedPreview && currentTime < cachedPreviewExpiresAt) return cachedPreview;
    if (previewRequest) return previewRequest;

    previewRequest = loadPreview()
      .then((preview) => {
        const upstreamTtlMs = preview.expiresIn > 0
          ? preview.expiresIn * 500
          : MAX_PREVIEW_CACHE_MS;
        cachedPreview = preview;
        cachedPreviewExpiresAt = now() + Math.min(upstreamTtlMs, MAX_PREVIEW_CACHE_MS);
        return preview;
      })
      .finally(() => {
        previewRequest = null;
      });

    return previewRequest;
  };
}

export const getCachedQqMusicPreview = createQqMusicPreviewCache(
  () => getQqMusicPublicPreviewUrl(),
);
