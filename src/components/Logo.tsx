'use client';

import { useId } from 'react';
import { cx } from '@/lib/format';

/** Mark paths copied from public/logos/legalgrads_mark.svg. Wordmark uses Plus Jakarta Sans on the page because an SVG <img> cannot use that font. */
export function Logo({ variant = 'color', className = '', compact = false }: { variant?: 'color' | 'white'; className?: string; compact?: boolean }) {
  const id = useId().replace(/:/g, '');
  const ink = variant === 'white' ? '#FFFFFF' : '#0B0B3B';
  const cap = variant === 'white' ? '#FFFFFF' : `url(#${id}-cap)`;
  const tassel = variant === 'white' ? '#FFFFFF' : '#FF6B22';
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg width={compact ? 36 : 46} height={compact ? 36 : 46} viewBox="0 0 96 96" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-cap`} x2="1" y2="1">
            <stop stopColor="#7A00FF" />
            <stop offset="1" stopColor="#A14BFF" />
          </linearGradient>
        </defs>
        <path d="M4 29 48 7 92 29 48 51Z" fill={cap} />
        <path d="M19 42 Q48 25 77 42 L77 51 Q48 36 19 51Z" fill={ink} />
        <path d="M24 55 V81 L37 88 V53 M43 51 V91 L54 96 V51 M60 53 V88 L73 81 V55" fill={ink} />
        <path d="M82 32 V66" stroke={tassel} strokeWidth="4" />
        <circle cx="82" cy="69" r="4" fill={tassel} />
      </svg>
      <span className={cx('font-display font-extrabold leading-none tracking-[-0.05em]', compact ? 'text-[1.35rem]' : 'text-[1.7rem]')}>
        <span style={{ color: ink }}>Legal</span>
        {variant === 'white' ? <span className="text-white">grads</span> : <span className="gradient-text">grads</span>}
      </span>
    </span>
  );
}
