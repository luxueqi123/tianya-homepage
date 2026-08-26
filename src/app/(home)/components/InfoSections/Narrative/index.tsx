import type { CSSProperties } from 'react';
import Image from 'next/image';
import { PanelsTopLeft, Workflow } from 'lucide-react';

import './index.scss';

const projects = [
  {
    name: '数字工具',
    description: '把重复、繁琐的工作，整理成更清晰高效的流程。',
    label: 'DIGITAL TOOL',
    icon: Workflow,
    className: 'narrative-project--tool',
    href: null,
    image: '/service-cards/digital-tool.webp',
  },
  {
    name: '无限画布',
    description: '让信息、灵感与视频创作，在一个自由空间里展开。',
    label: 'INFINITE CANVAS',
    icon: PanelsTopLeft,
    className: 'narrative-project--canvas',
    href: 'https://tianyayingxue.cn/login?next=%2Fcreate',
    image: '/project-cards/infinite-canvas-cosmos.webp',
  },
] as const;

export function CurrentWork() {
  return (
    <section
      id="doing"
      data-section
      aria-labelledby="doing-title"
      className="narrative-section narrative-current relative min-h-[100svh] overflow-hidden px-4 py-20 md:px-8 md:py-20 lg:px-20 lg:py-24"
    >
      <div aria-hidden className="narrative-grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="narrative-current-glow pointer-events-none absolute inset-0" />
      <p aria-hidden className="narrative-watermark narrative-watermark--current">
        MAKING
      </p>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <p data-reveal className="narrative-chapter">
            <strong>01</strong>
            <span>此刻所做</span>
          </p>

          <h2
            id="doing-title"
            data-section-title
            className="site-title-breathe mt-8 max-w-2xl text-balance text-5xl font-black leading-[0.98] tracking-[-0.065em] text-[#f4f0e8] md:text-7xl lg:text-[5.2rem] 2xl:text-[6.2rem]"
          >
            让想法，
            <br />
            <em className="font-normal not-italic text-[#9fe8d0]">成为作品。</em>
          </h2>

          <div data-reveal className="mt-8 max-w-xl space-y-3 text-sm leading-7 text-[#c8d0d5] md:text-base md:leading-8">
            <p>
              我正在推进自己的<span className="font-semibold text-[#9fe8d0]">数字工具</span>与
              <span className="font-semibold text-[#9fc7ff]">无限画布</span>。
            </p>
            <p>
              一个用来处理工作中的<span className="text-[#e8e3db]">繁琐与重复</span>，一个用来承载
              <span className="text-[#c9ddff]">信息、知识与视频创作</span>。
            </p>
          </div>
        </div>

        <div className="narrative-project-grid grid gap-5 md:grid-cols-12 md:gap-6">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <article
                key={project.name}
                data-reveal
                className={`narrative-flow-frame narrative-project ${project.className} group relative overflow-hidden rounded-[30px] p-6 md:p-8 ${
                  index === 0 ? 'md:col-span-7' : 'md:col-span-10 md:col-start-3'
                } ${project.href ? 'cursor-pointer' : ''}`}
                style={{ '--flow-delay': `${index * -3.2}s` } as CSSProperties}
              >
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="narrative-project-image pointer-events-none object-cover"
                />
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="打开无限画布"
                    className="absolute inset-0 z-20 rounded-[30px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9fc7ff]"
                  >
                    <span className="sr-only">打开无限画布</span>
                  </a>
                ) : null}
                <div aria-hidden className="narrative-project-pattern absolute inset-0" />
                <div className="relative z-10 flex min-h-[240px] flex-col md:min-h-[185px] 2xl:min-h-[240px]">
                  <div className="flex items-start justify-between gap-6">
                    <span className="narrative-project-icon inline-flex h-14 w-14 items-center justify-center rounded-full">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="narrative-project-label font-mono text-[10px] font-semibold tracking-[0.24em]">
                      {project.label}{project.href ? ' ↗' : ''}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <span aria-hidden className="narrative-project-line mb-5 block h-px w-14" />
                    <h3 className="site-title-sheen text-3xl font-black tracking-[-0.045em] text-[#f4f0e8] md:text-4xl">
                      {project.name}
                    </h3>
                    {project.href ? (
                      <span className="narrative-project-entry mt-3 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                        进入无限画布 <span aria-hidden>↗</span>
                      </span>
                    ) : null}
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#c4cdd3] md:text-base md:leading-8">
                      {project.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Vision() {
  return (
    <section
      id="vision"
      data-section
      aria-labelledby="vision-title"
      className="narrative-section narrative-vision relative flex min-h-[100svh] items-center overflow-hidden px-4 py-24 md:px-8 md:py-32 lg:px-20"
    >
      <div aria-hidden className="narrative-grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="narrative-vision-orbit pointer-events-none absolute" />
      <div aria-hidden className="narrative-vision-flare pointer-events-none absolute" />
      <p aria-hidden className="narrative-watermark narrative-watermark--vision">
        VALUE
      </p>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <p data-reveal className="narrative-chapter">
          <strong>03</strong>
          <span>此后所想</span>
        </p>

        <h2
          id="vision-title"
          data-section-title
          className="site-title-breathe narrative-vision-title mt-10 max-w-7xl text-[clamp(1.82rem,9.2vw,4.9rem)] font-black leading-[1.06] tracking-[-0.06em] text-[#f4f0e8]"
        >
          <span className="block whitespace-nowrap">
            让“<em className="font-normal not-italic text-[#9fe8d0]">天琊观雪</em>”
          </span>
          <span className="block whitespace-nowrap">不只是一页自我介绍，</span>
          <span className="mt-2 block md:mt-0">
            <span className="block whitespace-nowrap md:inline">而是成为一个</span>
            <span className="block whitespace-nowrap md:inline">
              <span className="font-normal text-[#9fc7ff]">持续产生价值</span>的地方。
            </span>
          </span>
        </h2>

        <div data-reveal className="narrative-vision-foot mt-12 flex items-center justify-between gap-6 border-t border-white/16 pt-6 md:mt-16">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b8c5cc]">
            Tianya Guanxue
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9fe8d0]">
            Value in motion
          </span>
        </div>
      </div>
    </section>
  );
}

