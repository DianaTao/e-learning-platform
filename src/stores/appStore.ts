import { create } from 'zustand';
import type { Course, Assignment, UserAnalytics, ToastMessage, CourseFilters, AssignmentFilters } from '@/types';
import { api } from '@/lib/api';

interface AppState {
  // Data
  courses: Course[];
  assignments: Assignment[];
  analytics: UserAnalytics | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  toasts: ToastMessage[];
  
  // Filters
  courseFilters: CourseFilters;
  assignmentFilters: AssignmentFilters;
  
  // Actions
  loadCourses: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  
  // Course actions
  enrollInCourse: (courseId: string) => Promise<void>;
  unenrollFromCourse: (courseId: string) => Promise<void>;
  updateCourseProgress: (courseId: string, lessonId: string) => Promise<void>;
  
  // Assignment actions
  submitAssignment: (assignmentId: string, submission: { content?: string; files?: File[] }) => Promise<void>;
  
  // Filter actions
  setCourseFilters: (filters: Partial<CourseFilters>) => void;
  setAssignmentFilters: (filters: Partial<AssignmentFilters>) => void;
  
  // UI actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  courses: [],
  assignments: [],
  analytics: null,
  isLoading: false,
  error: null,
  toasts: [],
  courseFilters: {},
  assignmentFilters: {},

