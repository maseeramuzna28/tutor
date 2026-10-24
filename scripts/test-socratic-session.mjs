// Comprehensive Multi-Turn Socratic DSA Tutoring Session Test
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { tutoEngine } from '../src/lib/ai/tutoEngine.ts';

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.warn('Could not load .env.local:', e.message);
}

test('Interactive Socratic DSA Tutoring Session: Binary Search', async () => {
  console.log('\n--- STARTING SOCRATIC DSA MULTI-TURN TEST ---');
  let conversation = [];
  let sessionState = {
    concept: 'Binary Search',
    step_index: 1,
    total_steps: 4,
    is_complete: false,
    mastered_points: [],
  };

  // Turn 1: Student requests Binary Search
  console.log('\n[Turn 1] Student: "Teach me binary search."');
  const turn1 = await tutoEngine.interactiveSocraticChat({
    message: 'Teach me binary search.',
    conversation,
    sessionState,
  });

  console.log('Tutor Feedback:', turn1.feedback);
  console.log('Tutor Explanation:', turn1.explanation);
  console.log('Tutor Question:', turn1.check_question);
  console.log('Tutor Spoken Text:', turn1.spoken_text);
  console.log('Quick Replies:', turn1.quick_replies);

  assert.ok(turn1.feedback, 'Turn 1 must have feedback');
  assert.ok(turn1.explanation, 'Turn 1 must have explanation');
  assert.ok(turn1.check_question, 'Turn 1 must ask a Socratic question');
  assert.ok(turn1.spoken_text, 'Turn 1 must have spoken_text');
  // Check spoken text is punchy and not a huge lecture
  const wordCount1 = turn1.spoken_text.split(/\s+/).length;
  assert.ok(wordCount1 <= 60, `Spoken text should be concise under 60 words, got ${wordCount1}`);
  assert.ok(turn1.quick_replies.length >= 2, 'Must provide quick reply suggestions');

  conversation.push({ role: 'user', content: 'Teach me binary search.' });
  conversation.push({
    role: 'assistant',
    content: `${turn1.feedback} ${turn1.explanation} ${turn1.check_question}`,
  });
  sessionState = turn1.sessionState;

  // Turn 2: Student responds to the tutor's check question
  console.log('\n[Turn 2] Student: "Look in the right half."');
  const turn2 = await tutoEngine.interactiveSocraticChat({
    message: 'Look in the right half.',
    conversation,
    sessionState,
  });

  console.log('Tutor Feedback:', turn2.feedback);
  console.log('Tutor Explanation:', turn2.explanation);
  console.log('Tutor Question:', turn2.check_question);
  console.log('Tutor Spoken Text:', turn2.spoken_text);
  if (turn2.code_snippet) console.log('DSA Code Snippet:\n', turn2.code_snippet);

  // Must acknowledge *why* right half is correct and present next step
  assert.ok(turn2.feedback, 'Must have feedback');
  assert.ok(turn2.explanation, 'Must have explanation');
  assert.ok(turn2.check_question, 'Must have check question');
  const wordCount2 = turn2.spoken_text.split(/\s+/).length;
  assert.ok(wordCount2 <= 65, `Spoken text should be concise under 65 words, got ${wordCount2}`);

  conversation.push({ role: 'user', content: 'Look in the right half.' });
  conversation.push({
    role: 'assistant',
    content: `${turn2.feedback} ${turn2.explanation} ${turn2.check_question}`,
  });
  sessionState = turn2.sessionState;

  // Turn 3: Student gives a wrong answer / misconception: "It works on unsorted lists too."
  console.log('\n[Turn 3] Student (Wrong): "It works on unsorted lists too."');
  const turn3 = await tutoEngine.interactiveSocraticChat({
    message: 'It works on unsorted lists too.',
    conversation,
    sessionState,
  });

  console.log('Tutor Feedback:', turn3.feedback);
  console.log('Tutor Explanation:', turn3.explanation);
  console.log('Tutor Question:', turn3.check_question);
  console.log('Tutor Spoken Text:', turn3.spoken_text);

  // Must diagnose the misconception gently and not just fail
  assert.match(
    turn3.feedback.toLowerCase() + turn3.explanation.toLowerCase() + turn3.spoken_text.toLowerCase(),
    /not quite|misconception|unsorted|cannot|can't|order|sorted|must|linear/i,
    'Must diagnose the unsorted list misconception'
  );

  conversation.push({ role: 'user', content: 'It works on unsorted lists too.' });
  conversation.push({
    role: 'assistant',
    content: `${turn3.feedback} ${turn3.explanation} ${turn3.check_question}`,
  });
  sessionState = turn3.sessionState;

  // Turn 4: Student says "I don't understand."
  console.log('\n[Turn 4] Student (Confused): "I don\'t understand."');
  const turn4 = await tutoEngine.interactiveSocraticChat({
    message: "I don't understand.",
    conversation,
    sessionState,
  });

  console.log('Tutor Feedback:', turn4.feedback);
  console.log('Tutor Explanation:', turn4.explanation);
  console.log('Tutor Question:', turn4.check_question);
  console.log('Tutor Spoken Text:', turn4.spoken_text);

  // Must simplify further and use an analogy or simpler prompt
  assert.ok(turn4.feedback, 'Must have feedback for confusion');
  assert.ok(turn4.explanation, 'Must have explanation for confusion');
  assert.ok(turn4.check_question, 'Must have simplified check question');

  conversation.push({ role: 'user', content: "I don't understand." });
  conversation.push({
    role: 'assistant',
    content: `${turn4.feedback} ${turn4.explanation} ${turn4.check_question}`,
  });
  sessionState = turn4.sessionState;

  // Turn 5: Student answers time complexity
  console.log('\n[Turn 5] Student: "O(log n)"');
  const turn5 = await tutoEngine.interactiveSocraticChat({
    message: 'O(log n)',
    conversation,
    sessionState,
  });

  console.log('Tutor Feedback:', turn5.feedback);
  console.log('Tutor Explanation:', turn5.explanation);
  console.log('Tutor Question:', turn5.check_question);
  console.log('Tutor Spoken Text:', turn5.spoken_text);
  console.log('Session State at Turn 5:', turn5.sessionState);

  assert.ok(turn5.feedback, 'Must have feedback');
  assert.ok(turn5.explanation, 'Must have explanation');
  assert.match(
    turn5.feedback.toLowerCase() + turn5.explanation.toLowerCase() + turn5.spoken_text.toLowerCase(),
    /log|exact|correct|brilliant|spot on|great|well done|master/i,
    'Must acknowledge logarithmic complexity'
  );

  conversation.push({ role: 'user', content: 'O(log n)' });
  conversation.push({
    role: 'assistant',
    content: `${turn5.feedback} ${turn5.explanation} ${turn5.check_question}`,
  });
  sessionState = turn5.sessionState;

  // Turn 6: Student answers boundary termination check
  console.log('\n[Turn 6] Student: "It means the target is not in the array, so return -1."');
  const turn6 = await tutoEngine.interactiveSocraticChat({
    message: 'It means the target is not in the array, so return -1.',
    conversation,
    sessionState,
  });

  console.log('Tutor Feedback:', turn6.feedback);
  console.log('Tutor Explanation:', turn6.explanation);
  console.log('Tutor Question:', turn6.check_question);
  console.log('Tutor Spoken Text:', turn6.spoken_text);
  console.log('Final Session State:', turn6.sessionState);

  assert.ok(turn6.feedback, 'Turn 6 must have feedback');
  assert.ok(turn6.explanation, 'Turn 6 must have summary explanation');

  console.log('\n🎉 ALL 6 TURNS TESTED & VERIFIED WITH LIVE GEMINI AI ENGINE!');
});
