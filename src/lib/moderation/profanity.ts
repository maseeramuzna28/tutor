// Basic Profanity Filter & Content Moderation

const BANNED_WORDS = [
  'abuse', 'bastard', 'bitch', 'bullshit', 'crap', 'cunt', 'damn', 'dick',
  'douche', 'fag', 'fuck', 'motherfucker', 'nigger', 'piss', 'pussy', 'shit',
  'slut', 'whore', 'asshole'
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      return true;
    }
  }
  return false;
}

export const REPORT_THRESHOLD_HIDE = 3;
