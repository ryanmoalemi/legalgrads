export const US_STATES: { code: string; name: string }[] = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
].map(([code, name]) => ({ code, name }));

export function stateName(code: string | null | undefined): string {
  return US_STATES.find((s) => s.code === code)?.name ?? '';
}

/** Official state bar / court attorney lookups, each checked to load (Oct 2026). Others fall back to the ABA directory list. */
export const STATE_BAR_LOOKUP: Record<string, string> = {
  CA: 'https://apps.calbar.ca.gov/attorney/LicenseeSearch/QuickSearch',
  GA: 'https://www.gabar.org/member-directory/',
  IL: 'https://www.iardc.org/Lawyer/Search',
  OR: 'https://www.osbar.org/members/membersearch_start.asp',
  PA: 'https://www.padisciplinaryboard.org/for-the-public/find-attorney',
  TX: 'https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer',
};
