import {
  User,
  Question,
  Answer,
  Project,
  Contribution,
  CurriculumPost,
  PulseItem,
  ConceptCluster,
  NotificationItem,
} from "./types";

/**
 * 🗂 Preloaded demo data — this content was added before the demo to show realistic usage.
 * Explicitly aligned with the Hackathon User Flows Specification:
 * - 2 Students: Arjun Sharma (IIT Bombay), Riya Patel (NIT Trichy)
 * - 2 Faculty: Dr. Priya Ramanathan (IIT Madras), Prof. Mehta (BITS Pilani)
 * - Seed clusters: Eigenvalues (7), Integration (5), Recursion (4)
 */

export const DEMO_DATA_BANNER = "🗂 Preloaded demo data — this content was added before the demo to show realistic usage.";

export const DEMO_USERS: User[] = [
  {
    id: "usr_student_1",
    display_name: "Arjun Sharma",
    role: "student",
    college: "IIT Bombay",
    points: 85,
  },
  {
    id: "usr_student_2",
    display_name: "Riya Patel",
    role: "student",
    college: "NIT Trichy",
    points: 110,
  },
  {
    id: "usr_faculty_1",
    display_name: "Dr. Priya Ramanathan",
    role: "faculty",
    college: "IIT Madras",
    points: 340,
  },
  {
    id: "usr_faculty_2",
    display_name: "Prof. Mehta",
    role: "faculty",
    college: "BITS Pilani",
    points: 290,
  },
];

export const DEMO_PULSE: PulseItem[] = [
  {
    concept: "Eigenvalues & Diagonalization",
    count: 7,
    subject: "Engineering Mathematics",
    threshold: 3,
    is_alert: true,
    last_question_time: "2 mins ago",
  },
  {
    concept: "Integration by Parts & Recurrence",
    count: 5,
    subject: "Calculus",
    threshold: 3,
    is_alert: true,
    last_question_time: "4 mins ago",
  },
  {
    concept: "Dynamic Programming & Recursion Tree",
    count: 4,
    subject: "Data Structures & Algorithms",
    threshold: 3,
    is_alert: true,
    last_question_time: "7 mins ago",
  },
  {
    concept: "MOSFET Saturation vs Triode",
    count: 2,
    subject: "Analog Electronics",
    threshold: 3,
    is_alert: false,
    last_question_time: "12 mins ago",
  },
];

export const DEMO_CLUSTERS: ConceptCluster[] = [
  {
    concept: "Eigenvalues & Diagonalization",
    subject: "Engineering Mathematics",
    root_cause: "Students confuse matrix characteristic equation det(A - λI) = 0 with scalar roots of polynomial factors.",
    count: 7,
    colleges: ["IIT Bombay", "NIT Trichy", "Anna University"],
    silent_doubt_rate: 85,
    sample_context: "7 students asked privately in the last 15 min. None felt comfortable asking during live lecture.",
  },
  {
    concept: "Integration by Parts & Recurrence",
    subject: "Calculus",
    root_cause: "Sign errors and looping in reduction formulas where u and dv choices oscillate recursively.",
    count: 5,
    colleges: ["BITS Pilani", "IIT Delhi", "IIT Madras"],
    silent_doubt_rate: 80,
    sample_context: "5 private doubts in Calculus tutorial. High silent doubt rate across freshman batches.",
  },
  {
    concept: "Dynamic Programming & Recursion Tree",
    subject: "Data Structures & Algorithms",
    root_cause: "Struggling to map overlapping subproblem states to 1D/2D memo table indices before recursion executes.",
    count: 4,
    colleges: ["DTU Delhi", "IIT Bombay"],
    silent_doubt_rate: 75,
    sample_context: "4 private queries during lab session.",
  },
];

