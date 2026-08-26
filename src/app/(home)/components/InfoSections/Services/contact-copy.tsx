'use client';

import { Check, Copy } from 'lucide-react';
import { SiWechat } from 'react-icons/si';
import { useEffect, useRef, useState } from 'react';

const WECHAT_CONTACT = 'wzb981127';

export function ContactCopy() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  const copyContact = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_CONTACT);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = WECHAT_CONTACT;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setCopied(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={copyContact}
      className="site-flow-frame site-flow-frame--compact services-contact group"
      aria-label={`复制微信联系方式 ${WECHAT_CONTACT}`}
    >
      <span className="services-contact-icon">
        <SiWechat aria-hidden />
      </span>
      <span className="services-contact-copy">
        <span>联系我</span>
        <strong>微信 · {WECHAT_CONTACT}</strong>
      </span>
      <span className="services-contact-action" aria-live="polite">
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        <span>{copied ? '已复制' : '复制微信'}</span>
      </span>
    </button>
  );
}
