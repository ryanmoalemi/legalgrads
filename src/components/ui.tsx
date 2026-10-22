import Link from 'next/link';
import { cx } from '@/lib/format';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-navy">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass = 'w-full rounded-2xl border border-navy/10 bg-white px-3 py-3 text-navy placeholder:text-ink/40';

export function Alert({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="mt-3 rounded-2xl bg-[#F8E8EE] px-3 py-2 text-sm font-medium text-[#6E123F]">{children}</p>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p role="status" className="mt-3 rounded-2xl bg-mint/10 px-3 py-2 text-sm text-navy">{children}</p>;
}

export function Empty({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-navy/15 bg-white p-8 text-center">
      <svg width="72" height="72" viewBox="0 0 72 72" className="mx-auto" aria-hidden="true">
        <rect x="8" y="14" width="56" height="44" rx="14" fill="#FFF8F1" stroke="#0B0B3B" strokeWidth="2" />
        <path d="M22 32h28M22 42h18" stroke="#7A00FF" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h2 className="mt-3 font-display text-xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink">{body}</p>
      {href && action ? <Link href={href} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">{action}</Link> : null}
    </div>
  );
}

export function Skeleton({ className = 'h-40' }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-3xl bg-white/70', className)} aria-hidden="true" />;
}

export function PageIntro({ kicker, title, body }: { kicker?: string; title: string; body?: string }) {
  return (
    <header className="max-w-3xl">
      {kicker ? <p className="font-display text-sm font-bold text-purple">{kicker}</p> : null}
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">{title}</h1>
      {body ? <p className="mt-3 text-lg text-ink">{body}</p> : null}
    </header>
  );
}

export function PrimaryButton({ children, type = 'button', onClick, disabled }: { children: React.ReactNode; type?: 'button' | 'submit'; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-flex min-h-11 items-center justify-center rounded-full bg-pink px-5 py-3 font-display text-sm font-semibold text-white disabled:opacity-50">
      {children}
    </button>
  );
}

export function GhostButton({ children, type = 'button', onClick }: { children: React.ReactNode; type?: 'button' | 'submit'; onClick?: () => void }) {
  return (
    <button type={type} onClick={onClick} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 font-display text-sm font-semibold text-navy ring-1 ring-navy/10">
      {children}
    </button>
  );
}
