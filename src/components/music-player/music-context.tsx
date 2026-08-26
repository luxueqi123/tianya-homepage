'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  QQ_MUSIC_TRACKS,
  type LyricLine,
  type MusicTrack,
} from '@/lib/qqmusic/track';

export const DEFAULT_MUSIC_VOLUME = 0.05;
const MUSIC_VOLUME_STORAGE_KEY = 'tianya-music-volume';
const MUSIC_BOOTSTRAP_SCRIPT = `(() => {
  const audio = document.getElementById('tianya-background-audio');
  if (!(audio instanceof HTMLAudioElement)) return;
  audio.volume = ${DEFAULT_MUSIC_VOLUME};
  audio.dataset.bootstrapReady = '1';
  const setPlayingVisual = (playing) => {
    document.documentElement.dataset.musicPlaying = playing ? 'true' : 'false';
  };
  setPlayingVisual(!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);
  audio.addEventListener('playing', () => setPlayingVisual(true));
  ['waiting', 'pause', 'ended', 'error'].forEach((eventName) => {
    audio.addEventListener(eventName, () => setPlayingVisual(false));
  });
  const bootstrap = Promise.resolve(true);
  window.__tianyaMusicBootstrap = bootstrap;

  const attempt = () => bootstrap.then((ready) => {
    if (!ready || !audio.paused) return;
    return audio.play().then(() => {
      delete audio.dataset.autoplayBlocked;
    }).catch((error) => {
      if (error && error.name === 'NotAllowedError') {
        audio.dataset.autoplayBlocked = '1';
        window.dispatchEvent(new CustomEvent('tianya:autoplay-blocked'));
      }
    });
  });
  void attempt();

  const unlock = (event) => {
    if (!audio.src || !audio.paused) return;
    audio.play().then(() => {
      delete audio.dataset.autoplayBlocked;
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    }).catch(() => {});
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
})();`;

type MusicBootstrapWindow = Window & {
  __tianyaMusicBootstrap?: Promise<boolean>;
};