  // Data loading actions
  loadCourses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (true) { // Use mock data in development
        // Use mock data in development (immediate load)
        const mockCourses = [
          // Programming Courses
          {
            id: '1',
            title: 'React Fundamentals',
            description: 'Learn the basics of React including components, hooks, and state management.',
            instructor: {
              id: 'inst-1',
              name: 'Alex Johnson',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              rating: 4.8,
            },
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Beginner' as const,
            estimatedHours: 20,
            totalLessons: 12,
            completedLessons: 7,
            progress: 58,
            enrolled: true,
            enrollmentDate: new Date('2024-01-15'),
            lastAccessedDate: new Date('2024-01-28'),
            rating: 4.6,
            tags: ['React', 'JavaScript', 'Frontend'],
            prerequisites: ['HTML', 'CSS', 'JavaScript'],
          },
          {
            id: '2',
            title: 'Advanced TypeScript',
            description: 'Master advanced TypeScript concepts for large-scale applications.',
            instructor: {
              id: 'inst-2',
              name: 'Sarah Chen',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056b34?w=150&h=150&fit=crop&crop=face',
              rating: 4.9,
            },
            thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 35,
            totalLessons: 18,
            completedLessons: 2,
            progress: 12,
            enrolled: true,
            enrollmentDate: new Date('2024-01-10'),
            lastAccessedDate: new Date('2024-01-25'),
            rating: 4.7,
            tags: ['TypeScript', 'JavaScript', 'Types'],
            prerequisites: ['JavaScript', 'TypeScript Basics'],
          },
          {
            id: '4',
            title: 'Python for Data Science',
            description: 'Learn Python programming with focus on data analysis, visualization, and machine learning.',
            instructor: {
              id: 'inst-4',
              name: 'David Kim',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              rating: 4.7,
            },
            thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Intermediate' as const,
            estimatedHours: 30,
            totalLessons: 20,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.8,
            tags: ['Python', 'Data Science', 'Machine Learning'],
            prerequisites: ['Basic Programming'],
          },
          {
            id: '5',
            title: 'Node.js Backend Development',
            description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
            instructor: {
              id: 'inst-5',
              name: 'Maria Garcia',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
              rating: 4.6,
            },
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Intermediate' as const,
            estimatedHours: 28,
            totalLessons: 16,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.5,
            tags: ['Node.js', 'Express', 'MongoDB', 'Backend'],
            prerequisites: ['JavaScript', 'Basic Web Development'],
          },
          {
            id: '6',
            title: 'Mobile App Development with React Native',
            description: 'Create cross-platform mobile applications using React Native and modern development tools.',
            instructor: {
              id: 'inst-6',
              name: 'James Wilson',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              rating: 4.9,
            },
            thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 40,
            totalLessons: 24,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.7,
            tags: ['React Native', 'Mobile', 'Cross-platform'],
            prerequisites: ['React', 'JavaScript', 'Mobile Development Basics'],
          },
          {
            id: '16',
            title: 'Machine Learning Fundamentals',
            description: 'Introduction to machine learning algorithms, data preprocessing, and model evaluation.',
            instructor: {
              id: 'inst-15',
              name: 'Dr. Sophia Zhang',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056b34?w=150&h=150&fit=crop&crop=face',
              rating: 4.9,
            },
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
            category: 'Programming' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 38,
            totalLessons: 22,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.8,
            tags: ['Machine Learning', 'Python', 'AI', 'Data Science'],
            prerequisites: ['Python', 'Statistics', 'Linear Algebra'],
          },
          
          // Design Courses
          {
            id: '7',
            title: 'UI/UX Design Principles',
            description: 'Learn fundamental design principles and user experience best practices.',
            instructor: {
              id: 'inst-3',
              name: 'Emily Rodriguez',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              rating: 4.6,
            },
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            category: 'Design' as const,
            difficulty: 'Intermediate' as const,
            estimatedHours: 25,
            totalLessons: 15,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.5,
            tags: ['Design', 'UX', 'UI'],
            prerequisites: [],
          },
          {
            id: '8',
            title: 'Graphic Design Fundamentals',
            description: 'Master the basics of graphic design including typography, color theory, and layout principles.',
            instructor: {
              id: 'inst-7',
              name: 'Lisa Thompson',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
              rating: 4.8,
            },
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            category: 'Design' as const,
            difficulty: 'Beginner' as const,
            estimatedHours: 18,
            totalLessons: 12,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.6,
            tags: ['Graphic Design', 'Typography', 'Color Theory'],
            prerequisites: [],
          },
          {
            id: '9',
            title: 'Web Design with Figma',
            description: 'Create stunning web designs using Figma, from wireframes to high-fidelity prototypes.',
            instructor: {
              id: 'inst-8',
              name: 'Carlos Mendez',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              rating: 4.7,
            },
            thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
            category: 'Design' as const,
            difficulty: 'Intermediate' as const,
            estimatedHours: 22,
            totalLessons: 14,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.4,
            tags: ['Figma', 'Web Design', 'Prototyping'],
            prerequisites: ['Basic Design Principles'],
          },
          {
            id: '10',
            title: 'Motion Graphics & Animation',
            description: 'Learn to create engaging motion graphics and animations for digital media.',
            instructor: {
              id: 'inst-9',
              name: 'Anna Park',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056b34?w=150&h=150&fit=crop&crop=face',
              rating: 4.9,
            },
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            category: 'Design' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 35,
            totalLessons: 20,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.8,
            tags: ['Motion Graphics', 'Animation', 'After Effects'],
            prerequisites: ['Graphic Design Basics', 'Video Editing'],
          },
          
          // Business Courses
          {
            id: '12',
            title: 'Entrepreneurship Fundamentals',
            description: 'Learn the essential skills and strategies to start and grow your own business.',
            instructor: {
              id: 'inst-11',
              name: 'Michael Brown',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              rating: 4.8,
            },
            thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
            category: 'Business' as const,
            difficulty: 'Beginner' as const,
            estimatedHours: 20,
            totalLessons: 12,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.7,
            tags: ['Entrepreneurship', 'Business Planning', 'Startup'],
            prerequisites: [],
          },
          {
            id: '13',
            title: 'Project Management Professional',
            description: 'Master project management methodologies and earn PMP certification preparation.',
            instructor: {
              id: 'inst-12',
              name: 'Jennifer Lee',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b056b34?w=150&h=150&fit=crop&crop=face',
              rating: 4.9,
            },
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            category: 'Business' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 45,
            totalLessons: 30,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.8,
            tags: ['Project Management', 'PMP', 'Leadership'],
            prerequisites: ['Business Experience', 'Team Management'],
          },
          {
            id: '14',
            title: 'Financial Analysis & Modeling',
            description: 'Learn to analyze financial data and create sophisticated financial models for business decisions.',
            instructor: {
              id: 'inst-13',
              name: 'Robert Chen',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              rating: 4.7,
            },
            thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            category: 'Business' as const,
            difficulty: 'Advanced' as const,
            estimatedHours: 32,
            totalLessons: 18,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.6,
            tags: ['Financial Analysis', 'Excel', 'Modeling'],
            prerequisites: ['Basic Finance', 'Excel Skills'],
          },
          {
            id: '15',
            title: 'Business Analytics with Excel',
            description: 'Transform data into actionable business insights using Excel and analytical techniques.',
            instructor: {
              id: 'inst-14',
              name: 'Amanda White',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              rating: 4.5,
            },
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
            category: 'Business' as const,
            difficulty: 'Intermediate' as const,
            estimatedHours: 26,
            totalLessons: 15,
            completedLessons: 0,
            progress: 0,
            enrolled: false,
            enrollmentDate: undefined,
            lastAccessedDate: undefined,
            rating: 4.4,
            tags: ['Business Analytics', 'Excel', 'Data Analysis'],
            prerequisites: ['Basic Excel', 'Business Fundamentals'],
          }
        ];
        set({ courses: mockCourses, isLoading: false });
      } else {
        const response = await api.courses.getEnrolled();
        set({ courses: response.data, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load courses';
      set({ error: message, isLoading: false });
    }
  },

  loadAssignments: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (true) { // Use mock data in development
        // Use mock data in development (immediate load)
        const mockAssignments = [
          {
            id: '1',
            courseId: '1',
            courseName: 'React Fundamentals',
            title: 'Build a Todo App',
            description: 'Create a functional todo application using React hooks and local storage.',
            instructions: 'Build a todo app with the following features: add, edit, delete, and mark complete.',
            dueDate: new Date('2025-02-15'),
            points: 100,
            status: 'in_progress' as const,
            priority: 'high' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip', '.tar.gz'],
            maxFileSize: 10,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2025-01-20'),
            updatedAt: new Date('2025-01-28'),
          },
          {
            id: '2',
            courseId: '1',
            courseName: 'React Fundamentals',
            title: 'Component Architecture',
            description: 'Design and implement a scalable component architecture.',
            instructions: 'Create reusable components following best practices.',
            dueDate: new Date('2025-01-29'),
            points: 85,
            status: 'overdue' as const,
            priority: 'medium' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip'],
            maxFileSize: 5,
            maxAttempts: 2,
            submissions: [],
            createdAt: new Date('2025-01-10'),
            updatedAt: new Date('2025-01-25'),
          },
          {
            id: '3',
            courseId: '2',
            courseName: 'Advanced TypeScript',
            title: 'Type System Design',
            description: 'Design a complex type system for a library API.',
            instructions: 'Implement advanced TypeScript types and patterns.',
            dueDate: new Date('2025-02-19'),
            points: 120,
            status: 'not_started' as const,
            priority: 'low' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.ts', '.zip'],
            maxFileSize: 8,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2025-01-15'),
            updatedAt: new Date('2025-01-15'),
          },
          {
            id: '4',
            courseId: '2',
            courseName: 'Advanced TypeScript',
            title: 'Generics & Utility Types',
            description: 'Apply generics and utility types to refactor a codebase.',
            instructions: 'Refactor given code using advanced TS features; include tests.',
            dueDate: new Date('2025-02-05'),
            points: 90,
            status: 'submitted' as const,
            priority: 'medium' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip'],
            maxFileSize: 10,
            maxAttempts: 2,
            submissions: [{ id: 'sub-4-1', date: new Date('2025-02-03') }],
            createdAt: new Date('2025-01-18'),
            updatedAt: new Date('2025-02-03'),
          },
          {
            id: '5',
            courseId: '4',
            courseName: 'Python for Data Science',
            title: 'Pandas Data Cleaning',
            description: 'Clean and transform a messy dataset using pandas.',
            instructions: 'Provide a notebook with cleaning steps and summary.',
            dueDate: new Date('2025-02-12'),
            points: 100,
            status: 'in_progress' as const,
            priority: 'high' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.ipynb', '.zip'],
            maxFileSize: 20,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2025-01-22'),
            updatedAt: new Date('2025-02-01'),
          },
          {
            id: '6',
            courseId: '5',
            courseName: 'Node.js Backend Development',
            title: 'REST API with Express',
            description: 'Build a REST API with authentication and CRUD endpoints.',
            instructions: 'Include endpoints, tests, and README with instructions.',
            dueDate: new Date('2025-02-25'),
            points: 150,
            status: 'not_started' as const,
            priority: 'high' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip'],
            maxFileSize: 25,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2025-02-01'),
            updatedAt: new Date('2025-02-01'),
          },
          {
            id: '7',
            courseId: '6',
            courseName: 'Mobile App Development with React Native',
            title: 'Login Flow & Navigation',
            description: 'Implement a login flow and stack/tab navigation.',
            instructions: 'Use React Navigation; support both iOS and Android.',
            dueDate: new Date('2025-02-08'),
            points: 110,
            status: 'overdue' as const,
            priority: 'medium' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip'],
            maxFileSize: 30,
            maxAttempts: 3,
            submissions: [],
            createdAt: new Date('2025-01-25'),
            updatedAt: new Date('2025-02-09'),
          },
          {
            id: '8',
            courseId: '7',
            courseName: 'UI/UX Design Principles',
            title: 'Heuristic Evaluation',
            description: 'Evaluate a product using Nielsen’s heuristics.',
            instructions: 'Deliver a report with issues, severity, and recommendations.',
            dueDate: new Date('2025-02-20'),
            points: 60,
            status: 'submitted' as const,
            priority: 'low' as const,
            submissionType: 'text' as const,
            allowedFileTypes: [],
            maxFileSize: 0,
            maxAttempts: 1,
            submissions: [{ id: 'sub-8-1', date: new Date('2025-02-18') }],
            createdAt: new Date('2025-02-10'),
            updatedAt: new Date('2025-02-18'),
          },
          {
            id: '9',
            courseId: '8',
            courseName: 'Graphic Design Fundamentals',
            title: 'Typography Poster',
            description: 'Design a poster focusing on typography hierarchy.',
            instructions: 'Export PDF and include source files.',
            dueDate: new Date('2025-02-28'),
            points: 80,
            status: 'graded' as const,
            priority: 'medium' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.zip', '.pdf'],
            maxFileSize: 50,
            maxAttempts: 2,
            submissions: [{ id: 'sub-9-1', date: new Date('2025-02-20') }],
            createdAt: new Date('2025-02-05'),
            updatedAt: new Date('2025-02-22'),
            grade: { score: 76, maxScore: 80, percentage: 95 },
            feedback: {
              id: 'fb-9',
              assignmentId: '9',
              instructorId: 'inst-7',
              comments: 'Excellent typography hierarchy and contrast. Minor spacing issues.',
              providedAt: new Date('2025-02-23'),
              rubricScores: [
                { criteria: 'Typography', score: 19, maxScore: 20 },
                { criteria: 'Layout', score: 18, maxScore: 20 },
                { criteria: 'Creativity', score: 19, maxScore: 20 },
                { criteria: 'Execution', score: 20, maxScore: 20 }
              ]
            },
          },
          {
            id: '10',
            courseId: '9',
            courseName: 'Web Design with Figma',
            title: 'Wireframes to Prototype',
            description: 'Turn low-fidelity wireframes into an interactive prototype.',
            instructions: 'Share a Figma link with comment access.',
            dueDate: new Date('2025-02-17'),
            points: 70,
            status: 'in_progress' as const,
            priority: 'medium' as const,
            submissionType: 'link' as const,
            allowedFileTypes: [],
            maxFileSize: 0,
            maxAttempts: 1,
            submissions: [],
            createdAt: new Date('2025-02-02'),
            updatedAt: new Date('2025-02-10'),
          },
          {
            id: '11',
            courseId: '13',
            courseName: 'Project Management Professional',
            title: 'WBS & Gantt Chart',
            description: 'Create a Work Breakdown Structure and Gantt chart for a project.',
            instructions: 'Provide PDF export and source file (MS Project or similar).',
            dueDate: new Date('2025-03-01'),
            points: 100,
            status: 'not_started' as const,
            priority: 'high' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.mpp', '.pdf', '.zip'],
            maxFileSize: 40,
            maxAttempts: 2,
            submissions: [],
            createdAt: new Date('2025-02-05'),
            updatedAt: new Date('2025-02-05'),
          },
          {
            id: '12',
            courseId: '14',
            courseName: 'Financial Analysis & Modeling',
            title: 'DCF Model',
            description: 'Build a discounted cash flow model for a given company.',
            instructions: 'Submit an Excel model with clear assumptions and outputs.',
            dueDate: new Date('2025-02-26'),
            points: 120,
            status: 'graded' as const,
            priority: 'high' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.xlsx', '.zip'],
            maxFileSize: 20,
            maxAttempts: 2,
            submissions: [{ id: 'sub-12-1', date: new Date('2025-02-22') }],
            createdAt: new Date('2025-02-10'),
            updatedAt: new Date('2025-02-23'),
            grade: { score: 108, maxScore: 120, percentage: 90 },
            feedback: {
              id: 'fb-12',
              assignmentId: '12',
              instructorId: 'inst-13',
              comments: 'Solid DCF with reasonable assumptions. Sensitivity analysis was well presented.',
              providedAt: new Date('2025-02-24'),
              rubricScores: [
                { criteria: 'Assumptions', score: 27, maxScore: 30 },
                { criteria: 'Model Accuracy', score: 28, maxScore: 30 },
                { criteria: 'Presentation', score: 25, maxScore: 30 },
                { criteria: 'Documentation', score: 28, maxScore: 30 }
              ]
            },
          },
          {
            id: '13',
            courseId: '15',
            courseName: 'Business Analytics with Excel',
            title: 'Dashboard KPI Report',
            description: 'Create an Excel dashboard visualizing provided KPIs.',
            instructions: 'Use PivotTables/Charts and slicers; include a summary.',
            dueDate: new Date('2025-02-21'),
            points: 90,
            status: 'submitted' as const,
            priority: 'medium' as const,
            submissionType: 'file' as const,
            allowedFileTypes: ['.xlsx', '.zip'],
            maxFileSize: 15,
            maxAttempts: 2,
            submissions: [{ id: 'sub-13-1', date: new Date('2025-02-19') }],
            createdAt: new Date('2025-02-08'),
            updatedAt: new Date('2025-02-19'),
          }
        ];
        set({ assignments: mockAssignments, isLoading: false });
      } else {
        const response = await api.assignments.getAll(get().assignmentFilters);
        set({ assignments: response.data.data, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load assignments';
      set({ error: message, isLoading: false });
    }
  },

  loadAnalytics: async () => {
    set({ isLoading: true, error: null });
    
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Generate mock analytics data
        const mockAnalytics: UserAnalytics = {
          overview: {
            totalHoursStudied: 45.5,
            coursesCompleted: 3,
            coursesInProgress: 2,
            averageQuizScore: 87.3,
            currentStreak: 7,
            longestStreak: 21,
          },
          studyTime: {
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
              minutes: Math.floor(Math.random() * 120) + 30,
              lessonsCompleted: Math.floor(Math.random() * 5),
              coursesAccessed: ['1', '2'].slice(0, Math.floor(Math.random() * 3) + 1),
            })).reverse(),
            weekly: Array.from({ length: 12 }, (_, i) => ({
              week: `Week ${12 - i}`,
              minutes: Math.floor(Math.random() * 500) + 200,
              lessonsCompleted: Math.floor(Math.random() * 20) + 5,
            })),
            monthly: Array.from({ length: 6 }, (_, i) => ({
              month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long' }),
              minutes: Math.floor(Math.random() * 2000) + 800,
              lessonsCompleted: Math.floor(Math.random() * 80) + 20,
            })).reverse(),
          },
          courseBreakdown: [
            {
              courseId: '1',
              courseName: 'React Fundamentals',
              timeSpent: 720,
              progress: 58,
              averageQuizScore: 85,
              lessonsCompleted: 7,
              totalLessons: 12,
              lastAccessed: new Date('2024-01-28'),
              modules: [
                {
                  id: 'm1',
                  title: 'Getting Started with React',
                  totalTime: 240,
                  averageScore: 90,
                  lessons: [
                    {
                      id: 'l1',
                      title: 'Introduction to React',
                      completedAt: new Date('2024-01-15'),
                      timeSpent: 45,
                      quizScore: 95,
                      difficulty: 'easy'
                    },
                    {
                      id: 'l2',
                      title: 'JSX Fundamentals',
                      completedAt: new Date('2024-01-16'),
                      timeSpent: 60,
                      quizScore: 88,
                      difficulty: 'easy'
                    },
                    {
                      id: 'l3',
                      title: 'Components and Props',
                      completedAt: new Date('2024-01-18'),
                      timeSpent: 75,
                      quizScore: 92,
                      difficulty: 'medium'
                    },
                    {
                      id: 'l4',
                      title: 'State and Lifecycle',
                      completedAt: new Date('2024-01-20'),
                      timeSpent: 90,
                      quizScore: 85,
                      difficulty: 'medium'
                    }
                  ]
                },
                {
                  id: 'm2',
                  title: 'Advanced React Concepts',
                  totalTime: 300,
                  averageScore: 82,
                  lessons: [
                    {
                      id: 'l5',
                      title: 'Hooks Introduction',
                      completedAt: new Date('2024-01-22'),
                      timeSpent: 80,
                      quizScore: 78,
                      difficulty: 'medium'
                    },
                    {
                      id: 'l6',
                      title: 'useState and useEffect',
                      completedAt: new Date('2024-01-24'),
                      timeSpent: 100,
                      quizScore: 85,
                      difficulty: 'medium'
                    },
                    {
                      id: 'l7',
                      title: 'Custom Hooks',
                      completedAt: new Date('2024-01-26'),
                      timeSpent: 120,
                      quizScore: 80,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l8',
                      title: 'Context API',
                      timeSpent: 0,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l9',
                      title: 'Performance Optimization',
                      timeSpent: 0,
                      difficulty: 'hard'
                    }
                  ]
                },
                {
                  id: 'm3',
                  title: 'React Router and State Management',
                  totalTime: 180,
                  averageScore: 0,
                  lessons: [
                    {
                      id: 'l10',
                      title: 'React Router Basics',
                      timeSpent: 0,
                      difficulty: 'medium'
                    },
                    {
                      id: 'l11',
                      title: 'State Management with Redux',
                      timeSpent: 0,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l12',
                      title: 'Final Project',
                      timeSpent: 0,
                      difficulty: 'hard'
                    }
                  ]
                }
              ],
              quizScores: [
                { date: '2024-01-15', score: 95 },
                { date: '2024-01-16', score: 88 },
                { date: '2024-01-18', score: 92 },
                { date: '2024-01-20', score: 85 },
                { date: '2024-01-22', score: 78 },
                { date: '2024-01-24', score: 85 },
                { date: '2024-01-26', score: 80 }
              ],
              studyTimeTrend: [
                { date: '2024-01-15', minutes: 45 },
                { date: '2024-01-16', minutes: 60 },
                { date: '2024-01-18', minutes: 75 },
                { date: '2024-01-20', minutes: 90 },
                { date: '2024-01-22', minutes: 80 },
                { date: '2024-01-24', minutes: 100 },
                { date: '2024-01-26', minutes: 120 },
                { date: '2024-01-28', minutes: 50 }
              ]
            },
            {
              courseId: '2',
              courseName: 'Advanced TypeScript',
              timeSpent: 180,
              progress: 12,
              averageQuizScore: 0,
              lessonsCompleted: 2,
              totalLessons: 18,
              lastAccessed: new Date('2024-01-26'),
              modules: [
                {
                  id: 'm1',
                  title: 'TypeScript Fundamentals',
                  totalTime: 120,
                  averageScore: 0,
                  lessons: [
                    {
                      id: 'l1',
                      title: 'Introduction to TypeScript',
                      completedAt: new Date('2024-01-20'),
                      timeSpent: 60,
                      quizScore: 0,
                      difficulty: 'easy'
                    },
                    {
                      id: 'l2',
                      title: 'Basic Types',
                      completedAt: new Date('2024-01-22'),
                      timeSpent: 60,
                      quizScore: 0,
                      difficulty: 'easy'
                    },
                    {
                      id: 'l3',
                      title: 'Interfaces and Classes',
                      timeSpent: 0,
                      difficulty: 'medium'
                    },
                    {
                      id: 'l4',
                      title: 'Generics',
                      timeSpent: 0,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l5',
                      title: 'Advanced Types',
                      timeSpent: 0,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l6',
                      title: 'Decorators',
                      timeSpent: 0,
                      difficulty: 'hard'
                    }
                  ]
                },
                {
                  id: 'm2',
                  title: 'Advanced TypeScript Patterns',
                  totalTime: 0,
                  averageScore: 0,
                  lessons: [
                    {
                      id: 'l7',
                      title: 'Utility Types',
                      timeSpent: 0,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l8',
                      title: 'Conditional Types',
                      timeSpent: 0,
                      difficulty: 'hard'
                    },
                    {
                      id: 'l9',
                      title: 'Template Literal Types',
                      timeSpent: 0,
                      difficulty: 'hard'
                    }
                  ]
                }
              ],
              quizScores: [],
              studyTimeTrend: [
                { date: '2024-01-20', minutes: 60 },
                { date: '2024-01-22', minutes: 60 },
                { date: '2024-01-26', minutes: 60 }
              ]
            },
          ],
          achievements: [
            // Progress Badges
            {
              id: '1',
              title: 'First Steps',
              description: 'Complete your first lesson',
              icon: '🎯',
              category: 'progress',
              unlockedAt: new Date('2024-01-20'),
              progress: 100,
              requirements: 'Complete 1 lesson',
              rarity: 'common',
              points: 10,
            },
            {
              id: '2',
              title: 'Lesson Learner',
              description: 'Complete 10 lessons',
              icon: '📚',
              category: 'progress',
              unlockedAt: new Date('2024-01-25'),
              progress: 100,
              requirements: 'Complete 10 lessons',
              rarity: 'common',
              points: 25,
            },
            {
              id: '3',
              title: 'Course Master',
              description: 'Complete your first course',
              icon: '🏆',
              category: 'progress',
              progress: 75,
              requirements: 'Complete 1 full course',
              rarity: 'rare',
              points: 100,
            },
            {
              id: '4',
              title: 'Multi-Course Master',
              description: 'Complete 5 courses',
              icon: '👑',
              category: 'progress',
              progress: 20,
              requirements: 'Complete 5 courses',
              rarity: 'epic',
              points: 250,
            },
            
            // Streak Badges
            {
              id: '5',
              title: 'Week Warrior',
              description: 'Study for 7 consecutive days',
              icon: '🔥',
              category: 'streak',
              unlockedAt: new Date('2024-01-28'),
              progress: 100,
              requirements: 'Study for 7 days straight',
              rarity: 'rare',
              points: 50,
            },
            {
              id: '6',
              title: 'Month Master',
              description: 'Study for 30 consecutive days',
              icon: '⚡',
              category: 'streak',
              progress: 60,
              requirements: 'Study for 30 days straight',
              rarity: 'epic',
              points: 200,
            },
            {
              id: '7',
              title: 'Hundred Day Hero',
              description: 'Study for 100 consecutive days',
              icon: '💎',
              category: 'streak',
              progress: 18,
              requirements: 'Study for 100 days straight',
              rarity: 'legendary',
              points: 500,
            },
            
            // Score Badges
            {
              id: '8',
              title: 'High Scorer',
              description: 'Achieve 90% or higher on a quiz',
              icon: '⭐',
              category: 'score',
              unlockedAt: new Date('2024-01-22'),
              progress: 100,
              requirements: 'Score 90%+ on any quiz',
              rarity: 'common',
              points: 30,
            },
            {
              id: '9',
              title: 'Perfect Score',
              description: 'Achieve 100% on a quiz',
              icon: '🌟',
              category: 'score',
              progress: 0,
              requirements: 'Score 100% on any quiz',
              rarity: 'rare',
              points: 75,
            },
            {
              id: '10',
              title: 'Consistent Excellence',
              description: 'Achieve 90%+ on 10 quizzes',
              icon: '🏅',
              category: 'score',
              progress: 30,
              requirements: 'Score 90%+ on 10 quizzes',
              rarity: 'epic',
              points: 150,
            },
            
            // Milestone Badges
            {
              id: '11',
              title: 'Time Investment',
              description: 'Study for 50 total hours',
              icon: '⏰',
              category: 'milestone',
              progress: 45,
              requirements: 'Study for 50 total hours',
              rarity: 'common',
              points: 40,
            },
            {
              id: '12',
              title: 'Dedicated Learner',
              description: 'Study for 100 total hours',
              icon: '🎓',
              category: 'milestone',
              progress: 22,
              requirements: 'Study for 100 total hours',
              rarity: 'rare',
              points: 100,
            },
            {
              id: '13',
              title: 'Knowledge Seeker',
              description: 'Study for 500 total hours',
              icon: '🧠',
              category: 'milestone',
              progress: 4,
              requirements: 'Study for 500 total hours',
              rarity: 'legendary',
              points: 300,
            },
            
            // Skill Badges
            {
              id: '14',
              title: 'JavaScript Novice',
              description: 'Reach Beginner level in JavaScript',
              icon: '🟨',
              category: 'skill',
              unlockedAt: new Date('2024-01-18'),
              progress: 100,
              requirements: 'Reach Beginner level in JavaScript',
              rarity: 'common',
              points: 20,
              subject: 'JavaScript',
            },
            {
              id: '15',
              title: 'React Rookie',
              description: 'Reach Beginner level in React',
              icon: '⚛️',
              category: 'skill',
              progress: 85,
              requirements: 'Reach Beginner level in React',
              rarity: 'common',
              points: 25,
              subject: 'React',
            },
            {
              id: '16',
              title: 'TypeScript Trainee',
              description: 'Reach Beginner level in TypeScript',
              icon: '🔷',
              category: 'skill',
              progress: 30,
              requirements: 'Reach Beginner level in TypeScript',
              rarity: 'common',
              points: 30,
              subject: 'TypeScript',
            },
          ],
          goals: [
            {
              id: '1',
              title: 'Weekly Study Goal',
              description: 'Study for 10 hours this week',
              targetValue: 10,
              currentValue: 7.5,
              unit: 'hours',
              deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              completed: false,
            },
            {
              id: '2',
              title: 'Course Completion',
              description: 'Complete React Fundamentals',
              targetValue: 1,
              currentValue: 0.58,
              unit: 'courses',
              deadline: new Date('2024-02-15'),
              completed: false,
            },
          ],
          weeklyGoals: [
            {
              id: '1',
              title: 'Weekly Study Goal',
              description: 'Study for 10 hours this week',
              targetValue: 10,
              currentValue: 7.5,
              unit: 'hours',
              deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              completed: false,
              weeklyTarget: 10,
              dailyAverage: 1.25,
              daysRemaining: 2,
              onTrack: true,
            },
            {
              id: '2',
              title: 'Complete 5 Lessons',
              description: 'Finish 5 lessons across all courses',
              targetValue: 5,
              currentValue: 3,
              unit: 'lessons',
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              completed: false,
              weeklyTarget: 5,
              dailyAverage: 0.43,
              daysRemaining: 7,
              onTrack: true,
            },
          ],
          courseGoals: [
            {
              id: '1',
              courseId: '1',
              courseName: 'React Fundamentals',
              targetCompletionDate: new Date('2024-02-15'),
              currentProgress: 58,
              estimatedCompletionDate: new Date('2024-02-20'),
              onTrack: true,
              classAverage: 45,
              personalPace: 2.5,
              paceComparison: 'ahead',
            },
            {
              id: '2',
              courseId: '2',
              courseName: 'Advanced TypeScript',
              targetCompletionDate: new Date('2024-03-15'),
              currentProgress: 12,
              estimatedCompletionDate: new Date('2024-04-10'),
              onTrack: false,
              classAverage: 25,
              personalPace: 1.2,
              paceComparison: 'behind',
            },
          ],
          learningPaces: [
            {
              courseId: '1',
              courseName: 'React Fundamentals',
              personalPace: 2.5,
              classAverage: 1.8,
              difference: 0.7,
              status: 'ahead',
            },
            {
              courseId: '2',
              courseName: 'Advanced TypeScript',
              personalPace: 1.2,
              classAverage: 1.5,
              difference: -0.3,
              status: 'behind',
            },
          ],
          weeklyProgress: [
            { date: '2024-01-22', hours: 1.5, target: 1.4 },
            { date: '2024-01-23', hours: 2.0, target: 1.4 },
            { date: '2024-01-24', hours: 1.8, target: 1.4 },
            { date: '2024-01-25', hours: 1.2, target: 1.4 },
            { date: '2024-01-26', hours: 2.5, target: 1.4 },
            { date: '2024-01-27', hours: 1.0, target: 1.4 },
            { date: '2024-01-28', hours: 1.5, target: 1.4 },
          ],
          skillLevels: [
            {
              subject: 'JavaScript',
              level: 'Beginner',
              progress: 85,
              experience: 850,
              nextLevel: 1000,
              badges: ['🟨', '📚'],
            },
            {
              subject: 'React',
              level: 'Beginner',
              progress: 75,
              experience: 750,
              nextLevel: 1000,
              badges: ['⚛️', '🎯'],
            },
            {
              subject: 'TypeScript',
              level: 'Beginner',
              progress: 30,
              experience: 300,
              nextLevel: 1000,
              badges: ['🔷'],
            },
            {
              subject: 'Python',
              level: 'Beginner',
              progress: 15,
              experience: 150,
              nextLevel: 1000,
              badges: ['🐍'],
            },
            {
              subject: 'Node.js',
              level: 'Beginner',
              progress: 5,
              experience: 50,
              nextLevel: 1000,
              badges: ['🟢'],
            },
          ],
        };
        
