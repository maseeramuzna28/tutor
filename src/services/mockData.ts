// DEMO DATA ONLY. Replaced by real API responses when the backend is connected.
const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

export interface MockUser {
  id: string;
  name: string;
  role: "student" | "faculty";
  college: string;
  department: string;
  year: string;
  bio: string;
  anonymousByDefault: boolean;
  notifyEmail: boolean;
  notifyPulse: boolean;
}

export interface MockCourse {
  id: string;
  name: string;
  sections: string[];
}

export interface MockDoubt {
  id: string;
  question: string;
  createdAt: string;
  status: string;
}

export interface MockPost {
  id: string;
  author: string;
  anonymous: boolean;
  tag: string;
  body: string;
  createdAt: string;
  upvotes: number;
  upvoted: boolean;
  replies: Array<{ id: string; author: string; body: string; createdAt: string }>;
}

export interface MockProject {
  id: string;
  title: string;
  summary: string;
  skills: string[];
  teamSize: number;
  members: number;
  interested: boolean;
}

export interface MockTopic {
  id: string;
  name: string;
  heat: number;
}

export interface MockLesson {
  id: string;
  title: string;
  concept: string;
  minutes: number;
  completed: boolean;
  steps: Array<{ title: string; body: string }>;
}

export interface MockBadge {
  id: string;
  name: string;
  text: string;
  earned: boolean;
}

export interface MockOutcome {
  code: string;
  text: string;
  target: number;
  attainment: number;
}

export interface MockCurriculumUpdate {
  id: string;
  title: string;
  course: string;
  section: string;
  effective: string;
  body: string;
  publishedAt: string;
}

