import type { Metadata, Viewport } from 'next';
import './globals.scss';

import { MusicProvider } from '@/components/music-player/music-context';
import { FloatingLyrics } from '@/components/music-player/floating-lyrics';
import { MusicPlayer } from '@/components/music-player/music-player';

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://my.tianyaguanxue.com');

export const metadata: Metadata = {
  title: '天琊观雪 · 个人主页',
  description: '天琊观雪 — 赛博发烧友 / 王者荣耀玩家 | 不断认识世界，也不断重塑自己',
  applicationName: '天琊观雪 · 个人主页',
  metadataBase: siteUrl,
  alternates: { canonical: '/' },
  authors: [{ name: '天琊观雪' }],
  creator: '天琊观雪',
  keywords: ['天琊观雪', '个人主页', '赛博发烧友', '王者荣耀', '照片墙', '音乐'],
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/bird.svg', type: 'image/svg+xml' }],
    shortcut: '/bird.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '天琊观雪 · 个人主页',
    title: '天琊观雪 · 个人主页',
    description: '认真折腾，也认真生活。一个属于天琊观雪的个人网站。',
    url: siteUrl,
  },
  twitter: {
    card: 'summary',
    title: '天琊观雪 · 个人主页',
    description: '认真折腾，也认真生活。一个属于天琊观雪的个人网站。',
  },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050608',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '天琊观雪',
    url: siteUrl.toString(),
    description: '赛博发烧友与王者荣耀玩家',
    homeLocation: { '@type': 'Place', name: '广东·惠州' },
    knowsAbout: ['个人网站', '人工智能', '内容创作'],
  };

  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://isure.stream.qqmusic.qq.com" crossOrigin="anonymous" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        <MusicProvider>
          {children}
          <FloatingLyrics />
          <MusicPlayer />
        </MusicProvider>
      </body>
    </html>
  );
}
