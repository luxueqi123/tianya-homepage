'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

import './index.scss';

const milestones = [
  {
    date: '2022',
    watermark: '2022',
    title: '昵称由来',
    description: [
      '读完《诛仙》让这个名字有了最初的想象，也成为后来一路延续的起点。',
    ],
    image: '/milestones/00-zhuxian-cover.png',
    side: 'above',
    x: '400px',
    y: '390px',
  },
  {
    date: '2026.06',
    watermark: '2026',
    title: '重新启程',
    description: [
      '没有现成答案，也没有明确终点。',
    ],
    image: '/milestones/01-resignation-notice.png',
    side: 'below',
    x: '960px',
    y: '295px',
  },
  {
    date: '2026.08',
    watermark: 'SITE',
    title: '个人主页制作',
    description: [
      '开始搭建个人网站，让“天琊观雪”不再只是一个名字，而是成为承载思考、记录与未来可能的空间。',
    ],
    image: '/milestones/02-personal-homepage.png',
    side: 'above',
    x: '1520px',
    y: '330px',
  },
  {
    date: '2026.08.24',
    watermark: 'LOGO',
    title: '精心设计',
    description: [
      '为自己的无限画布“映雪”设计了 Logo，从构思到定稿，花了一天时间反复推敲打磨。',
    ],
    image: '/milestones/03-yingxue-logo.webp',
    side: 'below',
    x: '2080px',
    y: '405px',
  },
  {
    date: '2026.08.26',
    watermark: '映雪',
    title: '无限画布“映雪”上线',
    description: [
      '无限画布项目“映雪”完成首次上线，从一个想法，变成了真正可以打开和使用的网站。',
    ],
    image: '/milestones/04-yingxue-canvas.webp',
    side: 'above',
    x: '2640px',
    y: '330px',
  },
  {
    date: '此刻',
    watermark: 'NOW',
    title: '向远而行',
    description: [
      '在一次次尝试与验证中，让想法逐渐成为作品。',
    ],
    image: '/milestones/03-mountain-trail.jpg',
    side: 'below',
    x: '3200px',
    y: '320px',
  },
] as const;

const tracePath = 'M -80 350 C 40 380 100 430 160 390 C 300 300 450 270 592 310 C 740 350 870 430 1024 380 C 1180 330 1300 260 1440 320 C 1540 360 1620 390 1680 350';
const timelineSidePadding = 400;
const timelineNodeGap = 560;

