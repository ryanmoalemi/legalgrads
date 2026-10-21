/** Calendar year an attorney joined Legalgrads. A date only — not a rating. */
export function joinedYear(when?: string | number | Date | null): number {
  if (typeof when === 'number' && Number.isFinite(when)) {
    const year = Math.trunc(when);
    if (year >= 2000 && year <= 9999) return year;
  }
  const date = when instanceof Date ? when : when ? new Date(when) : new Date();
  const year = date.getFullYear();
  return Number.isFinite(year) ? year : new Date().getFullYear();
}

export function joinedLabel(when?: string | number | Date | null): string {
  return `Joined ${joinedYear(when)}`;
}
