export interface MusicTrack {
  id: number;
  mid: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
}

export interface LyricLine {
  /** 秒 */
  time: number;
  text: string;
  translation?: string;
  words?: LyricWord[];
}

export interface LyricWord {
  /** 该字或词开始播放的绝对秒数 */
  time: number;
  /** 持续秒数 */
  duration: number;
  text: string;
}

export const QQ_MUSIC_TRACK = {
  id: 300569300,
  mid: '0034Kjbr0runUq',
  title: '时光盲盒',
  artist: 'ChiliChill乐团',
  album: 'QQ音乐 · 公开试听',
  cover: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000j0UsI4EwOsP_1.jpg',
  duration: 60_000,
} satisfies MusicTrack;

export const QQ_MUSIC_TRACKS: MusicTrack[] = [QQ_MUSIC_TRACK];
export const QQ_MUSIC_OPEN_URL = 'https://y.qq.com/n/ryqq/songDetail/0034Kjbr0runUq';
export const QQ_PREVIEW_FILENAME = 'RS020004pB0d2pAKbH.mp3';
