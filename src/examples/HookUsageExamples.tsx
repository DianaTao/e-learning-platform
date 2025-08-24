/**
 * Example file showing how to use the custom API hooks
 * This file demonstrates various patterns and usage examples
 */

import React from 'react';
// import { useAuth, useCourses, useAssignments, useAnalytics } from '@/hooks';

// Example 1: Basic Authentication
/* export const AuthExample: React.FC = () => {
  const { 
    user, 
    isLoggingIn, 
    loginError, 
    login, 
    logout 
  } = useAuth();

  const handleLogin = async () => {
    await login({
      email: 'demo@example.com',
      password: 'demo123',
      rememberMe: true
    });
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
          {loginError && <p className="text-red-500">{loginError}</p>}
        </div>
      )}
    </div>
  );
};

// Example 2: Course Management
export const CourseExample: React.FC = () => {
  const {
    enrolledCourses,
    recentCourses,
    recommendations,
    courseStats,
    loading,
    enroll,
    updateProgress,
    isEnrolling
  } = useCourses();

  const handleEnroll = async (courseId: string) => {
    await enroll(courseId);
  };

  const handleProgressUpdate = async (courseId: string) => {
    await updateProgress({
      courseId,
      lessonId: 'lesson-1',
      completed: true,
      timeSpent: 45
    });
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h2>Course Management</h2>
      
      {/* Course Statistics */}
      {courseStats && (
        <div className="stats">
          <p>Total Enrolled: {courseStats.total}</p>
          <p>Completed: {courseStats.completed}</p>
          <p>In Progress: {courseStats.inProgress}</p>
          <p>Average Progress: {courseStats.averageProgress}%</p>
        </div>
      )}

      {/* Enrolled Courses */}
      <div>
        <h3>Your Courses</h3>
        {enrolledCourses.map(course => (
          <div key={course.id} className="course-card">
            <h4>{course.title}</h4>
            <p>Progress: {course.progress.percentage}%</p>
            <button 
              onClick={() => handleProgressUpdate(course.id)}
              disabled={isEnrolling}
            >
              Mark Lesson Complete
            </button>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div>
        <h3>Recently Accessed</h3>
        {recentCourses.map(course => (
          <div key={course.id}>
            <span>{course.title}</span>
            <span>Last accessed: {course.lastAccessedISO}</span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div>
        <h3>Recommended for You</h3>
        {recommendations.map(course => (
          <div key={course.id} className="recommendation">
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <button 
              onClick={() => handleEnroll(course.id)}
              disabled={isEnrolling}
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 3: Assignment Management
export const AssignmentExample: React.FC = () => {
  const {
    assignments,
    selectedAssignment,
    assignmentStats,
    upcomingAssignments,
    loading,
    selectAssignment,
    updateStatus,
    submitAssignment,
    bulkUpdate,
    isUpdatingStatus,
    isSubmitting
  } = useAssignments();

  const handleStatusUpdate = async (assignmentId: string) => {
    await updateStatus(assignmentId, 'in_progress');
  };

  const handleSubmit = async (assignmentId: string) => {
    await submitAssignment(assignmentId, {
      content: 'My assignment submission',
      files: [] // File array would go here
    });
  };

  const handleBulkComplete = async (assignmentIds: string[]) => {
    await bulkUpdate(assignmentIds, 'markComplete');
  };

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div>
      <h2>Assignment Management</h2>

      {/* Assignment Statistics */}
      {assignmentStats && (
        <div className="stats">
          <p>Total: {assignmentStats.total}</p>
          <p>Completed: {assignmentStats.byStatus.graded}</p>
          <p>Overdue: {assignmentStats.overdue}</p>
          <p>Due This Week: {assignmentStats.dueThisWeek}</p>
          <p>Completion Rate: {assignmentStats.completionRate}%</p>
        </div>
      )}

      {/* Upcoming Assignments */}
      <div>
        <h3>Due Soon</h3>
        {upcomingAssignments.map(assignment => (
          <div key={assignment.id} className="assignment-card">
            <h4>{assignment.title}</h4>
            <p>Course: {assignment.courseName}</p>
            <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
            <p>Status: {assignment.status}</p>
            <div className="actions">
              <button 
                onClick={() => handleStatusUpdate(assignment.id)}
                disabled={isUpdatingStatus}
              >
                Start Working
              </button>
              <button 
                onClick={() => handleSubmit(assignment.id)}
                disabled={isSubmitting}
              >
                Submit
              </button>
              <button onClick={() => selectAssignment(assignment.id)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Assignment Details */}
      {selectedAssignment && (
        <div className="assignment-details">
          <h3>Assignment Details</h3>
          <h4>{selectedAssignment.title}</h4>
          <p>{selectedAssignment.description}</p>
          <p>Points: {selectedAssignment.points}</p>
          <p>Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
          {selectedAssignment.feedback && (
            <div>
              <h5>Feedback</h5>
              <p>{selectedAssignment.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Example 4: Analytics and Progress Tracking
export const AnalyticsExample: React.FC = () => {
  const {
    summary,
    studyLogs,
    achievements,
    studyGoals,
    studyStreaks,
    studyTimeByCategory,
    dailyStudyTime,
    achievementsByStatus,
    loading,
    logStudyTime,
    createStudyGoal,
    unlockAchievement,
    isLoggingStudyTime,
    isCreatingGoal
  } = useAnalytics();

  const handleLogStudyTime = async () => {
    await logStudyTime({
      minutes: 60,
      courseCategory: 'Programming',
      courseId: 'course-1',
      lessonId: 'lesson-1'
    });
  };

  const handleCreateGoal = async () => {
    await createStudyGoal({
      type: 'weekly_hours',
      target: 10,
      title: 'Study 10 hours per week',
      description: 'Complete 10 hours of focused study time each week'
    });
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div>
      <h2>Learning Analytics</h2>

      {/* Summary Stats */}
      {summary && (
        <div className="summary">
          <h3>Summary (Last 30 Days)</h3>
          <p>Hours Studied: {summary.hoursStudied}</p>
          <p>Current Streak: {summary.streak.current} days</p>
          <p>Longest Streak: {summary.streak.longest} days</p>
          <p>Average Score: {summary.averageScore}%</p>
          <p>Courses Completed: {summary.completion.completed}</p>
        </div>
      )}

      {/* Study Streaks */}
      <div className="streaks">
        <h3>Study Streaks</h3>
        <p>Current: {studyStreaks.current} days</p>
        <p>Personal Best: {studyStreaks.longest} days</p>
      </div>

      {/* Study Time by Category */}
      <div className="categories">
        <h3>Study Time by Category</h3>
        {studyTimeByCategory.map(category => (
          <div key={category.name}>
            <span>{category.name}: </span>
            <span>{category.hours}h ({category.percentage}%)</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="achievements">
        <h3>Achievements</h3>
        <div>
          <h4>Unlocked ({achievementsByStatus.unlocked.length})</h4>
          {achievementsByStatus.unlocked.map(achievement => (
            <div key={achievement.id}>
              <span>{achievement.icon} {achievement.title}</span>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
        <div>
          <h4>In Progress ({achievementsByStatus.inProgress.length})</h4>
          {achievementsByStatus.inProgress.map(achievement => (
            <div key={achievement.id}>
              <span>{achievement.icon} {achievement.title}</span>
              <p>Progress: {achievement.progress}/{achievement.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Study Goals */}
      <div className="goals">
        <h3>Study Goals</h3>
        {studyGoals.map(goal => (
          <div key={goal.id}>
            <h4>{goal.title}</h4>
            <p>{goal.description}</p>
            <p>Progress: {goal.current}/{goal.target}</p>
            {goal.deadline && (
              <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
            )}
          </div>
        ))}
        <button 
          onClick={handleCreateGoal}
          disabled={isCreatingGoal}
        >
          {isCreatingGoal ? 'Creating...' : 'Create New Goal'}
        </button>
      </div>

      {/* Actions */}
      <div className="actions">
        <button 
          onClick={handleLogStudyTime}
          disabled={isLoggingStudyTime}
        >
          {isLoggingStudyTime ? 'Logging...' : 'Log 1 Hour Study Time'}
        </button>
      </div>
    </div>
  );
};

// Example 5: Advanced Hook Usage Patterns
export const AdvancedHookPatterns: React.FC = () => {
  // Using multiple hooks together
  const { user } = useAuth();
  const { enrolledCourses, loading: coursesLoading } = useCourses();
  const { upcomingAssignments, loading: assignmentsLoading } = useAssignments();
  const { summary, loading: analyticsLoading } = useAnalytics();

  // Combined loading state
  const isLoading = coursesLoading || assignmentsLoading || analyticsLoading;

  // Dashboard-style overview
  return (
    <div>
      <h2>Learning Dashboard</h2>
      
      {isLoading ? (
        <div>Loading your learning data...</div>
      ) : (
        <div className="dashboard">
          {/* User Welcome */}
          {user && (
            <div className="welcome">
              <h3>Welcome back, {user.firstName}!</h3>
              <p>Let's continue your learning journey</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat">
              <h4>Enrolled Courses</h4>
              <p>{enrolledCourses.length}</p>
            </div>
            <div className="stat">
              <h4>Upcoming Assignments</h4>
              <p>{upcomingAssignments.length}</p>
            </div>
            <div className="stat">
              <h4>Hours This Week</h4>
              <p>{summary?.hoursStudied || 0}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            {/* Combine recent data from multiple hooks */}
            {/* This would show a timeline of recent learning activities */}
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  // AuthExample,
  // CourseExample,
  // AssignmentExample,
  // AnalyticsExample,
  // AdvancedHookPatterns
};
*/
