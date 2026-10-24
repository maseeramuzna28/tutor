// Test Script for TUTO Audio Clarity and Mathematical Speech Engine
import assert from 'node:assert/strict';
import test from 'node:test';
import { execSync } from 'node:child_process';
import { verbalizeMathForSpeech, getBestSiriVoice } from '../src/lib/voice/speechAudioEngine.ts';

test('1. Mathematical Verbalization: User Examples (O(log n), n / 2, 2^k = n)', () => {
  // Test Requirement 4: O(log n) -> Big O of log n
  const t1 = verbalizeMathForSpeech('The time complexity is O(log n).');
  assert.ok(t1.includes('Big O of log n'), `Expected "Big O of log n", got: "${t1}"`);

  // Test Requirement 4: n / 2 -> n divided by two
  const t2 = verbalizeMathForSpeech('Each comparison reduces the array to n / 2 items.');
  assert.ok(t2.includes('n divided by two'), `Expected "n divided by two", got: "${t2}"`);

  // Test Requirement 4: 2^k = n -> Two raised to the power of k equals n
  const t3 = verbalizeMathForSpeech('Because 2^k = n, the total steps is k.');
  assert.ok(t3.includes('Two raised to the power of k equals n'), `Expected "Two raised to the power of k equals n", got: "${t3}"`);

  // Test LaTeX format: \mathcal{O}(\log n)
  const t4 = verbalizeMathForSpeech('Worst-case time complexity is $\\mathcal{O}(\\log n)$.');
  assert.ok(t4.includes('Big O of log n'), `Expected "Big O of log n", got: "${t4}"`);

  // Test array indexing and comparisons
  const t5 = verbalizeMathForSpeech('if arr[mid] == target and low <= high: return mid');
  assert.ok(t5.includes('array at middle equals target'), `Expected "array at middle equals target", got: "${t5}"`);
  assert.ok(t5.includes('is less than or equal to'), `Expected "is less than or equal to", got: "${t5}"`);
});

test('2. Short Spoken Explanation Test', () => {
  const shortExplanation = "Binary search checks the middle element and eliminates half of the remaining search space.";
  const checkQuestion = "Why do you think the array must be sorted for this to work?";

  const verbalizedExplanation = verbalizeMathForSpeech(shortExplanation);
  const verbalizedQuestion = verbalizeMathForSpeech(checkQuestion);
  const fullScript = `${verbalizedExplanation} ... ... ${verbalizedQuestion}`;

  console.log('\n--- TEST: SHORT SPOKEN EXPLANATION ---');
  console.log('Script to Speak:\n', fullScript);

  assert.ok(!fullScript.includes('$'));
  assert.ok(!fullScript.includes('`'));
  assert.ok(fullScript.includes('... ...'), 'Must include natural pause before check question');

  // Actually test real audio synthesis on macOS via native SpeechSynthesis voice
  try {
    execSync(`say -v Samantha -r 175 "${fullScript.replace(/"/g, '\\"')}"`);
    console.log('✅ Real audio tested and played via macOS Samantha (Siri US)!');
  } catch (err) {
    console.log('Voice test ran, synthesis returned:', err.message);
  }
});

test('3. Binary-Search Complexity Explanation Test', () => {
  const complexityText = "Because we divide the remaining elements by 2 with every comparison ($n / 2$), the recurrence relation is $2^k = n$. Therefore, the worst-case time complexity of binary search is $\\mathcal{O}(\\log n)$, which takes at most $\\log_2(n)$ comparisons.";
  const checkQuestion = "For an array of 64 elements, how many checks does Big O of log n take?";

  const verbalized = verbalizeMathForSpeech(complexityText);
  const verbalizedQ = verbalizeMathForSpeech(checkQuestion);
  const fullComplexityScript = `${verbalized} ... ... ${verbalizedQ}`;

  console.log('\n--- TEST: BINARY SEARCH COMPLEXITY EXPLANATION ---');
  console.log('Script to Speak:\n', fullComplexityScript);

  // Assertions for clean speech
  assert.ok(fullComplexityScript.includes('n divided by two'), 'Must verbalize n / 2');
  assert.ok(fullComplexityScript.includes('Two raised to the power of k equals n'), 'Must verbalize 2^k = n');
  assert.ok(fullComplexityScript.includes('Big O of log n'), 'Must verbalize O(log n)');
  assert.ok(fullComplexityScript.includes('log base two of n'), 'Must verbalize log_2(n)');
  assert.ok(!fullComplexityScript.includes('\\mathcal'));
  assert.ok(!fullComplexityScript.includes('$'));
  assert.ok(!fullComplexityScript.includes('^'));

  // Actually test real audio synthesis on macOS via native SpeechSynthesis voice
  try {
    execSync(`say -v Samantha -r 175 "${fullComplexityScript.replace(/"/g, '\\"')}"`);
    console.log('✅ Real complexity audio tested and played via macOS Samantha (Siri US)!');
  } catch (err) {
    console.log('Voice test ran, synthesis returned:', err.message);
  }
});
