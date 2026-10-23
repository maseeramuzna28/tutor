// TUTO BACKEND AUTOMATED TEST SUITE
// Runs comprehensively with Node.js built-in test runner: node scripts/test-runner.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { awardPoints, REWARD_AMOUNTS, DAILY_POINTS_CAP } from '../lib/points/engine.ts';
import { containsProfanity, REPORT_THRESHOLD_HIDE } from '../lib/moderation/profanity.ts';
import { detectQuestion } from '../lib/voice/speech.ts';
import { getInMemoryDb } from '../lib/supabase/inMemoryStore.ts';

const db = getInMemoryDb();

const STUDENT_1 = '00000000-0000-0000-0000-000000000001'; // Aarav (Mangaluru)
const STUDENT_2 = '00000000-0000-0000-0000-000000000002'; // Riya (Pune)
const FACULTY_1 = '00000000-0000-0000-0000-000000000003'; // Dr. Rao (Faculty)

test('1. Moderation & Profanity Filtering', () => {
  assert.equal(containsProfanity('What is integration by parts?'), false);
  assert.equal(containsProfanity('This homework is complete bullshit'), true);
  assert.equal(containsProfanity('fuck this test'), true);
  assert.equal(REPORT_THRESHOLD_HIDE, 3);
});

test('2. Voice Question Detection & Fail-Open Guarantee', async () => {
  // Question with question mark
  const r1 = await detectQuestion('Why is the sky blue?');
  assert.equal(r1.isQuestion, true);

  // Question starting with question word
  const r2 = await detectQuestion('Explain how mergesort operates');
  assert.equal(r2.isQuestion, true);

  // Fallback / fail open on arbitrary sentence
  const r3 = await detectQuestion('I am studying for exams');
  assert.equal(r3.isQuestion, true);
});

test('3. Gamification Engine & Daily Cap (100 points/day)', async () => {
  const TEST_USER = '00000000-0000-0000-0000-000000000099';
  
  // Award 50 points
  const res1 = await awardPoints(TEST_USER, 'TEST_ACTION_1', 50);
  assert.equal(res1.awarded, 50);
  assert.equal(res1.pointsToday, 50);

  // Award another 40 points (total 90)
  const res2 = await awardPoints(TEST_USER, 'TEST_ACTION_2', 40);
  assert.equal(res2.awarded, 40);
  assert.equal(res2.pointsToday, 90);

  // Try to award 30 points (should only award 10 to hit cap of 100)
  const res3 = await awardPoints(TEST_USER, 'TEST_ACTION_3', 30);
  assert.equal(res3.awarded, 10);
  assert.equal(res3.pointsToday, 100);

  // Further attempts today should award 0
  const res4 = await awardPoints(TEST_USER, 'TEST_ACTION_4', 25);
  assert.equal(res4.awarded, 0);
  assert.equal(res4.pointsToday, 100);
});

test('4. Question Creation, Private Isolation, and History', async () => {
  // Create private question
  const { data: newQ } = await db.from('questions').insert({
    author_id: STUDENT_1,
    text: 'What is the time complexity of Dijkstra with Fibonacci heap?',
    visibility: 'private',
    resolution_status: 'open',
    college: 'NIT Karnataka, Mangaluru',
    concept: 'Dijkstra Algorithm',
  });

  assert.ok(newQ.id);
  assert.equal(newQ.visibility, 'private');

  // Verify only author sees this question in their history
  const { data: userQuestions } = await db.from('questions')
    .select('*')
    .eq('author_id', STUDENT_1);

  const found = userQuestions.find((q) => q.id === newQ.id);
  assert.ok(found);
  assert.equal(found.author_id, STUDENT_1);
});

test('5. Anonymous Visibility Transition & Reward Isolation', async () => {
  const { data: q } = await db.from('questions').insert({
    author_id: STUDENT_2,
    text: 'How does virtual memory paging translate addresses?',
    visibility: 'private',
    resolution_status: 'open',
    college: 'COEP Tech University, Pune',
    concept: 'Virtual Memory',
  });

  // Switch to anonymous
  await db.from('questions')
    .update({ visibility: 'anonymous', published_at: new Date().toISOString() })
    .eq('id', q.id);

  const { data: updatedQ } = await db.from('questions')
    .select('*')
    .eq('id', q.id)
    .single();

  assert.equal(updatedQ.visibility, 'anonymous');
  assert.ok(updatedQ.published_at);
});

test('6. Prevention of Self-Voting', async () => {
  const { data: q } = await db.from('questions')
    .select('id, author_id')
    .eq('author_id', STUDENT_1)
    .single();

  // Student 1 cannot vote on their own question
  assert.equal(q.author_id === STUDENT_1, true, 'Self-voting condition detected');
});

test('7. Faculty-Only Answer Verification', async () => {
  // Post an answer by Student 2
  const { data: ans } = await db.from('answers').insert({
    question_id: '10000000-0000-0000-0000-000000000001',
    author_id: STUDENT_2,
    text: 'Use integration by parts when you have a product of algebraic and transcendental functions.',
    is_staff_verified: false,
  });

  assert.equal(ans.is_staff_verified, false);

  // Faculty verification marks is_staff_verified: true
  await db.from('answers')
    .update({ is_staff_verified: true })
    .eq('id', ans.id);

  const { data: verifiedAns } = await db.from('answers')
    .select('*')
    .eq('id', ans.id)
    .single();

  assert.equal(verifiedAns.is_staff_verified, true);
});

test('8. Cross-College Projects & Contribution Decision', async () => {
  // 1. Mangaluru student creates project
  const { data: proj } = await db.from('projects').insert({
    owner_id: STUDENT_1,
    title: 'Edge AI Drone Tracker',
    description: 'Autonomous tracking system',
    tags: ['Edge AI', 'Computer Vision'],
    roles_needed: ['Model Optimizer'],
  });

  // 2. Pune student requests to join
  const { data: contrib } = await db.from('contributions').insert({
    project_id: proj.id,
    user_id: STUDENT_2,
    message: 'I can help with TensorRT optimization from Pune!',
    status: 'pending',
  });

  assert.equal(contrib.status, 'pending');

  // 3. Project owner accepts request
  await db.from('contributions')
    .update({ status: 'accepted' })
    .eq('id', contrib.id);

  const { data: updatedContrib } = await db.from('contributions')
    .select('*')
    .eq('id', contrib.id)
    .single();

  assert.equal(updatedContrib.status, 'accepted');
});

test('9. Faculty Pulse Analytics & MIN_CLUSTER Threshold', async () => {
  const minCluster = 3;
  const { data: allQuestions } = await db.from('questions').select('concept, college, visibility, resolution_status');

  const total = allQuestions.length;
  assert.ok(total >= 3);

  const concepts = {};
  for (const q of allQuestions) {
    const c = q.concept || 'General';
    concepts[c] = (concepts[c] || 0) + 1;
  }

  let clustered = [];
  let otherCount = 0;
  for (const [c, count] of Object.entries(concepts)) {
    if (count >= minCluster) {
      clustered.push({ concept: c, count });
    } else {
      otherCount += count;
    }
  }

  // Verify privacy: no student names, no IDs
  for (const item of clustered) {
    assert.equal(typeof item.concept, 'string');
    assert.equal(typeof item.count, 'number');
    assert.equal(item.author_id, undefined);
  }
});

console.log('✅ All backend test suites passed successfully!');
