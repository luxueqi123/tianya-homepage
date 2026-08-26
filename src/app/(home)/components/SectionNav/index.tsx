'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const sections = [
  { id: 'top', label: '首页' },
  { id: 'location', label: '坐标' },
  { id: 'doing', label: '此刻' },
  { id: 'services', label: '能做' },
  { id: 'vision', label: '此后' },
  { id: 'direction', label: '所往' },
  { id: 'freedom', label: '远方' },
  { id: 'travel-gallery', label: '风景' },
  { id: 'open-source', label: '照片墙' },
  { id: 'sponsor', label: '同行者' },
  { id: 'wall', label: '留言' },
  { id: 'quote', label: '向往' },
  { id: 'milestone', label: '节点' },
] as const;

type SectionId = (typeof sections)[number]['id'];

export function SectionNav() {
  const [activeId, setActiveId] = useState<SectionId>('top');
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const frameRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      frameRef.current = 0;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));

      const focusLine = window.innerHeight * 0.42;
      let closest: SectionId = sections[0].id;
      let closestDistance = Number.POSITIVE_INFINITY;
      sections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const distance = rect.top <= focusLine && rect.bottom >= focusLine
          ? 0
          : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = id;
        }
      });
      setActiveId(closest);
    };

    const onScroll = () => {
      setIsScrolling(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setIsScrolling(false), 900);
      if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showDesktopNav = isScrolling || isInteracting;

  return (
    <>
      <nav aria-label="页面章节" className="fixed inset-x-0 top-0 z-50 h-1 bg-black/25 backdrop-blur-sm md:hidden">
        <span className="absolute inset-y-0 left-0 bg-[#9fe8d0] shadow-[0_0_12px_rgba(159,232,208,0.7)] motion-safe:animate-pulse" style={{ width: `${progress * 100}%` }} />
        <div className="absolute inset-x-0 top-0 grid h-4" style={{ gridTemplateColumns: `repeat(${sections.length},1fr)` }}>
          {sections.map(({ id, label }) => <a key={id} href={`#${id}`} aria-label={`前往${label}`} />)}
        </div>
      </nav>

      <nav
        aria-label="页面章节"
        aria-hidden={!showDesktopNav}
        onPointerEnter={() => setIsInteracting(true)}
        onPointerLeave={() => setIsInteracting(false)}
        onFocusCapture={() => setIsInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsInteracting(false);
        }}
        className={`fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-1.5 transition-[opacity,transform,filter] duration-500 ease-out will-change-[opacity,transform,filter] md:flex ${
          showDesktopNav
            ? 'pointer-events-auto translate-x-0 opacity-100 blur-0'
            : 'pointer-events-none translate-x-4 opacity-0 blur-[2px]'
        }`}
      >
        {sections.map(({ id, label }, index) => {
          const active = id === activeId;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active ? 'location' : undefined}
              className="site-flow-frame site-flow-frame--compact group relative flex h-7 w-7 items-center justify-center rounded-full [--site-flow-rgb:159,232,208]"
              style={{ '--site-flow-delay': `${index * -0.42}s` } as CSSProperties}
            >
              <span className={`relative z-[5] block rounded-full transition-all ${active ? 'h-2.5 w-2.5 bg-[#9fe8d0] shadow-[0_0_14px_rgba(159,232,208,0.72)]' : 'h-1.5 w-1.5 bg-white/38 group-hover:bg-white/70'}`} />
              <span className="site-flow-frame site-flow-frame--compact pointer-events-none absolute right-full z-[5] mr-2 whitespace-nowrap rounded border border-white/14 bg-[#10141b]/95 px-2 py-1 text-[10px] text-white/88 opacity-0 shadow-lg transition-opacity [--site-flow-rgb:159,232,208] group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="relative z-[5]">{label}</span>
              </span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
