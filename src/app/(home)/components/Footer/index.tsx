import { ArrowUp, Music2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 px-4 py-10 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(83,157,253,0.1),transparent_62%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="site-title-breathe text-2xl font-black text-white">天琊观雪</p>
          <p className="mt-2 max-w-md text-xs leading-6 text-[#aeb9c0]">
            认真折腾，也认真生活。背景音乐：《时光盲盒》· QQ 音乐提供。
          </p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-[#9daeb7]">
            © {new Date().getFullYear()} TIANYA GUANXUE
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] text-[#b6c2c8]">
            <Music2 className="h-3.5 w-3.5 text-[#9fe8d0]/65" aria-hidden />
            页面仍在继续生长
          </span>
          <a href="#top" aria-label="回到顶部" className="site-flow-frame inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[#0b1113] text-[#d1d9dd] transition-colors [--site-flow-delay:-4s] hover:border-[#9fe8d0]/45 hover:text-[#b7ffe8]">
            <ArrowUp className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
