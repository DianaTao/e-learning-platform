import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast } from 'date-fns';
import type { Assignment } from '@/types';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  assignments,
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group assignments by date
  const assignmentsByDate = assignments.reduce((acc, assignment) => {
    const dateKey = format(new Date(assignment.dueDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return assignmentsByDate[dateKey] || [];
  };

  const getDayClasses = (date: Date) => {
    const dayAssignments = getAssignmentsForDate(date);
    const hasOverdue = dayAssignments.some(a => isPast(new Date(a.dueDate)) && a.status !== 'submitted' && a.status !== 'graded');
    const hasDue = dayAssignments.length > 0;
    
    let classes = 'w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors ';
    
    if (selectedDate && isSameDay(date, selectedDate)) {
      classes += 'bg-primary-500 dark:bg-primary-600 text-white ';
    } else if (isToday(date)) {
      classes += 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium border-2 border-primary-300 dark:border-primary-600 ';
    } else if (hasOverdue) {
      classes += 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-700 ';
    } else if (hasDue) {
      classes += 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 ';
    } else {
      classes += 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ';
    }
    
    return classes;
  };

  return (
    <div className="card max-w-sm">
      <div className="card-header bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-300" />
            Assignment Calendar
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-2">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
      </div>

      <div className="card-body pt-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8" />
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map(date => {
            const dayAssignments = getAssignmentsForDate(date);
            
            return (
              <div
                key={date.toISOString()}
                className="relative"
              >
                <div
                  className={getDayClasses(date)}
                  onClick={() => onDateSelect?.(date)}
                  title={
                    dayAssignments.length > 0
                      ? `${dayAssignments.length} assignment(s) due: ${dayAssignments.map(a => a.title).join(', ')}`
                      : ''
                  }
                >
                  {format(date, 'd')}
                </div>
                
                {/* Assignment count indicator */}
                {dayAssignments.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                    {dayAssignments.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-100 dark:bg-primary-900/40 border-2 border-primary-300 dark:border-primary-600 rounded-full mr-2" />
            Today
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-full mr-2" />
            Assignments due
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-full mr-2" />
            Overdue assignments
          </div>
        </div>
      </div>
    </div>
  );
};