export interface MockNotification {
  id: string;
  audience: "student" | "faculty";
  type: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface MockSection {
  course: string;
  section: string;
  enrolled: number;
  openDoubts: number;
  flagged: number;
}

export const db: {
  users: Record<"student" | "faculty", MockUser>;
  courses: MockCourse[];
  doubts: MockDoubt[];
  posts: MockPost[];
  projects: MockProject[];
  topics: Record<string, MockTopic[]>;
  concepts: {
    groups: Array<{ id: string; name: string; cx: number; cy: number; rx: number; ry: number; lx: number; ly: number }>;
    nodes: Array<{ id: string; label: string; x: number; y: number; mastery: number; group: string }>;
    links: Array<[string, string]>;
  };
  lessons: MockLesson[];
  points: number;
  streak: number;
  badges: MockBadge[];
  leaderboard: {
    class: { week: [string, number][]; all: [string, number][] };
    college: { week: [string, number][]; all: [string, number][] };
  };
  outcomes: Record<string, MockOutcome[]>;
  updates: MockCurriculumUpdate[];
  notifications: MockNotification[];
  sections: MockSection[];
} = {
  users: {
    student: {
      id: "demo_student",
      name: "Demo Student",
      role: "student",
      college: "Demo College of Engineering",
      department: "Computer Science",
      year: "2nd year",
      bio: "",
      anonymousByDefault: false,
      notifyEmail: true,
      notifyPulse: true,
    },
    faculty: {
      id: "demo_faculty",
      name: "Demo Faculty",
      role: "faculty",
      college: "Demo College of Engineering",
      department: "Computer Science",
      year: "",
      bio: "",
      anonymousByDefault: false,
      notifyEmail: true,
      notifyPulse: true,
    },
  },

  courses: [
    { id: "cs201", name: "Data Structures", sections: ["A", "B"] },
    { id: "cs204", name: "Database Systems", sections: ["A"] },
    { id: "cs210", name: "Operating Systems", sections: ["A", "B"] },
  ],

  doubts: [
    { id: "d1", question: "Why does my recursive function never stop?", createdAt: ago(300), status: "answered" },
    { id: "d2", question: "What is the difference between a process and a thread?", createdAt: ago(1560), status: "answered" },
  ],

  posts: [
    {
      id: "p1",
      author: "Anonymous",
      anonymous: true,
      tag: "Question",
      body: "Is a stack overflow in recursion always caused by a missing base case, or can the input just be too deep?",
      createdAt: ago(35),
      upvotes: 12,
      upvoted: false,
      replies: [
        {
          id: "r1",
          author: "Demo Student B",
          body: "Both can cause it. A correct base case can still overflow if the depth is very large.",
          createdAt: ago(20),
        },
      ],
    },
    {
      id: "p2",
      author: "Demo Student C",
      anonymous: false,
      tag: "Resource",
      body: "Sharing my notes on the three normal forms, with one worked example for each.",
      createdAt: ago(180),
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
      createdAt: ago(600),
      upvotes: 5,
      upvoted: false,
      replies: [],
    },
    {
      id: "p4",
      author: "Anonymous",
      anonymous: true,
      tag: "Discussion",
      body: "Round robin scheduling only made sense to me after I drew it on paper. Does anyone have other ways to picture it?",
      createdAt: ago(1440),
      upvotes: 9,
      upvoted: false,
      replies: [],
    },
  ],

  projects: [
    {
      id: "pr1",
      title: "Campus bus tracker",
      summary: "A web app that shows live positions of campus buses on a map.",
      skills: ["React", "Maps", "Node"],
      teamSize: 4,
      members: 2,
      interested: false,
    },
    {
      id: "pr2",
      title: "Lab equipment booking",
      summary: "Let students book lab slots and let staff see usage.",
      skills: ["SQL", "Python", "Forms"],
      teamSize: 3,
      members: 1,
      interested: false,
    },
    {
      id: "pr3",
      title: "Study group matcher",
      summary: "Match students who are weak and strong in complementary topics.",
      skills: ["Python", "Data", "React"],
      teamSize: 5,
      members: 3,
      interested: false,
    },
    {
      id: "pr4",
      title: "Notes search engine",
      summary: "Search across shared class notes by concept, not just keyword.",
      skills: ["Search", "Node", "UI design"],
      teamSize: 4,
      members: 1,
      interested: false,
    },
  ],

  topics: {
    cs201: [
      { id: "t1", name: "Recursion", heat: 62 },
      { id: "t2", name: "Linked lists", heat: 28 },
      { id: "t3", name: "Binary trees", heat: 36 },
      { id: "t4", name: "Hashing", heat: 18 },
      { id: "t5", name: "Big O", heat: 30 },
      { id: "t6", name: "Graph traversal", heat: 48 },
    ],
    cs204: [
      { id: "t7", name: "Normalization", heat: 44 },
      { id: "t8", name: "SQL joins", heat: 24 },
      { id: "t9", name: "Transactions", heat: 52 },
      { id: "t10", name: "Indexing", heat: 38 },
      { id: "t11", name: "ER diagrams", heat: 20 },
      { id: "t12", name: "Query planning", heat: 58 },
    ],
    cs210: [
      { id: "t13", name: "Deadlocks", heat: 52 },
      { id: "t14", name: "Paging", heat: 40 },
      { id: "t15", name: "Scheduling", heat: 34 },
      { id: "t16", name: "Semaphores", heat: 66 },
      { id: "t17", name: "Virtual memory", heat: 46 },
      { id: "t18", name: "File systems", heat: 22 },
    ],
  },

  concepts: {
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
    {
      id: "l3",
      title: "Reading Big O",
      concept: "Big O",
      minutes: 5,
      completed: false,
      steps: [
        { title: "Count the basic steps", body: "Count how many basic operations the algorithm does as the input size n grows." },
        { title: "Ignore constants", body: "Doing 3n steps and doing n steps grow the same way, so both are O of n." },
        { title: "Keep the fastest growing term", body: "n squared plus n is O of n squared, because the squared term dominates for large n." },
        { title: "Compare growth rates", body: "From slowest to fastest growth: constant, logarithmic, linear, n log n, quadratic, exponential." },
      ],
    },
    {
      id: "l4",
      title: "Normalization step by step",
      concept: "Normalization",
      minutes: 8,
      completed: false,
      steps: [
        { title: "Start with one wide table", body: "List every attribute you want to store and note which ones repeat." },
        { title: "First normal form", body: "Each cell holds a single value and each row is unique." },
        { title: "Second normal form", body: "Every non key column depends on the whole key, not just part of it." },
        { title: "Third normal form", body: "Non key columns depend only on the key, not on other non key columns." },
      ],
    },
  ],

  points: 240,
  streak: 4,

  badges: [
    { id: "b1", name: "First question", text: "Asked your first question.", earned: true },
    { id: "b2", name: "Three day streak", text: "Studied three days in a row.", earned: true },
    { id: "b3", name: "Lesson finisher", text: "Completed a micro lesson.", earned: false },
    { id: "b4", name: "Helper", text: "Replied to five community posts.", earned: false },
    { id: "b5", name: "Project starter", text: "Posted a college project.", earned: false },
    { id: "b6", name: "Pulse sender", text: "Sent a Live Confusion Pulse.", earned: false },
  ],

  leaderboard: {
    class: {
      week: [
        ["Demo Student A", 180],
        ["Demo Student B", 150],
        ["Demo Student C", 120],
        ["Demo Student D", 90],
        ["Demo Student E", 60],
      ],
      all: [
        ["Demo Student A", 1240],
        ["Demo Student B", 980],
        ["Demo Student C", 760],
        ["Demo Student D", 410],
        ["Demo Student E", 300],
      ],
    },
    college: {
      week: [
        ["Demo Student F", 260],
        ["Demo Student A", 180],
        ["Demo Student G", 170],
        ["Demo Student B", 150],
        ["Demo Student H", 140],
      ],
      all: [
        ["Demo Student F", 2100],
        ["Demo Student G", 1500],
        ["Demo Student A", 1240],
        ["Demo Student H", 1100],
        ["Demo Student B", 980],
      ],
    },
  },

  outcomes: {
    cs201: [
      { code: "CO1", text: "Analyse the time complexity of algorithms", target: 60, attainment: 68 },
      { code: "CO2", text: "Implement linear and tree data structures", target: 60, attainment: 52 },
      { code: "CO3", text: "Apply recursion to divide and conquer problems", target: 60, attainment: 47 },
      { code: "CO4", text: "Select hash based structures for lookup problems", target: 60, attainment: 71 },
    ],
    cs204: [
      { code: "CO1", text: "Design entity relationship models", target: 60, attainment: 74 },
      { code: "CO2", text: "Write SQL queries across multiple tables", target: 60, attainment: 58 },
      { code: "CO3", text: "Normalize relational schemas", target: 60, attainment: 49 },
      { code: "CO4", text: "Reason about transactions and concurrency", target: 60, attainment: 55 },
    ],
    cs210: [
      { code: "CO1", text: "Compare CPU scheduling algorithms", target: 60, attainment: 66 },
      { code: "CO2", text: "Solve synchronization problems", target: 60, attainment: 46 },
      { code: "CO3", text: "Explain memory management techniques", target: 60, attainment: 59 },
      { code: "CO4", text: "Describe file system structures", target: 60, attainment: 72 },
    ],
  },

  updates: [
    {
      id: "u1",
      title: "Unit 3 now includes balanced trees",
      course: "Data Structures",
      section: "A",
      effective: inDays(7),
      body: "AVL trees are added to Unit 3. Rotations will be covered in the lecture and assessed in the internal test.",
      publishedAt: ago(2880),
    },
    {
      id: "u2",
      title: "Lab schedule moved",
      course: "Database Systems",
      section: "A",
      effective: inDays(3),
      body: "The SQL lab moves from Thursday to Friday this week because of the seminar.",
      publishedAt: ago(4300),
    },
  ],

  notifications: [
    {
      id: "n1",
      audience: "student",
      type: "Doubt",
      text: "Your question about recursion has a worked answer.",
      createdAt: ago(40),
      read: false,
    },
    {
      id: "n2",
      audience: "student",
      type: "Community",
      text: "Someone replied to your community post.",
      createdAt: ago(120),
      read: false,
    },
    {
      id: "n3",
      audience: "student",
      type: "Curriculum",
      text: "Syllabus update for Data Structures, Section A.",
      createdAt: ago(2880),
      read: true,
    },
    {
      id: "n4",
      audience: "faculty",
      type: "Confusion",
      text: "Semaphores is the most flagged topic in Operating Systems.",
      createdAt: ago(25),
      read: false,
    },
    {
      id: "n5",
      audience: "faculty",
      type: "Doubt",
      text: "Three new questions were raised in Data Structures.",
      createdAt: ago(190),
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
