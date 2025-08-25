// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences;
  enrollmentDate: Date;
  lastLoginDate: Date;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: Date;
  };
}

export interface UserPreferences {
  notifications: boolean;
  studyTimeReminders: boolean;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening';
  timezone: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: Instructor;
  thumbnail: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  estimatedHours: number;
  totalLessons: number;
  completedLessons: number;
  progress: number; // 0-100
  enrolled: boolean;
  enrollmentDate?: Date;
  lastAccessedDate?: Date;
  rating: number;
  tags: string[];
  prerequisites: string[];
}

export interface Instructor {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
}

export type CourseCategory = 'Programming' | 'Design' | 'Business' | 'Marketing' | 'Other';
export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  estimatedHours: number;
  completed: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: number; // minutes
  completed: boolean;
  completedAt?: Date;
  order: number;
  resources: LessonResource[];
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'code';
  url: string;
  downloadable: boolean;
}

// Assignment Types
export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: Date;
  points: number;
  status: AssignmentStatus;
  priority: 'low' | 'medium' | 'high';
  submissionType: 'file' | 'text' | 'url' | 'multiple';
  allowedFileTypes?: string[];
  maxFileSize?: number; // MB
  maxAttempts?: number;
  
  // Submission data
  submissions: AssignmentSubmission[];
  feedback?: AssignmentFeedback;
  grade?: AssignmentGrade;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  content?: string;
  files: UploadedFile[];
  submittedAt: Date;
  attempt: number;
  status: 'draft' | 'submitted' | 'graded';
}

export interface AssignmentFeedback {
  id: string;
  assignmentId: string;
  instructorId: string;
  comments: string;
  rubricScores?: RubricScore[];
  providedAt: Date;
}

export interface AssignmentGrade {
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
}

export interface RubricScore {
  criteria: string;
  score: number;
  maxScore: number;
  comments?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

// Analytics Types
export interface SkillLevel {
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number; // 0-100
  experience: number;
  nextLevel: number;
  badges: string[];
}

export interface UserAnalytics {
  overview: AnalyticsOverview;
  studyTime: StudyTimeData;
  courseBreakdown: CourseAnalytics[];
  achievements: Achievement[];
  goals: LearningGoal[];
  weeklyGoals: WeeklyGoal[];
  courseGoals: CourseGoal[];
  learningPaces: LearningPace[];
  weeklyProgress: { date: string; hours: number; target: number }[];
  skillLevels: SkillLevel[];
}

export interface AnalyticsOverview {
  totalHoursStudied: number;
  coursesCompleted: number;
  coursesInProgress: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
}

export interface StudyTimeData {
  daily: DailyStudyTime[];
  weekly: WeeklyStudyTime[];
  monthly: MonthlyStudyTime[];
}

export interface DailyStudyTime {
  date: Date;
  minutes: number;
  lessonsCompleted: number;
  coursesAccessed: string[];
}

export interface WeeklyStudyTime {
  week: string;
  minutes: number;
  lessonsCompleted: number;
}

export interface MonthlyStudyTime {
  month: string;
  minutes: number;
  lessonsCompleted: number;
}

export interface AnalyticsLesson {
  id: string;
  title: string;
  completedAt?: Date;
  timeSpent: number; // in minutes
  quizScore?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AnalyticsModule {
  id: string;
  title: string;
  lessons: AnalyticsLesson[];
  totalTime: number;
  averageScore: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  timeSpent: number; // minutes
  progress: number; // 0-100
  averageQuizScore: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessed: Date;
  modules: AnalyticsModule[];
  quizScores: { date: string; score: number }[];
  studyTimeTrend: { date: string; minutes: number }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'score' | 'milestone' | 'skill';
  unlockedAt?: Date;
  progress: number; // 0-100
  requirements: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  skillLevel?: string;
  subject?: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'hours' | 'courses' | 'assignments' | 'streak';
  deadline?: Date;
  completed: boolean;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'hours' | 'lessons' | 'courses';
  deadline: Date;
  completed: boolean;
  weeklyTarget: number;
  dailyAverage: number;
  daysRemaining: number;
  onTrack: boolean;
}

export interface CourseGoal {
  id: string;
  courseId: string;
  courseName: string;
  targetCompletionDate: Date;
  currentProgress: number;
  estimatedCompletionDate: Date;
  onTrack: boolean;
  classAverage: number;
  personalPace: number;
  paceComparison: 'ahead' | 'behind' | 'on_track';
}

export interface LearningPace {
  courseId: string;
  courseName: string;
  personalPace: number; // lessons per week
  classAverage: number;
  difference: number;
  status: 'ahead' | 'behind' | 'on_track';
}

// API Response Types
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    timestamp: Date;
    requestId: string;
  };
  success: false;
}

export interface APISuccess<T = any> {
  data: T;
  success: true;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: Date;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ResetPasswordForm {
  email: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Filter Types
export interface CourseFilters {
  category?: CourseCategory;
  difficulty?: CourseDifficulty;
  status?: 'all' | 'enrolled' | 'completed' | 'not_enrolled';
  search?: string;
}

export interface AssignmentFilters {
  status?: AssignmentStatus;
  courseId?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: 'overdue' | 'today' | 'this_week' | 'this_month';
  search?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
