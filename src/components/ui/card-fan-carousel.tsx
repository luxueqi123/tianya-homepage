"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Mouse, MoveHorizontal } from "lucide-react";

export interface CardItem {
  imgUrl: string;
  alt?: string;
  linkUrl?: string;
}

interface SocialCardsProps {
  cards: CardItem[];
  emptyLabel?: string;
}

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7,  scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0,   scale: 1.0,    x: 0,   y: 0.0, zIndex: 10 },
  { rot: 7,   scale: 0.9346, x: 11,  y: 1.3, zIndex: 3 },
  { rot: 14,  scale: 0.8498, x: 22,  y: 4.0, zIndex: 2 },
  { rot: 21,  scale: 0.7756, x: 30,  y: 7.3, zIndex: 1 },
];

function getResponsiveMultiplier(width: number) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1.0;
}

/**
 * Returns a multiplier (0..1] that scales y-offsets and entry animation
 * distances when the viewport is too short for the ideal layout height.
 */
function getHeightMultiplier(width: number) {
  // Ideal layout heights (in px at 16px root) matching the CSS breakpoints
  let idealPx: number;
  if (width < 480) idealPx = 22 * 16;       // 352px
  else if (width < 640) idealPx = 26 * 16;  // 416px
  else if (width < 768) idealPx = 28 * 16;  // 448px
  else if (width < 1024) idealPx = 34 * 16; // 544px
  else idealPx = 38 * 16;                    // 608px

  const available = window.innerHeight * 0.7; // 70vh budget
  if (available >= idealPx) return 1;
  return available / idealPx;
}

function getSlotConfig(totalCards: number, slot: number) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = (totalCards - 1) / 2;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

const ARROW_CLASSES =
  "site-flow-frame site-flow-frame--compact relative flex items-center justify-center rounded-full border-[1.5px] border-white/18 bg-white/[0.07] backdrop-blur-[16px] text-white/82 cursor-pointer shrink-0 z-30 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-white/35 hover:bg-white/12 hover:text-white active:opacity-70 transition-colors duration-300 [--site-flow-rgb:142,197,255]";

