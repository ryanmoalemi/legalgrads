import { containsDisallowedLink } from './links.ts';

/** Cheap checks and the Gemini classify call. Message text is not logged here. */

export type ScreenLabel = 'genuine' | 'uncertain' | 'spam' | 'not_screened';

const SPAM_PHRASES = [
  'guest post',
  'guest posting',
  'backlink',
  'link building',
  'seo service',
  'seo package',
  'rank your website',
  'rank on google',
  'increase your traffic',
  'digital marketing agency',
  'buy followers',
  'dofollow',
  'domain authority',
  'link insertion',
  'sponsored article',
  'sponsored post',
  'white label',
  'white-label',
  'lead generation service',
  'lead generation for attorneys',
  'more clients guaranteed',
  'cheap traffic',
  'web design package',
  'social media management service',
  'we build websites',
  'crypto airdrop',
  'seed phrase',
];

export function precheckSpam(name: string, body: string, phone = ''): 'links' | 'keywords' | null {
  const text = `${name}\n${phone}\n${body}`;
  if (containsDisallowedLink(text)) return 'links';
  const hay = text.toLowerCase();
  for (const phrase of SPAM_PHRASES) {
    if (hay.includes(phrase)) return 'keywords';
  }
  return null;
}

export function parseScreenLabel(text: string): ScreenLabel {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(trimmed) as { label?: unknown };
    const label = String(parsed.label ?? '').toLowerCase();
    if (label === 'spam' || label === 'genuine' || label === 'uncertain') return label;
  } catch {
    return 'not_screened';
  }
  return 'not_screened';
}

export function relaySubject(label: ScreenLabel): string {
  if (label === 'uncertain') return '[Uncertain] New message on Legalgrads';
  if (label === 'not_screened') return '[Not screened] New message on Legalgrads';
  return 'New message on Legalgrads';
}

const MODEL = 'gemini-2.5-flash-lite';
export const CLASSIFIER_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function requestBody(name: string, body: string, thinking: boolean): string {
  const prompt = [
    'Classify one message sent to a lawyer.',
    'Reply with JSON only: {"label":"genuine"} or {"label":"uncertain"} or {"label":"spam"}.',
    'spam means solicitation, an SEO pitch, vendor sales, a scam, or abusive content that is not asking for legal help.',
    'genuine means a person asking about a legal matter.',
    'uncertain means you cannot tell.',
    'Do not quote or repeat the message.',
    '',
    `Name: ${name.slice(0, 120)}`,
    'Message:',
    body.slice(0, 2000),
  ].join('\n');
  const generationConfig: Record<string, unknown> = {
    temperature: 0,
    maxOutputTokens: 40,
    responseMimeType: 'application/json',
  };
  if (thinking) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  return JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  });
}

async function postClassifier(
  apiKey: string,
  payload: string,
  fetchImpl: typeof fetch,
): Promise<Response> {
  return fetchImpl(CLASSIFIER_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: payload,
    signal: AbortSignal.timeout(8000),
  });
}

/** Sends the name and message to Gemini only. Any error returns not_screened. */
export async function classifyInquiry(
  input: { name: string; body: string },
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ScreenLabel> {
  if (!apiKey.trim()) return 'not_screened';
  try {
    let response = await postClassifier(apiKey, requestBody(input.name, input.body, true), fetchImpl);
    if (response.status === 400) {
      response = await postClassifier(apiKey, requestBody(input.name, input.body, false), fetchImpl);
    }
    if (!response.ok) return 'not_screened';
    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? '').join('');
    return parseScreenLabel(text);
  } catch {
    return 'not_screened';
  }
}
