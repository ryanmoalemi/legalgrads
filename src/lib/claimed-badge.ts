// Copy for the claimed-profile credibility badge.
// public/js/owner-edits.js repeats these rules for static pages. Keep the two in sync.

export type ClaimedBadgeFacts = {
  barValue: string;
  barLabel: string;
  status: string;
  stateName: string;
  authority: string;
};

export type ClaimedBadgeCopy = {
  /** Pieces before the record clause, already joined. Empty when both are missing. */
  head: string;
  /** "matched to ..." clause. Empty only when there is nothing to say, which the fallback avoids. */
  match: string;
  disclosure: string;
};

const tidy = (value: string) => value.replace(/\s+/g, ' ').trim();

export function claimedBadgeCopy(facts: ClaimedBadgeFacts): ClaimedBadgeCopy {
  const barValue = tidy(facts.barValue || '');
  const barLabel = tidy(facts.barLabel || '');
  const status = tidy(facts.status || '');
  const stateName = tidy(facts.stateName || '');
  const authority = tidy(facts.authority || '');

  const number = (barValue.match(/#\s*(\S+)/) || [])[1] || '';
  const isBar = /bar/i.test(barLabel) || /bar\s*#/i.test(barValue);
  const shortId = number ? (isBar ? `Bar #${number}` : `License #${number}`) : '';
  const fullId = number ? (isBar ? barValue : `License #${number}`) : '';

  let shortRecord = '';
  let official = '';
  if (authority === 'State Bar of California') {
    shortRecord = 'State Bar record';
    official = authority;
  } else if (authority && authority !== stateName) {
    shortRecord = `${authority} record`;
    official = authority;
  } else if (stateName) {
    shortRecord = `${stateName} state bar record`;
    official = `${stateName} state bar`;
  } else {
    shortRecord = 'official state bar record';
    official = 'state bar';
  }

  const head = [shortId, status].filter(Boolean).join(' · ');
  const match = `matched to ${shortRecord}`;
  const matched = `matched to the official ${official} record`;
  const detail = fullId && status
    ? `The listing shows ${fullId} with ${status} status, ${matched}.`
    : fullId
      ? `The listing shows ${fullId}, ${matched}.`
      : status
        ? `The listing shows ${status} status, ${matched}.`
        : `The listing is ${matched}.`;

  return {
    head,
    match,
    disclosure: `This attorney claimed and manages this profile on LegalGrads. ${detail}`,
  };
}
