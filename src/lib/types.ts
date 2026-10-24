/**
 * TUTO - SHARED CONTRACT TYPES
 * Strictly aligns with Section 6 of the Master Specification.
 * DO NOT alter schemas without coordinating with P2 Backend & P3 AI.
 */

export type UserRole = "student" | "faculty";

export interface User {
  id: string;
  display_name: string;
  role: UserRole;
  college: string;
  points: number;
}

export type QuestionVisibility = "private" | "anonymous";
export type ResolutionStatus = "open" | "resolved" | "still_stuck";

export interface StepItem {
  step_number: number;
  title: string;
  explanation: string;
  latex?: string;
  teaching_speech?: string;
  check_question?: string;
  auto_notes?: string;
}

export interface Question {
  id: string;
  author_id?: string; // Hidden in public/anonymous feed
  text: string;
  spoken_answer: string;
  tutor_intro?: string;
  tutor_wrapup?: string;
  steps: StepItem[];
  subject: string;
  concept: string;
  root_cause: string;
  visibility: QuestionVisibility;
  resolution_status: ResolutionStatus;
  college: string;
  created_at: string;
  answers_count?: number;
  upvotes_count?: number;
  has_upvoted?: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id?: string;
  author_name?: string;
  author_role?: UserRole;
  author_college?: string;
  text: string;
  is_ai: boolean;
  is_staff_verified: boolean;
  report_count: number;
  created_at: string;
  upvotes?: number;
}

export interface Vote {
  id: string;
  user_id: string;
  target_type: "question" | "answer";
  target_id: string;
}

export interface Project {
  id: string;
  owner_id: string;
  owner_name?: string;
  owner_college?: string;
  title: string;
  description: string;
  tags: string[];
  roles_needed: string[];
  link?: string;
  created_at: string;
  contributions_count?: number;
}

export type ContributionStatus = "pending" | "accepted" | "declined";

export interface Contribution {
  id: string;
  project_id: string;
  project_title?: string;
  user_id: string;
  user_name?: string;
  user_college?: string;
  message: string;
  status: ContributionStatus;
  created_at: string;
}

export interface PointsLog {
  id: string;
  user_id: string;
  action: string;
  points: number;
  created_at: string;
}

export interface CurriculumPost {
  id: string;
  faculty_id: string;
  faculty_name?: string;
  faculty_college?: string;
  title: string;
  body: string;
  concept: string;
  created_at: string;
}

export interface Clarification {
  id: string;
  faculty_id: string;
  faculty_name?: string;
  faculty_college?: string;
  concept: string;
  title: string;
  body: string;
  spoken_text: string;
  created_at: string;
}

export type NotificationStatus = "unread" | "helped" | "still_stuck";

export interface NotificationItem {
  id: string;
  user_id: string;
  clarification_id: string;
  status: NotificationStatus;
  created_at: string;
  clarification?: Clarification;
}

export interface PulseItem {
  concept: string;
  count: number;
  subject: string;
  threshold: number;
  is_alert: boolean;
  last_question_time: string;
}

export interface ConceptCluster {
  concept: string;
  subject: string;
  root_cause: string;
  count: number;
  colleges: string[];
  silent_doubt_rate: number; // percentage, e.g. 78%
  sample_context?: string; // AI synthetic summary, never raw student identity
}

export interface ClarificationOutcome {
  clarification_id: string;
  concept: string;
  delivered: number;
  helped: number;
  still_stuck: number;
}

export type {
  SocraticChatTurn,
  SocraticSessionState,
  SocraticChatRequest,
  SocraticChatResponse,
} from "./types/database";