export const DEMO_QUESTIONS: Question[] = [
  {
    id: "q_101",
    author_id: "usr_student_1",
    text: "Why do we subtract lambda times the identity matrix when finding eigenvalues?",
    spoken_answer:
      "When finding eigenvalues, we want to solve A v equals lambda v. Rearranging gives A v minus lambda I v equals zero. For non-zero vectors v to exist, the determinant of A minus lambda I must strictly equal zero.",
    steps: [
      {
        step_number: 1,
        title: "The Definition of Eigenvectors",
        explanation: "An eigenvector satisfies the linear mapping where transformation matrix A acts merely as scalar scaling by factor \\lambda:",
        latex: "A \\mathbf{v} = \\lambda \\mathbf{v}",
      },
      {
        step_number: 2,
        title: "Algebraic Factorization",
        explanation: "To factor vector \\mathbf{v}, replace scalar \\lambda with scalar matrix \\lambda I:",
        latex: "A \\mathbf{v} - \\lambda I \\mathbf{v} = \\mathbf{0} \\implies (A - \\lambda I)\\mathbf{v} = \\mathbf{0}",
      },
      {
        step_number: 3,
        title: "Condition for Non-trivial Solutions",
        explanation: "If (A - \\lambda I) had an inverse, the only solution would be \\mathbf{v} = \\mathbf{0}. Thus the determinant must vanish:",
        latex: "\\det(A - \\lambda I) = 0",
      },
    ],
    subject: "Engineering Mathematics",
    concept: "Eigenvalues & Diagonalization",
    root_cause: "Matrix scalar scaling vs identity transformation",
    visibility: "anonymous",
    resolution_status: "resolved",
    college: "IIT Bombay",
    created_at: "22 mins ago",
    upvotes_count: 14,
    answers_count: 2,
  },
  {
    id: "q_102",
    author_id: "usr_student_2",
    text: "How do we choose u and dv in integration by parts to avoid an infinite loop in recurrence relations?",
    spoken_answer:
      "Use the LIATE priority rule: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential. When an integral loops back to itself, treat the original integral as variable I and solve the resulting algebraic equation algebraically.",
    steps: [
      {
        step_number: 1,
        title: "Integration by Parts Formula",
        explanation: "Derived from the product rule of differentiation:",
        latex: "\\int u \\, dv = u v - \\int v \\, du",
      },
      {
        step_number: 2,
        title: "Cyclic Recurrence Recovery",
        explanation: "After applying parts twice, the original integral reappears with opposite sign:",
        latex: "I = e^{ax}\\sin(bx) - \\frac{b^2}{a^2} I \\implies I\\left(1 + \\frac{b^2}{a^2}\\right) = \\text{remainder}",
      },
    ],
    subject: "Calculus",
    concept: "Integration by Parts & Recurrence",
    root_cause: "Cyclic reduction formula algebra vs repeated differentiation",
    visibility: "anonymous",
    resolution_status: "still_stuck",
    college: "NIT Trichy",
    created_at: "35 mins ago",
    upvotes_count: 9,
    answers_count: 1,
  },
];

