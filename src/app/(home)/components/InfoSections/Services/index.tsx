import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Boxes, Clapperboard, FileText, Globe2 } from 'lucide-react';

import { ContactCopy } from './contact-copy';

import './index.scss';

const serviceGroups = [
  {
    title: '内容制作',
    promise: '让内容被看见',
    scope: ['视频剪辑、商铺宣传、短视频与活动内容等等。'],
    detail: ['给我你拍摄的素材，我来完成内容整理、节奏剪辑、字幕包装与成片交付。'],
    label: 'CONTENT',
    icon: Clapperboard,
    image: '/service-cards/content-production.webp',
  },
  {
    title: '产品开发与维护',
    promise: '让想法真正可用',
    scope: ['商铺会员管理系统，小程序开发，业务系统，软件开发等等。'],
    detail: ['把你的想法和零散的需求梳理成清晰流程，做成能够实际使用、持续完善的线上产品，从此让你的店铺不再受制于大平台。'],
    label: 'PRODUCT',
    icon: Boxes,
    image: '/service-cards/product-system.webp',
  },
  {
    title: '网站搭建',
    promise: '让别人更快认识你',
    scope: ['个人主页、业务网站、商品网站与产品页面等等。'],
    detail: ['从内容结构、视觉呈现到开发上线，让别人看懂你、了解业务并找到你。'],
    label: 'WEB',
    icon: Globe2,
    image: '/service-cards/website.webp',
  },
  {
    title: '文稿撰写',
    promise: '让复杂内容清晰成文',
    scope: ['论文辅导代写、方案撰写、标书制作、汇报材料等等。'],
    detail: ['你提供主题、资料与具体要求，我负责结构梳理、内容整理、文字润色与规范排版，交付清晰、完整的成稿。'],
    label: 'WRITING',
    icon: FileText,
    image: '/service-cards/writing.webp',
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      data-section
      aria-labelledby="services-title"
      className="services-section relative min-h-[100svh] overflow-hidden px-4 py-20 md:px-8 md:py-28 lg:px-20"
    >
      <div aria-hidden className="services-grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="services-field pointer-events-none absolute inset-0" />
      <div aria-hidden className="services-flare pointer-events-none absolute" />
      <p aria-hidden className="services-watermark">
        SERVICE
      </p>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-5xl">
          <p data-reveal className="services-chapter">
            <strong>02</strong>
            <span>与你有关</span>
          </p>

          <h2
            id="services-title"
            data-section-title
            className="site-title-breathe mt-8 whitespace-nowrap text-[clamp(3rem,8vw,6.35rem)] font-black leading-[1.01] tracking-[-0.065em] text-[#f4f0e8]"
          >
            我能<span className="font-normal text-[#9fe8d0]">为你</span>做的
          </h2>

          <p data-reveal className="mt-7 max-w-3xl text-sm leading-7 text-[#d4dbe0] md:text-base md:leading-8">
            你给我<span className="font-semibold text-[#9fc7ff]">素材、目标</span>，或一个迟迟没有解决的问题；我负责把它梳理清楚，推进到
            <span className="font-semibold text-[#9fe8d0]">可以发布、使用和交付</span>。
          </p>
        </div>

        <div className="services-ledger mt-14 grid gap-5 md:mt-20 md:grid-cols-2 md:gap-6">
          {serviceGroups.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                data-service-card
                className="services-row services-flow-frame group relative flex min-h-[310px] flex-col overflow-hidden rounded-[28px] p-6 md:min-h-[340px] md:p-8"
                style={
                  {
                    '--services-flow-delay': `${index * -2.7}s`,
                  } as CSSProperties
                }
              >
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="services-row-image pointer-events-none object-cover"
                />
                <div aria-hidden className="services-row-pattern pointer-events-none absolute inset-0" />
                <div aria-hidden className="services-row-light pointer-events-none absolute inset-0" />

                <div className="services-row-content relative z-10 flex min-h-full flex-1 flex-col">
                  <div className="flex items-start justify-between gap-6">
                    <span className="services-row-icon inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="services-card-index font-mono text-xs font-semibold tracking-[0.22em]">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="mt-9">
                    <span className="services-card-label font-mono text-[10px] font-semibold tracking-[0.24em]">
                      {service.label}
                    </span>
                    <h3 className="site-title-sheen mt-3 text-3xl font-black tracking-[-0.045em] text-[#f7f3ec] md:text-4xl">
                      {service.title}
                    </h3>
                    <p className="services-card-promise mt-3 text-sm font-semibold tracking-[0.02em]">{service.promise}</p>
                  </div>

                  <div className="mt-auto border-t border-white/12 pt-7">
                    <p className="services-card-copy text-sm font-medium leading-7 text-[#edf0f2] md:text-base md:leading-8">
                      {service.scope.join('')}
                    </p>
                    <p className="services-card-copy mt-3 text-sm leading-7 text-[#d0d8dc] md:leading-8">
                      {service.detail.join('')}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div
          data-reveal
          className="services-invitation services-flow-frame relative mt-10 overflow-hidden rounded-[26px] px-6 py-7 md:mt-14 md:px-9 md:py-9"
        >
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="site-title-breathe max-w-4xl text-[clamp(1.35rem,3.8vw,2rem)] font-semibold leading-[1.55] tracking-[-0.025em] text-[#f4f0e8]">
              告诉我<span className="text-[#9fe8d0]">你的想法</span>，
              <span className="block sm:inline">我来解决<span className="text-[#9fc7ff]">你的需求</span>。</span>
            </p>
            <ContactCopy />
          </div>
        </div>
      </div>
    </section>
  );
}
