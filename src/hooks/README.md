# Custom API Hooks Documentation

This directory contains custom React hooks for managing API data fetching, caching, and state management in the e-learning platform.

## 📁 File Structure

```
src/hooks/
├── index.ts              # Main exports
├── useApi.ts            # Base API hook with caching & retry
├── useAuth.ts           # Authentication management
├── useCourses.ts        # Course management
├── useAssignments.ts    # Assignment management
├── useAnalytics.ts      # Progress tracking & analytics
└── README.md           # This documentation
```

## 🚀 Quick Start

```typescript
import { useAuth, useCourses, useAssignments, useAnalytics } from '@/hooks';

// Use in any component
function MyComponent() {
  const { user, login, logout } = useAuth();
  const { enrolledCourses, loading } = useCourses();
  // ... use hooks as needed
}
```

## 📚 Core Hooks

### 🔐 useAuth()

Manages authentication state and operations.

```typescript
const {
  // State
  user,                    // Current user object
  isAuthenticated,         // Boolean authentication status
  
  // Loading states
  isLoggingIn,            // Login in progress
  isRegistering,          // Registration in progress
  isUpdatingProfile,      // Profile update in progress
  
  // Error states
  loginError,             // Login error message
  profileError,           // Profile error message
  
  // Actions
  login,                  // (credentials) => Promise
  register,               // (userData) => Promise
  logout,                 // () => Promise
  updateProfile,          // (updates) => Promise
  changePassword,         // (passwordData) => Promise
  
  // Optimistic data
  isOptimisticProfile,    // Profile being updated optimistically
} = useAuth();
```

**Key Features:**
- ✅ JWT token management with automatic refresh
- ✅ Session timeout handling
- ✅ Optimistic profile updates
- ✅ Password reset flow
- ✅ Email verification
- ✅ Automatic navigation on auth state changes

### 📚 useCourses(filters?)

Manages course data, enrollment, and progress.

```typescript
const {
  // Data
  courses,                 // All courses (filtered)
  enrolledCourses,        // User's enrolled courses
  selectedCourse,         // Currently selected course details
  recommendations,        // Recommended courses
  recentCourses,          // Recently accessed courses
  courseStats,            // Statistics about user's courses
  
  // Loading states
  loading,                // Main courses loading
  loadingCourse,          // Single course loading
  isEnrolling,           // Enrollment in progress
  isUpdatingProgress,    // Progress update in progress
  
  // Pagination
  hasNext,               // More courses available
  total,                 // Total course count
  page,                  // Current page
  loadMore,              // Load next page
  
  // Actions
  enroll,                // (courseId) => Promise
  unenroll,              // (courseId) => Promise
  updateProgress,        // (progressData) => Promise
  selectCourse,          // (courseId) => Promise
  searchCourses,         // (query) => Promise
  filterCourses,         // (filters) => Promise
  
  // Utilities
  getCourseById,         // (courseId) => Course | undefined
  getCoursesByCategory,  // (category) => Course[]
} = useCourses(filters);
```

**Key Features:**
- ✅ Automatic filtering and pagination
- ✅ Optimistic enrollment updates
- ✅ Progress tracking with time logging
- ✅ Course recommendations
- ✅ Recent activity tracking
- ✅ Search and category filtering

### 📝 useAssignments(filters?)

Manages assignments, submissions, and bulk operations.

```typescript
const {
  // Data
  assignments,            // All assignments (filtered)
  selectedAssignment,     // Currently selected assignment
  assignmentStats,        // Assignment statistics
  upcomingAssignments,    // Assignments due soon
  
  // Loading states
  loading,                // Main assignments loading
  isUpdatingStatus,       // Status update in progress
  isSubmitting,          // Submission in progress
  isBulkUpdating,        // Bulk operation in progress
  
  // Actions
  updateStatus,          // (id, status, note?) => Promise
  submitAssignment,      // (id, submission) => Promise
  bulkUpdate,            // (ids[], action) => Promise
  selectAssignment,      // (id) => Promise
  searchAssignments,     // (query) => Promise
  filterAssignments,     // (filters) => Promise
  
  // Utilities
  getAssignmentById,     // (id) => Assignment | undefined
  getAssignmentsByCourse, // (courseId) => Assignment[]
} = useAssignments(filters);
```

