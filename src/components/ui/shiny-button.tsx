'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface ShinyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** 传 true 并给单个元素子节点（如 <a>），可渲染为链接/任意元素 */
  asChild?: boolean;
}

/**
 * Shiny 按钮：旋转 conic 渐变边框 + 圆点纹理 + 内部闪亮 + 呼吸内发光。
 * 样式类 .shiny-cta 定义在 globals.scss（全局类，便于 asChild 克隆元素复用）。
 */
export function ShinyButton({ children, onClick, className = '', asChild }: ShinyButtonProps) {
  if (asChild) {
    const childNodes = React.Children.toArray(children);
    const child = childNodes.length === 1 && React.isValidElement(childNodes[0])
      ? childNodes[0] as React.ReactElement<{
          className?: string;
          children?: React.ReactNode;
        }>
      : null;

    if (!child) {
      throw new Error('ShinyButton 的 asChild 模式需要且只能接收一个元素子节点。');
    }

    return React.cloneElement(child, {
      className: cn('shiny-cta', className),
      ...(onClick ? { onClick } : {}),
      children: (
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap leading-none">
          {child.props.children}
        </span>
      ),
    });
  }

  return (
    <button className={cn('shiny-cta', className)} onClick={onClick}>
      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap leading-none">
        {children}
      </span>
    </button>
  );
}
