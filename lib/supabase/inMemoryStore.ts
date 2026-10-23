// In-Memory Database Store & Query Builder for Local Testing / Offline Fallback
// Emulates Supabase's PostgREST query builder for users, questions, answers, votes, projects, contributions, points_log, and reports.

export interface DbStore {
  users: any[];
  questions: any[];
  answers: any[];
  votes: any[];
  projects: any[];
  contributions: any[];
  points_log: any[];
  reports: any[];
  ai_rate_limits: any[];
  courses: any[];
  posts: any[];
  replies: any[];
  topics: any[];
  concepts: any[];
  lessons: any[];
  badges: any[];
  outcomes: any[];
  curriculum_updates: any[];
  notifications: any[];
  sections: any[];
  [key: string]: any[];
}

// Initial demo seeded records
const initialStore: DbStore = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      display_name: 'Aarav Sharma',
      role: 'student',
      college: 'NIT Karnataka, Mangaluru',
      points: 25,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      display_name: 'Riya Patel',
      role: 'student',
      college: 'COEP Tech University, Pune',
      points: 40,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      display_name: 'Dr. Anand Rao',
      role: 'faculty',
      college: 'IIT Bombay',
      points: 100,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ],
  questions: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      author_id: '00000000-0000-0000-0000-000000000001',
      text: 'Why does integration by parts work, and how do I pick u vs dv?',
      spoken_answer: 'Integration by parts is essentially the product rule of differentiation run in reverse.',
      steps: [
        {
          step: 1,
          title: 'Product Rule Origin',
          explanation: 'Start with $\\frac{d}{dx}[u(x)v(x)] = u\'(x)v(x) + u(x)v\'(x)$.',
        },
        {
          step: 2,
          title: 'Rearrange and Integrate',
          explanation: 'Integrating both sides gives $\\int u \\, dv = uv - \\int v \\, du$.',
        },
      ],
      refresher: 'Remember the product rule: the derivative of a product is $u\'v + uv\'$.',
      subject: 'Mathematics',
      concept: 'Integration by Parts',
      root_cause: 'Product Rule of Differentiation',
      visibility: 'anonymous',
      resolution_status: 'resolved',
      college: 'NIT Karnataka, Mangaluru',
      report_count: 0,
      is_hidden: false,
      published_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      author_id: '00000000-0000-0000-0000-000000000002',
      text: 'How do resource allocation graphs detect deadlocks in multi-instance systems?',
      spoken_answer: 'Cycles in resource allocation graphs indicate deadlock only when resources have single instances; for multi-instances, reduction algorithms are required.',
      steps: [
        {
          step: 1,
          title: 'Graph Nodes and Edges',
          explanation: 'Processes and resources form nodes; request and assignment edges define state.',
        },
      ],
      refresher: 'Review Bankers Algorithm safety state conditions.',
      subject: 'Computer Science',
      concept: 'Deadlock Detection',
      root_cause: 'Resource Allocation Graph reduction',
      visibility: 'anonymous',
      resolution_status: 'open',
      college: 'COEP Tech University, Pune',
      report_count: 0,
      is_hidden: false,
      published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      author_id: '00000000-0000-0000-0000-000000000001',
      text: 'Why does MC = MR yield profit maximization rather than maximum revenue?',
      spoken_answer: 'Profit is total revenue minus total cost. Taking the first derivative with respect to quantity sets marginal profit to zero.',
      steps: [
        {
          step: 1,
          title: 'Derivative of Profit Function',
          explanation: '$\\Pi(Q) = TR(Q) - TC(Q) \\implies \\frac{d\\Pi}{dQ} = MR - MC = 0$.',
        },
      ],
      refresher: 'First derivative optimization condition for finding local maxima.',
      subject: 'Economics',
      concept: 'Profit Maximization',
      root_cause: 'Marginal Analysis and First Derivative Tests',
      visibility: 'anonymous',
      resolution_status: 'open',
      college: 'NIT Karnataka, Mangaluru',
      report_count: 0,
      is_hidden: false,
      published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
    },
  ],
  answers: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      question_id: '10000000-0000-0000-0000-000000000001',
      author_id: '00000000-0000-0000-0000-000000000002',
      text: 'A handy heuristic is the LIATE rule (Logarithmic, Inverse trig, Algebraic, Trig, Exponential). Choose u based on whichever appears earlier in LIATE!',
      is_ai: false,
      is_staff_verified: true,
      report_count: 0,
      is_hidden: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  votes: [],
  projects: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      owner_id: '00000000-0000-0000-0000-000000000001',
      title: 'Autonomous Agricultural Drone with Edge AI',
      description: 'Building an autonomous aerial monitoring drone using Raspberry Pi and YOLOv8 for crop disease detection.',
      tags: ['Computer Vision', 'Embedded Systems', 'Robotics'],
      roles_needed: ['Computer Vision Engineer', 'Flight Dynamics specialist'],
      link: 'https://github.com/demo/agri-drone',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  contributions: [
    {
      id: '40000000-0000-0000-0000-000000000001',
      project_id: '30000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      message: 'I have experience deploying quantized ONNX models on Edge devices. Would love to collaborate from Pune!',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  points_log: [
    {
      id: '50000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      action: 'ASK_QUESTION',
      points: 5,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000001',
      action: 'PUBLISH_ANONYMOUS',
      points: 5,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      user_id: '00000000-0000-0000-0000-000000000001',
      action: 'POST_PROJECT',
      points: 15,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  reports: [],
  ai_rate_limits: [],
  courses: [
    { id: "cs201", name: "Data Structures", sections: ["A", "B"] },
    { id: "cs204", name: "Database Systems", sections: ["A"] },
    { id: "cs210", name: "Operating Systems", sections: ["A", "B"] },
  ],
  posts: [
    {
      id: "p1",
      author: "Anonymous",
      anonymous: true,
      tag: "Question",
      body: "Is a stack overflow in recursion always caused by a missing base case, or can the input just be too deep?",
      createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      upvotes: 12,
      upvoted: false,
      replies: [
        {
          id: "r1",
          author: "Demo Student B",
          body: "Both can cause it. A correct base case can still overflow if the depth is very large.",
          createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
        },
      ],
    },
    {
      id: "p2",
      author: "Demo Student C",
      anonymous: false,
      tag: "Resource",
      body: "Sharing my notes on the three normal forms, with one worked example for each.",
      createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
      upvotes: 8,
      upvoted: false,
      replies: [],
    },
    {
      id: "p3",
      author: "Demo Student D",
      anonymous: false,
      tag: "Question",
      body: "Why is a hash table lookup O(1) on average but O(n) in the worst case?",
      createdAt: new Date(Date.now() - 600 * 60000).toISOString(),
      upvotes: 5,
      upvoted: false,
      replies: [],
    },
  ],
  replies: [],
  topics: [
    { id: "t1", courseId: "cs201", name: "Recursion", heat: 62 },
    { id: "t2", courseId: "cs201", name: "Linked lists", heat: 28 },
    { id: "t3", courseId: "cs201", name: "Binary trees", heat: 36 },
    { id: "t4", courseId: "cs201", name: "Hashing", heat: 18 },
    { id: "t5", courseId: "cs201", name: "Big O", heat: 30 },
    { id: "t6", courseId: "cs201", name: "Graph traversal", heat: 48 },
    { id: "t7", courseId: "cs204", name: "Normalization", heat: 44 },
    { id: "t8", courseId: "cs204", name: "SQL joins", heat: 24 },
    { id: "t9", courseId: "cs204", name: "Transactions", heat: 52 },
    { id: "t10", courseId: "cs204", name: "Indexing", heat: 38 },
    { id: "t11", courseId: "cs204", name: "ER diagrams", heat: 20 },
    { id: "t12", courseId: "cs204", name: "Query planning", heat: 58 },
    { id: "t13", courseId: "cs210", name: "Deadlocks", heat: 52 },
    { id: "t14", courseId: "cs210", name: "Paging", heat: 40 },
    { id: "t15", courseId: "cs210", name: "Scheduling", heat: 34 },
    { id: "t16", courseId: "cs210", name: "Semaphores", heat: 66 },
    { id: "t17", courseId: "cs210", name: "Virtual memory", heat: 46 },
    { id: "t18", courseId: "cs210", name: "File systems", heat: 22 },
  ],
  concepts: [
    {
      groups: [
        { id: "ds", name: "Data structures", cx: 170, cy: 200, rx: 140, ry: 150, lx: 40, ly: 44 },
        { id: "alg", name: "Algorithms", cx: 490, cy: 165, rx: 130, ry: 125, lx: 385, ly: 34 },
        { id: "db", name: "Databases", cx: 465, cy: 345, rx: 180, ry: 48, lx: 295, ly: 291 },
      ],
      nodes: [
        { id: "arrays", label: "Arrays", x: 110, y: 100, mastery: 80, group: "ds" },
        { id: "lists", label: "Linked lists", x: 230, y: 70, mastery: 70, group: "ds" },
        { id: "stacks", label: "Stacks", x: 100, y: 210, mastery: 65, group: "ds" },
        { id: "trees", label: "Trees", x: 240, y: 190, mastery: 40, group: "ds" },
        { id: "hashing", label: "Hashing", x: 170, y: 320, mastery: 30, group: "ds" },
        { id: "recursion", label: "Recursion", x: 400, y: 110, mastery: 45, group: "alg" },
        { id: "sorting", label: "Sorting", x: 540, y: 70, mastery: 72, group: "alg" },
        { id: "bigo", label: "Big O", x: 560, y: 190, mastery: 55, group: "alg" },
        { id: "graphs", label: "Graph traversal", x: 420, y: 250, mastery: 35, group: "alg" },
        { id: "joins", label: "SQL joins", x: 600, y: 330, mastery: 60, group: "db" },
        { id: "norm", label: "Normalization", x: 470, y: 355, mastery: 44, group: "db" },
        { id: "index", label: "Indexing", x: 330, y: 340, mastery: 38, group: "db" },
      ],
      links: [
        ["arrays", "lists"],
        ["arrays", "stacks"],
        ["lists", "trees"],
        ["stacks", "recursion"],
        ["trees", "recursion"],
        ["trees", "graphs"],
        ["recursion", "sorting"],
        ["sorting", "bigo"],
        ["bigo", "graphs"],
        ["hashing", "index"],
        ["trees", "index"],
        ["joins", "norm"],
        ["norm", "index"],
        ["hashing", "arrays"],
        ["graphs", "recursion"],
      ],
    },
  ],
  lessons: [
    {
      id: "l1",
      title: "Recursion in four steps",
      concept: "Recursion",
      minutes: 6,
      completed: false,
      steps: [
        { title: "Find the base case", body: "Every recursive function needs a case it can answer without calling itself. Write that first." },
        { title: "Shrink the problem", body: "Each call must move toward the base case, for example by passing n minus 1." },
        { title: "Trust the call", body: "Assume the recursive call returns the right answer for the smaller input, then use it to build your answer." },
        { title: "Trace a small input", body: "Walk factorial of 3 by hand: 3 times factorial of 2, then 2 times factorial of 1, then 1 times factorial of 0, which is 1." },
      ],
    },
    {
      id: "l2",
      title: "Pointers without panic",
      concept: "Pointers",
      minutes: 7,
      completed: false,
      steps: [
        { title: "A pointer stores an address", body: "A variable holds a value. A pointer holds the memory address where a value lives." },
        { title: "Dereference to reach the value", body: "Using the pointer with the star operator reads or writes the value at that address." },
        { title: "Pass an address to change the original", body: "Passing a pointer to a function lets it modify the caller's variable instead of a copy." },
        { title: "Avoid null and dangling pointers", body: "Check for null before dereferencing, and never use a pointer after the memory it points to has been freed." },
      ],
    },
  ],
  badges: [
    { id: "b1", name: "First question", text: "Asked your first question.", earned: true },
    { id: "b2", name: "Three day streak", text: "Studied three days in a row.", earned: true },
    { id: "b3", name: "Lesson finisher", text: "Completed a micro lesson.", earned: false },
    { id: "b4", name: "Helper", text: "Replied to five community posts.", earned: false },
    { id: "b5", name: "Project starter", text: "Posted a college project.", earned: false },
    { id: "b6", name: "Pulse sender", text: "Sent a Live Confusion Pulse.", earned: false },
  ],
  outcomes: [
    { courseId: "cs201", code: "CO1", text: "Analyse the time complexity of algorithms", target: 60, attainment: 68 },
    { courseId: "cs201", code: "CO2", text: "Implement linear and tree data structures", target: 60, attainment: 52 },
    { courseId: "cs201", code: "CO3", text: "Apply recursion to divide and conquer problems", target: 60, attainment: 47 },
    { courseId: "cs201", code: "CO4", text: "Select hash based structures for lookup problems", target: 60, attainment: 71 },
    { courseId: "cs204", code: "CO1", text: "Design entity relationship models", target: 60, attainment: 74 },
    { courseId: "cs204", code: "CO2", text: "Write SQL queries across multiple tables", target: 60, attainment: 58 },
    { courseId: "cs204", code: "CO3", text: "Normalize relational schemas", target: 60, attainment: 49 },
    { courseId: "cs204", code: "CO4", text: "Reason about transactions and concurrency", target: 60, attainment: 55 },
    { courseId: "cs210", code: "CO1", text: "Compare CPU scheduling algorithms", target: 60, attainment: 66 },
    { courseId: "cs210", code: "CO2", text: "Solve synchronization problems", target: 60, attainment: 46 },
    { courseId: "cs210", code: "CO3", text: "Explain memory management techniques", target: 60, attainment: 59 },
    { courseId: "cs210", code: "CO4", text: "Describe file system structures", target: 60, attainment: 72 },
  ],
  curriculum_updates: [
    {
      id: "u1",
      title: "Unit 3 now includes balanced trees",
      course: "Data Structures",
      section: "A",
      effective: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      body: "AVL trees are added to Unit 3. Rotations will be covered in the lecture and assessed in the internal test.",
      publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: "u2",
      title: "Lab schedule moved",
      course: "Database Systems",
      section: "A",
      effective: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      body: "The SQL lab moves from Thursday to Friday this week because of the seminar.",
      publishedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ],
  notifications: [
    {
      id: "n1",
      audience: "student",
      type: "Doubt",
      text: "Your question about recursion has a worked answer.",
      createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
      read: false,
    },
    {
      id: "n2",
      audience: "student",
      type: "Community",
      text: "Someone replied to your community post.",
      createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      read: false,
    },
    {
      id: "n3",
      audience: "student",
      type: "Curriculum",
      text: "Syllabus update for Data Structures, Section A.",
      createdAt: new Date(Date.now() - 2880 * 60000).toISOString(),
      read: true,
    },
    {
      id: "n4",
      audience: "faculty",
      type: "Confusion",
      text: "Semaphores is the most flagged topic in Operating Systems.",
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      read: false,
    },
    {
      id: "n5",
      audience: "faculty",
      type: "Doubt",
      text: "Three new questions were raised in Data Structures.",
      createdAt: new Date(Date.now() - 190 * 60000).toISOString(),
      read: false,
    },
  ],
  sections: [
    { course: "Data Structures", section: "A", enrolled: 58, openDoubts: 6, flagged: 3 },
    { course: "Data Structures", section: "B", enrolled: 54, openDoubts: 4, flagged: 2 },
    { course: "Database Systems", section: "A", enrolled: 60, openDoubts: 5, flagged: 2 },
    { course: "Operating Systems", section: "A", enrolled: 57, openDoubts: 8, flagged: 4 },
  ],
};

// Global singleton in-memory database instance
class InMemoryDatabase {
  private store: DbStore;

  constructor() {
    this.store = JSON.parse(JSON.stringify(initialStore));
  }

  from(tableName: keyof DbStore) {
    return new QueryBuilder(this.store, tableName);
  }

  rpc(functionName: string, params: any) {
    if (functionName === 'consume_ai_rate_limit') {
      const { p_key, p_window_seconds, p_max_requests } = params;
      const now = Date.now();
      let entry = this.store.ai_rate_limits.find((item) => item.key === p_key);

      if (!entry || now - new Date(entry.window_started_at).getTime() >= p_window_seconds * 1000) {
        entry = {
          key: p_key,
          window_started_at: new Date(now).toISOString(),
          request_count: 0,
        };
        this.store.ai_rate_limits = this.store.ai_rate_limits.filter(
          (item) => now - new Date(item.window_started_at).getTime() < 24 * 60 * 60 * 1000
        );
        this.store.ai_rate_limits.push(entry);
      }

      entry.request_count += 1;
      return Promise.resolve({
        data: {
          allowed: entry.request_count <= p_max_requests,
          remaining: Math.max(0, p_max_requests - entry.request_count),
        },
        error: null,
      });
    }

    if (functionName === 'award_user_points') {
      const { p_user_id, p_action, p_points } = params;
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      // Check if action already awarded
      const alreadyAwarded = this.store.points_log.some(
        (l) => l.user_id === p_user_id && l.action === p_action
      );
      if (alreadyAwarded) {
        let user = this.store.users.find((u) => u.id === p_user_id);
        const logsToday = this.store.points_log.filter(
          (l) => l.user_id === p_user_id && new Date(l.created_at) >= startOfDay
        );
        const pointsToday = logsToday.reduce((sum, l) => sum + (l.points || 0), 0);
        return Promise.resolve({
          data: {
            awarded: 0,
            requested: p_points,
            points_today: pointsToday,
            daily_cap: 100,
            total_points: user?.points || 0,
            duplicate: true,
          },
          error: null,
        });
      }

      const logsToday = this.store.points_log.filter(
        (l) => l.user_id === p_user_id && new Date(l.created_at) >= startOfDay
      );
      const pointsToday = logsToday.reduce((sum, l) => sum + (l.points || 0), 0);
      const allowable = Math.max(0, Math.min(p_points, 100 - pointsToday));

      let user = this.store.users.find((u) => u.id === p_user_id);
      if (!user) {
        user = {
          id: p_user_id,
          display_name: 'Student',
          role: 'student',
          college: 'IIT',
          points: 0,
          created_at: new Date().toISOString(),
        };
        this.store.users.push(user);
      }

      if (allowable > 0) {
        this.store.points_log.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
          user_id: p_user_id,
          action: p_action,
          points: allowable,
          created_at: new Date().toISOString(),
        });
        user.points += allowable;
      }

      return Promise.resolve({
        data: {
          awarded: allowable,
          requested: p_points,
          points_today: pointsToday + allowable,
          daily_cap: 100,
          total_points: user.points,
        },
        error: null,
      });
    }

    return Promise.resolve({ data: null, error: { message: `Unknown RPC function ${functionName}` } });
  }
}

class QueryBuilder {
  private store: DbStore;
  private table: keyof DbStore;
  private filters: ((item: any) => boolean)[] = [];
  private orderField?: string;
  private orderAscending: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private countOptions?: any;

  constructor(store: DbStore, table: keyof DbStore) {
    this.store = store;
    this.table = table;
    if (!this.store[table]) {
      this.store[table] = [];
    }
  }

  select(fields?: string, options?: any) {
    this.countOptions = options;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push((item) => item[field] !== value);
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push((item) => (item[field] || 0) < value);
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push((item) => {
      if (item[field] instanceof Date || typeof item[field] === 'string') {
        return new Date(item[field]) >= new Date(value);
      }
      return item[field] >= value;
    });
    return this;
  }

  ilike(field: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((item) => {
      const val = String(item[field] || '').toLowerCase();
      return val.includes(cleanPattern);
    });
    return this;
  }

  contains(field: string, values: any[]) {
    this.filters.push((item) => {
      const arr = item[field];
      if (!Array.isArray(arr)) return false;
      return values.every((v) => arr.includes(v));
    });
    return this;
  }

  order(field: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderField = field;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this.execute();
  }

  insert(record: any) {
    const tableItems = this.store[this.table];
    const newItems = Array.isArray(record) ? record : [record];
    const created: any[] = [];

    for (const item of newItems) {
      const newItem = {
        id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`),
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      };
      tableItems.push(newItem);
      created.push(newItem);
    }

    const resultData = Array.isArray(record) ? created : created[0];
    return {
      select: (fields?: string) => ({
        single: async () => ({ data: created[0], error: null }),
        maybeSingle: async () => ({ data: created[0], error: null }),
        then: (resolve: any) => Promise.resolve({ data: resultData, error: null }).then(resolve),
      }),
      then: (resolve: any) => Promise.resolve({ data: resultData, error: null }).then(resolve),
      data: resultData,
      error: null,
    };
  }

  update(patch: any) {
    const applyUpdate = () => {
      const tableItems = this.store[this.table];
      const matched = tableItems.filter((item) => this.filters.every((f) => f(item)));
      for (const item of matched) {
        Object.assign(item, patch);
      }
      return matched;
    };

    const self = this;
    const builder = {
      eq(field: string, value: any) {
        self.eq(field, value);
        return builder;
      },
      select(fields?: string) {
        return {
          single: async () => {
            const matched = applyUpdate();
            return { data: matched[0] || null, error: null };
          },
          maybeSingle: async () => {
            const matched = applyUpdate();
            return { data: matched[0] || null, error: null };
          },
          then: (resolve: any) => {
            const matched = applyUpdate();
            return Promise.resolve({ data: matched, error: null }).then(resolve);
          },
        };
      },
      then(resolve: any) {
        const matched = applyUpdate();
        return Promise.resolve({ data: matched, error: null }).then(resolve);
      },
    };

    return builder;
  }

  private execute(): Promise<{ data: any; error: any }> {
    let items = (this.store[this.table] || []).filter((item) =>
      this.filters.every((f) => f(item))
    );

    // Deep clone items so modifications don't corrupt in unexpected ways
    items = JSON.parse(JSON.stringify(items));

    // Handle joins / relations for questions -> answers, projects -> contributions, etc.
    if (this.table === 'questions') {
      for (const q of items) {
        q.answers = this.store.answers
          .filter((a) => a.question_id === q.id)
          .map((a) => {
            const author = this.store.users.find((u) => u.id === a.author_id);
            return { ...a, author };
          });
      }
    } else if (this.table === 'projects') {
      for (const p of items) {
        p.owner = this.store.users.find((u) => u.id === p.owner_id);
        p.contributions = this.store.contributions
          .filter((c) => c.project_id === p.id)
          .map((c) => {
            const user = this.store.users.find((u) => u.id === c.user_id);
            return { ...c, user };
          });
      }
    } else if (this.table === 'contributions') {
      for (const c of items) {
        c.project = this.store.projects.find((p) => p.id === c.project_id);
        c.applicant = this.store.users.find((u) => u.id === c.user_id);
      }
    }

    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAscending;
      items.sort((a, b) => {
        if (a[field] < b[field]) return asc ? -1 : 1;
        if (a[field] > b[field]) return asc ? 1 : -1;
        return 0;
      });
    }

    if (typeof this.limitCount === 'number') {
      items = items.slice(0, this.limitCount);
    }

    if (this.countOptions?.count === 'exact') {
      return Promise.resolve({
        count: items.length,
        data: this.countOptions.head ? null : items,
        error: null,
      });
    }

    if (this.isSingle) {
      if (items.length === 0) {
        return Promise.resolve({ data: null, error: { message: 'Row not found' } });
      }
      return Promise.resolve({ data: items[0], error: null });
    }

    if (this.isMaybeSingle) {
      return Promise.resolve({ data: items[0] || null, error: null });
    }

    return Promise.resolve({ data: items, error: null });
  }

  then(resolve: (res: { data: any; error: any }) => void) {
    return this.execute().then(resolve);
  }
}

let inMemoryDbInstance: InMemoryDatabase | null = null;

export function getInMemoryDb(): InMemoryDatabase {
  if (!inMemoryDbInstance) {
    inMemoryDbInstance = new InMemoryDatabase();
  }
  return inMemoryDbInstance;
}
