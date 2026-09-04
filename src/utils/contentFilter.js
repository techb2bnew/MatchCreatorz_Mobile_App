/**
 * Objectionable-content filter for anything a user types (job posts, proposals,
 * chat messages, reviews, profiles).
 *
 * Required by App Store guideline 1.2 — apps with user-generated content must
 * filter objectionable content. Kept as a plain word list so it works offline
 * and can't be bypassed by a slow network; the backend/admin review is still
 * the final authority.
 */

// Slurs and abuse. Matched as whole words so "assessment"/"classic" stay fine.
const BLOCKED_WORDS = [
  'fuck', 'fucker', 'fucking', 'motherfucker', 'shit', 'bullshit', 'bitch',
  'bastard', 'asshole', 'dickhead', 'cunt', 'slut', 'whore', 'rape', 'rapist',
  'nigger', 'nigga', 'faggot', 'retard', 'retarded', 'chutiya', 'madarchod',
  'behenchod', 'bhenchod', 'randi', 'gaand', 'lund', 'harami', 'kutta', 'kutiya',
  'kill yourself', 'kys',
];

// Matches a word even when it's disguised: f*ck, f u c k, sh1t, f-u-c-k, fu.ck.
// Letters may be separated by any non-letters, and vowels may be swapped for
// digits or censor characters. Only non-letters may sit between the letters, so
// ordinary words ("shirt", "classic", "assessment") never match.
const VOWELS = 'aeiou';
const SEP = '[^a-z]*';

const buildPattern = word => {
  const body = word
    .split('')
    .filter(ch => ch !== ' ')
    .map(ch => (VOWELS.includes(ch) ? '[aeiou0-9*#@$]' : ch))
    .join(SEP);
  return new RegExp(`(^|[^a-z])${body}([^a-z]|$)`, 'i');
};

const WORD_PATTERNS = BLOCKED_WORDS.map(buildPattern);

/** First blocked word found, or '' when the text is clean. */
export const findObjectionableWord = text => {
  const value = String(text || '').toLowerCase();
  if (!value.trim()) return '';
  const index = WORD_PATTERNS.findIndex(pattern => pattern.test(value));
  return index === -1 ? '' : BLOCKED_WORDS[index];
};

export const containsObjectionableContent = text => Boolean(findObjectionableWord(text));

export const CONTENT_BLOCKED_MESSAGE =
  'This contains language that is not allowed on MatchCreatorz. Please edit it and try again.';
