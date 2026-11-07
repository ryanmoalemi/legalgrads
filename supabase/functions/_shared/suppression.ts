import list from "../../../src/data/suppressed-profiles.json" with { type: "json" };

const SUFFIXES = new Set(["esq", "esquire", "jr", "sr", "ii", "iii", "iv", "v", "phd", "llm"]);
const EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
const keys = new Set(list.keys);
const names = new Set(list.names.map((name) => normalize(name)));
const emails = new Set(list.emails.map((email) => email.trim().toLowerCase()));

function normalize(value: string): string {
  const text = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  return text.split(/\s+/).filter((token) => token && !SUFFIXES.has(token) && !/^\d+$/.test(token)).sort().join(" ");
}

export function isSuppressedClaim(input: { name?: string; email?: string; profilePath?: string }): boolean {
  const email = (input.email || "").trim().toLowerCase();
  if (email && emails.has(email)) return true;
  if (input.name && names.has(normalize(input.name))) return true;
  const path = input.profilePath || "";
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 4 && parts[0] === "attorneys" && /^[a-z]{2}$/i.test(parts[1] || "")) {
    const slug = parts[parts.length - 1];
    const bar = slug.split("-").pop() || "";
    if (keys.has(`${parts[1].toLowerCase()}-${bar.toLowerCase()}`)) return true;
    if (names.has(normalize(slug.replace(/-/g, " ")))) return true;
  }
  for (const found of path.match(EMAIL_RE) || []) {
    if (emails.has(found.toLowerCase())) return true;
  }
  return false;
}
