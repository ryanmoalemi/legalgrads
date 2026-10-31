// California State Bar figures used by the calculator and the official-bill receipt.
// Rule 2.15(B) and Rule 2.16(C), Schedule of Charges and Deadlines (2026).
export const ANNUAL = 598;
export const SCALED_ANNUAL = 460.25;
export const WAIVED_ANNUAL = 323;
export const SCALING_INCOME = 60478.35;
export const WAIVER_HOUSEHOLD = 20000;
export const HOURS_PER_DAY = 8;
export const DEFAULT_HOURLY = 18;
export const DEFAULT_BONUS = 0;
export const MORAL_CHARACTER = 900;
export const NAT_BUNDLE = 55;
export const FEE_YEAR_LABEL = 'Estimated using 2026 fees';

export type Relief = 'none' | 'scaling' | 'waiver';
export const annualFor = (relief: Relief) => (relief === 'waiver' ? WAIVED_ANNUAL : relief === 'scaling' ? SCALED_ANNUAL : ANNUAL);