**Key Features:**
- ✅ Status management (not_started → in_progress → submitted → graded)
- ✅ File upload handling with progress
- ✅ Bulk operations (mark complete, export CSV)
- ✅ Advanced filtering (by status, course, due date)
- ✅ Optimistic status updates
- ✅ Assignment calendar integration

### 📊 useAnalytics()

Manages learning analytics, progress tracking, and achievements.

```typescript
const {
  // Data
  summary,               // Analytics summary
  studyLogs,            // Detailed study time logs
  achievements,         // User achievements
  studyGoals,          // Personal study goals
  courseAnalytics,     // Per-course analytics
  
  // Computed data
  studyStreaks,        // Current and longest streaks
  studyTimeByCategory, // Time spent by category
  dailyStudyTime,      // Last 30 days study time
  achievementsByStatus, // Grouped achievements
  
  // Loading states
  loadingSummary,      // Summary loading
  isLoggingStudyTime,  // Study time logging
  isCreatingGoal,      // Goal creation
  
  // Actions
  logStudyTime,        // (data) => Promise
  createStudyGoal,     // (goal) => Promise
  updateStudyGoal,     // (id, updates) => Promise
  deleteStudyGoal,     // (id) => Promise
  unlockAchievement,   // (id) => Promise
  selectCourse,        // (courseId) => Promise
} = useAnalytics();
```

**Key Features:**
- ✅ Automatic study time tracking
- ✅ Achievement system with progress tracking
- ✅ Flexible goal management
- ✅ Visual analytics data (charts, heatmaps)
- ✅ Course-specific analytics
- ✅ Streak calculation and maintenance

## 🛠 Base Hook: useApi()

The foundation for all other hooks, providing:

```typescript
const {
  data,           // API response data
  loading,        // Loading state
  error,          // Error message
  execute,        // Manual execution function
  refresh,        // Refresh data
  reset,          // Reset to initial state
  setData,        // Manual data updates (optimistic)
} = useApi(apiFunction, options);
```

**Advanced Features:**
- ✅ **Automatic Caching**: Configurable cache time (default: 5 minutes)
- ✅ **Retry Logic**: Automatic retries with exponential backoff
- ✅ **Request Cancellation**: Automatic cleanup on unmount
- ✅ **Optimistic Updates**: Update UI before API confirms
- ✅ **Background Refresh**: Refresh data when window gains focus
- ✅ **Error Recovery**: Smart retry based on error type

### usePaginatedApi()

Extended version for paginated data:

```typescript
const {
  ...baseHookReturns,
  data,           // All accumulated data
  page,           // Current page number
  hasNext,        // More data available
  total,          // Total item count
  loadMore,       // Load next page
} = usePaginatedApi(apiFunction, pageSize, options);
```

### useMutation()

For API mutations (POST, PUT, PATCH, DELETE):

```typescript
const {
  ...baseHookReturns,
  mutate,         // Execute mutation
  isOptimistic,   // Currently showing optimistic data
} = useMutation(mutationFunction, options);
```

## 🎯 Hook Options

All hooks accept an options object for customization:

```typescript
interface UseApiOptions {
  immediate?: boolean;        // Execute on mount (default: true)
  cacheTime?: number;        // Cache duration in ms (default: 5min)
  retry?: number;            // Retry attempts (default: 2)
  retryDelay?: number;       // Retry delay in ms (default: 1s)
  onSuccess?: (data) => void; // Success callback
  onError?: (error) => void;  // Error callback
}
```

## 🔄 State Management Integration

Hooks integrate seamlessly with Zustand stores:

```typescript
// useAuth integrates with authStore
const { setUser, setTokens, clearAuth } = useAuthStore();

// Hooks can update global state
const { addToast } = useAppStore();
```

## 🎨 Usage Patterns

### 1. Basic Data Fetching