export default function SocialCards({ cards, emptyLabel }: SocialCardsProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevVisible = useRef<Set<number>>(new Set());

  const totalCards = cards.length;
  const visibleCount = Math.min(totalCards, MAX_VISIBLE);
  const canCycle = totalCards > 1;
  const [centerIndex, setCenterIndex] = useState(Math.min(HALF, totalCards >> 1));
  const [wheelActive, setWheelActive] = useState(false);

  const getVisibleMap = useCallback((center: number) => {
    const map = new Map<number, number>();
    const centerSlot = visibleCount >> 1;
    for (let slot = 0; slot < visibleCount; slot++) {
      map.set(((center + slot - centerSlot) % totalCards + totalCards) % totalCards, slot);
    }
    return map;
  }, [totalCards, visibleCount]);

  const cycle = useCallback((direction: "left" | "right") => {
    if (isAnimating.current || !canCycle) return;
    isAnimating.current = true;
    directionRef.current = direction;
    setCenterIndex(prev =>
      direction === "right" ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
    );
  }, [totalCards, canCycle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !canCycle) return;

    const handleWheel = (event: WheelEvent) => {
      if (!wheelActive) return;

      // 显式激活后，滚轮才交给照片墙。
      event.preventDefault();

      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

      if (Math.abs(delta) < 6 || isAnimating.current) return;

      cycle(delta > 0 ? "right" : "left");
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [canCycle, cycle, wheelActive]);

  useEffect(() => {
    if (!wheelActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWheelActive(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wheelActive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;

    const cardElements = Array.from(container.querySelectorAll<HTMLElement>(".fan-card"));
    if (!cardElements.length) return;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = visibleCount;
    const config = (slot: number) => getSlotConfig(slotCount, slot);
    const shouldReduceMotion = Boolean(reduceMotion);

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const animatedCardCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= animatedCardCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (shouldReduceMotion) {
        gsap.killTweensOf(card);
        if (slot !== undefined) {
          const { x, y, rot, scale, zIndex } = config(slot);
          gsap.set(card, {
            x: `${x * multiplier}rem`,
            y: `${y * hMult}rem`,
            rotation: rot,
            scale,
            opacity: 1,
            zIndex,
          });
        } else {
          gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, rotation: 0, zIndex: 0 });
        }
        return;
      }

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 1.2, ease: "elastic.out(1.05,.78)", delay: 0.2 + slot * 0.06, onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === "right" ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.6, ease: "power2.out", onComplete: onCardDone });
        } else {
          gsap.to(card, { ...target, duration: 0.5, ease: "power2.out", onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === "right" ? -30 : 30, duration: 0.4, ease: "power2.in", zIndex: 0 });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    if (shouldReduceMotion) {
      isAnimating.current = false;
      hasEntered.current = true;
    }

    prevVisible.current = new Set(visibleMap.keys());

    // Hover interactions
    const visibleEntries: { el: HTMLElement; slot: number }[] = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: NodeJS.Timeout | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM;
            targetScale *= 1.08;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        const hoverTarget = {
          x: `${targetX}rem`, y: `${targetY}rem`, rotation: targetRot, scale: targetScale,
        };
        if (shouldReduceMotion) {
          gsap.killTweensOf(el);
          gsap.set(el, hoverTarget);
        } else {
          gsap.to(el, {
            ...hoverTarget,
            duration: 0.5, delay, ease: "elastic.out(1,.75)", overwrite: "auto",
          });
        }
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        if (activeSlot !== slot) { activeSlot = slot; updateHoverLayout(slot); }
      };
      el.addEventListener("mouseenter", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { activeSlot = null; updateHoverLayout(null); }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => { if (!isAnimating.current) updateHoverLayout(activeSlot); };
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, visibleCount, reduceMotion]);

  if (!totalCards) return null;

  return (
    <section className="flex flex-col items-center w-full py-4 lg:py-8 px-4 md:px-8 relative z-20">
      <div className="flex items-center justify-center w-full max-w-[90rem]">
        <div
          ref={containerRef}
          className={`fan-layout relative w-full max-w-[90rem] ${wheelActive ? "fan-wheel-active cursor-ew-resize" : ""}`}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("a, button")) return;
            setWheelActive(true);
          }}
          onMouseLeave={() => setWheelActive(false)}
        >
          {cards.map((card, index) => {
            const image = (
              <div className="relative w-full h-full overflow-hidden">
                <img src={card.imgUrl} loading="lazy" decoding="async" alt={card.alt || `Card ${index}`} className="absolute inset-0 w-full h-full object-cover z-10" />
                <span aria-hidden className="fan-card-grade" />
              </div>
            );
            return card.linkUrl ? (
              <a key={index} href={card.linkUrl} target={card.linkUrl.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" className="fan-card site-flow-frame block cursor-pointer">{image}</a>
            ) : (
              <div key={index} className="fan-card site-flow-frame">{image}</div>
            );
          })}

          {emptyLabel ? (
            <p className="site-flow-frame pointer-events-none absolute bottom-14 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/16 bg-black/48 px-3.5 py-1.5 text-center text-sm font-semibold tracking-[0.32em] text-white/82 [--site-flow-delay:-1.4s] md:bottom-16 md:text-base">
              {emptyLabel}
            </p>
          ) : null}

          {canCycle && (
            <button
              type="button"
              aria-pressed={wheelActive}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setWheelActive((active) => !active)}
              className={`site-flow-frame absolute bottom-2 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] backdrop-blur-md transition-colors [--site-flow-delay:-2.2s] md:flex ${
                wheelActive
                  ? "border-[#9fe8d0]/35 bg-[#9fe8d0]/12 text-[#b7ffe8]"
                  : "border-white/18 bg-black/45 text-white/76 hover:border-white/30 hover:text-white"
              }`}
            >
              <Mouse className="h-3.5 w-3.5" strokeWidth={1.8} />
              {wheelActive ? "滚轮切换 · 移出或 Esc 退出" : "点击开启滚轮切换"}
            </button>
          )}
        </div>
      </div>

      {canCycle && (
        <div className="mt-4 flex flex-col items-center gap-3 md:mt-6">
          <div className="site-flow-frame flex items-center gap-2 rounded-full border border-white/16 bg-black/42 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/82 [--site-flow-delay:-1.8s] md:hidden">
            <MoveHorizontal className="h-4 w-4 text-[#9fe8d0]/70" aria-hidden />
            使用左右按钮切换照片
          </div>
          <div className="flex items-center justify-center gap-4 z-30">
          <button className={`${ARROW_CLASSES} w-10 h-10 [--site-flow-delay:-2.6s] md:w-12 md:h-12`} onClick={() => cycle("left")} aria-label="上一张照片">
            <ChevronLeft className="relative z-[2] h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`site-flow-frame site-flow-frame--compact h-2 w-2 rounded-full transition-all duration-300 ${i === centerIndex ? "scale-[1.3] bg-white/90" : "bg-white/25"}`}
                style={{ '--site-flow-delay': `${i * -0.55}s` } as CSSProperties}
              />
            ))}
          </div>
          <button className={`${ARROW_CLASSES} w-10 h-10 [--site-flow-delay:-4.1s] md:w-12 md:h-12`} onClick={() => cycle("right")} aria-label="下一张照片">
            <ChevronRight className="relative z-[2] h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
          </button>
          </div>
        </div>
      )}
    </section>
  );
}