        set({ analytics: mockAnalytics, isLoading: false });
      } else {
        const response = await api.analytics.getOverview();
        set({ analytics: { overview: response.data } as UserAnalytics, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load analytics';
      set({ error: message, isLoading: false });
    }
  },

  // Course actions
  enrollInCourse: async (courseId: string) => {
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { courses } = get();
        const updatedCourses = courses.map(course =>
          course.id === courseId
            ? { 
                ...course, 
                enrolled: true, 
                enrollmentDate: new Date(),
                // Mark as recently accessed so it shows in "Jump back in"
                lastAccessedDate: new Date(),
              }
            : course
        );
        set({ courses: updatedCourses });
        
        get().addToast({
          type: 'success',
          title: 'Enrollment Successful',
          message: 'You have been enrolled in the course!',
        });
      } else {
        await api.courses.enroll(courseId);
        await get().loadCourses();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll in course';
      get().addToast({
        type: 'error',
        title: 'Enrollment Failed',
        message,
      });
    }
  },

  unenrollFromCourse: async (courseId: string) => {
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { courses } = get();
        const updatedCourses = courses.filter(course => course.id !== courseId);
        set({ courses: updatedCourses });
        
        get().addToast({
          type: 'success',
          title: 'Unenrollment Successful',
          message: 'You have been unenrolled from the course.',
        });
      } else {
        await api.courses.unenroll(courseId);
        await get().loadCourses();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unenroll from course';
      get().addToast({
        type: 'error',
        title: 'Unenrollment Failed',
        message,
      });
    }
  },

  updateCourseProgress: async (courseId: string, lessonId: string) => {
    try {
      if (true) { // Use mock data in development
        const { courses } = get();
        const updatedCourses = courses.map(course => {
          if (course.id === courseId) {
            const newCompletedLessons = course.completedLessons + 1;
            const newProgress = Math.round((newCompletedLessons / course.totalLessons) * 100);
            return {
              ...course,
              completedLessons: newCompletedLessons,
              progress: newProgress,
              lastAccessedDate: new Date(),
            };
          }
          return course;
        });
        set({ courses: updatedCourses });
      } else {
        await api.courses.updateProgress(courseId, lessonId);
        await get().loadCourses();
      }
    } catch (error) {
      console.error('Failed to update course progress:', error);
    }
  },

  // Assignment actions
  submitAssignment: async (assignmentId: string, submission: { content?: string; files?: File[] }) => {
    try {
      if (true) { // Use mock data in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { assignments } = get();
        const updatedAssignments = assignments.map(assignment =>
          assignment.id === assignmentId
            ? { ...assignment, status: 'submitted' as const }
            : assignment
        );
        set({ assignments: updatedAssignments });
        
        get().addToast({
          type: 'success',
          title: 'Assignment Submitted',
          message: 'Your assignment has been submitted successfully!',
        });
      } else {
        await api.assignments.submit(assignmentId, submission);
        await get().loadAssignments();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit assignment';
      get().addToast({
        type: 'error',
        title: 'Submission Failed',
        message,
      });
    }
  },

  // Filter actions
  setCourseFilters: (filters: Partial<CourseFilters>) => {
    set({ courseFilters: { ...get().courseFilters, ...filters } });
  },

  setAssignmentFilters: (filters: Partial<AssignmentFilters>) => {
    set({ assignmentFilters: { ...get().assignmentFilters, ...filters } });
  },

  // UI actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    set({ toasts: [...get().toasts, newToast] });
    
    // Auto remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id: string) => {
    set({ toasts: get().toasts.filter(toast => toast.id !== id) });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Auto-initialize with mock data in development
if (true) { // Auto-initialize with mock data
  useAppStore.getState().loadCourses();
  useAppStore.getState().loadAssignments();
}