```typescript
function CourseList() {
  const { enrolledCourses, loading, error } = useCourses();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {enrolledCourses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### 2. Optimistic Updates

```typescript
function CourseCard({ course }) {
  const { enroll, isEnrolling, isOptimisticEnrollment } = useCourses();
  
  const handleEnroll = () => enroll(course.id);
  
  return (
    <div className={isOptimisticEnrollment ? 'optimistic' : ''}>
      <h3>{course.title}</h3>
      <button onClick={handleEnroll} disabled={isEnrolling}>
        {isEnrolling ? 'Enrolling...' : 'Enroll'}
      </button>
    </div>
  );
}
```

### 3. Advanced Filtering

```typescript
function AssignmentTracker() {
  const [filters, setFilters] = useState({
    status: 'all',
    courseId: 'all',
    sort: 'dueDate',
    order: 'asc'
  });
  
  const {
    assignments,
    loading,
    assignmentStats,
    filterAssignments
  } = useAssignments(filters);
  
  useEffect(() => {
    filterAssignments(filters);
  }, [filters, filterAssignments]);
  
  return (
    <div>
      <FilterControls filters={filters} onChange={setFilters} />
      <AssignmentStats stats={assignmentStats} />
      <AssignmentList assignments={assignments} loading={loading} />
    </div>
  );
}
```

### 4. Multiple Hook Coordination

```typescript
function Dashboard() {
  const { user } = useAuth();
  const { enrolledCourses, courseStats } = useCourses();
  const { upcomingAssignments } = useAssignments();
  const { summary, studyStreaks } = useAnalytics();
  
  return (
    <div>
      <WelcomeHeader user={user} />
      <StatsOverview 
        courses={courseStats}
        assignments={upcomingAssignments.length}
        analytics={summary}
        streaks={studyStreaks}
      />
      <RecentActivity courses={enrolledCourses} />
    </div>
  );
}
```

## 🧪 Testing

Hooks are designed to be easily testable:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCourses } from '@/hooks';

test('should load courses on mount', async () => {
  const { result } = renderHook(() => useCourses());
  
  expect(result.current.loading).toBe(true);
  
  await act(async () => {
    // Wait for data to load
  });
  
  expect(result.current.loading).toBe(false);
  expect(result.current.enrolledCourses).toHaveLength(3);
});
```

## 🚀 Performance Optimizations

### Caching Strategy

1. **HTTP-level caching**: ETags and Last-Modified headers
2. **Client-side caching**: Configurable cache times per hook
3. **Smart invalidation**: Related data refreshes automatically
4. **Background updates**: Fresh data loaded in background

### Request Optimization

1. **Request deduplication**: Identical requests are merged
2. **Automatic cancellation**: Previous requests cancelled on new ones
3. **Retry logic**: Smart retries based on error type
4. **Batch operations**: Multiple updates combined where possible

### Memory Management

1. **Automatic cleanup**: Hooks clean up on unmount
2. **Weak references**: Prevent memory leaks
3. **Selective updates**: Only re-render when relevant data changes
4. **Garbage collection**: Unused cache entries cleaned periodically

## 🔧 Troubleshooting

### Common Issues

1. **Stale data**: Check cache time settings
2. **Too many requests**: Verify request deduplication
3. **Memory leaks**: Ensure proper cleanup in useEffect
4. **Race conditions**: Use proper loading states

### Debug Mode

Enable debug logging:

```typescript
// In development
if (import.meta.env.DEV) {
  window.DEBUG_API_HOOKS = true;
}
```

## 📈 Future Enhancements

Planned improvements:

- [ ] WebSocket integration for real-time updates
- [ ] Offline support with service workers
- [ ] Background sync for failed requests
- [ ] Enhanced analytics with ML predictions
- [ ] Advanced caching with IndexedDB
- [ ] Progressive data loading
- [ ] Smart prefetching based on user behavior

## 🤝 Contributing

When adding new hooks:

1. Follow the established patterns
2. Include comprehensive TypeScript types
3. Add loading and error states
4. Implement optimistic updates where appropriate
5. Write tests and documentation
6. Consider performance implications

---

For more examples, see `/src/examples/HookUsageExamples.tsx`.
