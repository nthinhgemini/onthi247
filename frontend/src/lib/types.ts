export type Role = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  school?: string | null;
  target_block?: string | null;
  avatar_url?: string | null;
  xp: number;
  streak_count: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    full_name: string;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  _count?: { chapters: number; exams: number };
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  order_index: number;
  _count?: { questions: number };
}

export type Difficulty = "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao";
export type QuestionType = "single_choice" | "multi_true_false" | "short_answer";
export type ContentStatus = "draft" | "published" | "rejected";

export interface QuestionOption {
  id: string;
  content: string;
  is_correct: boolean;
  order_index: number;
}

export interface Question {
  id: string;
  chapter_id: string;
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  image_url?: string | null;
  explanation?: string | null;
  created_by: string;
  status: ContentStatus;
  created_at: string;
  chapter?: { id: string; name: string; subject: { id: string; name: string } };
  options: QuestionOption[];
  creator?: { id: string; full_name: string };
}

export interface ExamQuestion {
  id: string;
  order_index: number;
  score_weight: number;
  question: Question;
}

export interface Exam {
  id: string;
  title: string;
  subject_id: string;
  type: "official" | "practice" | "custom";
  duration_minutes: number;
  total_score: number;
  created_by: string;
  status: ContentStatus;
  created_at: string;
  subject?: { id: string; name: string };
  creator?: { id: string; full_name: string };
  examQuestions?: ExamQuestion[];
  _count?: { examQuestions: number };
}

export interface Submission {
  id: string;
  user_id: string;
  exam_id: string;
  started_at: string;
  submitted_at?: string | null;
  total_score?: number | null;
  xp_awarded: number;
  correct_count: number;
  status: "in_progress" | "submitted";
  flagged?: string[];
  exam?: Exam;
}

export interface SubmitResult {
  id: string;
  status: "submitted";
  total_score?: number | null;
  xp_earned: number;
  earned_badges: { id: string; name: string; icon_url: string | null }[];
}

export interface StatsOverview {
  xp: number;
  streak: number;
  level: number;
  total_submissions: number;
  avg_score: number;
  best_score: number;
  accuracy: number;
  subjects: { subject: string; count: number; avg: number }[];
}

export interface ProgressDay {
  date: string;
  count: number;
  avg_score: number;
  xp: number;
}

export interface WeakChapter {
  chapter: string;
  subject: string;
  attempts: number;
  accuracy: number;
  suggestion: string;
}

export interface WeakChaptersData {
  weakest: WeakChapter[];
  all: WeakChapter[];
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  condition_type: string;
  condition_value: number;
  earned_at?: string | null;
}

export interface BadgesData {
  earned: Badge[];
  locked: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  full_name: string;
  xp: number;
  streak_count: number;
  school?: string | null;
  avatar_url?: string | null;
  submissions: number;
}

export interface AdminOverview {
  counts: {
    users: number;
    teachers: number;
    questions: number;
    publishedQuestions: number;
    pendingQuestions: number;
    exams: number;
    submissions: number;
    submissionsToday: number;
  };
  recentUsers: {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    is_active: boolean;
    created_at: string;
  }[];
  recentQuestions: Question[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  school?: string | null;
  target_block?: string | null;
  avatar_url?: string | null;
  xp: number;
  streak_count: number;
  is_active: boolean;
  created_at: string;
  _count?: { submissions: number };
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewItem {
  order_index: number;
  score_weight: number;
  earned_score: number | null;
  question: Question;
  user_answer: string | null;
  is_correct: boolean | null;
}

export interface ReviewData {
  submission: Submission;
  exam: { id: string; title: string; subject: { id: string; name: string } };
  questions: ReviewItem[];
}

export interface ForumAuthor {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  xp: number;
}

export interface ForumCommentType {
  id: string;
  user_id: string;
  content: string;
  is_best: boolean;
  created_at: string;
  user: ForumAuthor;
}

export interface ForumPost {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  content: string;
  view_count: number;
  vote_count: number;
  comment_count: number;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  voted: boolean;
  user: ForumAuthor;
  subject?: { id: string; name: string } | null;
  comments?: ForumCommentType[];
  best_comment_id?: string | null;
}

export interface NotificationItem {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsData {
  items: NotificationItem[];
  unread: number;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject_id?: string | null;
  created_at: string;
  updated_at: string;
  subject?: { id: string; name: string } | null;
}

export interface PublicProfileData {
  user: {
    id: string;
    full_name: string;
    school?: string | null;
    target_block?: string | null;
    avatar_url?: string | null;
    xp: number;
    streak_count: number;
    created_at: string;
    _count?: { forumPosts: number };
  };
  stats: {
    submissions: number;
    avg_score: number;
    best_score: number;
    correct_count: number;
  };
  badges: Badge[];
  recentSubmissions: {
    id: string;
    exam: { id: string; title: string; subject: { id: string; name: string } };
    total_score: number | null;
    submitted_at: string | null;
  }[];
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  nhan_biet: "Nhận biết",
  thong_hieu: "Thông hiểu",
  van_dung: "Vận dụng",
  van_dung_cao: "Vận dụng cao",
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: "Trắc nghiệm",
  multi_true_false: "Đúng/Sai nhiều ý",
  short_answer: "Điền đáp án",
};
