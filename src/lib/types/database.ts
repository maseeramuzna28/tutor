// Database and API Data Models for TUTO

export type UserRole = 'student' | 'faculty';

export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  college: string;
  points: number;
  created_at: string;
}

export type QuestionVisibility = 'private' | 'anonymous';
export type ResolutionStatus = 'open' | 'resolved' | 'still_stuck';

export interface QuestionStep {
  step: number;
  title: string;
  explanation: string;
  equation_or_code?: string;
  teaching_speech?: string;
  check_question?: string;
  auto_notes?: string;
}

export interface Question {
  id: string;
  author_id: string;
  text: string;
  spoken_answer: string | null;
  steps: QuestionStep[];
  refresher: string | null;
  subject: string | null;
  concept: string | null;
  root_cause: string | null;
  visibility: QuestionVisibility;
  resolution_status: ResolutionStatus;
  college: string;
  report_count: number;
  is_hidden: boolean;
  published_at?: string | null;
  created_at: string;
  author?: {
    display_name: string;
    college: string;
  };
}

export interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  text: string;
  is_ai: boolean;
  is_staff_verified: boolean;
  report_count: number;
  is_hidden: boolean;
  created_at: string;
  author?: {
    display_name: string;
    role: UserRole;
    college: string;
  };
  votes_count?: number;
  user_voted?: boolean;
}

export interface Vote {
  id: string;
  user_id: string;
  target_type: 'question' | 'answer';
  target_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  tags: string[];
  roles_needed: string[];
  link: string | null;
  created_at: string;
  owner?: {
    display_name: string;
    college: string;
  };
  contributors_count?: number;
  accepted_contributors?: {
    user_id: string;
    display_name: string;
    college: string;
  }[];
}

export type ContributionStatus = 'pending' | 'accepted' | 'declined';

export interface Contribution {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  status: ContributionStatus;
  created_at: string;
  applicant?: {
    display_name: string;
    college: string;
  };
  project?: {
    title: string;
    owner_id: string;
  };
}

export interface PointsLogEntry {
  id: string;
  user_id: string;
  action: string;
  points: number;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface SolveRequest {
  question: string;
  style?: 'simpler' | 'analogy' | 'worked_example';
  conversation?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export type TutorIntent =
  | 'question'
  | 'learning_request'
  | 'greeting'
  | 'acknowledgement'
  | 'clarification'
  | 'unrelated';

interface TutorResponseBase {
  intent: TutorIntent;
  topic: string;
  response: string;
}

export interface ConversationalSolveResponse extends TutorResponseBase {
  intent: 'greeting' | 'acknowledgement' | 'unrelated';
}

export interface LearningSolveResponse extends TutorResponseBase {
  intent: 'question' | 'learning_request' | 'clarification';
  spoken_answer: string;
  tutor_intro?: string;
  tutor_wrapup?: string;
  steps: QuestionStep[];
  concept: string;
  root_cause: string;
  refresher: string;
  subject: string;
  disclaimer?: string;
}

export type SolveResponse = ConversationalSolveResponse | LearningSolveResponse;

export interface FacultyPulseResponse {
  period_days: number;
  total_doubts: number;
  colleges_represented: number;
  silent_doubt_rate: number; // percentage of doubts resolved without publishing anonymously or open doubts unresolved
  concepts: {
    concept: string;
    count: number;
  }[];
  min_cluster_applied: number;
}
