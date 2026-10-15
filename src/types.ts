export type UserRole = 'student' | 'owner' | 'admin';

export interface User {
  uid: string;
  username: string;
  email: string;
  university_id: string;
  full_name?: string;
  role: UserRole;
  academic_year: number;
  xp: number;
  streak: number;
  profile_image?: string;
  profile_picture?: string;
  is_active: boolean;
  password?: string;
  auth_provider?: 'local' | 'google';
  created_at: string;
}

export interface AcademicYear {
  id: number;
  year_number: number;
  name: string;
  order: number;
}

export interface AcademicSubject {
  id: number;
  academic_year: number;
  year_number?: number;
  name: string;
  code?: string;
  description?: string;
  order: number;
  lecture_count: number;
}

export interface AcademicLecture {
  id: number;
  subject_id: number;
  title: string;
  lecture_number: number;
  description?: string;
  order: number;
  has_content: boolean;
}

export type ProcessingStatus =
  | 'UPLOADED'
  | 'EXTRACTING'
  | 'EXTRACTED'
  | 'PARTIALLY_EXTRACTED'
  | 'FAILED'
  | 'READY';

export interface DocumentPage {
  page_number: number;
  text: string;
  headings: string[];
  formulas: string[];
  tables?: string[];
  has_math: boolean;
  is_blank?: boolean;
}

export interface DocumentChunk {
  id: string;
  chunk_index: number;
  page_number: number;
  section_title: string;
  text: string;
  formulas: string[];
}

export interface DocumentExtractionReport {
  total_pages: number;
  extracted_pages: number;
  equations_found: number;
  headings_found: number;
  status: ProcessingStatus;
  message?: string;
}

export interface AcademicMaterial {
  id: number;
  academic_year_id: number;
  subject_id: number;
  lecture_id: number;
  title: string;
  material_type: 'lecture' | 'section';
  section_title?: string;
  original_filename: string;
  processing_status: ProcessingStatus;
  processing_error?: string;
  uploaded_at: string;
  size_bytes?: number;
  storage_path?: string;
  file_url?: string;
  extracted_text?: string;
  pages?: DocumentPage[];
  chunks?: DocumentChunk[];
  extraction_report?: DocumentExtractionReport;
}

export interface QuizQuestion {
  id: string | number;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  lecture?: number;
}

export interface QuizAttemptAnswer {
  question_id: string;
  question: string;
  options: string[];
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation?: string;
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  earned_xp: number;
  points_per_question?: number;
  max_xp?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
  subject?: string;
  lecture?: number;
  answers: QuizAttemptAnswer[];
}

export interface DailyChallenge {
  date: string;
  subject: string;
  lecture: number;
  goal_questions: number;
  bonus_xp: number;
  started: boolean;
  completed: boolean;
  score?: number;
  total_questions?: number;
  quiz?: {
    quiz_id: string;
    questions: QuizQuestion[];
  };
}

export interface ReviewItem {
  id: number;
  subject: string;
  lecture: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  reviewed_at?: string | null;
  review_count: number;
}

export interface StudyPlan {
  id: number;
  title: string;
  subject_id?: number | null;
  subject_name?: string;
  target_minutes_per_day: number;
  sessions_per_week: number;
  start_date: string;
  end_date?: string | null;
  notes?: string;
  is_active: boolean;
}

export interface StudyNotification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  type?: string;
}

export interface StudentPreferences {
  notifications_enabled: boolean;
  daily_challenge_reminders: boolean;
  weekly_progress_reports: boolean;
  study_goal_minutes: number;
}

export interface ChatSource {
  file_name: string;
  lecture_number?: number;
  section_title?: string;
  page_number?: number;
}

export interface ChatAttachment {
  name: string;
  sizeBytes?: number;
  type: string;
  thumbnailUrl?: string;
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  is_user: boolean;
  time: string;
  sources?: ChatSource[];
  provider?: string;
  model?: string;
  coverage_checklist?: string[];
  has_continuation?: boolean;
  continuation_part?: number;
  total_parts?: number;
  next_part_prompt?: string;
  attachment?: ChatAttachment;
}

export interface ChatConversation {
  id: string;
  title: string;
  subject: string;
  lecture: number;
  lastUpdated: string;
  messages: ChatMessage[];
}
