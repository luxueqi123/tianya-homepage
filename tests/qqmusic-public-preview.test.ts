import assert from 'node:assert/strict';
import test from 'node:test';

import {
  QQ_MUSIC_TRACK,
  QQ_PREVIEW_FILENAME,
  buildQqMusicPreviewRequest,
  parseQqMusicPreviewResponse,
} from '../src/lib/qqmusic/public-preview.ts';
import { createQqMusicPreviewCache } from '../src/lib/qqmusic/preview-cache.ts';

const validResponse = (overrides: Record<string, unknown> = {}) => ({
  code: 0,
  req_0: {
    code: 0,
    data: {
      expiration: 7200,
      sip: ['https://isure.stream.qqmusic.qq.com/'],
      midurlinfo: [
        {
          filename: QQ_PREVIEW_FILENAME,
          purl: `${QQ_PREVIEW_FILENAME}?guid=10000&vkey=short-lived-preview-key`,
          result: 0,
          vkey: 'short-lived-preview-key',
        },
      ],
      ...overrides,
    },
  },
});

test('构造固定曲目的匿名 QQ 音乐公开试听请求', () => {
  const request = buildQqMusicPreviewRequest();
  const param = request.req_0.param;

  assert.equal(request.req_0.module, 'vkey.GetVkeyServer');
  assert.equal(request.req_0.method, 'CgiGetVkey');
  assert.deepEqual(param.songmid, [QQ_MUSIC_TRACK.mid]);
  assert.deepEqual(param.filename, [QQ_PREVIEW_FILENAME]);
  assert.equal(param.uin, '0');
  assert.equal(request.comm.uin, 0);
});

test('只返回受信 QQ 音乐域名上的临时试听地址', () => {
  const result = parseQqMusicPreviewResponse(validResponse());
  const url = new URL(result.url);

  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'isure.stream.qqmusic.qq.com');
  assert.equal(url.pathname, `/${QQ_PREVIEW_FILENAME}`);
  assert.equal(result.expiresIn, 7200);
  assert.equal('vkey' in result, false);
});

test('QQ 未返回 CDN 列表时使用固定受信试听域名', () => {
  const result = parseQqMusicPreviewResponse(validResponse({ sip: [] }));
  assert.equal(new URL(result.url).hostname, 'isure.stream.qqmusic.qq.com');
});

test('拒绝上游注入的绝对地址', () => {
  assert.throws(
    () =>
      parseQqMusicPreviewResponse(
        validResponse({
          midurlinfo: [
            {
              filename: QQ_PREVIEW_FILENAME,
              purl: 'https://evil.example/track.mp3',
              result: 0,
              vkey: 'not-used',
            },
          ],
        }),
      ),
    /试听地址无效/,
  );
});

test('拒绝无权限或缺失的试听结果', () => {
  assert.throws(
    () =>
      parseQqMusicPreviewResponse(
        validResponse({
          midurlinfo: [
            {
              filename: QQ_PREVIEW_FILENAME,
              purl: '',
              result: 104003,
              vkey: '',
            },
          ],
        }),
      ),
    /试听暂时不可用/,
  );

  assert.throws(
    () => parseQqMusicPreviewResponse({ code: 1 }),
    /试听暂时不可用/,
  );
});

test('并发请求共用同一次 QQ 音乐地址获取，并在缓存过期后刷新', async () => {
  let now = 1_000;
  let calls = 0;
  const getCachedPreview = createQqMusicPreviewCache(
    async () => {
      calls += 1;
      return {
        url: `https://isure.stream.qqmusic.qq.com/${QQ_PREVIEW_FILENAME}?vkey=${calls}`,
        expiresIn: 7_200,
      };
    },
    () => now,
  );

  const [first, concurrent] = await Promise.all([getCachedPreview(), getCachedPreview()]);
  assert.equal(calls, 1);
  assert.equal(first.url, concurrent.url);

  now += 60 * 60 * 1_000 + 1;
  const refreshed = await getCachedPreview();
  assert.equal(calls, 2);
  assert.notEqual(first.url, refreshed.url);
});
