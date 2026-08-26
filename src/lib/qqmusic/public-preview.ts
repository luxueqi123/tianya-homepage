import { QQ_MUSIC_TRACK, QQ_PREVIEW_FILENAME } from './track.ts';

export { QQ_MUSIC_TRACK, QQ_PREVIEW_FILENAME } from './track.ts';

const QQ_MUSIC_ENDPOINT = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
const FALLBACK_AUDIO_ORIGIN = 'https://isure.stream.qqmusic.qq.com/';
const REQUEST_TIMEOUT_MS = 8_000;

type JsonRecord = Record<string, unknown>;

export interface QqMusicPreviewResult {
  url: string;
  expiresIn: number;
}

const asRecord = (value: unknown): JsonRecord | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;

const isTrustedAudioUrl = (value: string) => {
  try {
    const url = new URL(value);
    const trustedHost =
      url.hostname === 'isure.stream.qqmusic.qq.com' ||
      url.hostname.endsWith('.stream.qqmusic.qq.com');
    return (
      url.protocol === 'https:' &&
      trustedHost &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443') &&
      url.pathname === `/${QQ_PREVIEW_FILENAME}`
    );
  } catch {
    return false;
  }
};

export function buildQqMusicPreviewRequest() {
  return {
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        guid: '10000',
        songmid: [QQ_MUSIC_TRACK.mid],
        songtype: [0],
        uin: '0',
        loginflag: 1,
        platform: '20',
        filename: [QQ_PREVIEW_FILENAME],
      },
    },
    comm: {
      uin: 0,
      format: 'json',
      ct: 24,
      cv: 0,
    },
  };
}

export function parseQqMusicPreviewResponse(payload: unknown): QqMusicPreviewResult {
  const root = asRecord(payload);
  const request = asRecord(root?.req_0);
  const data = asRecord(request?.data);

  if (Number(root?.code) !== 0 || Number(request?.code) !== 0 || !data) {
    throw new Error('QQ 音乐试听暂时不可用');
  }

  const items = Array.isArray(data.midurlinfo) ? data.midurlinfo : [];
  const item = items
    .map(asRecord)
    .find((candidate) => candidate?.filename === QQ_PREVIEW_FILENAME);
  const purl = typeof item?.purl === 'string' ? item.purl.trim() : '';

  if (!item || Number(item.result) !== 0 || !purl) {
    throw new Error('QQ 音乐试听暂时不可用');
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(purl) || purl.startsWith('//') || purl.includes('\\')) {
    throw new Error('QQ 音乐试听地址无效');
  }

  const upstreamOrigins = Array.isArray(data.sip)
    ? data.sip.filter((value): value is string => typeof value === 'string')
    : [];
  const trustedOrigin = [...upstreamOrigins, FALLBACK_AUDIO_ORIGIN].find((origin) => {
    try {
      const url = new URL(origin);
      return (
        url.protocol === 'https:' &&
        (url.hostname === 'isure.stream.qqmusic.qq.com' ||
          url.hostname.endsWith('.stream.qqmusic.qq.com'))
      );
    } catch {
      return false;
    }
  });

  if (!trustedOrigin) throw new Error('QQ 音乐试听地址无效');

  const url = new URL(purl, trustedOrigin).toString();
  if (!isTrustedAudioUrl(url)) throw new Error('QQ 音乐试听地址无效');

  const expiration = Number(data.expiration);
  return {
    url,
    expiresIn: Number.isFinite(expiration) && expiration > 0 ? Math.floor(expiration) : 0,
  };
}

export async function getQqMusicPublicPreviewUrl(
  fetcher: typeof fetch = fetch,
): Promise<QqMusicPreviewResult> {
  const response = await fetcher(QQ_MUSIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(buildQqMusicPreviewRequest()),
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error('QQ 音乐试听暂时不可用');
  return parseQqMusicPreviewResponse(await response.json());
}
