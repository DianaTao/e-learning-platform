import React from 'react';
import { 
  Clock, 
  BookOpen, 
  Star, 
  Play, 
  Calendar,
  TrendingUp 
} from 'lucide-react';
import type { Course } from '@/types';

interface CourseListItemProps {
  course: Course;
  onContinue?: () => void;
  onEnroll?: () => void;
  isEnrolled: boolean;
}

export const CourseListItem: React.FC<CourseListItemProps> = ({ 
  course, 
  onContinue, 
  onEnroll, 
  isEnrolled 
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'badge-success';
      case 'Intermediate':
        return 'badge-warning';
      case 'Advanced':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Programming':
        return 'bg-blue-500';
      case 'Design':
        return 'bg-purple-500';
      case 'Business':
        return 'bg-green-500';
      case 'Marketing':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatLastAccessed = (date?: Date) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group bg-white dark:bg-gray-800">
      <div className="flex items-start space-x-4">
        {/* Course Image */}
        <div className="relative flex-shrink-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-24 h-18 object-cover rounded-lg"
          />
          
          {/* Progress Indicator for Enrolled Courses */}
          {isEnrolled && course.progress > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
              <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                <div 
                  className="w-4 h-4 rounded-full bg-primary-500 transition-all duration-300"
                  style={{
                    background: `conic-gradient(#3b82f6 ${course.progress * 3.6}deg, #e5e7eb 0deg)`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-1">
                <span className={`inline-block px-2 py-1 ${getCategoryColor(course.category)} text-white text-xs font-medium rounded`}>
                  {course.category}
                </span>
                <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary-600 transition-colors">
                {course.title}
              </h3>
              
              {/* Instructor */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <img
                  src={course.instructor.avatar || '/api/placeholder/24/24'}
                  alt={course.instructor.name}
                  className="w-5 h-5 rounded-full mr-2"
                />
                <span>{course.instructor.name}</span>
                <div className="flex items-center ml-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="ml-1">{course.instructor.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {course.description}
              </p>

              {/* Course Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.estimatedHours}h</span>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.totalLessons} lessons</span>
                </div>
                
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>

                {/* Progress for enrolled courses */}
                {isEnrolled && (
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{course.progress}% complete</span>
                  </div>
                )}
              </div>

              {/* Last Accessed */}
              {isEnrolled && course.lastAccessedDate && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Last accessed: {formatLastAccessed(course.lastAccessedDate)}</span>
                </div>
              )}

              {/* Progress Bar for Enrolled Courses */}
              {isEnrolled && course.progress > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {course.tags.length > 4 && (
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                    +{course.tags.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="ml-4 flex-shrink-0">
              {isEnrolled ? (
                <button
                  onClick={onContinue}
                  className="btn btn-primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {course.progress === 0 ? 'Start' : 'Continue'}
                </button>
              ) : (
                <button
                  onClick={onEnroll}
                  className="btn btn-outline"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Enroll
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
