/** Client messages cannot contain URLs. Bots use normal links and a few disguises. */

export const LINK_ERROR = 'Please remove links; describe your situation in words';

const TLDS = [
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'info', 'biz',
  'io', 'co', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'nl', 'ru', 'br', 'mx', 'jp', 'nz', 'eu',
  'me', 'ly', 'gl', 'cc', 'gd', 'tv', 'gg', 'sh', 'ai', 'app', 'dev', 'xyz', 'site', 'online',
  'link', 'click', 'page', 'legal', 'law', 'bar', 'attorney', 'blog', 'cloud', 'live', 'news',
  'top', 'vip', 'icu', 'gy', 'ws', 'be', 'at', 'to', 'so', 'pro',
];

const TLD = [...new Set(TLDS)].sort((a, b) => b.length - a.length).join('|');
const SAFE_SPACED_TLD = ['com', 'net', 'org', 'info', 'biz', 'xyz', 'io', 'ly', 'cc', 'gov', 'edu', 'app', 'legal', 'law', 'link', 'click', 'online', 'site'].join('|');

const BARE_DOMAIN = new RegExp(
  String.raw`\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:${TLD})\b`,
  'i',
);
const OBFUSCATED_DOT = new RegExp(
  String.raw`\b[a-z0-9][a-z0-9-]{0,62}\s*(?:\[\s*\.\s*\]|\(\s*\.\s*\)|\{\s*\.\s*\}|\[\s*dot\s*\]|\(\s*dot\s*\)|\{\s*dot\s*\})\s*(?:${TLD})\b`,
  'i',
);
const WORD_DOT = new RegExp(String.raw`\bdot\s+(?:${TLD})\b`, 'i');
const SPACED_DOT = new RegExp(
  String.raw`\b[a-z0-9][a-z0-9-]{1,62}\s+\.\s*(?:${SAFE_SPACED_TLD})\b`,
  'i',
);

function normalized(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[。．]/g, '.');
}

/** True when the text contains a URL, a bare domain, a shortener, or a common disguise. */
export function containsDisallowedLink(value: string): boolean {
  if (!value.trim()) return false;
  const text = normalized(value);
  if (/h\s*t\s*t\s*p\s*s?\s*\[?\s*:\s*\]?\s*\/\s*\//i.test(text)) return true;
  if (/h\s*x\s*x\s*p\s*s?\s*\[?\s*:\s*\]?\s*\/\s*\//i.test(text)) return true;
  if (/\bwww\s*\./i.test(text)) return true;
  if (/(^|[\s([\]])\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) return true;
  if (/<\s*a\b|<\s*\/\s*a\s*>|\bhref\s*=/i.test(text)) return true;
  if (/\[[^\]]{0,200}\]\(\s*[^)\s]{0,300}(\.|\/|http|hxxp|www)/i.test(text)) return true;
  if (OBFUSCATED_DOT.test(text) || WORD_DOT.test(text) || SPACED_DOT.test(text)) return true;
  if (BARE_DOMAIN.test(text)) return true;
  return false;
}

/** Breaks leftover URL spelling in a label so a mail client does not turn it into a link. */
export function withoutAutoLinks(value: string): string {
  const text = normalized(value)
    .replace(/h\s*t\s*t\s*p\s*s?\s*\[?\s*:\s*\]?\s*\/\s*\/\s*/gi, '')
    .replace(/h\s*x\s*x\s*p\s*s?\s*\[?\s*:\s*\]?\s*\/\s*\/\s*/gi, '')
    .replace(/\bwww\s*\.\s*/gi, '')
    .replace(BARE_DOMAIN, (match) => match.replace(/\./g, ' '))
    .replace(OBFUSCATED_DOT, (match) => match.replace(/\[|\]|\(|\)|\{|\}|\./g, ' '));
  return text.replace(/\s{2,}/g, ' ').trim();
}

export function buildRelayText(input: {
  attorney: string;
  sender: string;
  phone: string;
  body: string;
  canReply: boolean;
}): string {
  return [
    `Someone sent a message about the Legalgrads listing for ${withoutAutoLinks(input.attorney) || 'an attorney'}.`,
    '',
    `Name: ${input.sender}`,
    input.phone ? `Phone: ${input.phone}` : '',
    '',
    input.body,
    '',
    'Legalgrads relayed this message. Your email address is not shown to the sender, and their email address is not in this message.',
    input.canReply ? 'Reply to this email to respond through Legalgrads.' : 'Email delivery is one-way until reply routing is turned on.',
  ].filter(Boolean).join('\n');
}
