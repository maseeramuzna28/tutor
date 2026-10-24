// ============================================================================
// TUTO Academic Intelligence & Multi-Bot LLM Engine
// Orchestrator for Local LLM (Ollama/vLLM 'tuto-tutor'), Cloud (Gemini),
// and Autonomous First-Principles Socratic Reasoner.
// ============================================================================

import {
  SolveRequest,
  QuestionStep,
  TutorIntent,
} from '../types/database';

export interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  stepIndex?: number;
  tag?: string;
  desc?: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartData {
  title: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface TutoSolutionResult {
  intent: TutorIntent;
  subject: string;
  concept: string;
  root_cause: string;
  topic: string;
  response: string;
  spoken_answer: string;
  tutor_intro?: string;
  tutor_wrapup?: string;
  refresher: string;
  steps: QuestionStep[];
  analogy: string;
  flowchart: FlowchartData;
  provider: 'local-ollama' | 'local-vllm' | 'gemini' | 'autonomous';
  model: string;
  disclaimer?: string;
}

export interface MicroLessonResult {
  id: string;
  title: string;
  concept: string;
  minutes: number;
  completed: boolean;
  steps: {
    title: string;
    body: string;
    latex?: string;
  }[];
}

// Configuration defaults
const OLLAMA_BASE_URL = process.env.OLLAMA_API_BASE || 'http://127.0.0.1:11434';
const TUTO_MODEL_NAME = process.env.TUTO_LOCAL_MODEL || 'tuto-tutor';
const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Clean speech helper (Acoustic Bot)
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Replace LaTeX big-O notations
    .replace(/\\mathcal\{O\}\((.*?)\)/gi, 'O of $1')
    .replace(/\$O\((.*?)\)\$/gi, 'O of $1')
    .replace(/O\((.*?)\)/gi, 'O of $1')
    // Replace Greek and math operators
    .replace(/\\lambda/gi, 'lambda')
    .replace(/\\cdot/gi, 'times')
    .replace(/\\times/gi, 'times')
    .replace(/\\log/gi, 'log')
    .replace(/\\mu/gi, 'mu')
    .replace(/\\pi/gi, 'pi')
    .replace(/\\theta/gi, 'theta')
    .replace(/\\alpha/gi, 'alpha')
    .replace(/\\beta/gi, 'beta')
    .replace(/\\sigma/gi, 'sigma')
    .replace(/\\le/gi, 'less than or equal to')
    .replace(/\\ge/gi, 'greater than or equal to')
    .replace(/\\ne/gi, 'not equal to')
    .replace(/\\approx/gi, 'approximately')
    .replace(/\\in/gi, 'is an element of')
    .replace(/\\mathcal\{[a-zA-Z]+\}/g, '')
    // Strip markdown formatting & delimiters
    .replace(/\$(.*?)\$/g, '$1') // strip math delimiters
    .replace(/\*\*(.*?)\*\*/g, '$1') // strip bold
    .replace(/\*(.*?)\*/g, '$1') // strip italic
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1') // strip code fences
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // strip markdown links
    .replace(/#+\s+/g, '') // strip headers
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// Specialized Domain Knowledge Base for Autonomous Socratic Fallback
// ============================================================================
interface DomainTemplate {
  keywords: RegExp;
  subject: string;
  concept: string;
  root_cause: string;
  analogy: string;
  refresher: string;
  steps: { title: string; explanation: string; equation_or_code?: string }[];
  flowNodes: { id: string; label: string; type: 'start' | 'process' | 'decision' | 'end'; tag: string; desc: string }[];
}

const DOMAIN_KNOWLEDGE_TEMPLATES: DomainTemplate[] = [
  {
    keywords: /eigenvalue|eigenvector|characteristic equation|det\(a|lambda/i,
    subject: 'Mathematics (Linear Algebra)',
    concept: 'Eigenvalues and Eigenvectors',
    root_cause: 'Confusion between matrix multiplication as spatial transformation vs vector scaling',
    analogy: 'Imagine stretching a rubber sheet in multiple directions. Most arrows drawn on the sheet tilt and rotate as it stretches. Eigenvectors are the special arrows that point along the exact axis of stretching—they grow or shrink by a factor of lambda, but never change their direction.',
    refresher: 'Remember that an eigenvector satisfies $A v = \\lambda v$, which rearranges to $(A - \\lambda I) v = 0$. For a non-trivial vector $v \\neq 0$, the determinant $\\det(A - \\lambda I)$ must equal zero.',
    steps: [
      {
        step: 1,
        title: 'Formulate the Invariance Condition',
        explanation: 'Start with the fundamental definition: an eigenvector $v$ undergoing transformation $A$ merely scales by scalar $\\lambda$.',
        equation_or_code: '$$A v = \\lambda v \\iff (A - \\lambda I) v = 0$$',
      },
      {
        step: 2,
        title: 'Enforce Non-Trivial Kernel Requirement',
        explanation: 'If $(A - \\lambda I)$ were invertible, multiplying both sides by its inverse would yield only the trivial vector $v = 0$. For non-zero eigenvectors to exist, $(A - \\lambda I)$ must be singular.',
        equation_or_code: '$$\\det(A - \\lambda I) = 0$$',
      },
      {
        step: 3,
        title: 'Solve Characteristic Polynomial',
        explanation: 'Compute the determinant to derive an $n$-th degree polynomial in $\\lambda$. The roots of this characteristic equation are the eigenvalues.',
        equation_or_code: '$$p(\\lambda) = \\lambda^n - \\operatorname{tr}(A)\\lambda^{n-1} + \\dots + (-1)^n \\det(A) = 0$$',
      },
      {
        step: 4,
        title: 'Extract Eigenspaces by Null Space Elimination',
        explanation: 'For each eigenvalue $\\lambda_i$, substitute back into $(A - \\lambda_i I)v = 0$ and perform Gaussian elimination to find the basis vectors of the null space.',
        equation_or_code: '$$v_i \\in \\operatorname{Null}(A - \\lambda_i I)$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Matrix Transformation A', type: 'start', tag: 'Input State', desc: 'Given linear transformation matrix A' },
      { id: 'step-1', label: 'Form (A - λI)', type: 'process', tag: 'Step 1', desc: 'Shift diagonal by scalar lambda' },
      { id: 'step-2', label: 'Check det(A - λI) == 0', type: 'decision', tag: 'Step 2', desc: 'Enforce non-trivial singular matrix condition' },
      { id: 'step-3', label: 'Eigenspace Basis Verified', type: 'end', tag: 'Verified Goal', desc: 'Nullspace eigenvectors and scaling eigenvalues' },
    ],
  },
  {
    keywords: /dijkstra|shortest path|graph algorithm|priority queue|adjacency/i,
    subject: 'Computer Science (Algorithms)',
    concept: "Dijkstra's Shortest Path Algorithm",
    root_cause: 'Misunderstanding why greedy relaxation requires strictly non-negative edge weights',
    analogy: 'Imagine water flowing outward from a sprinkler head through an irrigation pipe network. The water will always arrive at the closest pipe junctions first. Once water reaches a junction through the fastest route, no longer path can deliver water sooner, provided pipes have positive travel times.',
    refresher: 'Dijkstra maintains a priority queue of tentative distances. It extracts the unvisited node with minimal distance and relaxes its outgoing edges.',
    steps: [
      {
        step: 1,
        title: 'Initialize Distance Table and Priority Queue',
        explanation: 'Assign $d(s) = 0$ for source node $s$, and $d(u) = \\infty$ for all other vertices $u \\in V \\setminus \\{s\\}$. Insert $(0, s)$ into a min-heap priority queue.',
        equation_or_code: '```python\ndist = {v: float("inf") for v in graph}\ndist[source] = 0\npq = [(0, source)]\n```',
      },
      {
        step: 2,
        title: 'Extract Minimum Unvisited Node',
        explanation: 'Pop $(d_u, u)$ from the priority queue. If $d_u > dist[u]$, discard it as an outdated entry. Mark $u$ as finalized.',
        equation_or_code: '$$u = \\arg\\min_{v \\notin S} \\operatorname{dist}[v]$$',
      },
      {
        step: 3,
        title: 'Edge Relaxation Invariant',
        explanation: 'For each neighbor $v$ connected via weight $w(u, v) \\ge 0$, check if passing through $u$ produces a shorter path than previously known.',
        equation_or_code: '$$\\text{If } \\operatorname{dist}[u] + w(u, v) < \\operatorname{dist}[v] \\implies \\operatorname{dist}[v] \\leftarrow \\operatorname{dist}[u] + w(u, v)$$',
      },
      {
        step: 4,
        title: 'Termination and Path Reconstruction',
        explanation: 'Repeat until priority queue is empty. Total time complexity with a Fibonacci or binary min-heap is $O((V + E) \\log V)$.',
        equation_or_code: '$$\\mathcal{O}((E + V) \\log V)$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Graph G=(V,E) with non-neg weights', type: 'start', tag: 'Problem State', desc: 'Initialize dist[start]=0, all others inf' },
      { id: 'step-1', label: 'Pop Min Distance Node from Heap', type: 'process', tag: 'Step 1', desc: 'Extract minimal unvisited vertex u' },
      { id: 'step-2', label: 'Can we relax neighbor dist?', type: 'decision', tag: 'Step 2', desc: 'dist[u] + weight < dist[v]?' },
      { id: 'step-3', label: 'All Shortest Paths Settled', type: 'end', tag: 'Goal State', desc: 'Optimal shortest distance tree obtained' },
    ],
  },
  {
    keywords: /recursion|base case|call stack|recursive/i,
    subject: 'Computer Science (Data Structures)',
    concept: 'Recursive Decomposition & Call Stacks',
    root_cause: 'Mental difficulty visualizing frames on the execution stack and base-case unwinding',
    analogy: 'Think of Russian nesting dolls (Matryoshka). You open each larger doll only to find a smaller one inside. You cannot snap the outer dolls closed until you reach the solid, indivisible innermost doll (the base case), at which point you assemble each outer shell back in reverse order.',
    refresher: 'A recursive procedure requires two parts: (1) an anchor base case that returns without recursion, and (2) a shrinking step where input monotonically approaches the base case.',
    steps: [
      {
        step: 1,
        title: 'Establish the Base Case Anchor',
        explanation: 'Determine the simplest irreducible input that can be resolved immediately with no further subcalls.',
        equation_or_code: '```python\nif n <= 1:\n    return 1\n```',
      },
      {
        step: 2,
        title: 'Formulate the Inductive Reduction',
        explanation: 'Assume by induction that the function works correctly for $n-1$. Express the solution for $n$ as a composition of this smaller subproblem.',
        equation_or_code: '$$T(n) = f(n, T(n - 1))$$',
      },
      {
        step: 3,
        title: 'Call Stack Allocation & Winding',
        explanation: 'Each invocation pushes a new stack frame containing local variables and return address into memory, consuming $O(D)$ stack space for depth $D$.',
        equation_or_code: '$$\\text{Depth } D \\implies \\text{Memory Overhead } \\mathcal{O}(D)$$',
      },
      {
        step: 4,
        title: 'Stack Unwinding and Result Assembly',
        explanation: 'Once the base case evaluates, the return values propagate upwards, popping frames and assembling the final composite answer.',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Evaluate Function f(n)', type: 'start', tag: 'Initial State', desc: 'Incoming call with parameter n' },
      { id: 'step-1', label: 'Is n at Base Case?', type: 'decision', tag: 'Step 1', desc: 'Check termination invariant' },
      { id: 'step-2', label: 'Push Stack Frame f(n-1)', type: 'process', tag: 'Step 2', desc: 'Shrink problem size towards base case' },
      { id: 'step-3', label: 'Unwind and Return Solution', type: 'end', tag: 'Terminal State', desc: 'Composite result returned to caller' },
    ],
  },
  {
    keywords: /pointer|memory address|segmentation fault|dereference|malloc|free/i,
    subject: 'Computer Systems & C',
    concept: 'Memory Addresses and Pointer Indirection',
    root_cause: 'Conflating a container (memory cell address) with the content stored inside that container',
    analogy: 'A regular variable is like a locker that holds your coat. A pointer variable is a piece of paper with the locker number written on it. Dereferencing is opening the locker matching the number on your paper to get whatever is stored inside.',
    refresher: 'Remember: `&x` yields the memory address of `x`, while `*ptr` reads or writes the value located at address `ptr`.',
    steps: [
      {
        step: 1,
        title: 'Understand the Linear Address Space',
        explanation: 'RAM is structured as a contiguous sequence of numbered byte cells. Every declared variable resides at a distinct hexadecimal address.',
        equation_or_code: '```c\nint x = 42;\nint *p = &x; // p holds address of x, e.g. 0x7ffee4\n```',
      },
      {
        step: 2,
        title: 'Dereferencing (* operator)',
        explanation: 'Dereferencing instructs the CPU to load or store data directly at the target memory address.',
        equation_or_code: '```c\n*p = 100; // x is now 100\n```',
      },
      {
        step: 3,
        title: 'Pointer Arithmetic by Type Size',
        explanation: 'Adding 1 to a pointer increments its raw memory address by `sizeof(*p)` bytes, rather than a single raw byte.',
        equation_or_code: '$$p + k \\equiv \\text{addr}(p) + k \\times \\operatorname{sizeof}(T)$$',
      },
      {
        step: 4,
        title: 'Prevent Dangling Pointers & Memory Leaks',
        explanation: 'Always set freed pointers to `NULL` to prevent use-after-free bugs and check allocation returns.',
        equation_or_code: '```c\nfree(p);\np = NULL;\n```',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Variable Declared in Memory', type: 'start', tag: 'Memory State', desc: 'Variable holds value at address 0x...' },
      { id: 'step-1', label: 'Pointer Assigned Address &x', type: 'process', tag: 'Step 1', desc: 'Store target address inside pointer variable' },
      { id: 'step-2', label: 'Is pointer non-null and valid?', type: 'decision', tag: 'Step 2', desc: 'Guard against segmentation fault' },
      { id: 'step-3', label: 'Safe Dereference Execution', type: 'end', tag: 'Goal State', desc: 'Direct access to memory byte block' },
    ],
  },
  {
    keywords: /fourier|fft|frequency domain|signal|sine|transform/i,
    subject: 'Electrical Engineering & Physics',
    concept: 'Fourier Transform & Frequency Domain Analysis',
    root_cause: 'Inability to connect time-domain waveform interference with orthogonal basis projections',
    analogy: 'Imagine tasting a fruit smoothie. In the "time domain", you experience one combined flavor all at once. The Fourier Transform is like a molecular flavor analyzer that separates the smoothie into exact grams of banana, strawberry, mango, and milk.',
    refresher: 'The Fourier Transform decomposes any signal into an integral of orthogonal complex sinusoids $e^{-i \\omega t} = \\cos(\\omega t) - i \\sin(\\omega t)$.',
    steps: [
      {
        step: 1,
        title: 'Continuous Fourier Transform Definition',
        explanation: 'Project the continuous time signal $x(t)$ onto the orthogonal complex exponential basis vectors.',
        equation_or_code: '$$X(\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t} dt$$',
      },
      {
        step: 2,
        title: 'Euler Representation of Basis Harmonics',
        explanation: 'Expand the exponential using Euler formula to separate symmetric (cosine) and anti-symmetric (sine) harmonic phases.',
        equation_or_code: '$$e^{-j\\omega t} = \\cos(\\omega t) - j\\sin(\\omega t)$$',
      },
      {
        step: 3,
        title: 'Discrete Fourier Transform (DFT)',
        explanation: 'For digital signal processing, compute finite sampled sequences using $N$ sample points.',
        equation_or_code: '$$X[k] = \\sum_{n=0}^{N-1} x[n] e^{-j 2\\pi k n / N}$$',
      },
      {
        step: 4,
        title: 'Fast Fourier Transform (FFT) Optimization',
        explanation: 'The Cooley-Tukey algorithm recursively partitions even and odd indices, reducing complexity from $O(N^2)$ to $O(N \\log N)$.',
        equation_or_code: '$$\\mathcal{O}(N \\log N)$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Time-Domain Signal x(t)', type: 'start', tag: 'Raw Signal', desc: 'Continuous or discrete time amplitude sequence' },
      { id: 'step-1', label: 'Project onto Complex Exponentials', type: 'process', tag: 'Step 1', desc: 'Multiply by e^(-jωt) basis harmonics' },
      { id: 'step-2', label: 'Integrate / Sum Harmonics', type: 'decision', tag: 'Step 2', desc: 'Extract orthogonal projection magnitudes' },
      { id: 'step-3', label: 'Frequency Spectrum X(ω)', type: 'end', tag: 'Goal State', desc: 'Magnitude and phase frequency spectrum' },
    ],
  },
  {
    keywords: /\b(dfs|depth[\s-]first(\s*search)?)\b/i,
    subject: 'Computer Science (Algorithms & Graph Theory)',
    concept: 'Depth-First Search (DFS) & Graph Traversal',
    root_cause: 'Confusing branch exploration with shortest path finding and forgetting visited set tracking, which causes infinite cyclic loops',
    analogy: 'Imagine exploring an ancient labyrinth with a spool of string and chalk. At every doorway, you mark the archway with chalk and walk as deep as possible until you reach a dead end. When blocked, you trace your string backward to the previous junction to explore the next doorway.',
    refresher: 'DFS explores deep along each branch before backtracking. It relies on a LIFO stack (or recursive call stack), visiting every node and edge in O(V + E) time.',
    steps: [
      {
        step: 1,
        title: 'Initialize Visited Set & LIFO Call Stack',
        explanation: 'Start at the source vertex $s$. Maintain a hash set `visited` to mark vertices upon discovery and prevent infinite loops in cyclic graphs.',
        equation_or_code: '```python\nvisited = set()\n\ndef dfs(graph, node):\n    if node in visited:\n        return\n    visited.add(node)\n```',
      },
      {
        step: 2,
        title: 'Recursive Branch Dive (Go Deep First)',
        explanation: 'For each unvisited neighbor $v$ connected to current vertex $u$, recursively invoke DFS. The call stack preserves the backtracking trail.',
        equation_or_code: '```python\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            dfs(graph, neighbor)\n```',
      },
      {
        step: 3,
        title: 'Backtrack on Dead-End Termination',
        explanation: 'When a vertex has no remaining unvisited neighbors, its execution frame pops from the call stack, naturally retreating to the parent vertex.',
        equation_or_code: '$$\\text{Call Stack Frame Popped} \\implies \\text{Backtrack to Parent Vertex}$$',
      },
      {
        step: 4,
        title: 'Asymptotic Complexity Invariant',
        explanation: 'Every vertex is pushed and popped at most once, and every edge is examined at most twice (in undirected graphs). Total time is $O(V + E)$ and auxiliary space is $O(V)$.',
        equation_or_code: '$$\\mathcal{O}(V + E) \\quad \\text{Time}, \\quad \\mathcal{O}(V) \\quad \\text{Space}$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Unvisited Graph G=(V,E) & Start Node', type: 'start', tag: 'Problem State', desc: 'Initialize visited set and call stack' },
      { id: 'step-1', label: 'Mark Current Node Visited', type: 'process', tag: 'Step 1', desc: 'Add node to set, process node value' },
      { id: 'step-2', label: 'Are there unvisited neighbors?', type: 'decision', tag: 'Step 2', desc: 'Check adjacency list for unexplored edges' },
      { id: 'step-3', label: 'All Branches Explored (Backtrack Complete)', type: 'end', tag: 'Goal State', desc: 'Full connected component visited' },
    ],
  },
  {
    keywords: /\b(bfs|breadth[\s-]first(\s*search)?)\b/i,
    subject: 'Computer Science (Algorithms & Graph Theory)',
    concept: 'Breadth-First Search (BFS) & Shortest Path',
    root_cause: 'Attempting to use a LIFO stack instead of a FIFO queue, losing the level-by-level distance guarantee in unweighted graphs',
    analogy: 'Imagine dropping a pebble into a calm pond. Ripples expand outward in concentric rings, touching all points at distance 1 before any point at distance 2. BFS guarantees finding the shortest unweighted path because it exhausts every radius completely before stepping further outward.',
    refresher: 'BFS visits vertices level by level using a FIFO queue. In an unweighted graph, the first time BFS reaches a node is guaranteed to be its shortest path.',
    steps: [
      {
        step: 1,
        title: 'Initialize FIFO Queue and Distance Map',
        explanation: 'Enqueue the source vertex $s$ into a First-In-First-Out (FIFO) queue and mark it visited with distance 0.',
        equation_or_code: '```python\nfrom collections import deque\nqueue = deque([start])\ndist = {start: 0}\n```',
      },
      {
        step: 2,
        title: 'Dequeue Current Frontier Vertex',
        explanation: 'Pop the vertex at the front of the queue. Its current distance is globally finalized.',
        equation_or_code: '```python\nu = queue.popleft()\n```',
      },
      {
        step: 3,
        title: 'Enqueue Unvisited Neighbors (Next Level)',
        explanation: 'Iterate all neighbors $v$ of $u$. If $v$ is not yet in the distance map, record $dist[v] = dist[u] + 1$ and append $v$ to the back of the queue.',
        equation_or_code: '$$\\operatorname{dist}[v] = \\operatorname{dist}[u] + 1$$',
      },
      {
        step: 4,
        title: 'Termination and Level-Order Property',
        explanation: 'Repeat until the queue is empty. Every reachable node is visited in increasing order of distance from source in $O(V + E)$ time.',
        equation_or_code: '$$\\mathcal{O}(V + E) \\quad \\text{Time}, \\quad \\mathcal{O}(V) \\quad \\text{Queue Memory}$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Source Node & Empty FIFO Queue', type: 'start', tag: 'Problem State', desc: 'Enqueue start, dist[start] = 0' },
      { id: 'step-1', label: 'Pop Vertex from Front of Queue', type: 'process', tag: 'Step 1', desc: 'Process current frontier vertex u' },
      { id: 'step-2', label: 'Are there unvisited neighbors?', type: 'decision', tag: 'Step 2', desc: 'Enqueue unvisited neighbors at dist+1' },
      { id: 'step-3', label: 'Queue Empty: All Distances Minimal', type: 'end', tag: 'Goal State', desc: 'Shortest unweighted path tree formed' },
    ],
  },
  {
    keywords: /\b(binary search tree|bst|inorder traversal)\b/i,
    subject: 'Computer Science (Data Structures)',
    concept: 'Binary Search Trees & Inorder Invariant',
    root_cause: 'Believing that a node only needs to be greater than its immediate left child, rather than greater than all elements in its entire left subtree',
    analogy: 'Imagine a sorted dictionary split into two halves. Everything to the left of the middle divider comes before it alphabetically, and everything to the right comes after it. When inserting or searching a word, you decide which half to open with a single comparison, halving remaining candidates.',
    refresher: 'For every node x in a valid BST, all keys in left(x) are < key(x), and all keys in right(x) are > key(x). An inorder traversal yields strictly sorted keys.',
    steps: [
      {
        step: 1,
        title: 'The Global Subtree Ordering Invariant',
        explanation: 'Every key in the left subtree must be strictly less than the root key, and every key in the right subtree must be strictly greater.',
        equation_or_code: '$$\\forall k_L \\in \\operatorname{Left}(x), \\; k_L < \\operatorname{key}(x) < \\forall k_R \\in \\operatorname{Right}(x)$$',
      },
      {
        step: 2,
        title: 'Search & Insertion Pruning',
        explanation: 'To search for target key $k$, compare $k$ with current node. If $k < key$, branch left; if $k > key$, branch right.',
        equation_or_code: '```python\nif target < node.val:\n    return search(node.left, target)\nelif target > node.val:\n    return search(node.right, target)\nreturn node\n```',
      },
      {
        step: 3,
        title: 'Inorder Traversal Produces Sorted Sequence',
        explanation: 'Traversing Left -> Root -> Right yields all keys in strictly ascending sorted order.',
        equation_or_code: '$$\\text{Inorder}(T) = [k_1 \\le k_2 \\le \\dots \\le k_n]$$',
      },
      {
        step: 4,
        title: 'Height Balance & Degeneracy',
        explanation: 'Balanced BSTs (AVL, Red-Black) guarantee $O(\\log n)$ operations. If keys are inserted in sorted order without balancing, height degenerates to $O(n)$.',
        equation_or_code: '$$\\mathcal{O}(\\log n) \\text{ Balanced} \\quad \\text{vs} \\quad \\mathcal{O}(n) \\text{ Degenerate}$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Query Key k & BST Root', type: 'start', tag: 'Search State', desc: 'Compare target key with current node' },
      { id: 'step-1', label: 'Is target < current.val?', type: 'decision', tag: 'Step 1', desc: 'Branch left or right subtree' },
      { id: 'step-2', label: 'Traverse Subtree Recursively', type: 'process', tag: 'Step 2', desc: 'Halve remaining search space' },
      { id: 'step-3', label: 'Target Node Located / Inserted', type: 'end', tag: 'Goal State', desc: 'Operation complete in O(log n)' },
    ],
  },
  {
    keywords: /\b(merge[\s-]sort|divide and conquer)\b/i,
    subject: 'Computer Science (Algorithms)',
    concept: 'Merge Sort & Divide-and-Conquer Recurrence',
    root_cause: 'Confusing the division phase (which does zero comparison work) with the linear two-pointer zipper merge phase',
    analogy: 'Imagine two people each holding a sorted deck of playing cards. To combine them into one sorted deck, they simply compare their top cards, take the smaller one, and place it face down. They repeat this until both decks are merged, requiring only one single pass.',
    refresher: 'Merge sort splits an array into halves recursively until sub-arrays of size 1 remain, then merges sorted halves using two pointers in O(n) time.',
    steps: [
      {
        step: 1,
        title: 'Divide Array into Equal Halves',
        explanation: 'Find the midpoint $m = \\lfloor (l + r) / 2 \\rfloor$ and recursively split the array until subproblem size reaches the base case of 1.',
        equation_or_code: '$$T(n) = 2T(n/2) + \\Theta(n)$$',
      },
      {
        step: 2,
        title: 'Two-Pointer Zipper Merge',
        explanation: 'Maintain two pointers $i$ and $j$ at the head of left and right sorted subarrays. Compare $L[i]$ and $R[j]$, copy the smaller element to output, and advance.',
        equation_or_code: '```python\nwhile i < len(L) and j < len(R):\n    if L[i] <= R[j]:\n        arr[k] = L[i]; i += 1\n    else:\n        arr[k] = R[j]; j += 1\n    k += 1\n```',
      },
      {
        step: 3,
        title: 'Copy Residual Elements',
        explanation: 'Once one subarray is exhausted, append the remaining elements of the other subarray directly to the merged output.',
      },
      {
        step: 4,
        title: 'Master Theorem Asymptotic Proof',
        explanation: 'The recursion tree has $\\log_2 n$ levels, and each level performs exactly $c \\cdot n$ merging work. Total time complexity is strictly $O(n \\log n)$ in all cases.',
        equation_or_code: '$$\\mathcal{O}(n \\log n) \\quad \\text{Best, Worst, & Average}$$',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Unsorted Array of Size n', type: 'start', tag: 'Input State', desc: 'Calculate midpoint and divide' },
      { id: 'step-1', label: 'Recursively Split until Size == 1', type: 'process', tag: 'Step 1', desc: 'Divide phase reaches trivial base case' },
      { id: 'step-2', label: 'Merge Sorted Halves with Two Pointers', type: 'decision', tag: 'Step 2', desc: 'L[i] <= R[j] zipper merge' },
      { id: 'step-3', label: 'Fully Sorted Array Verified', type: 'end', tag: 'Goal State', desc: 'O(n log n) stable sort complete' },
    ],
  },
  {
    keywords: /nash equilibrium|game theory|payoff|prisoner|dominant strategy/i,
    subject: 'Economics & Game Theory',
    concept: 'Nash Equilibrium & Strategic Dominance',
    root_cause: 'Assuming players maximize collective welfare rather than individual best responses',
    analogy: 'Imagine drivers at a crowded intersection without traffic lights. If everyone drives slowly and yields, traffic flows safely. But if every driver fears being blocked, each accelerates aggressively. In a Nash equilibrium, no driver can unilaterally change their move without becoming worse off.',
    refresher: 'A strategy profile is a Nash equilibrium if no player has an incentive to unilaterally deviate from their chosen strategy given the strategies of all others.',
    steps: [
      {
        step: 1,
        title: 'Formulate Strategy Spaces and Payoff Matrix',
        explanation: 'Define players $i \\in \\{1, 2, \\dots, n\\}$, their strategy sets $S_i$, and payoff utility functions $u_i(s_1, \\dots, s_n)$.',
      },
      {
        step: 2,
        title: 'Compute Best Response Correspondence',
        explanation: 'For every prospective strategy choice of player 2, identify player 1 optimal payoff-maximizing action.',
        equation_or_code: '$$B_i(s_{-i}) = \\arg\\max_{s_i \\in S_i} u_i(s_i, s_{-i})$$',
      },
      {
        step: 3,
        title: 'Identify Mutual Best Response Intersection',
        explanation: 'Find where best-response strategies intersect simultaneously for all players.',
        equation_or_code: '$$s^* \\in B_i(s_{-i}^*) \\quad \\forall i$$',
      },
      {
        step: 4,
        title: 'Differentiate Pareto Optimality from Equilibrium',
        explanation: 'Observe that an equilibrium does not guarantee collective welfare maximization (e.g. Prisoner Dilemma defection trap).',
      },
    ],
    flowNodes: [
      { id: 'start', label: 'Game Matrix & Payoffs', type: 'start', tag: 'Rules State', desc: 'Players, available actions, and utility rewards' },
      { id: 'step-1', label: 'Calculate Best Response Curves', type: 'process', tag: 'Step 1', desc: 'Map best action for every opponent move' },
      { id: 'step-2', label: 'Does any player benefit by deviating?', type: 'decision', tag: 'Step 2', desc: 'Verify unilateral deviation stability' },
      { id: 'step-3', label: 'Nash Equilibrium Confirmed', type: 'end', tag: 'Stable State', desc: 'Self-enforcing strategic outcome' },
    ],
  },
];

// ============================================================================
// Socratic Teaching Enricher
// ============================================================================
function enrichWithTeaching(steps: any[], concept: string): QuestionStep[] {
  return steps.map((s, idx) => {
    let speech = s.teaching_speech;
    if (!speech) {
      const cleanExpl = (s.explanation || '').replace(/\$\$/g, '').replace(/\$/g, '').trim();
      speech = `Alright, let's look at Step ${idx + 1}: ${s.title}. Notice what happens here—${cleanExpl.slice(0, 150)}${cleanExpl.length > 150 ? '...' : ''}. This is our key transition.`;
    }
    let check = s.check_question;
    if (!check) {
      const prompts = [
        `Does this step make intuitive sense so far?`,
        `Notice the key substitution here—do you see why it holds?`,
        `Would you like me to share an everyday analogy for this step?`,
        `Ready for the next step, or should we break down the formula further?`,
      ];
      check = prompts[idx % prompts.length];
    }
    let notes = s.auto_notes;
    if (!notes) {
      notes = s.equation_or_code ? `${s.title}: ${s.equation_or_code}` : `${s.title} — ${s.explanation.slice(0, 75)}`;
    }
    return {
      step: s.step || idx + 1,
      title: s.title,
      explanation: s.explanation,
      equation_or_code: s.equation_or_code,
      teaching_speech: speech,
      check_question: check,
      auto_notes: notes,
    };
  });
}

// ============================================================================
// Fallback Generator for Arbitrary Academic Doubts
// ============================================================================
function generateAutonomousFallback(question: string): TutoSolutionResult {
  // Normalize question text and remove conversational preambles
  const stripped = question
    .replace(/^(please\s+)?(can\s+you\s+)?(explain|what\s+is|what\s+are|how\s+does|how\s+do|why\s+does|why\s+is|tell\s+me\s+about|describe|solve|calculate|derive|prove)\s+/i, '')
    .replace(/[?.,!]+$/g, '')
    .trim();

  // Check against our specialized domain templates using both raw and normalized queries
  for (const tmpl of DOMAIN_KNOWLEDGE_TEMPLATES) {
    if (tmpl.keywords.test(question) || tmpl.keywords.test(stripped)) {
      return {
        intent: 'question',
        subject: tmpl.subject,
        concept: tmpl.concept,
        root_cause: tmpl.root_cause,
        topic: tmpl.concept,
        response: `Here is the first-principles decomposition of ${tmpl.concept}. We address the core prerequisite gap: ${tmpl.root_cause}.`,
        spoken_answer: `Let's understand ${tmpl.concept}. ${tmpl.analogy.split('.')[0]}. Step by step, we isolate the invariant condition and derive the solution together.`,
        tutor_intro: `Hello! Let's explore ${tmpl.concept} together. I'll guide you through each step and auto-scribe our key formulas into your notebook.`,
        tutor_wrapup: `Great job working through ${tmpl.concept}! Take a glance at your hands-free notebook to review your formulas and notes.`,
        refresher: tmpl.refresher,
        steps: enrichWithTeaching(tmpl.steps, tmpl.concept),
        analogy: tmpl.analogy,
        flowchart: {
          title: `${tmpl.concept} — Pipeline Flowchart`,
          nodes: tmpl.flowNodes,
          edges: [
            { from: 'start', to: 'step-1', label: 'Initialize' },
            { from: 'step-1', to: 'step-2', label: 'Transform' },
            { from: 'step-2', to: 'step-3', label: 'Verify' },
          ],
        },
        provider: 'autonomous',
        model: 'tuto-socratic-v1',
      };
    }
  }

  // Generalized first-principles decomposition for any academic query
  const cleanTitle = stripped
    ? stripped.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Conceptual Reasoning';

  // Domain heuristic detection
  let subject = 'Science & Engineering';
  if (/algorithm|graph|tree|node|memory|stack|queue|sort|hash|pointer|code|thread|process|api/i.test(question)) {
    subject = 'Computer Science & Software Systems';
  } else if (/matrix|vector|derivative|integral|eigen|equation|theorem|probability|calculus|algebra/i.test(question)) {
    subject = 'Mathematics & Applied Analysis';
  } else if (/circuit|voltage|current|transistor|fourier|signal|diode|wave|quantum|energy/i.test(question)) {
    subject = 'Electrical Engineering & Physics';
  } else if (/market|price|demand|supply|cost|equilibrium|firm|utility|macro|inflation/i.test(question)) {
    subject = 'Economics & Decision Science';
  }

  const genericSteps = [
    {
      step: 1,
      title: `Define Boundary Constraints & System State for ${cleanTitle}`,
      explanation: `Identify what inputs and conditions define "${cleanTitle}". Explicitly write down boundary constraints, system variables, and expected target outputs.`,
      equation_or_code: '$$\\text{State}_0 = \\{ \\text{Inputs}, \\text{Constraints} \\}$$',
    },
    {
      step: 2,
      title: 'Isolate Governing Theorem or State Invariant',
      explanation: `Determine the primary mathematical invariant, algorithmic rule, or governing relation that remains constant throughout the ${cleanTitle} process.`,
      equation_or_code: '$$\\Delta I = 0 \\implies f(x) = \\text{Invariant}$$',
    },
    {
      step: 3,
      title: 'Stepwise Transformation & Execution',
      explanation: `Carry out each intermediate state transition methodically, checking consistency at every milestone.`,
    },
    {
      step: 4,
      title: 'Verify Against Boundary Conditions',
      explanation: `Validate the derived result against extreme limits, edge cases (such as zero, null, or infinity), and verify that all invariants hold.`,
    },
  ];

  return {
    intent: 'question',
    subject,
    concept: cleanTitle,
    root_cause: `Misunderstanding the underlying boundary conditions and transition invariants of ${cleanTitle}`,
    topic: cleanTitle,
    response: `Step-by-step academic breakdown for "${cleanTitle}". We isolate the fundamental governing principles before deriving the solution.`,
    spoken_answer: `To understand ${cleanTitle}, we first establish the boundary constraints, identify the core transformation mechanism, and verify the resulting invariant together.`,
    tutor_intro: `Welcome! Let's break down "${cleanTitle}" step by step so the intuition clicks naturally.`,
    tutor_wrapup: `You've derived the foundation of ${cleanTitle}! Check your notebook surface on the right for your compiled study notes.`,
    refresher: `Review the foundational definitions and boundary constraints governing ${cleanTitle} before applying complex operations.`,
    steps: enrichWithTeaching(genericSteps, cleanTitle),
    analogy: `Think of ${cleanTitle} like an arch bridge: the keystone in the center holds all the load only because every supporting block beneath it is cut to the exact angle. In the same way, this concept works because each intermediate step is anchored to the previous invariant.`,
    flowchart: {
      title: `${cleanTitle} — Execution Pipeline Flowchart`,
      nodes: [
        { id: 'start', label: cleanTitle, type: 'start', tag: 'Problem State', desc: 'Define inputs, constraints, and target unknowns' },
        { id: 'step-1', label: 'Formulate Governing Invariants', type: 'process', tag: 'Step 1', desc: 'Isolate core theorems and state equations' },
        { id: 'step-2', label: 'Derive State Transitions', type: 'decision', tag: 'Step 2', desc: 'Check arithmetic and logical invariants' },
        { id: 'step-3', label: 'Verify Boundary Limits', type: 'end', tag: 'Verified Result', desc: 'Confirm validation against known edge cases' },
      ],
      edges: [
        { from: 'start', to: 'step-1', label: 'Analyze' },
        { from: 'step-1', to: 'step-2', label: 'Derive' },
        { from: 'step-2', to: 'step-3', label: 'Validate' },
      ],
    },
    provider: 'autonomous',
    model: 'tuto-socratic-v1',
  };
}

// ============================================================================
// Multi-Bot TUTO LLM Engine Class
// ============================================================================
export class TutoLLMEngine {
  private static instance: TutoLLMEngine;

  public static getInstance(): TutoLLMEngine {
    if (!TutoLLMEngine.instance) {
      TutoLLMEngine.instance = new TutoLLMEngine();
    }
    return TutoLLMEngine.instance;
  }

  /**
   * Main Socratic Tutor Bot: Solves doubts with flowchart, KaTeX, and root cause.
   */
  public async solveDoubt(req: SolveRequest): Promise<TutoSolutionResult> {
    const question = (req.question || '').trim();
    if (!question) {
      throw new Error('Question text is required.');
    }

    // Tier 1: Try Local TUTO Model (Ollama or compatible LLM endpoint)
    try {
      const localResult = await this.callLocalTutoModel(question, req);
      if (localResult) return localResult;
    } catch {
      // Local server not running or timed out; seamlessly proceed to next provider
    }

    // Tier 2: Try Cloud Gemini if configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !apiKey.includes('your-')) {
      try {
        const geminiResult = await this.callGeminiModel(question, req, apiKey);
        if (geminiResult) return geminiResult;
      } catch (err: any) {
        console.warn('Gemini inference failed, invoking autonomous engine:', err?.message || err);
      }
    }

    // Tier 3: Autonomous Socratic Engine (Deterministic, instant, offline-guaranteed)
    return generateAutonomousFallback(question);
  }

  /**
   * Analogy Clarifier Bot: Generates relatable analogies for confusing steps.
   */
  public async clarifyStep(stepTitle: string, questionContext?: string): Promise<string> {
    // Check known templates
    for (const tmpl of DOMAIN_KNOWLEDGE_TEMPLATES) {
      if (tmpl.keywords.test(stepTitle) || (questionContext && tmpl.keywords.test(questionContext))) {
        return tmpl.analogy;
      }
    }

    // Try Local LLM
    try {
      const prompt = `Explain "${stepTitle}" simply using an intuitive everyday analogy for a college student. Keep it under 80 words.`;
      const res = await this.generateTextFromLocal(prompt);
      if (res && res.length > 20) return res;
    } catch {
      // ignore
    }

    // Default intuitive analogy
    return `To understand "${stepTitle}", think of it like assembling flat-pack furniture: before screwing the outer panels together, you need to align the dowel pins and check the corner squareness. In the same way, this step stabilizes the mathematical baseline before continuing.`;
  }

  /**
   * Micro-Lesson Bot: Generates 5-minute bite-sized lessons with check questions.
   */
  public async generateMicroLesson(concept: string, rootCause?: string): Promise<MicroLessonResult> {
    const cleanConcept = concept.trim();
    const fallbackLesson: MicroLessonResult = {
      id: `lesson-${Date.now()}`,
      title: `${cleanConcept} in 5 Minutes`,
      concept: cleanConcept,
      minutes: 5,
      completed: false,
      steps: [
        {
          title: 'The Real-World Hook',
          body: `Why does ${cleanConcept} matter? It solves the problem of ${rootCause || 'handling complex state transitions'} by providing a predictable mathematical guarantee.`,
        },
        {
          title: 'The Core Principle',
          body: `Break down the central invariant: always preserve boundary conditions and maintain balance across state changes.`,
          latex: '$$\\Delta S \\ge 0 \\quad \\text{or} \\quad \\sum \\text{forces} = 0$$',
        },
        {
          title: 'The Most Common Mistake',
          body: `Students often stumble by overlooking edge cases (e.g. empty lists, zero denominators, or uninitialized pointers). Always check these first.`,
        },
        {
          title: 'Quick 60-Second Self-Check',
          body: `If the initial condition is perturbed by $\\epsilon$, does the output remain bounded? Walk the smallest possible example by hand.`,
        },
      ],
    };

    return fallbackLesson;
  }

  /**
   * Confusion Pulse Telemetry Bot: Clusters student doubts and delivers faculty insights.
   */
  public analyzeConfusionTelemetry(
    doubts: { concept?: string; root_cause?: string; text?: string }[]
  ): {
    topFrictionPoints: { concept: string; count: number; advice: string }[];
    overallAssessment: string;
  } {
    const counts: Record<string, number> = {};
    for (const d of doubts) {
      const c = (d.concept || 'General Doubt').trim();
      counts[c] = (counts[c] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([concept, count]) => {
        let advice = 'Recommend dedicating 10 minutes in the next lecture to live worked examples on this topic.';
        if (/recursion|pointers/i.test(concept)) {
          advice = 'Students struggle with stack frame mental models. Use visual memory diagrams in class.';
        } else if (/eigen|matrix|linear/i.test(concept)) {
          advice = 'Emphasize the geometric meaning of determinants and vector transformations rather than formulaic expansion.';
        }
        return { concept, count, advice };
      });

    return {
      topFrictionPoints: sorted,
      overallAssessment: `Analyzed ${doubts.length} student queries. Most friction originates from foundational prerequisite misunderstandings rather than current course definitions.`,
    };
  }

  /**
   * Project Scout Bot: Matches skills and generates 3-stage milestone roadmap.
   */
  public scoutProjectRoadmap(
    title: string,
    skills: string[]
  ): {
    recommendedRoles: string[];
    milestones: { phase: string; goal: string }[];
  } {
    return {
      recommendedRoles: [
        'Lead Systems Architect',
        'Frontend & UI Engineer',
        'Data Pipeline & API Developer',
      ],
      milestones: [
        { phase: 'Phase 1: Architecture & Spike', goal: `Establish data schemas and verify feasibility with ${skills[0] || 'core stack'}.` },
        { phase: 'Phase 2: MVP Implementation', goal: 'Build functional end-to-end user workflows and connect database.' },
        { phase: 'Phase 3: Integration & Peer Review', goal: 'Cross-college deployment, accessibility testing, and demo presentation.' },
      ],
    };
  }

  // ==========================================================================
  // Private Helper: Call Local Ollama / vLLM Endpoint
  // ==========================================================================
  private async callLocalTutoModel(question: string, _req: SolveRequest): Promise<TutoSolutionResult | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s local inference budget

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: TUTO_MODEL_NAME,
          prompt: question,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!data?.response) return null;

      const parsed = JSON.parse(data.response);
      if (!parsed || !Array.isArray(parsed.steps)) return null;

      const steps: QuestionStep[] = parsed.steps.map((s: any, idx: number) => ({
        step: s.step || idx + 1,
        title: s.title || `Step ${idx + 1}`,
        explanation: s.explanation || '',
        equation_or_code: s.equation_or_code,
      }));

      const flowchart: FlowchartData = parsed.flowchart || {
        title: `${parsed.concept || 'Concept'} — Execution Flowchart`,
        nodes: steps.map((s, idx) => ({
          id: `step-${idx + 1}`,
          label: s.title,
          type: idx === steps.length - 1 ? 'end' : (idx === 0 ? 'start' : 'process'),
          tag: `Step ${idx + 1}`,
          desc: s.explanation.slice(0, 50) + '...',
        })),
        edges: steps.slice(0, -1).map((_, idx) => ({
          from: `step-${idx + 1}`,
          to: `step-${idx + 2}`,
          label: 'Next',
        })),
      };

      return {
        intent: 'question',
        subject: parsed.subject || 'Engineering & Science',
        concept: parsed.concept || 'Core Concept',
        root_cause: parsed.root_cause || 'Foundational Prerequisite Gap',
        topic: parsed.concept || 'Academic Solution',
        response: parsed.spoken_answer || steps[0]?.explanation || 'Step-by-step solution.',
        spoken_answer: sanitizeTextForSpeech(parsed.spoken_answer || steps[0]?.explanation || ''),
        refresher: 'Decompose the question into known axioms and verified rules first.',
        steps,
        analogy: parsed.analogy || 'A step-by-step logical derivation.',
        flowchart,
        provider: 'local-ollama',
        model: TUTO_MODEL_NAME,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ==========================================================================
  // Private Helper: Call Gemini Cloud Endpoint
  // ==========================================================================
  private async callGeminiModel(
    question: string,
    req: SolveRequest,
    apiKey: string
  ): Promise<TutoSolutionResult | null> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are TUTO, a collegiate academic tutor. Provide a step-by-step first-principles solution for:
"${question}"

Return JSON matching this schema:
{
  "subject": "Academic Domain",
  "concept": "Core Concept Name",
  "root_cause": "Underlying prerequisite knowledge gap",
  "spoken_answer": "Concise plain English summary under 80 words for speech synthesis",
  "analogy": "Intuitive everyday real-world analogy",
  "steps": [
    { "step": 1, "title": "Step title", "explanation": "Explanation", "equation_or_code": "Optional KaTeX or code" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text);

    const steps: QuestionStep[] = (parsed.steps || []).map((s: any, idx: number) => ({
      step: s.step || idx + 1,
      title: s.title || `Step ${idx + 1}`,
      explanation: s.explanation || '',
      equation_or_code: s.equation_or_code,
    }));

    const flowchartNodes: FlowchartNode[] = [
      {
        id: 'start',
        label: question.length > 30 ? question.slice(0, 28) + '...' : question,
        type: 'start',
        tag: 'Problem State',
        desc: 'Initial conditions and target unknowns.',
      },
      ...steps.map((s, idx) => ({
        id: `step-${idx + 1}`,
        label: s.title,
        type: (idx === steps.length - 1 ? 'end' : (idx === 1 ? 'decision' : 'process')) as any,
        tag: `Step ${idx + 1}`,
        desc: (s.explanation.split('.')[0] || s.title) + '.',
      })),
    ];

    const flowchartEdges: FlowchartEdge[] = flowchartNodes.slice(0, -1).map((node, idx) => ({
      from: node.id,
      to: flowchartNodes[idx + 1].id,
      label: idx === 0 ? 'Analyze' : (idx === flowchartNodes.length - 2 ? 'Verify' : 'Derive'),
    }));

    return {
      intent: 'question',
      subject: parsed.subject || 'Engineering & Science',
      concept: parsed.concept || 'Core Concept',
      root_cause: parsed.root_cause || 'Foundational Prerequisite Gap',
      topic: parsed.concept || 'Academic Solution',
      response: parsed.spoken_answer || steps[0]?.explanation || 'Step-by-step solution.',
      spoken_answer: sanitizeTextForSpeech(parsed.spoken_answer || steps[0]?.explanation || ''),
      refresher: 'Decompose the question into known axioms and verified rules first.',
      steps,
      analogy: parsed.analogy || 'A step-by-step logical derivation.',
      flowchart: {
        title: `${parsed.concept || 'Execution'} — Pipeline Flowchart`,
        nodes: flowchartNodes,
        edges: flowchartEdges,
      },
      provider: 'gemini',
      model: GEMINI_MODEL_NAME,
    };
  }

  // ==========================================================================
  // Private Helper: Quick text generator from local model
  // ==========================================================================
  private async generateTextFromLocal(prompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: TUTO_MODEL_NAME,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data?.response?.trim() || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const tutoEngine = TutoLLMEngine.getInstance();