export const DEMO_ANSWERS: Record<string, Answer[]> = {
  q_101: [
    {
      id: "ans_1",
      question_id: "q_101",
      author_id: "usr_faculty_1",
      author_name: "Dr. Priya Ramanathan",
      author_role: "faculty",
      author_college: "IIT Madras",
      text: "Spot on explanation. Remember: whenever a linear system (M)v = 0 has infinite directions for v, M must collapse dimension, meaning det(M) = 0. Always verify det(A - λI) is polynomial degree n.",
      is_ai: false,
      is_staff_verified: true,
      report_count: 0,
      created_at: "18 mins ago",
      upvotes: 21,
    },
    {
      id: "ans_2",
      question_id: "q_101",
      author_id: "usr_student_2",
      author_name: "Riya Patel",
      author_role: "student",
      author_college: "NIT Trichy",
      text: "A quick geometric intuition: think of eigenvectors as directions that don't rotate under the matrix shear, they only get stretched. The lambda is that stretch multiplier!",
      is_ai: false,
      is_staff_verified: false,
      report_count: 0,
      created_at: "12 mins ago",
      upvotes: 6,
    },
  ],
  q_102: [
    {
      id: "ans_3",
      question_id: "q_102",
      author_id: "usr_faculty_2",
      author_name: "Prof. Mehta",
      author_role: "faculty",
      author_college: "BITS Pilani",
      text: "Whenever exponential and sine terms multiply, expect a cycle after 2 iterations. Do not fear the loop; label the entire LHS as I and solve for I as an unknown variable.",
      is_ai: false,
      is_staff_verified: true,
      report_count: 0,
      created_at: "28 mins ago",
      upvotes: 18,
    },
  ],
};

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    user_id: "usr_student_1",
    clarification_id: "clarif_99",
    status: "unread",
    created_at: "5 mins ago",
    clarification: {
      id: "clarif_99",
      faculty_id: "usr_faculty_1",
      faculty_name: "Dr. Priya Ramanathan (IIT Madras)",
      faculty_college: "IIT Madras",
      concept: "Eigenvalues & Diagonalization",
      title: "Clarification: Why det(A - λI) = 0 is not just a formula",
      body: "Many of you recently asked why we introduce the identity matrix. In linear algebra, a matrix cannot subtract a bare number like A - λ. The identity matrix λI scales all coordinate axes equally so subtraction is dimensionally legal. Once det(A - λI) = 0, we guarantee non-trivial null space.",
      spoken_text:
        "Attention class. You cannot subtract a number from a matrix directly. We multiply lambda by identity to preserve matrix dimensions, then set determinant to zero so eigenvectors can be non-zero.",
      created_at: "5 mins ago",
    },
  },
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: "proj_1",
    owner_id: "usr_student_1",
    owner_name: "Arjun Sharma",
    owner_college: "IIT Bombay",
    title: "EdgeAI Spoken Doubt Recognizer for Low-Bandwidth Rural Classrooms",
    description:
      "Developing an on-device whisper-quantized pipeline to transcribe student acoustic queries without constant 5G connection. Need hardware DSP and WebAudio engineers.",
    tags: ["Embedded AI", "ONNX", "WebAudio", "Speech"],
    roles_needed: ["DSP Engineer", "Next.js Mobile UI", "PyTorch Quantizer"],
    link: "https://github.com/maseeramuzna28/tutor",
    created_at: "2 hours ago",
    contributions_count: 4,
  },
  {
    id: "proj_2",
    owner_id: "usr_student_2",
    owner_name: "Riya Patel",
    owner_college: "NIT Trichy",
    title: "Inter-College Autonomous Rover Swarm Simulator",
    description:
      "Simulating decentralized consensus routing for 20 ground rovers using ROS2 and WebGL. Looking for contributors skilled in kinematics and canvas rendering.",
    tags: ["Robotics", "ROS2", "WebGL", "Control Systems"],
    roles_needed: ["Three.js / Canvas Dev", "Control Systems Lead"],
    link: "https://github.com/maseeramuzna28/tutor",
    created_at: "1 day ago",
    contributions_count: 6,
  },
];

export const DEMO_CURRICULUM: CurriculumPost[] = [
  {
    id: "curr_1",
    faculty_id: "usr_faculty_1",
    faculty_name: "Dr. Priya Ramanathan",
    faculty_college: "IIT Madras",
    title: "Curriculum Update: Linear Algebra in Modern AI Transformers",
    body: "Starting this semester, the Eigenvalues module will directly incorporate the Attention Matrix SVD decomposition and Low-Rank Adaptation (LoRA) formulation used in state-of-the-art LLMs.",
    concept: "Eigenvalues & Diagonalization",
    created_at: "3 hours ago",
  },
  {
    id: "curr_2",
    faculty_id: "usr_faculty_2",
    faculty_name: "Prof. Mehta",
    faculty_college: "BITS Pilani",
    title: "Calculus Revisions: Numerical Integration in Autonomous Path Planning",
    body: "Calculus II tutorials now include real-world spline quadrature exercises mimicking trajectory integration in mobile robots.",
    concept: "Integration by Parts & Recurrence",
    created_at: "1 day ago",
  },
];
