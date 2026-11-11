import type { Src } from '@/lib/nationalPostBar';

export function OfficialSource({ src, className }: { src: Src; className?: string }) {
  if (src.url) {
    return <a className={className ?? 'text-purple underline'} href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>;
  }
  return <span className={className}>{`Source: ${src.label}`}</span>;
}
