'use client';

import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function Motion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      if (reduceMotion) {
        gsap.set('[data-hero-word], [data-reveal], [data-section-title], [data-orbit-tag], [data-orbit-avatar]', {
          autoAlpha: 1,
          y: 0,
          x: 0,
          scaleY: 1,
          clearProps: 'clipPath,filter',
        });
        return;
      }

      gsap.set('[data-hero-word]', { yPercent: isMobile ? 42 : 120, scaleY: isMobile ? 0.92 : 0.55, rotateX: isMobile ? 0 : 18, transformOrigin: '50% 100%', autoAlpha: 0 });
      gsap.set('[data-hero-meta], [data-hero-visual]', { y: isMobile ? 22 : 44, autoAlpha: 0, filter: isMobile ? 'none' : 'blur(16px)' });
      gsap.set('[data-orbit-avatar]', { scale: isMobile ? 0.94 : 0.86, rotate: isMobile ? 0 : -4, autoAlpha: 0, filter: isMobile ? 'none' : 'blur(10px)' });
      gsap.set('[data-orbit-tag]', { y: isMobile ? 18 : 34, scale: isMobile ? 0.97 : 0.92, autoAlpha: 0, filter: isMobile ? 'none' : 'blur(8px)' });
      // 清掉 HMR / 旧动画残留的裁切样式，避免文字被切一半
      gsap.set('[data-reveal], [data-section-title]', { clearProps: 'clipPath,filter' });

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to('[data-hero-word]', { yPercent: 0, scaleY: 1, rotateX: 0, autoAlpha: 1, duration: isMobile ? 0.68 : 1.1, stagger: isMobile ? 0.07 : 0.12 })
        .to('[data-hero-meta], [data-hero-visual]', { y: 0, autoAlpha: 1, filter: 'none', duration: isMobile ? 0.6 : 0.95, stagger: isMobile ? 0.06 : 0.1 }, isMobile ? '-=0.42' : '-=0.72')
        .to('[data-orbit-avatar]', { scale: 1, rotate: 0, autoAlpha: 1, filter: 'none', duration: isMobile ? 0.62 : 0.95 }, isMobile ? '-=0.42' : '-=0.65')
        .to('[data-orbit-tag]', { y: 0, scale: 1, autoAlpha: 1, filter: 'none', duration: isMobile ? 0.6 : 0.9, stagger: isMobile ? 0.05 : 0.09 }, isMobile ? '-=0.36' : '-=0.55');

      gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
        const title = section.querySelectorAll('[data-section-title]');
        const reveals = section.querySelectorAll('[data-reveal]');
        const images = section.querySelectorAll('[data-parallax]');

        // 不用 clip-path / blur：二者都会裁切中文字形溢出的墨水区域
        if (title.length) {
          gsap.fromTo(
            title,
            { y: 56, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: isMobile ? 0.72 : 1.1,
              ease: 'power3.out',
              stagger: 0.08,
              scrollTrigger: { trigger: section, start: 'top 74%' },
              clearProps: 'clipPath,filter',
            },
          );
        }

        if (reveals.length) {
          gsap.fromTo(
            reveals,
            { y: 40, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: isMobile ? 0.68 : 0.9,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 68%' },
              clearProps: 'clipPath,filter',
            },
          );
        }

        images.forEach((image) => {
          gsap.fromTo(
            image,
            { yPercent: -7, scale: 1.08 },
            {
              yPercent: 7,
              scale: 1.02,
              ease: 'none',
              scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            },
          );
        });
      });

      const serviceCards = gsap.utils.toArray<HTMLElement>('[data-service-card]');
      if (serviceCards.length) {
        ScrollTrigger.batch(serviceCards, {
          start: 'top 88%',
          once: true,
          interval: 0.16,
          batchMax: () => (window.matchMedia('(min-width: 768px)').matches ? 2 : 1),
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              {
                y: isMobile ? 34 : 68,
                scale: isMobile ? 0.985 : 0.955,
                rotateX: isMobile ? 0 : 4,
                autoAlpha: 0,
                transformOrigin: '50% 100%',
              },
              {
                y: 0,
                scale: 1,
                rotateX: 0,
                autoAlpha: 1,
                duration: isMobile ? 0.72 : 1.05,
                stagger: 0.14,
                ease: 'power4.out',
                clearProps: 'transform,opacity,visibility',
              },
            );
          },
        });
      }
    }, rootRef);

    const sections = rootRef.current?.querySelectorAll<HTMLElement>('[data-section]') ?? [];
    const activityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.sectionActive = entry.isIntersecting ? 'true' : 'false';
        });
      },
      { rootMargin: '18% 0px', threshold: 0.01 },
    );
    sections.forEach((section) => activityObserver.observe(section));

    return () => {
      activityObserver.disconnect();
      ctx.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