export function Milestone() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const timelineWidth = timelineSidePadding * 2 + timelineNodeGap * (milestones.length - 1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onWheel = (event: WheelEvent) => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      if (maxScroll <= 1) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const atStart = viewport.scrollLeft <= 0;
      const atEnd = viewport.scrollLeft >= maxScroll - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

      event.preventDefault();
      viewport.scrollLeft += delta * 1.35;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      dragging = true;
      startX = event.clientX;
      startScrollLeft = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      viewport.scrollLeft = startScrollLeft - (event.clientX - startX) * 1.25;
    };

    const stopDragging = () => {
      dragging = false;
      viewport.classList.remove('is-dragging');
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', stopDragging);
    viewport.addEventListener('pointercancel', stopDragging);

    return () => {
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', stopDragging);
      viewport.removeEventListener('pointercancel', stopDragging);
    };
  }, []);

  return (
    <section id="milestone" data-section className="milestone-journey relative overflow-hidden px-4 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
      <div aria-hidden className="milestone-journey__aurora pointer-events-none absolute inset-0" />
      <div aria-hidden className="milestone-journey__stars pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p data-section-title className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d7a35b]">
          Personal Trace
        </p>
        <h2 data-section-title className="site-title-breathe mt-4 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.06em] text-white md:text-6xl lg:text-7xl">
          时光
          <em className="font-normal not-italic text-[#d7a35b]">刻度</em>
        </h2>
        <p data-reveal className="mt-5 max-w-xl text-sm leading-7 text-[#c2ccd2] md:text-base md:leading-8">
          让每一步，都成为未来的伏笔。
        </p>
      </div>

      <div data-reveal className="milestone-journey__stage relative z-10 mx-auto mt-8 max-w-[1800px] md:mt-12">
        <div
          ref={viewportRef}
          className="milestone-journey__viewport"
          aria-label="横向滑动查看时间刻度"
        >
          <div
            className="milestone-journey__canvas"
            style={{ '--timeline-width': `${timelineWidth}px` } as CSSProperties}
          >
            <svg
              aria-hidden
              className="milestone-journey__trace"
              viewBox="0 0 1600 760"
              preserveAspectRatio="none"
            >
          <defs>
            <linearGradient id="milestone-trace-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8f6028" />
              <stop offset="0.45" stopColor="#f1b84e" />
              <stop offset="0.78" stopColor="#d7a35b" />
              <stop offset="1" stopColor="#9fe8d0" />
            </linearGradient>
            <filter id="milestone-trace-glow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path className="milestone-journey__ribbon" d={tracePath} />
          <path className="milestone-journey__line" d={tracePath} />
          <path className="milestone-journey__spark" d={tracePath} />
            </svg>

            <ol className="milestone-journey__timeline">
              {milestones.map((item, index) => (
            <li
              id={`milestone-node-${index + 1}`}
              key={item.title}
              data-side={item.side}
              className="milestone-journey__item"
              style={{
                '--node-x': item.x,
                '--node-y': item.y,
                '--node-delay': `${index * -0.7}s`,
              } as CSSProperties}
            >
              <span aria-hidden className="milestone-journey__watermark">{item.watermark}</span>
              <span aria-hidden className="milestone-journey__node">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </span>

              <article tabIndex={0} className="milestone-journey__card">
                <div
                  className={`milestone-journey__image${
                    index === 0
                      ? ' milestone-journey__image--portrait'
                      : index === 1
                        ? ' milestone-journey__image--document'
                        : index === 2
                          ? ' milestone-journey__image--site'
                          : index === 3
                            ? ' milestone-journey__image--logo'
                        : ''
                  }`}
                >
                  {index === 3 ? (
                    <div className="milestone-journey__logo-process" aria-label="映雪 Logo 设计过程与最终图标">
                      <span className="milestone-journey__logo-step milestone-journey__logo-step--dark">
                        <Image src="/milestones/03-yingxue-logo.webp" alt="映雪深色字标设计" fill sizes="88px" />
                        <small>01</small>
                      </span>
                      <span className="milestone-journey__logo-step milestone-journey__logo-step--light">
                        <Image src="/milestones/03-yingxue-logo-light.webp" alt="映雪浅色字标设计" fill sizes="88px" />
                        <small>02</small>
                      </span>
                      <span className="milestone-journey__logo-step milestone-journey__logo-step--final">
                        <Image src="/milestones/03-yingxue-mark.webp" alt="映雪网站成品图标" fill sizes="88px" />
                        <small>FINAL</small>
                      </span>
                    </div>
                  ) : (
                    <>
                  {index === 0 && (
                    <Image
                      aria-hidden
                      className="milestone-journey__image-backdrop"
                      src={item.image}
                      alt=""
                      fill
                      sizes="(min-width: 1200px) 270px, (min-width: 640px) 44vw, 88vw"
                    />
                  )}
                  <Image
                    className={
                      index === 0
                        ? 'milestone-journey__image-foreground'
                        : undefined
                    }
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1200px) 270px, (min-width: 640px) 44vw, 88vw"
                  />
                  <span aria-hidden className="milestone-journey__image-shade" />
                    </>
                  )}
                </div>

                <div className="milestone-journey__content">
                  <time className="milestone-journey__date">{item.date}</time>
                  <h3 className="site-title-sheen">{item.title}</h3>
                  {item.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </article>
            </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="milestone-journey__scroll-hint" aria-hidden>
          横向滑动 · 查看时间刻度
        </p>

        <nav className="milestone-journey__rail" aria-label="时间节点导航">
          <span aria-hidden className="milestone-journey__rail-line" />
          {milestones.map((item, index) => (
            <a
              key={item.title}
              href={`#milestone-node-${index + 1}`}
              aria-label={`查看：${item.title}`}
              className="site-flow-frame site-flow-frame--compact rounded-full"
              style={{ '--site-flow-delay': `${index * -0.65}s` } as CSSProperties}
            >
              <span />
            </a>
          ))}
        </nav>
      </div>

      <p data-reveal className="milestone-journey__closing relative z-10 mx-auto max-w-7xl">
        <span>下一程</span>
        路还很远，故事仍在继续。
      </p>
    </section>
  );
}