interface MusicContextValue {
  tracks: MusicTrack[];
  playlistName: string;
  loading: boolean;
  error: string;
  urlError: string;
  currentIndex: number;
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  isRepeat: boolean;
  volume: number;
  lyricsEnabled: boolean;
  playerExpanded: boolean;
  /** 当前歌曲歌词（带翻译） */
  lyrics: LyricLine[];
  lyricLoading: boolean;
  lyricError: string;
  audioAnalyser: AnalyserNode | null;
  getPlaybackTime: () => number;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleLyrics: () => void;
  setPlayerExpanded: (expanded: boolean) => void;
  seek: (time: number) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

const isAudioActivelyPlaying = (audio: HTMLAudioElement) =>
  !audio.paused
  && !audio.ended
  && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);

  const [tracks] = useState<MusicTrack[]>(QQ_MUSIC_TRACKS);
  const [playlistName] = useState('QQ音乐 · 公开试听');
  const [loading] = useState(false);
  const [error] = useState('');
  const [urlError, setUrlError] = useState('');

  const [lyrics] = useState<LyricLine[]>([]);
  const [lyricLoading] = useState(false);
  const [lyricError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(true);
  const [volume, setVolumeState] = useState(DEFAULT_MUSIC_VOLUME);
  const [lyricsEnabled, setLyricsEnabled] = useState(false);
  const [playerExpanded, setPlayerExpanded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const savedVolumeRaw = localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY);
        const savedVolume = savedVolumeRaw === null ? Number.NaN : Number(savedVolumeRaw);
        const nextVolume = Number.isFinite(savedVolume)
          ? Math.min(Math.max(savedVolume, 0), 1)
          : DEFAULT_MUSIC_VOLUME;
        setVolumeState(nextVolume);
        if (audioRef.current) {
          audioRef.current.volume = nextVolume;
          setIsPlaying(isAudioActivelyPlaying(audioRef.current));
          if (audioRef.current.dataset.autoplayBlocked === '1') {
            setUrlError('浏览器阻止了自动播放，点击唱片即可开启音乐');
          }
        }

        const savedLyrics = localStorage.getItem('yuniao-lyrics-enabled');
        if (savedLyrics !== null) setLyricsEnabled(savedLyrics !== 'false');
      } catch {
        /* use defaults */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleBootstrapBlocked = () => {
      setUrlError('浏览器阻止了自动播放，点击唱片即可开启音乐');
    };
    window.addEventListener('tianya:autoplay-blocked', handleBootstrapBlocked);
    return () => window.removeEventListener('tianya:autoplay-blocked', handleBootstrapBlocked);
  }, []);

  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.min(Math.max(Number(value) || 0, 0), 1);
    setVolumeState(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
    try {
      localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(nextVolume));
    } catch {
      /* ignore persistence errors */
    }
  }, []);

  const toggleLyrics = useCallback(() => {
    setLyricsEnabled((enabled) => {
      const next = !enabled;
      try {
        localStorage.setItem('yuniao-lyrics-enabled', String(next));
      } catch {
        /* ignore persistence errors */
      }
      return next;
    });
  }, []);

  const ensureAudioAnalyser = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || typeof window === 'undefined') return null;

    if (!audioContextRef.current) {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.62;
      analyser.minDecibels = -88;
      analyser.maxDecibels = -6;

      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      audioSourceRef.current = source;
      analyserRef.current = analyser;
      setAudioAnalyser(analyser);
    }

    const context = audioContextRef.current;
    if (context?.state === 'suspended') {
      await context.resume().catch(() => {});
    }

    return analyserRef.current;
  }, []);

  useEffect(() => {
    // 不在自动播放阶段创建 MediaElementAudioSource：浏览器若暂停 AudioContext，
    // 过早接管音频输出会让媒体显示为播放中却没有声音。首次真实交互后再升级为频谱分析。
    const prepareAnalyser = () => {
      void ensureAudioAnalyser();
    };
    window.addEventListener('pointerdown', prepareAnalyser, { capture: true, once: true });
    window.addEventListener('keydown', prepareAnalyser, { capture: true, once: true });
    return () => {
      window.removeEventListener('pointerdown', prepareAnalyser, true);
      window.removeEventListener('keydown', prepareAnalyser, true);
    };
  }, [ensureAudioAnalyser]);

  useEffect(() => {
    return () => {
      void audioContextRef.current?.close();
      audioContextRef.current = null;
      audioSourceRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  const isShuffleRef = useRef(isShuffle);
  const isRepeatRef = useRef(isRepeat);
  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);
  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  /* 播放期间以约 20fps 同步时间，满足逐字歌词高亮，同时控制全局重渲染频率。 */
  useEffect(() => {
    if (!isPlaying) return;

    let frame = 0;
    let previous = 0;
    const update = (timestamp: number) => {
      if (timestamp - previous >= 50) {
        previous = timestamp;
        const audio = audioRef.current;
        if (audio) setCurrentTime(audio.currentTime);
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  /* ---------- 播放 ---------- */
  const attemptAudioPlay = useCallback(async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setUrlError('');
      return true;
    } catch (playError) {
      const blocked = playError instanceof DOMException && playError.name === 'NotAllowedError';
      setUrlError(
        blocked
          ? '浏览器阻止了自动播放，点击唱片即可开启音乐'
          : '音乐播放暂时不可用，请稍后再试',
      );
      return false;
    }
  }, []);

  const loadTrack = useCallback(
    async (index: number, shouldPlay: boolean) => {
      const audio = audioRef.current;
      const track = tracks[index];
      if (!audio || !track) return;
      setCurrentIndex(index);
      setUrlError('');
      try {
        if (index === 0) {
          const bootstrap = (window as MusicBootstrapWindow).__tianyaMusicBootstrap;
          if (bootstrap) await bootstrap;
          if (audio.src) {
            if (shouldPlay) {
              if (audio.paused) await attemptAudioPlay(audio);
              else {
                setIsPlaying(isAudioActivelyPlaying(audio));
              }
            } else {
              setIsPlaying(isAudioActivelyPlaying(audio));
            }
            return;
          }
        }

        const res = await fetch('/api/music/url');
        const json = await res.json();
        if (!res.ok || !json.ok || !json.url) {
          setUrlError(json.error || '音乐暂时不可用，请稍后再试');
          audio.removeAttribute('src');
          audio.load();
          setIsPlaying(false);
          return;
        }
        audio.src = json.url;
        audio.load();
        if (shouldPlay) {
          await attemptAudioPlay(audio);
        } else {
          setIsPlaying(false);
        }
      } catch {
        setUrlError('音乐暂时不可用，请稍后再试');
        setIsPlaying(false);
      }
    },
    [attemptAudioPlay, tracks],
  );

  useEffect(() => {
    if (!tracks.length) return;

    let cancelled = false;
    // 首屏内联脚本已经在 audio 元素出现后立即请求播放；React 挂载后再同步一次，
    // 作为脚本未执行或音源稍后就绪时的兜底，不再人为增加等待时间。
    void loadTrack(0, true).then(() => {
      if (!cancelled && audioRef.current) {
        setIsPlaying(isAudioActivelyPlaying(audioRef.current));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [attemptAudioPlay, loadTrack, tracks.length]);

  useEffect(() => {
    if (!urlError.includes('浏览器阻止了自动播放')) return;

    const unlockOnFirstInteraction = (event: PointerEvent | KeyboardEvent) => {
      const audio = audioRef.current;
      if (audio?.src && audio.paused) void attemptAudioPlay(audio);
    };

    window.addEventListener('pointerdown', unlockOnFirstInteraction, { capture: true });
    window.addEventListener('keydown', unlockOnFirstInteraction, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnFirstInteraction, { capture: true });
      window.removeEventListener('keydown', unlockOnFirstInteraction, { capture: true });
    };
  }, [attemptAudioPlay, urlError]);

  const playTrack = useCallback(
    (index: number) => void loadTrack(index, true),
    [loadTrack],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    void ensureAudioAnalyser();
    if (!audio.src) {
      void loadTrack(currentIndex, true);
      return;
    }
    if (audio.paused) {
      void attemptAudioPlay(audio);
    } else {
      audio.pause();
    }
  }, [attemptAudioPlay, currentIndex, loadTrack, ensureAudioAnalyser]);

  const next = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const count = tracks.length;
    if (!count) return;
    if (count === 1 && audio.src) {
      audio.currentTime = 0;
      void attemptAudioPlay(audio);
      return;
    }
    const index = isShuffleRef.current
      ? Math.floor(Math.random() * count)
      : (currentIndex + 1) % count;
    void loadTrack(index, true);
  }, [attemptAudioPlay, currentIndex, tracks.length, loadTrack]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const count = tracks.length;
    if (!count) return;
    if (count === 1) {
      audio.currentTime = 0;
      return;
    }
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const index = isShuffleRef.current
      ? Math.floor(Math.random() * count)
      : (currentIndex - 1 + count) % count;
    void loadTrack(index, true);
  }, [currentIndex, tracks.length, loadTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration);
    setCurrentTime(audio.currentTime);
  }, []);

  const getPlaybackTime = useCallback(
    () => audioRef.current?.currentTime ?? 0,
    [],
  );

  const currentTrack = tracks[currentIndex] ?? null;

  return (
    <MusicContext.Provider
      value={{
        tracks,
        playlistName,
        loading,
        error,
        urlError,
        currentIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        isShuffle,
        isRepeat,
        volume,
        lyricsEnabled,
        playerExpanded,
        lyrics,
        lyricLoading,
        lyricError,
        audioAnalyser,
        getPlaybackTime,
        playTrack,
        togglePlay,
        next,
        prev,
        toggleShuffle: () => setIsShuffle((v) => !v),
        toggleRepeat: () => setIsRepeat((v) => !v),
        setVolume,
        toggleLyrics,
        setPlayerExpanded,
        seek,
      }}
    >
      <audio
        id="tianya-background-audio"
        ref={audioRef}
        autoPlay
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        src="/api/music/stream"
        suppressHydrationWarning
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setCurrentTime(a.currentTime);
          if (a.duration && Number.isFinite(a.duration)) setDuration(a.duration);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          const audio = audioRef.current;
          if (isRepeatRef.current && audio) {
            audio.currentTime = 0;
            void attemptAudioPlay(audio);
          } else {
            next();
          }
        }}
        onPlaying={(event) => {
          delete event.currentTarget.dataset.autoplayBlocked;
          setUrlError('');
          setIsPlaying(true);
        }}
        onWaiting={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onError={() => setUrlError('音乐暂时不可用，请稍后再试')}
      />
      <script dangerouslySetInnerHTML={{ __html: MUSIC_BOOTSTRAP_SCRIPT }} />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic 必须在 <MusicProvider> 内使用');
  return ctx;
}