export function Direction() {
  return (
    <section
      id="direction"
      data-section
      aria-labelledby="direction-title"
      className="narrative-section narrative-direction relative flex min-h-[92svh] items-center overflow-hidden px-4 py-24 md:px-8 md:py-32"
    >
      <div aria-hidden className="narrative-grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="narrative-compass pointer-events-none absolute left-[82%] top-1/2 md:left-[74%]">
        <span className="narrative-compass-ring narrative-compass-ring--outer" />
        <span className="narrative-compass-ring narrative-compass-ring--inner" />
        <span className="narrative-compass-axis narrative-compass-axis--x" />
        <span className="narrative-compass-axis narrative-compass-axis--y" />
        <span className="narrative-compass-point" />
        <span className="narrative-compass-letter narrative-compass-letter--n">N</span>
        <span className="narrative-compass-letter narrative-compass-letter--e">E</span>
        <span className="narrative-compass-letter narrative-compass-letter--s">S</span>
        <span className="narrative-compass-letter narrative-compass-letter--w">W</span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl text-left">
        <p data-reveal className="narrative-chapter">
          <strong>04</strong>
          <span>心之所往</span>
        </p>
        <h2
          id="direction-title"
          data-section-title
          className="site-title-breathe mt-10 max-w-7xl text-[clamp(2.15rem,10.5vw,7rem)] font-black leading-[1.04] tracking-[-0.06em] text-[#f4f0e8] md:text-[clamp(4.2rem,7vw,7rem)]"
        >
          <span className="block whitespace-nowrap">比抵达更重要的，</span>
          <span className="mt-2 block md:mt-0">
            是<span className="font-normal text-[#9fe8d0]">方向</span>始终
            <span className="block md:inline">
              由<span className="font-normal text-[#9fc7ff]">自己选择</span>。
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
