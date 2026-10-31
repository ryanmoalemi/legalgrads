'use client';
import { useState } from 'react';

export function EmbedBox({ pageUrl, title, src = 'https://legalgrads.com/embed/post-bar-licensing-tracker/', height = 720, label = 'Post-bar licensing costs and first-year CLE by state', heading = 'Embed or cite this 2026-2027 table' }: { pageUrl: string; title: string; src?: string; height?: number; label?: string; heading?: string }) {
  const [copied, setCopied] = useState('');
  const embed = `<iframe src="${src}" title="${label}" width="100%" height="${height}" style="border:0;border-radius:16px" loading="lazy"></iframe>\n<p style="font-size:12px">Source: <a href="${pageUrl}">Legalgrads.com</a></p>`;
  const cite = `${title}. Legalgrads. ${pageUrl}`;
  const copy = async (v: string, k: string) => { try { await navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(''), 2000); } catch { setCopied(''); } };
  return (
    <section className="mt-12 rounded-3xl bg-navy p-6 text-white sm:p-8" data-testid="embed-box">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-white/70">For law school career offices</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold">{heading}</h2>
      <p className="mt-2 max-w-2xl text-white/80">Free to use. No sign-up. The embed updates when official fees change, so your page never goes stale.</p>
      <pre className="mt-5 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-white/10 p-4 text-xs text-white/90">{embed}</pre>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => copy(embed, 'embed')} className="min-h-11 rounded-full bg-pink px-5 font-display text-sm font-bold" data-testid="copy-embed">{copied === 'embed' ? 'Copied' : 'Copy embed code'}</button>
        <button type="button" onClick={() => copy(cite, 'cite')} className="min-h-11 rounded-full bg-white px-5 font-display text-sm font-bold text-navy" data-testid="copy-cite">{copied === 'cite' ? 'Copied' : 'Copy citation link'}</button>
      </div>
      <p className="mt-3 text-xs text-white/60">Citation: {cite}</p>
    </section>
  );
}
