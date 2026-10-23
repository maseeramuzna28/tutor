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
