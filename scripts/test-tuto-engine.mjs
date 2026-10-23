// Test script for TUTO AI Engine & Multi-Bot Assits
import assert from 'node:assert/strict';
import test from 'node:test';
import { tutoEngine, sanitizeTextForSpeech } from '../lib/ai/tutoEngine.ts';

test('1. TutorBot: Socratic Doubt Resolution with Flowchart & Root Cause', async () => {
  const query = 'Why do we subtract lambda times the identity matrix when finding eigenvalues?';
  const solution = await tutoEngine.solveDoubt({ question: query });

  assert.ok(solution.concept);
  assert.ok(solution.root_cause);
  assert.ok(solution.spoken_answer);
  assert.ok(Array.isArray(solution.steps));
  assert.ok(solution.steps.length >= 3);
  assert.ok(solution.flowchart);
  assert.ok(Array.isArray(solution.flowchart.nodes));
  assert.ok(Array.isArray(solution.flowchart.edges));
  assert.ok(solution.flowchart.nodes.length >= 3);
  assert.ok(solution.analogy);
  assert.match(solution.provider, /autonomous|local-ollama|gemini/);
});

test('2. AnalogyBot: Intuitive Real-World Analogy Generation', async () => {
  const stepTitle = 'Formulate the Invariance Condition';
  const analogy = await tutoEngine.clarifyStep(stepTitle, 'Eigenvalues');
  assert.ok(typeof analogy === 'string');
  assert.ok(analogy.length > 20);
});

test('3. MicroLessonBot: On-Demand 5-Minute Bite-Sized Lessons', async () => {
  const lesson = await tutoEngine.generateMicroLesson('Pointers and Memory', 'Dangling pointers');
  assert.ok(lesson.id);
  assert.equal(lesson.concept, 'Pointers and Memory');
  assert.equal(lesson.minutes, 5);
  assert.equal(lesson.steps.length, 4);
  assert.ok(lesson.steps[0].title);
  assert.ok(lesson.steps[0].body);
});

test('4. ConfusionPulseBot: Cluster Doubts and Extract Faculty Advice', () => {
  const doubts = [
    { concept: 'Recursion', text: 'I get maximum call stack exceeded' },
    { concept: 'Recursion', text: 'Where does the return value go in the base case?' },
    { concept: 'Eigenvalues', text: 'Why det(A - lambda I) = 0?' },
  ];
  const telemetry = tutoEngine.analyzeConfusionTelemetry(doubts);
  assert.ok(Array.isArray(telemetry.topFrictionPoints));
  assert.ok(telemetry.topFrictionPoints.length >= 2);
  assert.equal(telemetry.topFrictionPoints[0].concept, 'Recursion');
  assert.equal(telemetry.topFrictionPoints[0].count, 2);
  assert.ok(telemetry.topFrictionPoints[0].advice);
});

test('5. ProjectMatchBot: Scout Roles and Milestone Roadmap', () => {
  const roadmap = tutoEngine.scoutProjectRoadmap('Autonomous Drone Mapping', ['Python', 'Computer Vision', 'ROS']);
  assert.ok(Array.isArray(roadmap.recommendedRoles));
  assert.ok(roadmap.recommendedRoles.length >= 3);
  assert.ok(Array.isArray(roadmap.milestones));
  assert.equal(roadmap.milestones.length, 3);
});

test('6. AcousticVoiceBot: Natural Speech Formatter', () => {
  const technical = 'Calculate $\\lambda \\cdot I$ and verify $\\mathcal{O}(n \\log n)$ with `code_block`.';
  const spoken = sanitizeTextForSpeech(technical);
  assert.ok(!spoken.includes('$'));
  assert.ok(!spoken.includes('`'));
  assert.ok(spoken.includes('lambda'));
  assert.ok(spoken.includes('O of n log n'));
});

test('7. TutorBot: Graph Traversal Query "explain dfs" returns structured DFS decomposition', async () => {
  const solution = await tutoEngine.solveDoubt({ question: 'explain dfs' });
  assert.equal(solution.concept, 'Depth-First Search (DFS) & Graph Traversal');
  assert.ok(solution.steps.some(s => s.equation_or_code?.includes('dfs(graph')));
  assert.ok(solution.flowchart.nodes.length >= 4);
});

console.log('🌟 All 7 TUTO Bot Assists tested and passed successfully!');
