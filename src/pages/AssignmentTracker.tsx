import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  Upload, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Circle,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
// import { useAssignments } from '@/hooks';
import { useAppStore } from '@/stores/appStore';
import { AssignmentDetailModal } from '@/components/assignments/AssignmentDetailModal';
import { AssignmentCalendar } from '@/components/assignments/AssignmentCalendar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Assignment, AssignmentStatus } from '@/types';
import { format, isToday, isThisWeek, isPast } from 'date-fns';

export const AssignmentTracker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'today' | 'this_week' | 'this_month'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'course' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);

  // Use store data directly for now (hooks will be integrated later)
  const {
    assignments,
    isLoading: loading,
    submitAssignment,
    loadAssignments,
    addToast
  } = useAppStore();
  
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Apply filters when they change
  useEffect(() => {
    const filters = {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      courseId: courseFilter !== 'all' ? courseFilter : undefined,
      sort: sortBy,
      order: sortOrder
    };

    // Add date filters
    if (dueDateFilter !== 'all') {
      const now = new Date();
      switch (dueDateFilter) {
        case 'overdue':
          filters.dueTo = now.toISOString();
          break;
        case 'today':
          filters.dueFrom = now.toISOString().split('T')[0];
          filters.dueTo = now.toISOString().split('T')[0];
          break;
        case 'this_week':
          const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filters.dueTo = weekEnd.toISOString();
          break;
        case 'this_month':
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filters.dueTo = monthEnd.toISOString();
          break;
      }
    }

    // No filtering needed here - we'll filter in the component
  }, [statusFilter, courseFilter, dueDateFilter, sortBy, sortOrder]);

  // Load assignments on mount
  useEffect(() => {
    if (assignments.length === 0) {
      loadAssignments();
    }
  }, [assignments.length, loadAssignments]);

  // Keyboard navigation for table
  const handleTableKeyDown = useCallback((event: React.KeyboardEvent) => {
    const rowCount = assignments.length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, rowCount - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedRowIndex >= 0 && focusedRowIndex < rowCount) {
          setSelectedAssignment(assignments[focusedRowIndex]);
        }
        break;
      case ' ':
        event.preventDefault();
        if (focusedRowIndex >= 0 && focusedRowIndex < rowCount) {
          toggleAssignmentSelection(assignments[focusedRowIndex].id);
        }
        break;
      case 'Escape':
        setFocusedRowIndex(-1);
        break;
    }
  }, [assignments, focusedRowIndex]);

  // Focus management
  useEffect(() => {
    if (focusedRowIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tbody tr');
      const targetRow = rows[focusedRowIndex] as HTMLElement;
      if (targetRow) {
        targetRow.focus();
      }
    }
  }, [focusedRowIndex]);

  // Toggle assignment selection
  const toggleAssignmentSelection = useCallback((assignmentId: string) => {
    setSelectedAssignmentIds(prev => 
      prev.includes(assignmentId) 
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  }, []);

  // Get unique courses for filter
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName)));

  // Use assignments directly since filtering is handled by the hook
  // Apply client-side filtering
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          assignment.title.toLowerCase().includes(searchLower) ||
          assignment.courseName.toLowerCase().includes(searchLower) ||
          assignment.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && assignment.status !== statusFilter) {
        return false;
      }

      // Course filter
      if (courseFilter !== 'all' && assignment.courseName !== courseFilter) {
        return false;
      }

      // Due date filter
      if (dueDateFilter !== 'all') {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        
        switch (dueDateFilter) {
          case 'overdue':
            if (dueDate >= now) return false;
            break;
          case 'today':
            if (!isToday(dueDate)) return false;
            break;
          case 'this_week':
            if (!isThisWeek(dueDate)) return false;
            break;
          case 'this_month':
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            if (dueDate.getMonth() !== thisMonth || dueDate.getFullYear() !== thisYear) return false;
            break;
        }
      }

      return true;
    });
  }, [assignments, searchQuery, statusFilter, courseFilter, dueDateFilter]);

  // Calculate assignment stats from filtered data
  const totalAssignments = filteredAssignments.length;
  const completedAssignments = filteredAssignments.filter(a => a.status === 'graded').length;
  const overdueAssignments = filteredAssignments.filter(a => a.status === 'overdue' || (new Date(a.dueDate) < new Date() && a.status !== 'graded')).length;
  const upcomingAssignments = filteredAssignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate > now && dueDate <= nextWeek && a.status !== 'graded';
  }).length;

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'not_started':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'submitted':
        return <Upload className="w-4 h-4 text-yellow-500" />;
      case 'graded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'not_started':
        return 'badge-gray';
      case 'in_progress':
        return 'badge-primary';
      case 'submitted':
        return 'badge-warning';
      case 'graded':
        return 'badge-success';
      case 'overdue':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  const getDueDateColor = (dueDate: Date, status: AssignmentStatus) => {
    if (status === 'submitted' || status === 'graded') return 'text-gray-600 dark:text-gray-400';
    
    if (isPast(dueDate)) return 'text-red-600 dark:text-red-400 font-medium';
    if (isToday(dueDate)) return 'text-orange-600 dark:text-orange-400 font-medium';
    if (isThisWeek(dueDate)) return 'text-amber-600 dark:text-amber-400 font-medium';
    return 'text-gray-600 dark:text-gray-400';
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };



  const handleBulkAction = async (action: 'complete' | 'export') => {
    if (selectedAssignmentIds.length === 0) return;

    try {
      switch (action) {
        case 'complete':
          // Optimistic update
          const { assignments: currentAssignments, addToast } = useAppStore.getState();
          const updatedAssignments = currentAssignments.map(assignment =>
            selectedAssignmentIds.includes(assignment.id)
              ? { ...assignment, status: 'submitted' as const }
              : assignment
          );
          useAppStore.setState({ assignments: updatedAssignments });

          // Simulate API call
          if (import.meta.env.DEV) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          addToast({
            type: 'success',
            title: 'Bulk Action Complete',
            message: `${selectedAssignmentIds.length} assignments marked as complete.`,
          });
          break;

        case 'export':
          // Generate CSV export
          const csvData = filteredAssignments
            .filter(a => selectedAssignmentIds.includes(a.id))
            .map(a => ({
              Assignment: a.title,
              Course: a.courseName,
              'Due Date': format(new Date(a.dueDate), 'yyyy-MM-dd'),
              Status: a.status,
              Points: a.points,
              Grade: a.grade?.percentage || 'N/A'
            }));

          const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `assignments-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);

          useAppStore.getState().addToast({
            type: 'success',
            title: 'Export Complete',
            message: `${selectedAssignmentIds.length} assignments exported to CSV.`,
          });
          break;
      }
    } catch (error) {
      useAppStore.getState().addToast({
        type: 'error',
        title: 'Bulk Action Failed',
        message: 'Unable to complete the bulk action. Please try again.',
      });
    } finally {
      setSelectedAssignmentIds([]);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Assignments 📚</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Let's get this stuff done! Track what's due and celebrate what's finished.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-slate-900 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 shadow-sm dark:shadow-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-600 dark:text-blue-300 text-sm font-medium bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
              All tasks
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{totalAssignments}</p>
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">total on your plate</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-green-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm dark:shadow-emerald-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500 dark:bg-emerald-600 rounded-xl shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-300 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
              {completedAssignments > 0 ? 'Nice!' : 'Let\'s go'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{completedAssignments}</p>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">crushed it 🎉</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-800/30 shadow-sm dark:shadow-red-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500 dark:bg-red-600 rounded-xl shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-600 dark:text-red-300 text-sm font-medium bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full">
              {overdueAssignments > 0 ? 'Uh oh' : 'Clear!'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{overdueAssignments}</p>
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{overdueAssignments > 0 ? 'need attention' : 'all caught up'}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-yellow-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30 shadow-sm dark:shadow-amber-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500 dark:bg-amber-600 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-amber-600 dark:text-amber-300 text-sm font-medium bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-full">
              Coming up
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{upcomingAssignments}</p>
          <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">ready to tackle</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card card-body">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
              placeholder="Search assignments..."
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | 'all')}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as typeof dueDateFilter)}
              className="input w-auto"
            >
              <option value="all">All Due Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAssignmentIds.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedAssignmentIds.length} assignment(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('complete')}
                className="btn btn-sm btn-primary"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="btn btn-sm btn-outline"
              >
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assignments Table and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <AssignmentCalendar
            assignments={assignments}
            onDateSelect={(date) => {
              // Filter assignments by selected date
              const dateStr = format(date, 'yyyy-MM-dd');
              setDueDateFilter(isToday(date) ? 'today' : isThisWeek(date) ? 'this_week' : 'all');
            }}
          />
        </div>

        {/* Assignments Table */}
        <div className="lg:col-span-3 card">
        <div className="overflow-x-auto">
          <table 
            ref={tableRef}
            className="w-full"
            role="table"
            aria-label="Assignments table"
            onKeyDown={handleTableKeyDown}
          >
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssignmentIds.length === assignments.length && assignments.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignmentIds(assignments.map(a => a.id));
                      } else {
                        setSelectedAssignmentIds([]);
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('title')}
                >
                  Assignment {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('course')}
                >
                  Course {sortBy === 'course' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('status')}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredAssignments.map((assignment, index) => (
                <tr 
                  key={assignment.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
                    focusedRowIndex === index ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                                      onClick={() => setSelectedAssignment(assignment)}
                  tabIndex={0}
                  role="row"
                  aria-selected={selectedAssignmentIds.includes(assignment.id)}
                  aria-label={`Assignment: ${assignment.title}, Course: ${assignment.courseName}, Due: ${format(new Date(assignment.dueDate), 'MMM dd, yyyy')}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedAssignmentIds.includes(assignment.id)}
                      onChange={() => toggleAssignmentSelection(assignment.id)}
                      className="rounded border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(assignment.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {assignment.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{assignment.courseName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getDueDateColor(new Date(assignment.dueDate), assignment.status)}`}>
                      {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(assignment.dueDate), 'h:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusBadge(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {assignment.grade ? (
                        <span className="font-medium">
                          {assignment.grade.score}/{assignment.grade.maxScore}
                        </span>
                      ) : (
                        <span>{assignment.points} pts</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAssignments.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmit={(submission) => {
            submitAssignment(selectedAssignment.id, submission);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
};
