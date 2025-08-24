import React, { useRef } from 'react';
import { 
  Clock, 
  BookOpen, 
  Star, 
  Play, 
  Calendar,
  Users,
  TrendingUp 
} from 'lucide-react';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  onContinue?: () => void;
  onEnroll?: () => void;
  isEnrolled: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onContinue, 
  onEnroll, 
  isEnrolled 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isEnrolled) {
        onContinue?.();
      } else {
        onEnroll?.();
      }
    }
  };
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
    <div 
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-300 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`${course.title} - ${isEnrolled ? 'Continue learning' : 'Enroll in course'}`}
    >
      {/* Course Image */}
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-block px-3 py-1 ${getCategoryColor(course.category)} text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm`}>
            {course.category}
          </span>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Progress Overlay for Enrolled Courses */}
        {isEnrolled && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span>{course.progress}% done</span>
              <span>{course.completedLessons} of {course.totalLessons}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {course.title}
          </h3>
          
          {/* Instructor */}
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <img
                src={course.instructor.avatar || '/api/placeholder/32/32'}
                alt={course.instructor.name}
                className="w-8 h-8 rounded-full mr-2 border-2 border-gray-100 dark:border-gray-600"
              />
              <span className="font-medium">{course.instructor.name}</span>
            </div>
            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-yellow-500 dark:text-yellow-400 fill-current mr-1" />
              <span className="text-yellow-700 dark:text-yellow-400 font-medium text-xs">{course.instructor.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Course Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
        </div>

        {/* Last Accessed (for enrolled courses) */}
        {isEnrolled && course.lastAccessedDate && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Last accessed: {formatLastAccessed(course.lastAccessedDate)}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{course.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button */}
        {isEnrolled ? (
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
          >
            <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            {course.progress === 0 ? 'Let\'s start! 🚀' : 'Keep going! 💪'}
          </button>
        ) : (
          <button
            onClick={onEnroll}
            className="w-full border-2 border-indigo-200 text-indigo-600 py-3 px-4 rounded-xl font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 flex items-center justify-center group"
          >
            <TrendingUp className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Join this course
          </button>
        )}
      </div>
    </div>
  );
};
