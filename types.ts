
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'student' | 'faculty';
}

export enum ValidationStatus {
  Idle = 'idle',
  Valid = 'valid',
  Invalid = 'invalid',
}

export enum PasswordStrength {
  Weak = 'weak',
  Medium = 'medium',
  Strong = 'strong',
  None = 'none'
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
}

export interface Exam {
  id: string;
  title: string;
  courseId?: string;
  courseName?: string;
  date: Date | string;
  durationMinutes: number;
  status: 'Draft' | 'Scheduled' | 'Live' | 'Completed';
  totalStudents?: number;
  type?: 'Mixed' | 'Coding' | 'MCQ';
  enrollmentId?: string;
  questionCount?: number;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  isHidden: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'coding' | 'short_answer';
  text: string; // Problem statement
  points: number;
  // MCQ specific
  options?: QuestionOption[];
  // Coding specific
  starterCode?: string;
  language?: string;
  constraints?: string; // e.g. "Time Limit: 1s"
  testCases?: TestCase[];
}

export type QuestionType = 'mcq' | 'coding';

// ... (Existing types below kept for compatibility if needed, though mostly superseded above for this flow)
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface CodingQuestion extends BaseQuestion {
  type: 'coding';
  starterCode: string;
  language: string;
  testCases: { input: string; output: string; hidden: boolean }[];
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  type: 'chart' | 'heatmap' | 'simple' | 'score';
  data?: number[];
}

export interface Module {
  id: string;
  title: string;
  day: number;
  duration: string;
  status: 'locked' | 'current' | 'completed';
  objectives?: string[];
  topics?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'faculty';
  timestamp: Date;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface LabChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  requirements: { id: string; text: string; completed: boolean }[];
  testCases: { id: string; description: string; expected: string; passed: boolean }[];
  initialCode: {
    html: string;
    css: string;
    js: string;
  };
}

export interface Snippet {
  id: string;
  title: string;
  language: 'web' | 'python' | 'java' | 'cpp' | 'go';
  code: {
    html?: string;
    css?: string;
    js?: string;
    main?: string; // For non-web languages
  };
  lastModified: Date;
}

export interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

export interface SystemCheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail' | 'checking';
  value: string;
  tip: string;
}

// New Types for Exam Results & Proctoring
export interface ExamResult {
  id: string;
  examTitle: string;
  completedAt: Date;
  score: number; // percentage
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: string;
  difficulty: string;
  status: 'passed' | 'failed';
  questions: ExamQuestionReview[];
  proctoring: ProctoringSession;
}

export interface ExamQuestionReview {
  id: string;
  text: string;
  userAnswerId: string;
  correctAnswerId: string;
  options: { id: string; text: string }[];
  explanation: string;
}

export interface ProctoringSession {
  attentionScore: number;
  checks: {
    faceDetected: boolean;
    idVerified: boolean;
    phoneDetected: boolean;
    multiplePeople: boolean;
    webcamActive: boolean;
    screenSharing: boolean;
  };
  timelineData: { time: number; score: number }[]; // Time in minutes, Score 0-100
  incidents: ProctoringIncident[];
}

export interface ProctoringIncident {
  id: string;
  timeLabel: string; // e.g., "12:45"
  timestamp: number; // relative minute for chart placement
  type: string;
  severity: 'low' | 'medium' | 'high';
  snapshot?: string;
  description?: string;
}
